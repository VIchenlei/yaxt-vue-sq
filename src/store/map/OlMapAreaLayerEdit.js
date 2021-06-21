import ol from 'openlayers'
import { ST } from '../def/odef'
import { sendAreaList, getAreaByCode } from '@api/api'
export default {
  namespaced: true,
  state: {
    layerSource: null,
    areaLayer: null,
    EditLayer: null,
    modify: null,
    snap: null,
    isforbidArea: false,
    feature: null,
    rows: null,
    name: null
  },
  mutations: {
    initLayers (state) {
      state.layerSource = new ol.source.Vector()
      state.areaLayer = new ol.layer.Vector({
        source: this.layerSource,
        zIndex: 12
      })
      this.state.mapService.map.addLayer(state.areaLayer)
    },
    addInteraction(state, msg) {
      let self = this
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'Polygon'
      })
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapAreaLayerEdit/drawend',{evt, msg}) }, false)
    },
    drawend(state, result) {
      let { evt, msg } = result
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
      let stateType = state.name === 'edit_area' || state.name === 'edit_forbid_area' ? 'changeAreaModal' : 'changeGoafModal'
      this.commit(`stateStore/${stateType}`, {
        type: true,
        points: path
      })
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
    },
    showTips(state, msg) {
      const { evt, feature } = msg
      let dataID = feature.getId()
      let id = dataID ? dataID.split('area')[1] : -1
      if (id < 0) return
      let subtype = feature.get('data_subtype')
      getAreaByCode({code: id}).then((res) => {
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
    addArea({state,commit,dispatch}, msg) {
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      state.name = msg.name
      this.commit('olMapAreaLayerEdit/addInteraction', msg)
    }
  }
}