import ol from 'openlayers'
import { drawSymbol } from './mapUtils/OlMapUtils.js'
import { getLightList, getAlarm } from '@api/api'
const defColorArr = ['红','黄','绿','闪烁']//用来处理判断是否输出warn
export default {
  namespaced: true,
  state: {
    layerSource: null,
    lightLayer: null,
    rows: null,
    alarm: null,
    overlayGroups: new Map(),
  },
  mutations: {
    initLayers (state) {
      state.layerSource = new ol.source.Vector()
      state.lightLayer = new ol.layer.Vector({
        source: state.layerSource,
        zIndex: 14
      })
      this.state.mapService.map.addLayer(state.lightLayer)
      state.lightLayer.setVisible(false)
      getLightList().then((res) => {
        if (res.success) {
          let result = res.result
          state.rows = result.records
          this.dispatch('olMapLightLayer/initDrawTrafficLisght', {data: result.records, status: true, name: 'light'})
        }
      })
    },
  },
  actions: {
    showLight ({state, commit, dispatch}, msg) {
      const { status } = msg
      const type = status ? 'remove' : 'add'
      dispatch('removeOrAddOverlayHide', {type})
      state.lightLayer.setVisible(status)
    },
    // 初始绘制红绿灯
    initDrawTrafficLisght ({state, commit, dispatch}, msg) {
      const { data } = msg
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const light = data[i]
          dispatch('drawLights', {row: light, stateName: '绿'})
        }
      }
    },
    drawLightsAndChangeState ({state, commit, dispatch}, msg) {
      const { rows, data } = msg
      for (let i = 0, len = rows.length; i < len; i++) {
        let row = rows[i]
        let lightData = state.rows && state.rows.filter(item => item.code === row[1]),
            x = lightData && lightData.pointX, 
            y = lightData && lightData.pointY
        let stateData = xdata.metaStore.data.device_state.get(row[2])
        let stateName = stateData && defColorArr.includes(stateData.name) && stateData.name
        if (isExitAlarm) stateName = '异常'
        if(!stateName){
          console.warn('unknow light state,pleace check device_state config!')
          continue
        }
        // this.drawLights(row, stateName, x, y)
      }
    },
    drawLights ({state, commit, dispatch}, msg) {
      const { row, stateName } = msg
      let isDrawRedState = dispatch('setStateAndNeedRedraw', msg)
      if (isDrawRedState) {
        const x = row.pointX, y = row.pointY
        if (stateName === '闪烁') {
          dispatch('mapAddOverlay', msg)
          // this.mapAddOverlay(row,x,y)
          state.overlayGroups.set(row.code, true)
        } else {
          let attrs = {
            'data-id': row.code,
            'id': row.code,
            'data-type': 'lights',
            'data_subtype': 'traffic-lights', //设备类型名
            // 'stateCtrl': row[3] ? 1 : 0,
            // 'ctrlUser': row[3],
            'stateCtrl': 0,
            'ctrlUser': 0,
            x: x,
            y: y,
            class: '',
            state: stateName
          }
          drawSymbol(attrs, state.layerSource, this.state.mapService.map)
        }
      }
    },
    mapAddOverlay ({state, commit, dispatch}, msg) {
      const { row, stateName } = msg
      let curLayerShow = state.lightLayer.getVisible()
      let div = document.createElement('div')
      curLayerShow ? div.setAttribute('class', 'lightFlash') : div.setAttribute('class', 'lightFlash hide')
      div.setAttribute('id', row.code)
      div.setAttribute('ctrlUser', 0)
      div.setAttribute('stateCtrl', 0)

      let pointOverlay = new ol.Overlay({
        element: div,
        positioning: 'center-center',
        id: 'lightFlash' + row.code,
        stopEvent: false
      })

      // div.addEventListener("click", this.showTips.bind(this,div,'overlay'))
      this.state.mapService.map.addOverlay(pointOverlay)
      pointOverlay.setPosition([x, -y])
    },
    setStateAndNeedRedraw ({state, commit, dispatch}, msg) {
      const { row, stateName } = msg
      let feature = state.layerSource.getFeatureById(row.code),src
      let overlay = state.overlayGroups.get(row.code)
      if (!feature) return true //都没有,即新画
      const x = row.pointX, y = row.pointY
      if (feature) {// 如果有，改状态,也有可能是改为overlay，改后不需要重画
        if (stateName === '闪烁') {
          dispatch('mapAddOverlay', msg)
          // this.mapAddOverlay(data, x, y)
          state.overlayGroups.set(row.code, true)
          state.layerSource.removeFeature(feature)
        } else {
          if (stateName === '红') src = `/img/lightred.png`
          if (stateName === '绿') src = `/img/lightgreen.png`
          if (stateName === '黄') src = `/img/lightyellow.png`
          if (stateName === '异常') src = '/img/lightgrey.png'
          let style = {image: new ol.style.Icon({src: src,scale: 0.08})}
          let attributes = {
            'data-id': row.code,
            'id': row.code,
            'data-type': 'lights',
            'data_subtype': 'traffic-lights', // 设备类型名
            // 'stateCtrl': row[3] ? 1 : 0,
            // 'ctrlUser': row[3],
            'stateCtrl': 0,
            'ctrlUser': 0,
            x: x,
            y: y,
            class: '',
            state: stateName
          }
          feature.setProperties(attributes)
          feature.setStyle(new ol.style.Style(style))
        }
        return false 
      }

      if (overlay) { // 原来是overlay,需要改为feature,需要重画
        dispatch('removeOverlay', msg)
        return true 
      }
    },
    removeOverlay ({state}, msg) {
      const { row } = msg
      let overlay = this.state.mapService.map.getOverlayById('lightFlash' + row.code)
      overlay && this.state.mapService.map.removeOverlay(overlay)
    },
    removeOrAddOverlayHide(type) {
      let overlays = document.getElementsByClassName('lightFlash')
      if (overlays && overlays.length > 0) {
        for (let i=0,len = overlays.length; i<len; i++) {
          type === 'remove' ?  overlays[i].classList.remove('hide') : overlays[i].classList.add('hide') 
        }
      }
    }
  }
}
