import ol from 'openlayers'
import {
  formatLength, formatArea
} from './mapUtils/OlMapUtils.js'

export default {
  namespaced: true,
  state: {
    measureSource: null,
    measureLayer: null,
    mode: null,
    type: null,
    featureId: 200,
    measureTooltipElement: null,
    measureTooltip: null
  },
  mutations: {
    initLayers (state) {
      state.measureSource = new ol.source.Vector()
      state.measureLayer = new ol.layer.Vector({
        source: state.measureSource,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#0099ff',
            width: 3
          })
        })
      })
      this.state.mapService.map.addLayer(state.measureLayer)
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
        offset: [0, -15],
        positioning: 'bottom-center'
      })
      this.state.mapService.map.addOverlay(state.measureTooltip)
    },
    drawstart (state, evt) {
      let sketch = evt.feature
      let tooltipCoord = evt.coordinate
      state.mode = 'drawing'
      let mapScale = window.xdata.state.mapService.zoomLevel.SCALE
      console.log('mapScale', mapScale)
      sketch.getGeometry().addEventListener('change', (evt) => {
        let geom = evt.target
        let output
        let sourceProj = this.state.mapService.map.getView().getProjection()
        if (geom instanceof ol.geom.Polygon) {
          output = formatArea(geom,sourceProj, ol)
          tooltipCoord = geom.getInteriorPoint().getCoordinates()
        } else if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom,sourceProj, ol, mapScale)
          tooltipCoord = geom.getLastCoordinate()
        }
        state.measureTooltipElement.innerHTML = output
        state.measureTooltip.setPosition(tooltipCoord)
      })
    },
    drawend (state, evt) {
      let deletetipCoord = null
      let sketch = evt.feature
      let geom = sketch.getGeometry()
      sketch.setId(state.featureId)
      if (geom instanceof ol.geom.LineString) {
        deletetipCoord = geom.getLastCoordinate()
      } else if (geom instanceof ol.geom.Polygon) {
        deletetipCoord = geom.getInteriorPoint().getCoordinates()
      }
      state.measureTooltipElement.className = 'tooltip tooltip-static'
      state.measureTooltip.setOffset([0, -7])
      this.commit('olMapMeasureLayer/createDeleteBox', deletetipCoord)
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      state.measureTooltipElement = null
      state.featureId = state.featureId + 1
    },
    addInteraction (state, geomtry) {
      let self = this
      let type = (geomtry === 1 ? 'LineString' : 'Polygon')
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: state.measureSource,
        type: type,
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#0099ff',
            width: 3
          }),
          image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            })
          })
        })
      })
  
      this.commit('olMapMeasureLayer/createMeasureTooltip')
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawstart', function (evt) { self.commit('olMapMeasureLayer/drawstart',evt) }, false)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapMeasureLayer/drawend',evt) }, false)
    },
    createDeleteBox (state,boxCoord) {
      let deleteBoxElement = document.createElement('div')
      deleteBoxElement.className = 'deletebox deletebox-static'
      deleteBoxElement.innerHTML = 'x'
      deleteBoxElement.setAttribute('featureId', state.featureId)
      deleteBoxElement.addEventListener('click', (evt) => {
        let deletebox = evt.target
        let featureId = deletebox.getAttribute('featureId')
        state.measureSource.removeFeature(state.measureSource.getFeatureById(featureId))
        this.state.mapService.map.removeOverlay(this.state.mapService.map.getOverlayById(featureId))
        deletebox.parentNode.removeChild(deletebox)
      })
  
      let deleteBox = new ol.Overlay({
        id: 'deleteBox',
        element: deleteBoxElement,
        offset: [15, 20],
        positioning: 'bottom-center'
      })
      deleteBox.setPosition(boxCoord)
      this.state.mapService.map.addOverlay(deleteBox)
    }
  },
  actions: {
    mapMeasure({state, commit, dispatch}, msg) {
      // if (this.state.mapService.map.getTarget() !== 'monitormap') return
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      this.commit('olMapMeasureLayer/addInteraction', msg.geometry)
    }
  }
}
