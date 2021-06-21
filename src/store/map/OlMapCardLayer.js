import ol from 'openlayers'
import {drawSymbol, createLabelStyleStaff, judgeZoomlevel, convertSVGPath2Coord, stringDivider, setCardCoord, setOrAnimate, createLabelStyleVehicle} from './mapUtils/OlMapUtils'
import {animate} from './mapUtils/animatorDep'
// import {ZOOM_LEVEL} from '../def/map_def.js'
import { getSVByCardId, getPositionCard } from '@/api/api';
export default {
  namespaced: true,
  state: {
    vehicleLayerSource: null,
    vehicleLayer: null,

    staffLayerSource: null,
    staffLayer: null,

    areaStaffSource: null,
    areaStaffLayer: null,

    groups: new Map(),
    staff: true,
    areaStaff: true,

    ZOOM_LEVEL: null,
    showStaffLevel: null,
  },
  mutations: {
    initLayers (state) {
      state.ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
      state.showStaffLevel = state.ZOOM_LEVEL.MIDDLE
      state.vehicleLayerSource = new ol.source.Vector()
      state.vehicleLayer = new ol.layer.Vector({
        source: state.vehicleLayerSource,
        zIndex: 7
      })

      state.staffLayerSource = new ol.source.Vector()
      state.staffLayer = new ol.layer.Vector({
        source: state.staffLayerSource,
        zIndex: 8
      })

      state.areaStaffSource = new ol.source.Vector()
      state.areaStaffLayer = new ol.layer.Vector({
        source: state.areaStaffSource,
        zIndex: 10
      })

      this.state.mapService.map.addLayer(state.vehicleLayer)
      this.state.mapService.map.addLayer(state.staffLayer)
      this.state.mapService.map.addLayer(state.areaStaffLayer)
      this.state.mapService.map.getView().addEventListener('change:resolution', (evt) => {
        let mapType = this.state.olMapWorkSpace.mapType;
        if (mapType === 'HISTORY') {
          state.staffLayer.setVisible(true)
        } else {
          let viewZoom = this.state.mapService.view.getZoom();
          if (state.staff) {
            if (viewZoom >= state.ZOOM_LEVEL.MIDDLE) {
              state.areaStaffLayer.setVisible(false)
              state.staffLayer.setVisible(true)
              if (viewZoom > state.ZOOM_LEVEL.STAFFLEAVE) {
                this.commit('olMapCardLayer/adjustStaffs', viewZoom)
              } else {
                let isStaffChange = judgeZoomlevel(viewZoom, this.state.mapService.map.getView().getProperties().zoomLevel, 'staff')
                isStaffChange && this.commit('olMapCardLayer/adjustStaffs', viewZoom)
              }
            } else {
              state.areaStaff ? state.areaStaffLayer.setVisible(true) : state.areaStaffLayer.setVisible(false)
              state.staffLayer.setVisible(false)
            }
            this.commit('olMapCardLayer/changeScaleVehicle', viewZoom)
          } 
        }
      })
    },
    changeScaleVehicle(state, viewZoom) {
      let shouldChange = judgeZoomlevel(viewZoom, this.state.mapService.map.getView().getProperties().zoomLevel, 'vehicle')
      let features = state.vehicleLayerSource.getFeatures()
      for (let feature of features) {
        let { color } = feature.getProperties()
        if (color && (color.includes('cmj') || color.includes('tunnel') || color.includes('djc'))) {
          feature.setStyle(createLabelStyleVehicle(feature, viewZoom, feature.getProperties(), this.state.mapService.map))
        }
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
      if (subType === 'hydraulic') return
      if (dataType === 'card') {
        getSVByCardId({ident:id,type:subType}).then((res) => {
          if (res.code === 200) {
            this.commit('stateStore/changeCardModal', {
              isVisible: true,
              data: res.result,
              subType: subType
            })
          }
        })
      } else if (dataType === 'staffArea') {
        getPositionCard({areaId: id, type: 'staff'}).then((res) => {
          console.log('区域人员', res)
          if (res.code === 200) {
            this.commit('stateStore/changeDetailDialog', {
              type: true,
              cardType: dataType,
              data: res.result,
              title: res.result.name,
              areaId: id,
            })
          }
        })
      } 
    }
  },
  actions: {
    informMapUpdateCard ({state, commit, dispatch}, data) {
      if (!data) return
      let needMove = data.needMove
      let setMove = data.setMove
      let isShowStaffLayer = false
      let viewZoom = this.state.mapService.map.getView().getZoom()
      if (state.staff && viewZoom >= state.ZOOM_LEVEL.MIDDLE) {
        isShowStaffLayer = true
      }
      state.staffLayer.setVisible(isShowStaffLayer)
      let card = data.card
      let type = data.type
      let cardID = card['ident']
      let speed = card['speed']
      let name = card['name']
      let group = type === 'vehicle'? state.vehicleLayerSource.getFeatureById(cardID) : state.staffLayerSource.getFeatureById(cardID)
      if (group) {
        if (needMove) {
          group = setCardCoord(cardID, group, card, type, this.state.mapService.map)
        } else {
          let isAnimate = speed > 0 && setOrAnimate(card, type, group, this.state.mapService.map, setMove)
          if (isAnimate) {
            let duration = type === 'staff' ? 2000 * 0.99 : 1000 * 0.99 
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
        this.commit('olMapCardLayer/setGroups', {
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
          rotation: card.bearing,
          color: card.color
        }
        if (card && card.mapType) {
          attrs['playtype'] = card.mapType;
        } else {
          attrs['playtype'] = 'MONITOR'; 
        }
        let layerSource = type === 'vehicle' ? state.vehicleLayerSource : state.staffLayerSource
        group = drawSymbol(attrs, layerSource, this.state.mapService.map)
        this.commit('olMapCardLayer/setGroups', {
          cardID: cardID,
          group: group
        })
      }
    },
    clearLayers({state}, type) {
      if (type === 'staff') {
        state.staffLayerSource.clear(true)
        // state.areaStaffSource.clear(true)
        state.groups.clear()
      } else if (type === 'vehicle') {
        state.vehicleLayerSource.clear(true)
      }
      
    },
    mapShowCard({state, commit, dispatch}, msg) {
      let viewZoom = this.state.mapService.map.getView().getZoom()
      if (msg.isVisible) {
        if (msg.symbolType === 'vehicle') {
          state.vehicleLayer.setVisible(true)
        } else if (msg.symbolType === 'staff') {
          state.staff = true
          if (viewZoom >= state.ZOOM_LEVEL.MIDDLE) {
            state.staffLayer.setVisible(true)
          } else {
            state.areaStaffLayer.setVisible(true)
          }
        } else if (msg.symbolType === 'areaStaff') {
          state.areaStaff = true
          state.areaStaffLayer.setVisible(true)
        }
      } else {
        if (msg.symbolType === 'vehicle') {
          state.vehicleLayer.setVisible(false)
        } else if (msg.symbolType === 'staff') {
          state.staff = false
          state.areaStaffLayer.setVisible(false)
          state.staffLayer.setVisible(false)
        } else if (msg.symbolType === 'areaStaff') {
          state.areaStaff = false
          state.areaStaffLayer.setVisible(false)
        }
      }
    },
    drawStaffs({state, commit, dispatch}, datas) {
      state.areaStaffSource.clear()
      if (datas) {
        for (let i = 0; i < datas.length; i++) {
          let data = datas[i]
          if (data.count === 0 || !data.hasOwnProperty('path')) continue
          let coordinates = convertSVGPath2Coord(data.path)
          let polygon = new ol.geom.Polygon([coordinates])
          let extent = polygon.getExtent()
          let coord = ol.extent.getCenter(extent)
          if (coord.every(item => isNaN(item))) return
          let centerPoly = new ol.geom.Point(coord)
          let feature = new ol.Feature(centerPoly)
          let areaNumber = data.count
          let text = data.name + ' ' + areaNumber + '人'
          let totle = stringDivider(text, data.name.length, '\n')
          let msg = {
            'totle': totle,
            'data-id': data.id,
            'data-type': 'staffArea',
            'number': parseInt(areaNumber)
          }
          feature.setProperties(msg)
          feature.setId('staffArea' + data.id)
          state.areaStaffSource.addFeature(feature)
          feature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.6)'
              }),
              radius: 40,
              stroke: ol.style.Stroke({
                color: '#000000',
                width: 2
              })
            }),
            text: new ol.style.Text({
              text: feature.get('totle'),
              font: '14px/2 Microsoft YaHei',
              textAlign: 'center',
              fill: new ol.style.Fill({
                color: '#000000'
              })
            })
          }))
        }
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
              group = setCardCoord(cardID, group, card, card.type, this.state.mapService.map, this.state.mapService.mapType)
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
                group = setCardCoord(cardID, group, card, card.type, this.state.mapService.map, this.state.mapService.mapType)
              }
            }
            this.commit('olMapCardLayer/setGroups', {
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
      if (cardTypeName === 'vehicle') {
        feature = state.vehicleLayerSource.getFeatureById(cardID);
      } else if (cardTypeName === 'staff') {
        feature = state.staffLayerSource.getFeatureById(cardID);
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
    }
  }
}
