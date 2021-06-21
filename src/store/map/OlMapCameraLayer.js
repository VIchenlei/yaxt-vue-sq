import ol from 'openlayers'
import { drawSymbol } from './mapUtils/OlMapUtils.js'

export default {
  namespaced: true,
  state: {
    cameraSource: null,
    cameraLayer: null,
    isCameraLayer: false,
    tool: null
  },
  mutations: {
    initLayers (state) {
      state.cameraSource = new ol.source.Vector()
      state.cameraLayer = new ol.layer.Vector({
        source: state.cameraSource,
        zIndex: 13
      })
      this.state.mapService.map.addLayer(state.cameraLayer)
      state.cameraLayer.setVisible(false)
      state.isCameraLayer = false
    },
  },
  actions: {
    async drawCamera ({state, commit, dispatch}, msg) {
      const { data, status } = msg
      if (data) {
        for (let camera of data) {
          await dispatch('drawlabel', {camera})
        }
      }
      state.cameraLayer.setVisible(status)
      state.isCameraLayer = true
    },
    async drawlabel ({state, commit, dispatch}, msg) {
      let { id, pointX, pointY, angle } = msg.camera
      let label = new ol.geom.Point([pointX, pointY]), rotate, src = '/img/cameraright.png'
      rotate = angle
      let feature = new ol.Feature({
        geometry: new ol.geom.Point([0, 0]),
        name: 'camera',
        population: 4000,
        rainfall: 500,
        'data-type': 'camera'
      })
      feature.setId(id)
      let style = await dispatch('setFeatureStyle', {src, rotate})
      feature.setStyle(style)
      feature.setGeometry(label)
      state.cameraSource.addFeature(feature)
    },
    setFeatureStyle ({state, commit, dispatch}, msg) {
      return new ol.style.Style({
        image: new ol.style.Icon(({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: msg.src,
          rotation: msg.rotate,
          scale: 0.14,
          rotateWithView: true
        }))
      })
    }
  }
}
