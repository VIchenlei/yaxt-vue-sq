import ol from 'openlayers'
import { drawSymbol } from './mapUtils/OlMapUtils.js'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    layerSource: null,
    readerLayer: null,
    pathLayer: false,
    snap: null,
    draw: null,
    rows: null,
    pathSelect: null,
    pathModify: null,
    readerCode: null,
    modifyArr: [],
  },
  mutations: {
    initLayers (state) {
      state.pathSelect = new ol.interaction.Select()
      state.pathModify = new ol.interaction.Modify({
          features: state.pathSelect.getFeatures()
      })
      state.pathSelect.setActive(false)
      state.pathModify.setActive(false)
      state.layerSource = new ol.source.Vector()
      state.readerLayer = new ol.layer.Vector({
        source: state.layerSource,
        zIndex: 14
      })
      this.state.mapService.map.addLayer(state.readerLayer)

      state.pathModify.on('modifyend', (e)=> {
        state.modifyArr.push(e.features.getArray()[0])
      })
    },
    addInteraction (state) {
      const source = state.layerSource
      state.draw = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'LineString',
      })
      this.state.mapService.map.addInteraction(state.draw)
      state.snap = new ol.interaction.Snap({
        source: source,
        pixelTolerance: 20
      })
      this.state.mapService.map.addInteraction(state.snap)
    },
    obtainDrawend (state, data) {
      if (state.draw instanceof String) return
      let self = this
      state.draw.addEventListener('drawend', function (evt) { self.commit('olMapReaderPathLayer/drawend',{evt, data}) }, false)
    },
    async drawend (state, msg) {
      let { evt, data } = msg;
      let geom = evt.feature.getGeometry();
      let coordinates = geom.getCoordinates();
      let coords = []
      if (coordinates && coordinates.length > 0) {
        for (let i = 0; i < coordinates.length; i++) {
          if (i === coordinates.length - 1) break
          coords.push([coordinates[i], coordinates[i+1]])
        }
      }
      // 手动画取分站路径数据
      let pathMsg =  await this.dispatch('olMapReaderPathLayer/getDrawReaderPathMsg', {coords, data});
      data.readerRouteList = pathMsg
      this.commit('stateStore/changeReaderEdit', {
        type: true,
        rows: data
      });
      this.state.mapService.map.removeInteraction(state.draw);
      
    },
    handleSubtype (state, msg) {
      const {feature, evt, type} = msg
      console.log(type)
      const { id, readerCode } = feature.getProperties()
      Vue.prototype['$message'].success(`分站编号为:${readerCode}下的路径编号:${id}`)
    }
  },
  actions: {
    drawPath ({state, commit, dispatch}, msg) {
      const { data, status } = msg
      dispatch('showHidePaths', {status, data})
    },
    drawPoint ({state, commit, dispatch}, msg) {
      const { data, status, name } = msg
      state.rows = data
      if (status) {
        if (!state.pathLayer) {
          dispatch('showHidePaths', {status, data})
          dispatch('showPoints')
        }
        if (name === 'edit_point' && state.draw) {
          this.commit('olMapReaderPathLayer/addInteraction')
          this.commit('olMapReaderPathLayer/obtainDrawend')
        } else {
          dispatch('removeInteraction')
        }
        state.pathLayer = true
      } else {
        dispatch('showHidePaths', {status, data})
        dispatch('removeInteraction')
        state.pathLayer = false
      }

    },
    showHidePaths ({state, commit, dispatch}, msg) {
      const { data, status } = msg
      console.log('分站路径',msg)
      if (data && data.length) {
        for (let i = 0; i < data.length; i++) {
          const readerPath = data[i]
          let drawData = {
            point: [[readerPath.beginX, readerPath.beginY],[readerPath.endX, readerPath.endY]],
            id: readerPath.code,
            color: '#FFCC33',
            readerCode: readerPath.readerCode,
          }
          this.commit('stateStore/switchShow', {code: readerPath.readerCode, checked: status})
          status && dispatch('drawOLLine', drawData)
        }
      }
      state.readerLayer.setVisible(status)
    },
    showPoints ({state, commit, dispatch}) {
      getIntersectionPointList().then((res) => {
        if (res.success) {
          let result = res.result
          let points = result.record
          points && points.forEach(item => {
            const { point } = item
            dispatch('drawPoint', {point})
          })
        }
      })
    },
    drawPoint ({state, commit, dispatch}, msg) {
      let point = msg.point.split(',')
      let feature = new ol.Feature(new ol.geom.Point([Number(point[0]), -Number(point[1])]))
      feature.setStyle(new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ff00b1',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#ff00b1'
          })
        })
      }))
      feature.setProperties({
        point: msg.point,
        data_subtype: 'intersection_point'
      })
      state.layerSource.addFeature(feature)
    },
    deletePoint ({state, commit, dispatch}, msg) {
      const features = state.layerSource.getFeatures()
      const feature = features.filter(feature => {
        const properties = feature.getProperties()
        const { data_subtype, point } = properties
        if (data_subtype === 'intersection_point' && point === msg.point) return true
        return false
      })
      feature[0] && state.layerSource.removeFeature(feature[0])
    },
    drawOLLine ({state, commit, dispatch}, drawData) {
      const { point, id, color, readerCode } = drawData
      const linestring = new ol.geom.LineString(point) // 坐标数组
      const lineLength = linestring.getLength()
      var lineFeature = new ol.Feature({
        geometry: linestring,
        id: id,
        finished: false,
        readerCode: readerCode,
        data_subtype: 'reader_path'
      })
      lineFeature.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({ width: 4, color: color }),
        fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.2)'})
      }))
      state.layerSource.addFeature(lineFeature)
    },
    removeInteraction ({state, commit, dispatch}) {
      this.state.mapService.map.removeInteraction(state.snap)
      state.snap = null
    },
    async addDrawPath({state, commit, dispatch}, data) {
      let features = state.layerSource.getFeatures();
      if (features && features.length > 0) await dispatch('clearlayerSource');
      state.readerCode = data.code;
      await this.commit('olMapReaderPathLayer/addInteraction');
      this.commit('olMapReaderPathLayer/obtainDrawend', data);
    },
    async editDrawPath({state, commit, dispatch}, data) {
      state.layerSource.clear();
      let status = true;
      state.readerCode = data.code;
      await dispatch('showHidePaths', {status, data: data.readerRouteList});
      state.pathSelect.setActive(true);
      state.pathModify.setActive(true);
      this.state.mapService.map.addInteraction(state.pathSelect);
      this.state.mapService.map.addInteraction(state.pathModify);
      this.state.mapService.map.addEventListener('dblclick', (evt) => {
        let isSelect = state.pathSelect.getActive();
        if (!isSelect) return
        let features = state.layerSource.getFeatures();
        let coordinates = [], modifyCoords = []
        for (let i = 0; i < features.length; i++) {
          let coord = features[i].getGeometry().getCoordinates()
          if (coord.length > 2) {
            modifyCoords.push(coord)
          } else {
            coordinates.push(coord)
          }
        }
        if (modifyCoords && modifyCoords.length > 0) {
          for (let i = 0; i < modifyCoords.length; i++) {
            let modifyCoord = modifyCoords[i]
            for (let j = 0; j < modifyCoord.length; j++) {
              if (j === modifyCoord.length - 1) break
              coordinates.push([modifyCoord[j], modifyCoord[j+1]])
            }
          }
        }
        dispatch('modifyPath', {coordinates, data});
      })
    },
    getDrawReaderPathMsg({state, commit, dispatch}, msg) {
      let { coords, data } = msg
      let readerPathMsg = [];
      if (coords && coords.length > 0) {
        for (let i = 0; i < coords.length; i++) {
          let coord = coords[i];
          readerPathMsg.push({
            code: data.readerRouteList[i] && data.readerRouteList[i].code ? data.readerRouteList[i].code : null,
            beginX: Number(coord[0][0].toFixed(2)),
            beginY: Number(coord[0][1].toFixed(2)),
            beginZ: 0,
            endX: Number(coord[1][0].toFixed(2)),
            endY: Number(coord[1][1].toFixed(2)),
            endZ: 0,
            angle: null,
            sort: i,
            readerCode: state.readerCode,
          })
        }
      }
      return readerPathMsg
    },
    async modifyPath({state, commit, dispatch}, msg) {
      let {data, coordinates} = msg;
      let pathMsg = await dispatch('getDrawReaderPathMsg', {coords: coordinates, data });
      data.readerRouteList = pathMsg
      this.commit('stateStore/changeReaderEdit', {
        type: true,
        rows: data
      });
      dispatch('clearlayerSource');
    },
    clearlayerSource ({state, commit, dispatch}) {
      state.layerSource.clear()
      for (let i = 0, len = state.modifyArr.length; i < len; i++) {
        if (state.modifyArr[i]) state.modifyArr[i].setGeometry(null)
      }
      state.pathSelect.setActive(false)
      state.pathModify.setActive(false)
      this.state.mapService.map.removeInteraction(state.pathSelect)
      this.state.mapService.map.removeInteraction(state.pathModify)
    },
    showPath({state, commit, dispatch}, msg) {
      let { data, checked } = msg;
      let status = true;
      if (checked) {
        let isVisible = state.readerLayer.getVisible();
        if (!isVisible) state.layerSource.clear();
        dispatch('showHidePaths', {status, data: data.readerRouteList})
      } else {
        const features = state.layerSource.getFeatures();
        for (let feature of features) {
          const id = feature.getProperties().readerCode;
          if (id == data.code) state.layerSource.removeFeature(feature);
        }
      }
    },
    /*
    * 删除分站 删除对应分站路径显示
    */
    removePathFeature({state, commit, dispatch}, data) {
      // console.log('删除对应分站路径', data);
      let paths = data.readerRouteList;
      let code = data.code;
      const isCheck = this.state.stateStore.showReaderPath.get(code);
      if (isCheck) {
        this.commit('stateStore/switchShow', {code, checked: false});
      }
      if (paths && paths.length > 0) {
        const features = state.layerSource.getFeatures();
        for (let feature of features) {
          const id = feature.getProperties().readerCode;
          if (id == code) state.layerSource.removeFeature(feature);
        }
      }
    }
  }
}
