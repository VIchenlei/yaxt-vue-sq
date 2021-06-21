import ol from 'openlayers'
import { getAllReaderPath } from '@api/api'
import { clone, getCoverLine, unique, getStartAndEndPath } from '../map/mapUtils/OlMapLayerUtils'
import { getPolylineBYPoints, createPathStyle, getWarnPosition } from '../map/mapUtils/OlMapUtils'

export default {
  namespaced: true,
  state: {
    layerSource: null,
    routePlanLayer: null,
    readerPath: null,
    feature: null,
    rows: null, // 人员轨迹数据
    startTime: null, //告警数据
    routePlan: null,
  },
  mutations: {
    initLayers (state) {
      state.layerSource = new ol.source.Vector()
      state.routePlanLayer = new ol.layer.Vector({
        source: state.layerSource,
        zIndex: 12
      })
      this.state.mapService.map.addLayer(state.routePlanLayer)
      getAllReaderPath().then((res) => {
        if (res.code === 200) {
          state.readerPath = res.result
        }
      })

    },
    addInteraction(state, msg) {
      let self = this
      this.state.mapService.draw.interaction = new ol.interaction.Draw({
        source: new ol.source.Vector(),
        type: 'LineString'
      })
      this.state.mapService.map.addInteraction(this.state.mapService.draw.interaction)
      this.state.mapService.draw.interaction.addEventListener('drawend', function (evt) { self.commit('olMapRoutePlan/drawend',{evt, msg}) }, false)
    },
    drawend(state, result) {
      let self = this
      const roadSegments = state.readerPath
      if (!roadSegments || roadSegments.length === 0) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
        return this.$message.warning('路径不存在！')
      }
      const pathGather = clone(roadSegments)
      let { evt, msg } = result
      state.feature = evt.feature
      let wkt = new ol.format.WKT()
      let wktGeo = wkt.writeGeometry(state.feature.getGeometry())
      let shortRoads = []
      let coord = []
      let path = wktGeo.slice(11, -2).split(',').map((item, index) => {
        item = item.split(' ')
        item[0] = Number(Number(item[0]).toFixed(1))
        item[1] = Number(Number(item[1]).toFixed(1))
        return item
      })
      for (let i = 0; i < path.length; i++) {
        if (i < path.length - 1) {
          let obj = {
            start_point: {
              x: path[i][0],
              y: path[i][1]
            },
            end_point: {
              x: path[i + 1][0],
              y: path[i + 1][1]
            }
          }
          let a = obj.start_point.x - obj.end_point.x
          let b = obj.start_point.y - obj.end_point.y
          let lineNum = 10 //开始点结束点线段距离等分成n段
          let line = Math.sqrt(a * a + b * b) / lineNum //获取等分线段长度
          for (let j = 0; j < lineNum; j++) {
            if (j === 0) coord.push([obj.start_point.x, obj.start_point.y])
            let x1 = obj.start_point.x + (obj.end_point.x - obj.start_point.x) * (j + 1) / lineNum
            let y1 = obj.start_point.y + (obj.end_point.y - obj.start_point.y) * (j + 1) / lineNum
            coord.push([x1, y1])
          }
          let singleShortPath = getCoverLine(coord, pathGather)
          shortRoads = shortRoads.concat(singleShortPath)
        }
      }
      //查找覆盖路径去除重复的路径信息
      const key = 'code'
      if (!shortRoads) return
      shortRoads = unique(shortRoads, key)
      this.commit('olMapRoutePlan/getRoutePlan', {path, coord, shortRoads})
      this.state.mapService.map.addEventListener('dblclick', (evt) => {
        if (!state.routePlan) return
        self.commit('stateStore/changeInspectionModal', {
          type: true,
          path: state.routePlan 
        })
        state.routePlan = null;
      })
      this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
    },
    getRoutePlan(state, msg) {
      let {path, coord, shortRoads} = msg
      let routePlan = ''
      for (let i = 0; i < shortRoads.length; i++) {
        if (i === 0) {
          coord = getStartAndEndPath(path[i][0], path[i][1], shortRoads[i].bpoint.x, shortRoads[i].bpoint.y, shortRoads[i].epoint.x, shortRoads[i].epoint.y)
          routePlan += `${shortRoads[i].code},,${coord.x},${coord.y},${shortRoads[i].epoint.x},${shortRoads[i].epoint.y};`
        } else if (0 < i && i < shortRoads.length - 1) {
          routePlan += `${shortRoads[i].code},;`
        } else if (i === shortRoads.length - 1) {
          coord = getStartAndEndPath(path[path.length - 1][0], path[path.length - 1][1], shortRoads[i].bpoint.x, shortRoads[i].bpoint.y, shortRoads[i].epoint.x, shortRoads[i].epoint.y)
          if (Number(shortRoads[i].bpoint.x) <= Number(coord.x) || Number(shortRoads[i].bpoint.y) <= Number(coord.y)) {
            routePlan += `${shortRoads[i].code},,${shortRoads[i].bpoint.x},${shortRoads[i].bpoint.y},${coord.x},${coord.y}`
          } else {
            routePlan += `${shortRoads[i].code},,${coord.x},${coord.y},${shortRoads[i].bpoint.x},${shortRoads[i].bpoint.y}`
          }
        }
      }
      state.routePlan = routePlan
    }
  },
  actions: {
    setRoutePlan({state,commit,dispatch}, msg) {
      if (this.state.mapService.draw.interaction) {
        this.state.mapService.map.removeInteraction(this.state.mapService.draw.interaction)
      }
      this.commit('olMapRoutePlan/addInteraction', msg)
    },
    showRoutePlan({state,commit,dispatch}, msg) {
      let features = state.layerSource.getFeatures()
      let isDrawFeature = false
      if (features.length > 0) state.layerSource.clear() //清除已有的人员偏离路线
      state.rows = msg.result.hisPath
      state.startTime = msg.startTime
      dispatch('viewRoutePlan', msg.result.route)
      dispatch('viewCrossLine', msg.result.hisPath)
    },
    viewRoutePlan({state,commit,dispatch}, route) { //执行展示预定路线函数
      let readerPath = state.readerPath
      let roads = []
      for (let i = 0; i < route.length; i++) {
        const road = readerPath.find(item => item.code === route[i])
        roads.push(road)
      }
      const color = '#ffcc33'
      for (let i = 0; i < roads.length; i++) {
        let singleRoad = [{
          road_segment_id: roads[i].code,
          x: Number(roads[i].beginX),
          y: Number(roads[i].beginY)
        },
        {
          road_segment_id: roads[i].road_segment_id,
          x: Number(roads[i].endX),
          y: Number(roads[i].endY)
        }]
        // if (msg.checked) {
          let path = getPolylineBYPoints(singleRoad)
          // this.drawOLLine(this.layerSource, path.pointCol, roads[i].code, color)
          let drawMsg = {
            // layerSource: state.layerSource,
            point: path.pointCol,
            code: roads[i].code,
            color
          }
          dispatch('drawOLLine', drawMsg)
        // }
      }
    },
    viewCrossLine({state,commit,dispatch}, hisPath) { //执行展示越界线函数
      let paths = clone(hisPath)
      for (let i = 0; i < paths.length; i++) {
        paths[i]['shortime'] = getWarnPosition(paths[i], state.startTime)
      }
      let clonePaths = clone(paths)
      clonePaths.sort(function (a, b) {
        return a.shortime - b.shortime
      })
      let index = null
      for (let i = 0; i < paths.length; i++) {
        if (paths[i].shortime === clonePaths[0].shortime) index = i
      }
      let normalPaths =  clone(paths)
      let deviatePaths =  clone(paths)
      let normalRoads = normalPaths.splice(0,index+1)//正常行走路线
      let deviateRoads = deviatePaths.splice(index) //偏离路线
      dispatch('crossAllLinePath', {rows: normalRoads, index: 1})
      dispatch('crossAllLinePath', {rows: deviateRoads, index: 2})
    },
    crossAllLinePath ({state,commit,dispatch}, msg) {
      const { rows, index } = msg
      for (let i = 0; i < rows.length; i++) {
        if (i < rows.length-1) {
          let startPath = rows[i]
          let endPath = rows[i+1]
          let roads = [startPath, endPath]
          dispatch('setCrossLinePath', {roads, index})
        }
      }
    },
    setCrossLinePath({state,commit,dispatch}, msg) {
      const { roads, index } = msg
      // index为1真实路线 为2偏离的路线
      const color = index === 1 ? '#804000' : '#FF6057'
      for (let i = 0; i < roads.length; i++) {
        let x = roads[i].begin_pt.split(',')[0]
        let y = roads[i].begin_pt.split(',')[1]
        roads[i]['x'] = Number(x)
        roads[i]['y'] = Number(y)
      }
      // if (this.checked) {
        let path = getPolylineBYPoints(roads)
        let drawMsg = {
          point: path.pointCol,
          code: roads[i].code,
          color
        }
        dispatch('drawOLLine', drawMsg)
      // }
    },
    drawOLLine({state,commit,dispatch}, drawMsg) {
      const { point, code, color } = drawMsg
      let linestring = new ol.geom.LineString(point)  // 坐标数组
      var lineFeature = new ol.Feature({
        geometry: linestring,
        id: code,
        finished: false
      })
      lineFeature.setStyle(createPathStyle(color))
      lineFeature.setId(code)
      state.layerSource.addFeature(lineFeature)
      return { lineFeature: lineFeature, lineLength: linestring.getLength()}
    }
  }
}