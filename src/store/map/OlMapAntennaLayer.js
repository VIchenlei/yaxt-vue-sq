import ol from 'openlayers'
import { drawSymbol } from './mapUtils/OlMapUtils.js'
import { getAantennaAngle, getReaderCoord } from './mapUtils/disc'

export default {
  namespaced: true,
  state: {
    layerSource: null,
    readerLayer: null,
    rows: null,
  },
  mutations: {
    initLayers (state) {
      state.layerSource = new ol.source.Vector()
      state.readerLayer = new ol.layer.Vector({
        source: state.layerSource,
        zIndex: 14
      })
      this.state.mapService.map.addLayer(state.readerLayer)
    },
  },
  actions: {
    drawAntennas ({state, commit, dispatch}, msg) {
      const { data, status } = msg
      if (status) {
        if (data && data.length) {
          for (let i = 0; i < data.length; i++) {
            const antenna = data[i]
            dispatch('drawAntenna', {antenna})
          }
        }
      }
      state.readerLayer.setVisible(status)
    },
    drawAntenna ({state, commit, dispatch}, msg) {
      const {antenna} = msg
      const pathColor = ['#9932CD', '#70DB93']
      for (let i = 0; i < 2; i++) {
        const color = pathColor[i]
        const type = i === 0 ? 'a' : 'b'
        const angle = getAantennaAngle(antenna.pointX, -antenna.pointY, antenna[`aerial${type}X`], -antenna[`aerial${type}Y`])
        const point = getReaderCoord(antenna.pointX, -antenna.pointY, 5, angle)
        const points = [[antenna.pointX, -antenna.pointY], [point.x, point.y]]
        let idx = i + 1
        let readerId = antenna.code
        dispatch('drawOLLine', {points, readerId, color, idx})
      }
    },
    async drawOLLine ({state, dispatch}, msg) {
      const { points, readerId, color, idx } = msg
      let t = await dispatch('getDeviceText', {idx})
      const linestring = new ol.geom.LineString(points) // 坐标数组
      const lineLength = linestring.getLength()
      var lineFeature = new ol.Feature({
        geometry: linestring,
        id: readerId,
        finished: false
      })
  
      const style = {
        stroke: { width: 4, color: color },
        fill: { color: 'rgba(255,255,255,0.2)'}
      }
      let ant = new ol.style.Style({
        stroke: new ol.style.Stroke(style.stroke),
        fill: new ol.style.Fill(style.fill),
        text: new ol.style.Text(t)
      })
  
      lineFeature.setStyle(ant)
      state.layerSource.addFeature(lineFeature)
      return { lineFeature, lineLength }
    },
    getDeviceText ({state}, msg) {
      const { idx } = msg
      if (!idx) return ''
      let t
      let briefName = idx
      if (briefName) {
        t = {
          text: `${briefName}`,
          font: '12px',
          fill: new ol.style.Fill({color: '#09f'}),
          stroke: new ol.style.Stroke({lineCap: 'square', color: '#fff', miterLimit: 10, width: 10}),
          offsetY: 0
        }
      }
      return t
    }
  }
}
