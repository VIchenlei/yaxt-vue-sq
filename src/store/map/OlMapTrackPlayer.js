
import ol from 'openlayers'
import { getPolylineBYPoints, drawOLLine } from '../map/mapUtils/OlMapUtils'
export default {
  namespaced: true,
  state: {
    map: null,
    mapID: null,
    trackWhole: null,
    layerSource: null,
    trackPlayerLayer: null,
    data: null,
  },
  mutations: {
    initLayers (state) {
      state.layerSource = new ol.source.Vector()
      state.trackPlayerLayer = new ol.layer.Vector({
        source: state.layerSource,
        style: new ol.style.Style({
          zIndex: 3
        })
      })
      state.trackPlayerLayer.name = 'trackplayerlayer'
      this.state.mapService.map.addLayer(state.trackPlayerLayer);
      console.log('轨迹图层初始化')
    }
  },
  actions: {
    drawWholeTrack ({state, commit, dispatch}, msg) {
      msg['type'] = 'track-whole'
      let track = dispatch('drawOLTrack', msg)
    },
    drawOLTrack({state, commit, dispatch}, msg) {
      let cardID = msg.cardID
      state.data = msg.rows
      state.mapID = msg.mapID
      let data = state.data
      let className = msg.type
      let PatrolPath= msg.PatrolPath
      let track = null
      let path = getPolylineBYPoints(data, null, state.mapID)
      if (path.hopCount > 0) {
        let id = `HISTORY_TRACK_${cardID}`
        track = drawOLLine(state.layerSource, id, path.pointCol, className, PatrolPath)
      }
      return { pathDom: track.lineFeature, pathLength: track.lineLength, pathDef: path }
    }
  }
}