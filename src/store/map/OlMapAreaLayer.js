/*
  区域图层
*/
import ol from 'openlayers'
import { convertSVGPath2Coord } from './mapUtils/OlMapUtils.js'
import { getVisibleAreaType, createPolygonStyle } from './mapUtils/OlMapLayerUtils'
import { getAreaList } from '@api/api'
// import {ZOOM_LEVEL} from '../def/map_def.js'
export default {
  namespaced: true,
  state: {
    layerSource: null,
    areaLayer: null,
    alarmAreaSource: null,
    alarmAreaLayer: null,
    isAreasDrawed: false,
    areaSelect: null,
    areaModify: null,
    areaList: new Map(),
    feature: null,
    editFeature: null,
    isEditing: false,
    updateAreaId: null,
    ZOOM_LEVEL: null,
  },
  mutations: {
    initLayers (state) {
      state.ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
      state.layerSource = new ol.source.Vector()
      state.areaLayer = new ol.layer.Vector({
        source: state.layerSource,
        zIndex: 12
      })
      this.state.mapService.map.addLayer(state.areaLayer)

      state.alarmAreaSource = new ol.source.Vector()
      state.alarmAreaLayer = new ol.layer.Vector({
        source: state.alarmAreaSource,
        zIndex: 1
      })
      this.state.mapService.map.addLayer(state.alarmAreaLayer)
    },
    handleSubtype(state, msg) {
      const id = msg.feature.getId();
      const currentId = 'area' + state.updateAreaId;
      console.log('id:'+id, 'currentId:'+currentId)
      if (id === currentId) {
        state.areaModify.setActive(true);
        this.state.mapService.map.addInteraction(state.areaSelect);
      } else {
        state.areaModify.setActive(true);
        this.state.mapService.map.removeInteraction(state.areaSelect);
      }
      if (!state.isEditing) {
        this.commit('olMapAreaLayerEdit/showTips',msg)
      } 
    },
  },
  actions: {
    drawInitArea ({state, commit, dispatch}, msg) {
      state.areaSelect = new ol.interaction.Select()
      state.areaModify = new ol.interaction.Modify({
        features: state.areaSelect.getFeatures()
      })
      if(msg.hasOwnProperty('fromPage')){
        if (state.feature) state.feature.setGeometry(null)
        let feature = state.layerSource.getFeatureById('area' + msg.areas)
        if (feature) state.layerSource.removeFeature(feature)
        state.isAreasDrawed = false
      }
      dispatch('showArea', msg)
    },
    showArea ({state,commit, dispatch}, msg) {
      if (msg.status) {
        if (msg.type) {
          dispatch('drawAlarmArea', msg)
        } else {
          dispatch('drawAreas', msg)
          dispatch('setDiffAreaTypeVisible', msg)
          state.areaLayer.setVisible(true)
        } 
      } else {
        if (msg.type) {
          dispatch('removeAlarmArea', msg)
        } else {
          dispatch('unvisible', msg)
          if (Array.from(state.areaList.values()).length <= 0) state.areaLayer.setVisible(false)
        }
      }
    },
    drawAlarmArea ({state, commit, dispatch}, msg) {
      if (msg.data) {
        let locationareas = msg.areas
        for (let localarea of locationareas) {
          let areaID = localarea
          let isLocalArea = state.alarmAreaSource.getFeatureById('location' + areaID)
          if (isLocalArea) {
            // let locatingarea = xdata.locateStore.locateAreas.get(areaID)
            if (locatingarea !== msg.type) {
              let text = isLocalArea.get('areaLabel')
              isLocalArea.setStyle(createPolygonStyle(text, msg.type))
            }
          } else {
            // let area = xdata.metaStore.data.area.get(areaID)
            let areaLabel = xdata.metaStore.getNameByID('area_id', areaID)
            if (area && area.points) {
              let coordinates = []
              let paths = area.points.split(' ')
              for (let path of paths) {
                let point = path.split(',')
                let x = Number(point[0].substring(1))
                let y = -Number(point[1])
                coordinates.push([x, y])
              }
              let message = {
                areaLabel: areaLabel,
                data_subtype: 'area'
              }
              let polygon = new ol.geom.Polygon([coordinates])
              let center = polygon.getInteriorPoint().getCoordinates()
              this.map.getView().animate({
                center: center,
                duration: 1000,
                zoom: state.ZOOM_LEVEL.SMALL
              })
              let feature = new ol.Feature(polygon)
              feature.setId('location' + areaID)
              feature.setProperties(message)
              state.alarmAreaSource.addFeature(feature)
              feature.setStyle(createPolygonStyle(areaLabel, msg['type']))
            }
          }
        }
      }
    },
    drawAreas ({state, commit, dispatch}, msg) {
      let { data, visiblearea } = msg
      let visibleAreaType = getVisibleAreaType(visiblearea)
      if (data) {
        for (let area of data) {
          if (area.needDisplay === 0) continue
          const datas = { msg, area, visibleAreaType }
          dispatch('drawArea', datas)
        }
      }
      state.isAreasDrawed = true
    },
    drawArea ({state, commit, dispatch}, datas) {
      let { msg, area, visibleAreaType } = datas
      const featureID = 'area' + area.code
      const areaType = area.areaType
      if (!msg) {
        let areaName = 'area_' + area.areaType
        visibleAreaType = state.areaList.get(areaName)
      }
      dispatch('drawFeature', {area, featureID, areaType, visibleAreaType})
    },
    drawFeature ({state, commit, dispatch}, msg) {
      let feature = null
      let { area, featureID, areaType, visibleAreaType } = msg
      if (area.needDisplay === 0) return
      let areaLabel = area.name
      if (area.points) {
        let coordinates = convertSVGPath2Coord(area.points)
        let polygon = new ol.geom.Polygon([coordinates])
        polygon.set(featureID, featureID, true)
        feature = new ol.Feature(polygon)
      } else if (area.geom) {
        let wkt = new ol.format.WKT()
        let wktGeo = wkt.readGeometry(area.geom)
        feature = new ol.Feature(wktGeo)
      }
      if (feature) { 
        feature.setId(featureID)
        feature.setProperties({areaLabel: areaLabel, areaType: areaType, data_subtype: 'area', 'data-id': area.code})
        const style = createPolygonStyle(areaLabel, areaType)
        if (areaType === Number(3000)) style.setZIndex = 13 // 施工区域层级调至最高
        feature.setStyle(style)
        if (visibleAreaType) {
          if (areaType != visibleAreaType) feature.setStyle(null)
        }
        state.layerSource.addFeature(feature)
      }
    },
    setDiffAreaTypeVisible ({state, commit, dispatch}, msg) {
      let { data, visiblearea } = msg
      let visibleAreaType = getVisibleAreaType(visiblearea)
      if (data) {
        for (let area of data) {
          if (area.need_display === 0) continue
          let featureID = 'area' + area.code
          let areaType = area.areaType
          let feature = state.layerSource.getFeatureById(featureID)
          state.areaList.set(visiblearea,visibleAreaType)
          let areaList = Array.from(state.areaList.values())
          if (!areaList.includes(areaType)) {
            feature && state.layerSource.removeFeature(feature)
          } else {
            if (!feature) {
              dispatch('drawFeature', {area, featureID, areaType, visibleAreaType})
            }
          }
        }
      }
    },
    removeAlarmArea ({state, commit, dispatch}, msg) {
      let areas = msg.areas
      for (let i = 0, len = areas.length; i < len; i++) {
        let areaID = areas[i]
        dispatch('deleteArea', areaID)
      }
    },
    deleteArea (state, areaID) {
      let feature = state.alarmAreaSource.getFeatureById('location' + areaID)
      if (feature) state.alarmAreaSource.removeFeature(feature)
    },
    unvisible ({state, commit, dispatch}, msg) {
      let visibleAreaType = getVisibleAreaType(msg.visiblearea)
      state.areaList.delete(msg.visiblearea)
      let features = state.layerSource.getFeatures()
      for (let feature of features) {
        let areaType = feature.getProperties().areaType
        if (areaType == visibleAreaType) state.layerSource.removeFeature(feature)
      } 
    },
    updateAreas ({state, commit, dispatch}, msg) {
      getAreaList({mapID: window.xdata.state.mapService.mapID}).then((res) => {
        console.log(res)
        if (res.code === 200) {
          let result = res.result
          let areaTypes = Array.from(state.areaList.values());
          result = result && result.filter(item =>areaTypes.includes(item.areaType));
          let msg = {
            data: result,
            visiblearea: 'area'
          }
          dispatch('drawAreas', msg)
        }
      })
    },
    removeFeature({state, commit, dispatch}, code) {
      let feature = state.layerSource.getFeatureById(`area${code}`);
      feature && state.layerSource.removeFeature(feature);
    },
    mapDrawArea({state, commit, dispatch}, data) {
      let self = this
      state.areaSelect = new ol.interaction.Select()
      state.areaModify = new ol.interaction.Modify({
        features: state.areaSelect.getFeatures()
      })
      state.isEditing = true
      this.state.mapService.map.addInteraction(state.areaSelect)
      this.state.mapService.map.addInteraction(state.areaModify)
      state.updateAreaId = !data.code ? null : data.code
      this.state.mapService.map.addEventListener('dblclick', (evt) => {
        if (!state.isEditing) return
        state.isEditing = false
        state.areaSelect.setActive(false)
        state.areaModify.setActive(false)
        this.state.mapService.map.removeInteraction(state.areaSelect)
        this.state.mapService.map.removeInteraction(state.areaModify)
        state.editFeature = state.layerSource.getFeatureById('area' + data.code)
        let wkt = new ol.format.WKT()
        let wktGeo = wkt.writeGeometry(state.editFeature.getGeometry())
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
        data.points = path
        self.commit('stateStore/changeAreaEdit', {
          type: true,
          rows: data
        })
      })
    }
  }
}
