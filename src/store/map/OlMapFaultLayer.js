import ol from 'openlayers'
import { drawSymbol } from './mapUtils/OlMapUtils.js'

const FAULTMAPID = 7 //地质构造图层ID
const UNDERGROUNDCABLE = 6 // 地下三线图层ID

export default {
  namespaced: true,
  state: {
    faultLayer: null, // 地质构造图层
    undergroundLayer: null //三线构造图层
  },
  mutations: {
    initLayer(state, data) {
      let rows = data.mapdata
      let signLayer = data.signLayer
      let mapDef = rows.map
      let row = rows.mapRow
      mapDef.tileWmsOpts.url = row.inner_url
      let containerName = 'monitormap'
      let projExtent = ol.proj.get('EPSG:3857').getExtent()
      let startResolution = ol.extent.getWidth(projExtent) / 256
      let resolutions = new Array(22)
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
      tileWmsOpts.tileGrid = tileGrid
      let mapType = mapDef.type
      if (!mapDef.type) {
        let str = mapDef.tileWmsOpts.url
        mapType = mapDef.tileWmsOpts.url.includes('wms')
        mapType = mapType ? 'wms' : 'wmts'
      }
      let chooseMap = { map_type: mapType }
      if (chooseMap.map_type === 'wms') {
        if (signLayer === 'fault') {
          state.faultLayer = new ol.layer.Tile({
            source: new ol.source.TileWMS(tileWmsOpts),
            map: this.state.mapService.map
          })
          this.state.mapService.map.addLayer(state.faultLayer)
        } else {
          state.undergroundLayer = new ol.layer.Tile({
            source: new ol.source.TileWMS(tileWmsOpts)
          })
          this.state.mapService.map.addLayer(state.undergroundLayer)
        }
      } 
    }
  },
  actions: {
    drawFault ({state, commit, dispatch}, msg) {
      const { data, status } = msg
      let mapdata = {
        map: {
          "id":5,
          "type":"wms",
          "tileWmsOpts":{
              "url":"http://192.168.0.242:30080/geoserver/ws:ws/wms",
              "params":{
                  "LAYERS":"ws:ws",
                  "TILED":"false"
              },
              "serverType":"geoserver"
          },
          "viewOpts":{
              "center":[
                  235,
                  -855
              ],
              "size":[
                  425,
                  768
              ],
              "zoom":16,
              "maxZoom":22,
              "minZoom":13
          }
        },
        mapRow: {
          "map_id":5,
          "name":"王家塔3-1下煤1",
          "url":"http://192.168.0.242:30080/geoserver",
          "check_layers":"ws:ws",
          "layers":"ws:ws",
          "map_type":"wms",
          "scale":1,
          "detail":"王家塔3-1下煤1",
          "state_id":0,
          "default_map":1,
          "judge_id":0,
          "x":235,
          "y":-855,
          "width":425,
          "height":768,
          "minX":-1424,
          "minY":-1320,
          "maxX":1199,
          "maxY":3403,
          "spy":"WJT3-1XM1"
        }
      }
      if (!state.faultLayer) {
        commit('initLayer', {mapdata, signLayer: 'fault'} )
      }
      state.faultLayer.setVisible(status)
    },
    drawUnderground ({state, commit, dispatch}, msg) {
      const { data, status } = msg
      let mapdata = {
        map: {
          "id":5,
          "type":"wms",
          "tileWmsOpts":{
              "url":"http://192.168.0.242:30080/geoserver/gh-dx:gh-dx/wms",
              "params":{
                  "LAYERS":"gh-dx:gh-dx",
                  "TILED":"false"
              },
              "serverType":"geoserver"
          },
          "viewOpts":{
              "center":[
                  235,
                  -855
              ],
              "size":[
                  425,
                  768
              ],
              "zoom":16,
              "maxZoom":22,
              "minZoom":13
          }
        },
        mapRow: {
          "map_id":5,
          "name":"王家塔3-1下煤1",
          "url":"http://192.168.0.242:30080/geoserver",
          "check_layers":"gh-dx:gh-dx",
          "layers":"gh-dx:gh-dx",
          "map_type":"wms",
          "scale":1,
          "detail":"王家塔3-1下煤1",
          "state_id":0,
          "default_map":1,
          "judge_id":0,
          "x":235,
          "y":-855,
          "width":425,
          "height":768,
          "minX":-1424,
          "minY":-1320,
          "maxX":1199,
          "maxY":3403,
          "spy":"WJT3-1XM1"
        }
      }
      if (!state.undergroundLayer) {
        commit('initLayer', {mapdata, signLayer: 'underground'} )
      }
      state.undergroundLayer.setVisible(status)
    },
  }
}
