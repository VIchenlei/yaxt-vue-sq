import ol from 'openlayers'
import {
  ST
} from '../def/odef'
import { getPositionCard } from '@api/api'
import { createCountStyle } from '../map/mapUtils/OlMapLayerUtils'

export default {
  namespaced: true,
  state: {
    querySource: null,
    queryLayer: null,
    type: null,
    tool: null,
    featureId: 100,
    measureTooltipElement: null,
    measureTooltip: null
  },
  mutations: {
    initLayers(state) {
      state.querySource = new ol.source.Vector()
      state.queryLayer = new ol.layer.Vector({
        source: state.querySource,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      })
      this.state.mapService.map.addLayer(state.queryLayer)
    },
    handleSubtype (state, msg) {
      const {points, subTypeID, shape} = msg.feature.getProperties()
      const cardType = subTypeID === 1 ? 'staff' : 'vehicle'
      let featureMsg = { points, shape, type: cardType}
      featureMsg['mapId'] = window.xdata.state.mapService.mapID
      getPositionCard(featureMsg).then((res) => {
        if (res.code === 200) {
          let data = res.result ? res.result : null
          let title = cardType === 'staff' ?  '人员' : '车辆'
          title = res.result ? res.result.name : title
          this.commit('stateStore/changeDetailDialog', {
            type: true,
            cardType: cardType,
            data: data,
            title: title,
            shape: shape,
            points: points,
          })
        } else {
          console.log(res.message)
        }
      })
    },
    createMeasureTooltip (state) {
      if (state.measureTooltipElement) {
        state.measureTooltipElement.parentNode.removeChild(state.measureTooltipElement)
      }
      state.measureTooltipElement = document.createElement('div')
      state.measureTooltipElement.className = 'tooltip tooltip-measure'
      state.measureTooltip = new ol.Overlay({
        id: state.featureId,
        element: state.measureTooltipElement,
        offset: [0, -10],
        positioning: 'bottom-center'
      })
      this.state.mapService.map.addOverlay(state.measureTooltip)
    },
    drawstart(state, evt) {
      let sketch = evt.feature
      let mapScale = window.xdata.state.mapService.zoomLevel.SCALE
      sketch.getGeometry().addEventListener('change', (evt) => {
        let geom = evt.target // 绘制几何要素
        if (geom instanceof ol.geom.Circle) {
          let tooltipCoord = geom.getLastCoordinate()
          state.measureTooltipElement.innerHTML = parseInt(geom.getRadius()*mapScale*1000)/1000// 将测量值设置到测量工具提示框中显示
          state.measureTooltip.setPosition(tooltipCoord) // 设置测量工具提示框的显示位置
        }       
      })
    },
    async drawend(state, data) {
      let {shape, evt} = data
      shape = shape === 'Box' ? 'Polygon' : shape
      let feature = evt.feature
      feature.setId(state.featureId)
      let filterGeo = feature.getGeometry()
      let boxCoord = ol.extent.getCenter(filterGeo.getExtent())
      // let rows = xdata.cardStore.getDetail(state.type, ST.SUM, '', filterGeo)
      let points = ''
      if (shape === 'Polygon') {
        let wkt = new ol.format.WKT()
        let wktGeo = wkt.writeGeometry(feature.getGeometry())
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
        points = path.join(" ")
      } else {
        let radius = filterGeo.getRadius()
        let coords = filterGeo.getFirstCoordinate()
        points = `M${coords[0]},${coords[1]} L${radius}`
      }
      console.log(points)
      shape = shape.toLocaleLowerCase()
      let cardType = state.type === 1 ? 'staff' : 'vehicle'
      let params = {points, shape, type: cardType}
      let personCount = 0
      params['mapId'] = window.xdata.state.mapService.mapID
      await getPositionCard(params).then((res) => {
        console.log(res)
        if (res.code === 200) {
          personCount = res.result && res.result.total
        } else {
          console.log(res.message)
        }
      })
      let name = state.type === 1 ? '人' : '车'
      let totle = (personCount ? personCount : 0) + name
      let type = state.type
      let centerPoly = new ol.geom.Point(boxCoord)
      let featureCountCircle = new ol.Feature(centerPoly)
      featureCountCircle.setId('featureCount' + state.featureId)
      let msg = {
        'data_subtype': 'countStaffVehicle',
        'totle': totle,
        'subTypeID': type,
        'statType': ST.SUM,
        'filterGeo': filterGeo,
        'type': 'card',
        'points': points,
        'shape': shape,
      }

      featureCountCircle.setProperties(msg)
      state.querySource.addFeature(featureCountCircle)
      let style = createCountStyle(featureCountCircle)
      featureCountCircle.setStyle(style)
      let msg2 = {
        'type': 'card',
        'data_subtype': 'countStaffVehicle',
        'subTypeID': type,
        'statType': ST.SUM,
        'filterGeo': filterGeo
      }
      feature.setProperties(msg2)
      state.querySource.addFeature(feature)
      state.measureTooltipElement.className = 'tooltip tooltip-static' // 设置测量提示框的样式
      state.measureTooltip.setOffset([0, -7])
      this.commit('olMapQueryLayer/createDeleteBox', boxCoord)
      state.featureId = state.featureId + 1
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      state.measureTooltipElement = null
      // state.tool.classList.remove('active')
      // state.tool.removeAttribute('flag')
    },
    /**
     * 加载交互绘制控件函数
     */
    addInteraction(state, msg) {
      let self = this
      state.type = msg.type
      let geotype = msg.geotype
      if (geotype === 'Box') {
        this.state.mapService.draw.interaction = new ol.interaction.Draw({
          source: new ol.source.Vector(),
          type: 'Circle',
          geometryFunction: ol.interaction.Draw.createBox()
        })
      } else {
        this.state.mapService.draw.interaction = new ol.interaction.Draw({
          source: new ol.source.Vector(),
          type: geotype
        })
      }
      this.commit('olMapQueryLayer/createMeasureTooltip')
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawstart', function (evt) { self.commit('olMapQueryLayer/drawstart',evt) }, false)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapQueryLayer/drawend',{shape: geotype, evt}) }, false)
    },
    createDeleteBox (state, boxCoord) {
      let self = this
      let Fid = state.featureId
      let deleteBoxElement = document.createElement('div')
      deleteBoxElement.className = 'deletebox deletebox-static'
      deleteBoxElement.innerHTML = 'x'
      deleteBoxElement.setAttribute('featureId', Fid)
      deleteBoxElement.addEventListener('click', (evt) => {
        let deletebox = evt.target
        let featureId = deletebox.getAttribute('featureId')
        state.querySource.getFeatureById(featureId) && state.querySource.removeFeature(state.querySource.getFeatureById(featureId))
        state.querySource.removeFeature(state.querySource.getFeatureById('featureCount' + featureId))
        self.state.mapService.map.removeOverlay(self.state.mapService.map.getOverlayById(featureId))
        deletebox.parentNode.removeChild(deletebox)
      })
      let deleteBox = new ol.Overlay({
        id: 'deleteBox',
        element: deleteBoxElement,
        offset: [45, 12],
        positioning: 'bottom-center'
      })
      deleteBox.setPosition(boxCoord)
      this.state.mapService.map.addOverlay(deleteBox)
    }
  },
  actions: {
    mapQuery({state,commit,dispatch}, msg) {
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      this.commit('olMapQueryLayer/addInteraction', msg)
    }
  }
}