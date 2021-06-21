import ol from 'openlayers'
import { showDetailOrBriefLabel } from '../map/mapUtils/OlMapUtils'
// import { ZOOM_LEVEL } from '../def/map_def'
const spliceLevel = 9
const DEAFULT_MAP_MATRIXID = 'shaqu:'
export default {
  namespaced: true,
  state: {
    mapID: 1,
    map: null,
    view: null,
    workspace: null,
    cardTips: null,
    showCardTips: false,
    showCardTipsID: null,
    flag: false,
    mousePositionControl: null,
    select: null,
    modify: null,
    selectActive: false,
    preFeature: null,
    isInnerIP: false,
    draw: {interaction: 'yes'},
    initViewConfig: null,
    zoomLevel: null,
  },
  mutations: {
    storeMap (state, val) {
      state.mapID = val.mapID
      state.map = val.map
      state.view = val.view
      state.zoomLevel = val.zoomLevel
    },
    changeCareTips (state, msg) {
      state.cardTips = msg
      state.showCardTips = true
      state.showCardTipsID = msg.id
    },
    hideCardTips (state) {
      state.showCardTips = false
    },
    changeMapType (state, msg) {
      state.mapType = msg.mapType
      console.log(msg)
    },
    changeMouse (state, msg) {
      state.flag = msg.flag
      if (!state.mousePositionControl) {
        state.mousePositionControl = new ol.control.MousePosition({
          coordinateFormat: ol.coordinate.createStringXY(1),
          undefinedHTML: '0,0',
          target: document.getElementById('mouse-position')
        })
      }
      let map = state.map
      state.flag ? map.addControl(state.mousePositionControl) : map.removeControl(state.mousePositionControl)
    },

    choosePreFeature (state){
      let features = state.select.getFeatures().getArray()
      if (state.selectActive && features && features.length>0){
        state.preFeature = features[0]
      }
    }
  },
  actions: {
    initMap ({state, commit, dispatch}, rows) {
      let self = this
      let ret = null
      let mapID = rows.id
      // state.isInnerIP = judgeURL()
      state.isInnerIP = false
      let mapDef = rows.map
      let row = rows.mapRow
      let zoomLevel = {
        MIN: row.geoMin,
        SMALL: row.geoSmall,
        MIDDLE: row.geoMiddle,
        STAFFLEAVE: row.geoStaffLevel,
        MAX: row.geoMax,
        RESOLUTION: row.geoResolution,
        SCALE: row.scale,
        CARDVIEWZOOM: row.cardViewZoom
      }
      console.log('zoomLevel', zoomLevel)
      let mapURL = mapDef.tileWmsOpts.url
      mapDef.tileWmsOpts.url = state.isInnerIP && row ? row.inner_url : mapURL
      let containerName = state.mapType === 'HISTORY' ?  'trackmap' : 'monitormap'
      let container = document.querySelector('#' + containerName)
      if (!container) {
        console.warn('NO map container element in current document: ', containerName)
        return ret
      }
      // let chooseMap = this.state.mapStore.gisMap && this.state.mapStore.gisMap.get(mapID)
      let chooseMap = null
      let projExtent = ol.proj.get('EPSG:3857').getExtent()
      let startResolution = ol.extent.getWidth(projExtent) / 256
      let resolutions = resolutions = new Array(zoomLevel.RESOLUTION)
      if (state.mapType === 'HISTORY') {
        mapDef.viewOpts.zoom = zoomLevel.MIDDLE
      }
      for (var i = 0, len = resolutions.length; i < len; ++i) {
        resolutions[i] = startResolution / Math.pow(2, i)
      }
      let extent = [2000, -1500, 12000, 4000]
      if (row) {
        extent = [parseInt(row.minX), parseInt(row.minY), parseInt(row.maxX), parseInt(row.maxY)]
      }
      let tileGrid = new ol.tilegrid.TileGrid({
        extent: extent,
        resolutions: resolutions,
        tileSize: [512, 256]
      })
      let tileWmsOpts = mapDef.tileWmsOpts
      let wmsLayer
      tileWmsOpts.tileGrid = tileGrid
      let mapType = mapDef.type
      if (!mapDef.type) {
        let str = mapDef.tileWmsOpts.url
        mapType = mapDef.tileWmsOpts.url.includes('wms')
        mapType = mapType ? 'wms' : 'wmts'
      }
      chooseMap = { map_type: mapType }
      if (mapType === 'wmts') {
        chooseMap.url = tileWmsOpts.url
        chooseMap.layers = tileWmsOpts.params.LAYERS
        chooseMap.matrixId = DEAFULT_MAP_MATRIXID
      }
      if (chooseMap.map_type === 'wms') {
        wmsLayer = new ol.layer.Tile({
          source: new ol.source.TileWMS(tileWmsOpts)
        })
      } else if (chooseMap.map_type === 'wmts') {
        let matrixIds = []
        let resolution = []
        let startResolutions = ol.extent.getHeight(extent) / 256
        for (let i = 0; i <= spliceLevel; i++) {
          matrixIds[i] = chooseMap.matrixId + i
          resolution[i] = startResolutions / Math.pow(2, i)
        }
        let matrixSet = chooseMap.matrixId && chooseMap.matrixId.slice(0, chooseMap.matrixId.indexOf(':'))
        wmsLayer = new ol.layer.Tile({
          source: new ol.source.WMTS({
            url: chooseMap.url,
            layer: chooseMap.layers,
            tileGrid: new ol.tilegrid.WMTS({
              extent: extent,
              resolutions: resolution,
              matrixIds: matrixIds,
              tileSize: [256, 256]
            }),
            matrixSet: matrixSet,
            format: 'image/png',
            projection: 'EPSG:3857'
          })
        })
      } else {
        console.warn('unknow map type!')
      }

      if (containerName === 'monitormap') {
        window.wmsLayer = wmsLayer
      }
      // mapDef.viewOpts.maxZoom = 28
      // mapDef.viewOpts.zoom = 23
      let view = new ol.View(mapDef.viewOpts)

      let m = {
        layers: [wmsLayer],
        overlays: [], // overlays: [tooltips],
        target: containerName,
        view: view,
        controls: ol.control.defaults({
          attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
          })
        }),
        interactions: ol.interaction.defaults({doubleClickZoom :false}).extend([])
      }
      let olmap = new ol.Map(m)
      let zoomslider = new ol.control.ZoomSlider()
      let ele = document.createElement('div')
      let img = document.createElement('img')
      img.src = '/img/north.png'
      ele.innerHTML = img
      document.querySelector('.ol-compass').innerText = ''
      let resetNorth = new ol.control.Rotate({
        autoHide: false,
        label: img
      })
      olmap.addControl(zoomslider)
      olmap.addControl(resetNorth)
      commit('storeMap', {
        mapID: mapID,
        map: olmap,
        view: view,
        zoomLevel: zoomLevel,
      })
      state.initViewConfig = {
        zoom: view.getZoom(),
        center: view.getCenter(),
        rotation: view.getRotation()
      }
      // state.mapType === 'MONITOR' && this.dispatch('olMapWorkSpace/init', state.mapType)
      this.dispatch('olMapWorkSpace/init', state.mapType)
      let moveReaderPointer = new Map()
      // 设置鼠标在特定 feature 上的形状
      olmap.on('pointermove', function (e) {
        let pixel = olmap.getEventPixel(e.originalEvent)
        let hit = olmap.hasFeatureAtPixel(pixel)
        if (hit) {
          olmap.forEachFeatureAtPixel(pixel, (feature) => {
            let dataSubtype = feature.getProperties() && feature.getProperties()['data_subtype']
            if (['virtual_reader', 'reader-v', 'reader', 'reader_o', 'reader_s', 'reader_b'].includes(dataSubtype)) {
              let id = feature.getProperties().id
              showDetailOrBriefLabel(feature, 'detail', id)
              moveReaderPointer.set(id, feature)
            }
          })
        } else if (moveReaderPointer.size > 0) {
          let features = Array.from(moveReaderPointer.values())
          features.forEach((feature) => {
            showDetailOrBriefLabel(feature, 'brief', feature.getProperties().id)
          })
          moveReaderPointer = new Map()
        }
        olmap.getTargetElement().style.cursor = hit ? 'pointer' : ''
      })

      olmap.addEventListener('dblclick', function (evt) {
          let coordinate = evt.coordinate
      })
    },
    resetView({state}) {
      if (state.view && state.initViewConfig) {
        state.view.setCenter(state.initViewConfig.center)
        state.view.setRotation(state.initViewConfig.rotation)
        state.view.setZoom(state.initViewConfig.zoom)
      }
    }
  }
}
