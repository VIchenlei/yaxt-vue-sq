/*
  采空区图层
  登录默认加载采空区图层
*/
import ol from 'openlayers'
import { convertSVGPath2Coord } from './mapUtils/OlMapUtils.js'
import { getGoafList, getGoafByCode } from '@/api/api'
import { createFillStyle } from './mapUtils/OlMapLayerUtils'

export default {
  namespaced: true,
  state: {
    fillAreaSource: null,
    fillAreaLayer: null,
    isDrawed: false,
    fillAreaSelect: null,
    fillAreaModify: null,
    path: '',
    editFeature: null,
    isEditing: false,
    updateGoafId: null,
    modifyArr: [],
  },
  mutations: {
    initLayers (state) {
      state.fillAreaSelect = new ol.interaction.Select()
      state.fillAreaModify = new ol.interaction.Modify({
        features: state.fillAreaSelect.getFeatures()
      })
      state.fillAreaSelect.setActive(false)
      state.fillAreaModify.setActive(false)
      state.fillAreaSource = new ol.source.Vector()
      state.fillAreaLayer = new ol.layer.Vector({
        source: state.fillAreaSource,
        zIndex: 12
      })
      this.state.mapService.map.addLayer(state.fillAreaLayer)
      getGoafList({mapID: window.xdata.state.mapService.mapID}).then((res) => {
        if (res.success) {
          let result = res.result
          this.dispatch('olMapFillAreaLayer/drawGoafs', {data: result, status: true, pname: 'path'})
        }
      })
    },
    addInteraction(state, msg) {
      let self = this
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'Polygon'
      })
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapFillAreaLayer/drawend',{evt, msg}) }, false)
    },
    drawend(state, result) {
      let { evt, msg } = result
      state.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(state.feature.getGeometry())
      // let path = wktGeo.slice(9, -2).split(',').map((item, index)=>{
      //   item = item.split(' ').join(',')
      //   return item
      // })
      // path = path.join(';')
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
      state.path = path
      let stateType = 'changeGoafModal'
      this.commit(`stateStore/${stateType}`, {
        type: true,
        points: path
      })
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
    },
    handleSubtype(state, msg) {
      let id = msg.feature.getId(),
          currentId = 'goaf' + state.updateGoafId
      if (id === currentId) {
        state.fillAreaModify.setActive(true);
        this.state.mapService.map.addInteraction(state.fillAreaSelect);
      } else {
        state.fillAreaModify.setActive(true);
        this.state.mapService.map.removeInteraction(state.fillAreaSelect);
      }
      if (!state.isEditing) {
        this.commit('olMapFillAreaLayer/showTips',msg)
      }
    },
    showTips(state, msg) {
      const { evt, feature } = msg
      let dataID = feature.getId()
      let id = dataID ? dataID.split('goaf')[1] : -1
      if (id < 0) return
      let subtype = feature.get('data_subtype')
      getGoafByCode({code: id}).then((res) => {
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
    drawGoafs ({state, commit, dispatch}, msg) {
      const { data, status, pname } = msg
      if (data) {
        for (let goaf of data) {
          if (!goaf) return
          dispatch('drawGoaf', {goaf, pname})
        }
      }
      state.isDrawed = true
    },
    drawGoaf({state, commit, dispatch}, msg) {
      let {goaf,pname} = msg
      let canvas = document.createElement('canvas')
      let context = canvas.getContext('2d')
      let goafID = `goaf${goaf.code}`
      let path = pname ? goaf.path : state.path
      let fill = convertSVGPath2Coord(path)
      let polygon = new ol.geom.Polygon([fill])
      let feature = new ol.Feature(polygon)
      let attributies = {
        data_subtype: 'goaf',
        'data-id': goaf.code
      }
      feature.setId(goafID)
      feature.setProperties(attributies)
      let pixelRatio = 1
      canvas.width = 8 * pixelRatio
      canvas.height = 8 * pixelRatio
      context.fillStyle = 'rgba(255, 255, 255, 0.1)'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.strokeStyle = 'rgba(192, 192, 192, 0.5)'
      context.beginPath()
      context.moveTo(0, 0)
      context.lineTo(300, 300)
      context.stroke()
      let patten = context.createPattern(canvas, 'repeat')
      feature.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({ width: 1, color: [192, 192, 192] }),
        fill: new ol.style.Fill({
          color: patten
        })
      }))
      state.fillAreaSource.addFeature(feature)
    },
    addGoaf({state, commit, dispatch}, msg) {
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      state.name = msg.name
      this.commit('olMapFillAreaLayer/addInteraction', msg)
    },
    removeFeature({state, commit, dispatch}, code) {
      let features = state.fillAreaSource.getFeatures()
      let goafFeatureID = `goaf${code}`
      let feature = state.fillAreaSource.getFeatureById(goafFeatureID)
      feature && state.fillAreaSource.removeFeature(feature)

      console.log(state.fillAreaSource.getFeatures())
      for (let i = 0, len = state.modifyArr.length; i < len; i++) {
        if (state.modifyArr[i] && state.modifyArr[i].getId() === goafFeatureID) state.modifyArr[i].setGeometry(null)
      }
    },
    async updateGoafs({state, commit, dispatch}) {
      await getGoafList({mapID: window.xdata.state.mapService.mapID}).then((res) => {
        if (res.code === 200) {
          dispatch('drawGoafs', {data: res.result, status: true, name: 'path'})
        }
      })
    },
    mapDrawGoaf({state, commit, dispatch}, data) {
      let self = this
      state.fillAreaSelect = new ol.interaction.Select()
      state.fillAreaModify = new ol.interaction.Modify({
        features: state.fillAreaSelect.getFeatures()
      })
      state.isEditing = true
      this.state.mapService.map.addInteraction(state.fillAreaSelect)
      this.state.mapService.map.addInteraction(state.fillAreaModify)
      state.updateGoafId = !data.code ? null : data.code
      state.fillAreaModify.on('modifyend', (evt)=> {
        state.modifyArr.push(evt.features.getArray()[0])
      })
      this.state.mapService.map.addEventListener('dblclick', (evt) => {
        if (!state.isEditing) return
        state.isEditing = false
        state.fillAreaSelect.setActive(false)
        state.fillAreaModify.setActive(false)
        this.state.mapService.map.removeInteraction(state.fillAreaSelect)
        this.state.mapService.map.removeInteraction(state.fillAreaModify)
        state.editFeature = state.fillAreaSource.getFeatureById('goaf' + data.code)
        let wkt = new ol.format.WKT()
        let wktGeo = wkt.writeGeometry(state.editFeature.getGeometry())
        // let path = wktGeo.slice(9, -2).split(',').map((item, index)=>{
        //   item = item.split(' ').join(',')
        //   return item
        // })
        // path = path.join(';')
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
        state.path = path
        console.log('path', path)
        data.path = path
        self.commit('stateStore/changeGoafEdit', {
          type: true,
          rows: data
        })
      })
    },
    showHidden({state, commit, dispatch}, msg) {
      const { name, status } = msg
      state.fillAreaLayer.setVisible(status)
    }, 
  }
}
