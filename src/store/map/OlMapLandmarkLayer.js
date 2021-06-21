import ol from 'openlayers'
import { drawSymbol } from './mapUtils/OlMapUtils.js'
import { getLandmarkList } from '@api/api'

export default {
  namespaced: true,
  state: {
    landmarkerSource: null,
    landmarkerLayer: null,
    isLandmarkerLayer: false,
    tool: null
  },
  mutations: {
    initLayers (state) {
      state.landmarkerSource = new ol.source.Vector()
      state.landmarkerLayer = new ol.layer.Vector({
        source: state.landmarkerSource,
        style: new ol.style.Style({
          zIndex: 3
        })
      })
      state.landmarkerLayer.setVisible(false)
      this.state.mapService.map.addLayer(state.landmarkerLayer)
      state.isLandmarkerLayer = false
    },
  },
  actions: {
    drawLandmarker ({state, commit, dispatch}, msg) {
      const { data, status } = msg
      if (data) {
        for (let landmark of data) {
          let landmarkID = landmark.code
          let attrs = {
            'data-id': landmarkID,
            'data-number': landmark.name,
            'data_subtype': 'landmark',
            'data-type': 'landmark',
            x: landmark.pointX,
            y: landmark.pointY,
            class: 'icon-device state-connected',
            geom: landmark.geom
          }
          drawSymbol(attrs, state.landmarkerSource, this.state.mapService.map)
        }
      }
      state.landmarkerLayer.setVisible(status)
      state.isLandmarkerLayer = true
    },
    removeFeature({state, commit, dispatch}, code) {
      // let features = state.landmarkerSource.getFeatures()
      // for (let i = 0; i < features.length; i++) {
      //   const feature = features[i]
      //   const id = feature.getProperties()['data-id']
      //   if (id == code) state.landmarkerSource.removeFeature(feature)
      // }
      let feature = state.landmarkerSource.getFeatureById(code);
      feature && state.landmarkerSource.removeFeature(feature);
    },
    updateFeatures({state, commit, dispatch}) {
      let status = state.landmarkerLayer.getVisible()
      state.landmarkerSource.clear()
      getLandmarkList({mapID: window.xdata.state.mapService.mapID}).then((res) => {
        if (res.code === 200) {
          dispatch('drawLandmarker', {data: res.result, status: status, name: 'landmark'})
        }
      })
    }
  }
}
