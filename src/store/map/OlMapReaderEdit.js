import ol from 'openlayers'
import { ST } from '../def/odef'
import { getReaderByCode } from '@api/api'

export default {
  namespaced: true,
  state: {
    readerSource: null,
    readerLayer: null,
    EditLayer: null,
    modify: null,
    snap: null,
    isforbidArea: false,
    feature: null,
    rows: null,
    isToolTip: true
  },
  mutations: {
    initLayers (state) {
      state.readerSource = new ol.source.Vector()
      state.readerLayer = new ol.layer.Vector({
        source: state.readerSource,
        zIndex: 12
      })
      this.state.mapService.map.addLayer(state.readerLayer)
    },
    addInteraction(state, msg) {
      let self = this
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'Point'
      })
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapReaderEdit/drawend',{evt, msg}) }, false)
    },
    drawend(state, result) {
      let { evt, msg } = result
      state.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(state.feature.getGeometry())
      
      let geom = "'" + wktGeo + "'"
      let valueGeom = {geom: geom}
      let coords = valueGeom.geom.split('POINT')[1].split('(')[1].split(')')[0].split(' ')
      this.commit('stateStore/changeReaderModal', {
        type: true,
        coords: coords
      })
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
    },
    handleSubtype(state, msg) {
      this.commit('olMapReaderEdit/showTips',msg)
    },
    showTips(state, msg) {
      const { evt, feature } = msg
      let dataID = feature.get('data-id')
      let id = dataID ? dataID.split('-')[0] : -1
      if (id < 0) return
      let subtype = ['virtual_reader', 'reader', 'reader-v', 'reader_o', 'reader_s', 'reader_b'].includes(feature.get('data_subtype')) ? 'reader' : feature.get('data_subtype')

      getReaderByCode(id).then((res) => {
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
    addReader({state,commit,dispatch}, msg) {
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      this.commit('olMapReaderEdit/addInteraction', msg)
    }
  }
}