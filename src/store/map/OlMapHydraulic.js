import ol from 'openlayers'
import {drawSymbol, createLabelStyleStaff, judgeZoomlevel,  setCardCoord, setOrAnimate, createLabelStyleHydraulic} from './mapUtils/OlMapUtils'
import {animate} from './mapUtils/animatorDep'
import { getSVByCardId, getPositionCard } from '@/api/api';
export default {
  namespaced: true,
  state: {
    hydraulicLayerSource: null,
    hydraulicLayer: null,
    groups: new Map(),
    ZOOM_LEVEL: null,
    status: new Map()
  },
  mutations: {
    initLayers (state) {
      state.ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
      state.showStaffLevel = state.ZOOM_LEVEL.MIDDLE
      state.hydraulicLayerSource = new ol.source.Vector()
      state.hydraulicLayer = new ol.layer.Vector({
        source: state.hydraulicLayerSource,
        zIndex: 6
      })


      this.state.mapService.map.addLayer(state.hydraulicLayer)
      this.state.mapService.map.getView().addEventListener('change:resolution', (evt) => {
        let mapType = this.state.olMapWorkSpace.mapType;
        if (mapType === 'HISTORY') {
          state.staffLayer.setVisible(true)
        } else {
          let viewZoom = this.state.mapService.view.getZoom();
          this.commit('olMapHydraulic/changeScaleVehicle', viewZoom)
        }
      })
    },
    changeScaleVehicle(state, viewZoom) {
      let shouldChange = judgeZoomlevel(viewZoom, this.state.mapService.map.getView().getProperties().zoomLevel, 'vehicle')
      let features = state.hydraulicLayerSource.getFeatures()
      for (let feature of features) {
        let { color } = feature.getProperties()
        // if (color.includes('cmj') || color.includes('tunnel')) {
          feature.setStyle(createLabelStyleHydraulic(feature, viewZoom, feature.getProperties(), this.state.mapService.map))
          feature.getStyle().setZIndex(6)
        // }
      }
    },
    setGroups (state, data) {
      state.groups.set(data.cardID, data.group)
    },
    adjustStaffs(state, viewZoom) {
      let features = state.staffLayerSource.getFeatures()
      for (let feature of features) {
        let featureID = feature.getId()
        if (!/line/g.test(featureID)) {
          feature.setStyle(createLabelStyleStaff(feature, viewZoom, this.state.mapService.map))
        }
      }
    },
    handleSubtype (state, msg) {
      let feature = msg.feature
      let properties = feature.getProperties()
      let dataType = properties['data-type']
      let id = feature.get('data-id')
      let subType = properties['data_subtype']
    }
  },
  actions: {
    informMapUpdateCard ({state, commit, dispatch}, data) {
      if (!data) return
      let needMove = data.needMove
      let setMove = data.setMove
      let viewZoom = this.state.mapService.map.getView().getZoom()
      let card = data.card
      card.x = card.x
      let type = data.type
      let cardID = card['hydraulicCode']
      let speed = card['speed']
      let name = card['name']
      let group = state.hydraulicLayerSource.getFeatureById(cardID)
      let status = state.status.size ? state.status.get(cardID) : 0
      status = status && status === 1 ? status : 0
      card['hydraulicStatus'] = status
      if (group) {
        if (needMove) {
          group = setCardCoord(cardID, group, card, type, this.state.mapService.map)
        } else {
          let isAnimate = speed > 0 && setOrAnimate(card, type, group, this.state.mapService.map, setMove)
          if (isAnimate) {
            let duration = 1000 * 0.99 
            let positionLay = this.state.mapService.map.getOverlayById('position' + cardID)
            animate({
              msg: group,
              x: card.x,
              y: card.y,
              duration: duration,
              positionLay: positionLay,
              type: type,
            })
          } else {
            group = setCardCoord(cardID, group, card, type, this.state.mapService.map)
          }
        }
        this.commit('olMapHydraulic/setGroups', {
          cardID: cardID,
          group: group
        })
      } else {
        let attrs = {
          'card': card,
          'data-id': cardID,
          'id':cardID,
          'data-number': cardID,
          'data-type': 'card',
          'data_subtype': type,
          'card-speed': card.speed,
          x: card.x,
          y: card.y,
          name: name,
          rotation: card.rotation,
          color: card.color
        }
        if (card && card.mapType) {
          attrs['playtype'] = card.mapType;
        } else {
          attrs['playtype'] = 'MONITOR'; 
        }
        let layerSource = state.hydraulicLayerSource
        group = drawSymbol(attrs, layerSource, this.state.mapService.map)
        this.commit('olMapHydraulic/setGroups', {
          cardID: cardID,
          group: group
        })
      }
    },
    clearLayers({state}, type) {
      if (type === 'hydraulic') {
        state.hydraulicLayerSource.clear(true)
        state.groups.clear()
      }
      
    },
    // 将卡画在地图上
    async drawCard({state, commit, dispatch}, msg) {
      let cmd = msg.cmd;
      let needMove = msg.needMove; // 是否需要动画 true:不需要动画
      let card = msg.card;
      if (!card) return;
      let cardID = card['ident'];
      let speed = Number(card['speed']);
      let type = cmd === 'NOSIGNAL' ? 'nosignal' : null;
      let mapID = card['mapCode'] ? card['mapCode'] : msg.card.mapCode;
      let mapType = this.state.olMapWorkSpace.mapType;
      let cardTypeName = card['type'];
      let group = await dispatch('getFeature', {cardID, cardTypeName});
      let viewZoom = this.state.mapService.view.getZoom();
      let isShowStaffLayer = false;
      if (state.staff && viewZoom >= state.showStaffLevel) {
        isShowStaffLayer = true;
      }
      if (mapType === 'HISTORY') {
        isShowStaffLayer = true;
      }
      state.staffLayer.setVisible(isShowStaffLayer);
      console.log('将卡画在地图上', group);
      switch (cmd) {
        case 'POSITION':
        case 'DOWNMINE':
        case 'NOSIGNAL': // 丢失信号时如果有坐标变化，也做移动处理，若此时状态还是进入盲区则推送数据问题
          if (group) {
            console.log(`x: ${card.x}, y: ${card.y}`);
            if (needMove) {
              group = setCardCoord(cardID, group, card, card.type, this.state.mapService.map)
            } else {
              let isAnimate = speed > 0 && setOrAnimate(card, card.type, group, this.state.mapService.map, 1)
              if (isAnimate) {
                let duration = type === 'staff' ? 2000 * 0.99 : 1000 * 0.99 
                let positionLay = this.state.mapService.map.getOverlayById('position' + cardID)
                animate({
                  msg: group,
                  x: card.x,
                  y: card.y,
                  duration: duration,
                  positionLay: positionLay,
                  type: card.type,
                })
              } else {
                group = setCardCoord(cardID, group, card, card.type, this.state.mapService.map)
              }
            }
            this.commit('olMapHydraulic/setGroups', {
              cardID: cardID,
              group: group
            })
          } else {
            dispatch('informMapUpdateCard', {card, type: cardTypeName})
            // group = this.drawCardOn(card, 'card-add', type)
            // group && this.groups.set(cardID, group)
          }
          break
        case 'SPECIAL': // 胶轮车 无label
          if (group) {
            this.judgePreCardState(card, group, cardTypeName, 'special', 'special')
            this.judgePreCardColor(card, group, cardTypeName, type)
            if (needMove) {
              this.setCardCoord(cardID, group, card)
            } else {
              speed > 0 && this.cardAnimation(cardID, group, card, cardTypeName)
            }
          } else {
            group = this.drawCardOn(card, 'card-add', 'special')
            group && this.groups.set(cardID, group)
          }
          break
        case 'UPMINE':
          this.deleteCardFrom(cardID)
          break
        case 'UNCOVER': // 非覆盖 无速度
          if (cardTypeName === 'staff') {
            if (group) {
              if (needMove) {
                this.setCardCoord(cardID, group, card)
              } else {
                speed > 0 && this.cardAnimation(cardID, group, card, cardTypeName)
              }
            } else {
              group = this.drawCardOn(card, 'card-add')
              group && this.groups.set(cardID, group)
            }
          } else {
            this.uncoverArea(card, cardID, cardTypeName, areaID)
            let positionLay = this.map.getOverlayById('position' + cardID)
            if (positionLay) {
              this.state.mapService.map.removeOverlay(positionLay)
              this.state.locateStore.locates.delete(cardID)
            }
          }
          break
        case 'NOCHANGE':
          if (group) {
            this.judgePreCardColor(card, group, cardTypeName, type)
            // this.judgePreUncoverCardPos(card, group, cardTypeName) // 判断非覆盖区域卡位置
          } else {
            // card, className, type, workfacestate
            // group = dispatch('card')
            // group && this.groups.set(cardID, group)
          }
          break
        default:
          console.warn(`未知的标识卡指令 ${msg.cmd}`)
      }
      return group
    },
    //  根据卡号、卡类型获取对应的 feature
    getFeature({state, commit, dispatch}, msg) {
      let {cardID, cardTypeName} = msg;
      let feature = null;
      if (cardTypeName === 'hydraulic') {
        feature = state.hydraulicLayerSource.getFeatureById(cardID);
      }
      return feature;
    },
    /**
     * 将 card 对象画在地图上
     * @param {*} canvas
     * @param {*} card
     * @param {*} className
     */
    drawCardOn({state, commit, dispatch}) {
      let cardID = card[CARD.card_id] ? card[CARD.card_id] : card.card_id
      let areaID = card[CARD.area_id]
      let cardTypeName = xdata.metaStore.getCardTypeName(cardID)
      if (cardTypeName === undefined) {
        if (String(cardID).match(/^002/)) {
          cardTypeName = 'vehicle'
        } else if (String(cardID).match(/^001/)) {
          cardTypeName = 'staff'
        }
      }
  
      let cardBindObj = xdata.metaStore.getCardBindObjectInfo(cardID)
      let name = ''
      let faceID = ''
      let vehicleTypeID = ''
      if (!cardBindObj) {
        console.warn(`当前系统中卡号为 ${cardID} 的卡没有绑定到 ${cardTypeName}`)
        type = 'unregistered'
      } else {
        vehicleTypeID = cardTypeName === 'vehicle' && cardBindObj.vehicle_type_id
      }
      let objectID = card[CARD.object_id]
      let attrs = {
        'card': card,
        'data-id': cardID,
        'data-number': objectID,
        'data-type': SYMBOL_TYPE.CARD,
        'data_subtype': cardTypeName,
        'card-speed': Math.round(card[CARD.speed] * 100) / 100,
        'card_area': areaID,
        'vehicle_type_id': vehicleTypeID,
        // 'card_occupation': occupationID,
        'card_state': card[CARD.state_object],
        'workface_state': workfacestate, // 采煤机、掘进机状态
        x: card[CARD.x] || Number(card[CARD.x]) === 0 ? card[CARD.x] : card.x,
        y: card[CARD.y] || Number(card[CARD.y]) === 0 ? card[CARD.y] : card.y,
        type: type,
        name: name,
        faceID: faceID,
        playtype: this.mapType
      }
  
      let layerSource = cardTypeName === 'vehicle' ? this.vehicleLayerSource : this.staffLayerSource
      return drawSymbol(attrs, layerSource, this.map, type)
    },
    judgePreCardState({state, commit, dispatch}, msg) {
      let {card, group, cardTypeName, special, type} = msg;
      let style = group.getStyle()
      let text = style ? style.getText() : ''
      let isPreviewInUncoverArea = group.getProperties().type;
      let cardID = card['ident'];
      if (text && /Km/ig.test(text.getText())) { // 正-正
        let newText = `${card['ident'] || String(cardID)}|${card['speed']}m/s`
        text.setText(newText)
        group.set('card-speed', card['speed'])
        group.set('data-number', card['ident'])
      }
      if (text && Number(text.getText()) === Number(cardID)) {
        let newText = card['ident'] ? card['ident'] : String(cardID)
        text.setText(newText)
        group.set('data-number', card['ident'])
      } else if (text && text.getText() === 'undefined') {
        let newText = String(cardID)
        text.setText(newText)
        group.set('data-number', card['ident'])
      }
    },
    judgePreCardColor({state, commit, dispatch}, msg) {
      let {card, group, cardTypeName, type} = msg;
      let img = group.getStyle() ? group.getStyle().getImage().getSrc() : ''
      let cardID = card['ident']
      if (img && (/unregistered/ig).test(img)) {
        dispatch('removeOldDrawNew', {card, group, cardTypeName, type, cardID});
      }
    },
    removeOldDrawNew({state, commit, dispatch}, msg) {
      let { cardID, cardTypeName, group, card, type, stateType } = msg
      if (cardTypeName === 'vehicle') {
        state.vehicleLayerSource.getFeatures().includes(group) && state.vehicleLayerSource.removeFeature(group)
      } else if (cardTypeName === 'staff') {
        state.staffLayerSource && state.staffLayerSource.getFeatures().includes(group) && state.staffLayerSource.removeFeature(group)
      }
      // 重画
      dispatch('informMapUpdateCard', {card, type: cardTypeName});
    },
    // judgePreCardMonky({state, commit, dispatch}, msg) {
    //   let ismonkeyType = Number(group.getProperties().card_state)
    //   let cardID = card[CARD.card_id]
    // },
    setOrAnimate({state, commit, dispatch}, msg) {
      let {card, cardTypeName} = msg;
      let curView = this.state.mapService.map.getView()
      let curZoom = curView.getZoom()
      let setOrAnimate = 0 // 0：动画；1：定位
      let isAnimate = false // 是否做动画
      let isMove = null
      if (cardTypeName === 'vehicle') {
        isAnimate = setOrAnimate === 0 ? true : false
      } else { // 人员 < 21 不做动画
        if (curZoom < 21) {
          isAnimate = false
        } else {
          let curExtent = curView.calculateExtent()
          let coords = {
            x: card['x'],
            y: card['y']
          }
          // 在可视范围内
          if (coords.x > curExtent[0] && coords.x < curExtent[2] && coords.y > curExtent[1] && coords.y < curExtent[3]) {
            isAnimate = setOrAnimate === 1 ? false : true
          } else {
            isAnimate = false
          }
        }
      }
      return isMove ? isMove : isAnimate
    },
    cardAnimation({state, commit, dispatch}, cardMsg) {
      let {cardID, group, card, cardTypeName} = cardMsg
      let positionLay = this.state.mapService.map.getOverlayById('position' + cardID)
      let msg = {
        group: group,
        positionLay: positionLay
      }
  
      if (card.mapType === 'HISTORY') {
        let duration = new Date(card['locationTime']).getTime() - new Date(card['locationTime']).getTime()
        animate({
          msg: group,
          x: card['x'],
          y: card['y'],
          duration: duration / 1000,
          positionLay: positionLay
        })
      } else {
        let durationMonitor= cardTypeName === 'staff' ? 2000 * 0.99 : 1000 * 0.99;
        animate({
          msg: group,
          x: card.x,
          y: card.y,
          duration: durationMonitor,
          positionLay: positionLay
        })
      }
    },
    deleteCardFrom({state, commit, dispatch}, row) {
      let cardType = row.type
      let cardID = row.ident
      if (cardType) {
        const layerSourceType = cardType === 145 ? 'staffLayerSource' : 'vehicleLayerSource'
        let lineCard = state[layerSourceType].getFeatureById(cardID + 'line')
        let deleteCardFeature = state[layerSourceType].getFeatureById(cardID)
        if (deleteCardFeature) {
          state[layerSourceType].removeFeature(deleteCardFeature)
        }
        if (lineCard) {
          state[layerSourceType].removeFeature(lineCard)
        }
        let moveLay = this.state.mapService.map.getOverlayById('cardID' + cardID)
        let positionLay = this.state.mapService.map.getOverlayById('position' + cardID)
        if (moveLay) {
          this.state.mapService.map.removeOverlay(moveLay)
        }
    
        if (positionLay) {
          this.state.mapService.map.removeOverlay(positionLay)
          this.state.locateStore.locates.delete(cardID)
        }
      }
    },
    removeCard({state, commit, dispatch}, data) {
      let rows = data.idents;
      if (!rows || !rows.length) return
      let upmine = this.state.stateStore.upmine
      if (upmine.isVisible && upmine.data.length > 0) {
        let upRows = upmine.data.filter(item => {
          let upRowIdent = rows.filter(list => list.ident === item.ident)
          return upRowIdent.length > 0 ? false : item
        })
        this.commit('stateStore/changeUpmine', {
          type: true,
          data: upRows,
        })
      }
      for (const row of rows) {
        dispatch('deleteCardFrom', row)
      }
    },
    showHidden({state, commit, dispatch}, msg) {
      const { name, status } = msg
      state.hydraulicLayer.setVisible(status)
    },
    updateStatus({state,commit,dispatch}, data) {
      if (!data || !data.data) return
      let hydraulicData = data.data['1']
      for (const hydraulic of hydraulicData) {
        state.status.set(hydraulic.code, hydraulic.status)
      }
    }
  }
}
