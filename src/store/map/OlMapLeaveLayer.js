import ol from 'openlayers'
export default {
  namespaced: true,
  state: {
    layerSource: null,
    leaveLayer: null,
    rows: null,
    points: null
  },
  mutations: {
    initLayers (state) {
      state.layerSource = new ol.source.Vector()
      state.leaveLayer = new ol.layer.Vector({
        source: state.layerSource,
        zIndex: 16
      })
      this.state.mapService.map.addLayer(state.leaveLayer)
    },
    addInteraction(state) {
      let self = this
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'Polygon'
      })
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapLeaveLayer/drawend',{evt}) }, false)
    },
    drawend(state, result) {
      let { evt } = result;
      state.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(state.feature.getGeometry())
      let path = wktGeo.slice(9,-2).split(',').map((item,index)=>{
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
      console.log('path', path)
      state.points = path;
      let self = this;
      this.state.mapService.map.addEventListener('dblclick', (evt) => {
        if (!state.points) return
        self.commit('stateStore/changeMapModel', {
          type: true,
          modalText: '提示：如果发送，井下人员收到“马上撤离”的信息。',
          resultStatus: 'warning',
          resultTitle: '您确认要发送“撤离”消息吗？',
          ajaxName: 'leave',
          title: '发送撤离',
          points: state.points,
          showInput: true,
        })
        state.points = null;
      })
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
    }
  },
  actions: {
    drawLeaveArea({state, commit, dispatch}) {
      console.log('画撤离区域')
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      this.commit('olMapLeaveLayer/addInteraction')
    }
  }
}
