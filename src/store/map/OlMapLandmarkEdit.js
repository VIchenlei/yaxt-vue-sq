import ol from 'openlayers'
import { ST } from '../def/odef'
import { getLandmarkByCode } from '@api/api'

export default {
  namespaced: true,
  state: {
    landmarkerSource: null,
    landmarkerLayer: null,
    EditLayer: null,
    modify: null,
    snap: null,
    feature: null,
    rows: null
  },
  mutations: {
    initLayers (state) {
      state.landmarkerSource = new ol.source.Vector()
      state.landmarkerLayer = new ol.layer.Vector({
        source: state.landmarkerSource,
        zIndex: 12
      })
      this.state.mapService.map.addLayer(state.landmarkerLayer)
    },
    addInteraction(state, msg) {
      let self = this
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'Point'
      })
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapLandmarkEdit/drawend',{evt, msg}) }, false)
    },
    drawend(state, result) {
      let { evt, msg } = result
      state.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(state.feature.getGeometry())
      
      let geom = "'" + wktGeo + "'"
      let valueGeom = {geom: geom}
      let coords = valueGeom.geom.split('POINT')[1].split('(')[1].split(')')[0].split(' ')
      this.commit('stateStore/changeLandmarkModal', {
        type: true,
        coords: coords
      })
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
    },
    handleSubtype(state, msg) {
      console.log(msg)
      this.commit('olMapLandmarkEdit/showTips',msg)
    },
    showTips(state, msg) {
      const { evt, feature } = msg
      let dataID = feature.get('data-id')
      let id = dataID ? dataID.split('-')[0] : -1
      if (id < 0) return
      let subtype = feature.get('data_subtype')
      getLandmarkByCode({code: id}).then((res) => {
        console.log(res)
        if (res.code === 200) {
          this.commit('stateStore/changeToolModal', {
            type: true,
            data: res.result,
            subtype: subtype
          })
        }
      })
    }
  },
  actions: {
    addLandMark({state,commit,dispatch}, msg) {
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      this.commit('olMapLandmarkEdit/addInteraction', msg)
    }
  }
}