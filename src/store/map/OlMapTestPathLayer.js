import ol from 'openlayers'
export default {
  namespaced: true,
  state: {
    layerSource: null,
    testPathLayer: null,
    rows: null,
    testPath: null
  },
  mutations: {
    initLayers (state) {
      console.log('初始化-----------------------------------------------')
      state.layerSource = new ol.source.Vector()
      state.testPathLayer = new ol.layer.Vector({
        source: state.layerSource,
        zIndex: 15
      })
      this.state.mapService.map.addLayer(state.testPathLayer)
    },
    addInteraction(state, msg) {
      let self = this
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'LineString'
      })
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapTestPathLayer/drawend',{evt, msg}) }, false)
    },
    drawend(state, result) {
      let { evt, msg } = result;
      state.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(state.feature.getGeometry())
      let path = wktGeo.slice(11,-2).split(',').map((item,index)=>{
        item = item.split(' ').map((it,index) =>{
          return Number(it).toFixed(1)
        }).join(' ')
        if (index === 0) {
          item = "M" + item.replace(/[ ]/g,",")
        } else {
          item = "L" + item.replace(/[ ]/g,",")
        }
        return item
      })
      path = path.join(" ")
      state.testPath = path;
      let self = this;
      this.state.mapService.map.addEventListener('dblclick', (evt) => {
        if (!state.testPath) return
        self.commit('stateStore/changeTrailModal', {
          type: true,
          trail: state.testPath
        })
        state.testPath = null;
      })
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
    }
  },
  actions: {
    testPath({state, commit, dispatch}, msg) {
      console.log('模拟路径')
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      this.commit('olMapTestPathLayer/addInteraction', msg)
    }
  }
}
