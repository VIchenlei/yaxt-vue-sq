import ol from 'openlayers'
// import {ZOOM_LEVEL} from '../../def/map_def.js'
import {mapIcon} from './map_icon.js'
import {rotateIcon} from './animatorDep'
import moment from "moment"

let staffIcon = mapIcon.staff
let vehicleIcon = mapIcon.vehicle
let vehiclePoint = mapIcon.vehiclePoint
let trackIcon = mapIcon.track
const MONKEYID = 7
const CMJTYPE = 25
const JJJTYPE = 26
const IP = window.location.hostname

function formatLength (line,sourceProj, ol, scale) {
  let wgs84Sphere = new ol.Sphere(6378137)
  let length = 0
  let coordinates = line.getCoordinates()
  for (let i = 0, li = coordinates.length - 1; i < li; i++) {
    let c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326')
    let c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326')
    length += wgs84Sphere.haversineDistance(c1, c2)
  }
  length = `${Math.round(length * scale * 10)/10} m`
  return length
}

function formatArea (polygon, sourceProj, ol) {
  let wgs84Sphere = new ol.Sphere(6378137)
  let area = 0
  let geom = polygon.clone().transform(sourceProj, 'EPSG:4326')
  let coordinates = geom.getLinearRing(0).getCoordinates()
  area = Math.round(Math.abs(wgs84Sphere.geodesicArea(coordinates) * 4)) + ' ' + 'm<sup>2</sup>'
  return area
}

function drawSymbol (attributes, source, map) {
  // 添加Features
  let geo = new ol.geom.Point([attributes.x, attributes.y])

  if (attributes.geom) {
    let wkt = new ol.format.WKT()
    geo = wkt.readGeometry(attributes.geom)
  }

  let feature = new ol.Feature(geo)
  feature.setId(attributes['data-id'])
  feature.setProperties(attributes)

  let dataType = attributes['data_subtype']
  let viewZoom = map.getView().getZoom()
  switch (dataType) {
    case 'vehicle':
      feature.setStyle(createLabelStyleVehicle(feature, viewZoom, attributes, map))
      break
    case 'staff':
      feature.setStyle(createLabelStyleStaff(feature, viewZoom, map))
      break
    case 'landmark':
      feature.setStyle(mapIcon.landmark)
      break
    case 'workFace':
      feature.setStyle(mapIcon.workface)
      break
    case 'fadeArea':
      feature.setStyle(createFadeAreaFeature(map, source, attributes))
      break
    case 'camera':
      feature.setStyle(mapIcon.camera)
      break
    case 'hydraulic':
      feature.setStyle(createLabelStyleHydraulic(feature, viewZoom, attributes, map))
      feature.getStyle().setZIndex(6)
      break
    default:
      feature.setStyle(createDevice(feature, dataType))
      break
  }
  feature.getStyle() && source.addFeature(feature)

  return feature
}

function getDeviceText(id,state,eventTypeID) {
  if (!id) return ''
  let t
  let briefName = `${id}`
  let color = `${state === 0 ? '#1890FF' : Number(eventTypeID) === 33 ? '#f4ea2a' : '#ff5858'}`
  if (briefName) {
    t = {
      text: briefName,
      font: '12px',
      fill: new ol.style.Fill({color: `${color}`}),
      stroke: new ol.style.Stroke({lineCap: 'square', color: '#fff', miterLimit: 20, width: 10}),
      offsetY: -25
    }
  }
  return t
}

function createDevice (feature, dataType) {
  let state = feature.get('state'), id = feature.get('id'), t = feature.get('briefName'), style, eventTypeID = feature.get('event_type')
  let p = {rotateWithView: true}
  switch (dataType) {
    case 'reader-v':
    case 'reader':
      t = getDeviceText(id,state,eventTypeID)
      p.src = `/img/${state === 0 ? 'reader' : Number(eventTypeID) === 33 ? 'chargereader' : 'unnormal'}.png`
      p.scale = 0.08
      break
    case 'reader_o':
      t = getDeviceText(id,state,eventTypeID)
      p.src = `/img/${state === 0 ? 'readerold' : Number(eventTypeID) === 33 ? 'chargereaderold' : 'unnormalold'}.png`
      p.scale = 0.08
      break
    case 'reader_s':
      t = getDeviceText(id,state,eventTypeID)
      p.src = `/img/${state === 0 ? 'readersmall' : Number(eventTypeID) === 33 ? 'chargereadersmall' : 'unnormalsmall'}.png`
      p.scale = 0.08
      break
    case 'reader_b':
      t = getDeviceText(id,state,eventTypeID)
      p.src = `/img/${state === 0 ? 'readerbig' : Number(eventTypeID) === 33 ? 'chargereaderbig' : 'unnormalbig'}.png`
      p.scale = 0.08
      break
    case 'virtual_reader': 
      t = getDeviceText(id,state,eventTypeID)
      p.src = `/img/virtualreader.png`
      p.scale = 0.08
      break
    case 'traffic':
      p.src = `/img/${state === 0 ? 'traffic' : 'untraffic'}.png`
      p.scale = 0.1
      break
    case 'traffic-lights':
      if (state === '红') p.src = `/img/lightred.png`
      if (state === '绿') p.src = `/img/lightgreen.png`
      if (state === '黄') p.src = `/img/lightyellow.png`
      if (state === '异常') p.src = '/img/lightgrey.png'
      p.scale = 0.08
      break
    default:
      console.warn('UNKNOWN device type : ', dataType)
      return null
  }
  style = t ? {image: new ol.style.Icon(p), text: new ol.style.Text(t)} : {image: new ol.style.Icon(p)}
  return new ol.style.Style(style)
}

function showDetailOrBriefLabel(feature, type, id) {
  let briefName = feature.get('briefName'), name = feature.get('name')
  let style = feature.getStyle()
  let text = style ? style.getText() : ''
  briefName = briefName ? briefName : name
  let newText = type === 'detail' ? `${id}-${name}` : `${briefName}`
  text && text.setText(newText)
}

function convertSVGPath2Coord (pathString, split, substring, isreverse) {
  if (!pathString) return
  let coordinates = []
  split = split || ' '
  let paths = pathString.split(split)
  for (let path of paths) {
    let point = path.split(',')
    let x = substring ? Number(point[0]) : Number(point[0].substring(1))
    let y = Number(point[1])
    if (isNaN(x) || isNaN(y)) return coordinates
    coordinates.push([x, y])
  }

  return coordinates
}

function toJson (data) {
  if (typeof data === 'object') {
    return data
  }

  let ret = null
  if (data && (typeof data === 'string')) {
    try {
      ret = JSON.parse(data)
    } catch (error) {
      console.warn('Can NOT parse the input data to be JSON : ', data)
    }
  } else {
    console.warn('The input data\'s type is NOT string : ', data)
  }

  return ret
}

function createLabelStyleStaff (feature, viewZoom, map) {
  const ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
  let id = feature.get('name')
  let playtype = feature.get('playtype')
  let name = String(id)
  let view = map.getView()
  let p = {
    scale: 0.12,
    rotateWithView: true
  }
  let t = {
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -45
  }
  if (playtype === 'HISTORY') {
    p.scale = 0.12
    t.text = `${name}|${feature.get('card-speed')}m/s`
    // if (state === MONKEYID) {
    //   p.src = staffIcon.monkey.img
    // } else {
      p.src = staffIcon.normal.img
    // }
  } else if (viewZoom < ZOOM_LEVEL.STAFFLEAVE) {
    view.setProperties({zoomLevel: 'STAFFSMALL'})
    p.src = staffIcon.point.img
    p.scale = 0.015
    t.name = ''
  } else {
    if (viewZoom >= 21 && viewZoom < 22) {
      p.scale = 0.08
    } else {
      p.scale = 0.12
    }
    view.setProperties({zoomLevel: 'MAX'})
    p.src = staffIcon.normal.img
    t.text = `${name}|${feature.get('card-speed').toFixed(2)}m/s` // 只有正常状态显示速度
  }
  return new ol.style.Style({
    image: new ol.style.Icon(p),
    text: new ol.style.Text(t)
  })
}

function createLabelStyleHydraulic (feature, viewZoom, attributes, map) {
  let rotation = attributes['rotation'] || 0
  let view = map.getView()
  let card = attributes['card']
  let status = card.hydraulicStatus
  if (viewZoom < 21) { // 16
    return new ol.style.Style({
      image: new ol.style.Icon({
        src: '/img/yellowpoint.png',
        rotation: rotation,
        scale: 0.015
      })
    })
  } else if (viewZoom < 23) {
    let p = {
      rotation: rotation,
      rotateWithView: true,
      src: status === 0 ? '/img/hy.png' : '/img/redhy.png',
      scale: 0.13
    }
    let t = {
      font: '12px',
      fill: new ol.style.Fill({
        color: 'red'
      }),
      stroke: new ol.style.Stroke({
        lineCap: 'square',
        color: '#fff',
        miterLimit: 20,
        width: 10
      }),
      offsetY: -35
    }
    return new ol.style.Style({
      image: new ol.style.Icon(p),
      text: new ol.style.Text(t)
    })
  } else {
    view.setProperties({zoomLevel: 'MAX'})
    return getTypeIconHydraulic(feature, rotation, status)
  }
}

function getTypeIconHydraulic (feature, rotation, status) {
  let p = {
    rotation: rotation,
    rotateWithView: true,
    src: status === 0 ? '/img/hy.png' : '/img/redhy.png',
    scale: 0.18
  }
  let t = {
    font: '12px',
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -35
  }
  return new ol.style.Style({
    image: new ol.style.Icon(p),
    text: new ol.style.Text(t)
  })
}

function createLabelStyleVehicle (feature, viewZoom, attributes, map) {
  const ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
  let rotation = attributes['rotation'] || 0
  if (rotation) rotation = rotation * Math.PI / 180
  let iconColor = attributes['color']
  if (iconColor && iconColor.includes('cmj')) rotation = 0.2
  let view = map.getView()
  if (viewZoom < ZOOM_LEVEL.SMALL) { // 16
    view.setProperties({zoomLevel: 'SMALL'})
    return getTypeIconPoint(rotation, iconColor)
  } else if (viewZoom < ZOOM_LEVEL.MIDDLE) { // 18
    view.setProperties({zoomLevel: 'MIDDLE'})
    return getTypeIconVehicle(feature, rotation, iconColor)
  } else {
    if (['cmj', 'cmjON', 'tunnel', 'tunnelON'].includes(iconColor)) {
      return specialScale(viewZoom, rotation, iconColor)
    } else {
      view.setProperties({zoomLevel: 'MAX'})
      return getTypeIconBg(feature, rotation, iconColor)
    }
  }
}

function getTypeIconPoint (rotation, iconColor) {
  let imgSrc = iconColor === 'djc' ? vehiclePoint.red.img : '/img/yellowpoint.png'
  return new ol.style.Style({
    image: new ol.style.Icon({
      src: imgSrc,
      rotation: rotation,
      scale: 0.015
    })
  })
}

function getTypeIconVehicle (feature, rotation, iconColor) {
  let p = {
    rotation: rotation,
    rotateWithView: true,
    src: vehicleIcon[iconColor + 'car'] ? vehicleIcon[iconColor + 'car'].img : '/img/greencar.png',
    scale: 0.18
  }
  let t = {
    font: '12px',
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -35
  }
  if (iconColor === 'cmj'|| iconColor === 'cmjON') {
    p.scale = 0.05
    return new ol.style.Style({
      image: new ol.style.Icon(p)
    })
  } else if (iconColor === 'tunnel'|| iconColor === 'tunnelON'){
    p.scale = 0.03
    return new ol.style.Style({
      image: new ol.style.Icon(p)
    })
  } else if (iconColor === 'djc') {
    p.scale = 0.1
    t.text = String(feature.get('data-number')) + '|' + feature.get('card-speed').toFixed(2) + 'm/s'
    return new ol.style.Style({
      image: new ol.style.Icon(p),
      text: new ol.style.Text(t)
    })
  } else {
    p.scale = 0.2
    t.text = String(feature.get('data-number')) + '|' + feature.get('card-speed').toFixed(2) + 'm/s'
    return new ol.style.Style({
      image: new ol.style.Icon(p),
      text: new ol.style.Text(t)
    })
  }
  
}

function specialScale (viewZoom, rotation, iconColor) {
  let p = {
    rotation: rotation,
    rotateWithView: true,
    src: vehicleIcon[iconColor + 'car'].img,
  }
  if (viewZoom >= 18 && viewZoom <=19) {
    p.scale = 0.05
  } else if (viewZoom > 19 && viewZoom <= 20) {
    p.scale = 0.1
  } else {
    p.scale = 0.3
  }
  return new ol.style.Style({
    image: new ol.style.Icon(p)
  })
}

function getTypeIconBg (feature, rotation, iconColor) {
  let p = {
    rotation: rotation,
    rotateWithView: true,
    src: vehicleIcon[iconColor + 'car'] ? vehicleIcon[iconColor + 'car'].img : '/img/redcar.png',
  }
  let t = {
    font: '12px',
    fill: new ol.style.Fill({
      color: 'red'
    }),
    stroke: new ol.style.Stroke({
      lineCap: 'square',
      color: '#fff',
      miterLimit: 20,
      width: 10
    }),
    offsetY: -35
  }
  if (iconColor === 'cmj'|| iconColor === 'cmjON') {
    p.scale = 0.3
    return new ol.style.Style({
      image: new ol.style.Icon(p)
    })
  } else if (iconColor === 'tunnel'|| iconColor === 'tunnelON'){
    p.scale = 0.08
    return new ol.style.Style({
      image: new ol.style.Icon(p)
    })
  } else if (iconColor === 'djc') {
    p.scale = 0.15
    t.text = String(feature.get('data-number')) + '|' + feature.get('card-speed').toFixed(2) + 'm/s'
    let cardId = String(feature.get('data-id'))
    return new ol.style.Style({
      image: new ol.style.Icon(p),
      text: new ol.style.Text(t)
    })
  } else {
    p.scale = 0.28
    t.text = String(feature.get('data-number')) + '|' + feature.get('card-speed').toFixed(2) + 'm/s'
    let cardId = String(feature.get('data-id'))
    return new ol.style.Style({
      image: new ol.style.Icon(p),
      text: new ol.style.Text(t)
    })
  }
}

function judgeZoomlevel(viewZoom, preZoomlevel, type) {
  const ZOOM_LEVEL = window.xdata.state.mapService.zoomLevel
  let zoomLevel = ''
  if (viewZoom < ZOOM_LEVEL.SMALL) {
    zoomLevel = 'SMALL'
  } else if (viewZoom < ZOOM_LEVEL.MIDDLE) {
    zoomLevel = 'MIDDLE'
  } else {
    zoomLevel = 'MAX'
    if (type === 'staff') {
      if (viewZoom < ZOOM_LEVEL.STAFFLEAVE) {
        zoomLevel = 'STAFFSMALL'
      }
    }
  }
  return preZoomlevel !== zoomLevel
}

function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width
    while (p > 0 && str[p] != ' ') {
      p--
    }
    if (p > 0) {
      var left = str.substring(0, p)
      var right = str.substring(p + 1)
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer)
    }
  }
  return str
}

function dealMapDatas(row) {
  let tiled = Number(row.judge_id) === 0 ? 'false' : true
  let layers = row.layers
  let params = {
    'LAYERS': layers,
    'TILED': tiled
  }
  let center = [Number(row.centerX), Number(row.centerY)]
  let size = [Number(row.width), Number(row.height)]
  let geoserverUrl = row.url
  geoserverUrl = ['localhost', '124.193.200.138'].includes(IP) ? 'http://124.193.200.138:60029/geoserver' : geoserverUrl
  let url = `${geoserverUrl}/${layers}/${row.mapType}`
  let mapID = Number(row.code)
  let map = {
    id: mapID,
    type: row.mapType,
    tileWmsOpts: {
      url: url,
      params: params,
      serverType: 'geoserver'
    },
    viewOpts: {
      center: center,
      size: size,
      zoom: row.geoSmall,
      maxZoom: row.geoMax,
      minZoom: row.geoMin
    }
  }
  return {
    id: mapID,
    map,
    mapRow: row
  }
}

/**
 * [buildPathDef 根据数组，组织开放的 path 字符串]
 * @param  {[Array]} data [坐标数组]
 * @return {[Object]}      [ 包括：{data: [], hopCount: number, path: pathstring}]
 */
function getPolylineBYPoints (data, special, mapID) {
  if (!data || data.length <= 0) {
    return { data: null, hopCount: 0, path: '' }
  }
  let pointList = new Array()
  let hopCount = data.length
  for (let i = 0; i < hopCount; i++) {
    let item = data[i]
    // if (mapID && item.map_id !== mapID) continue
    
    let x = item.x
    let y = item.y
    if (special) {
      let coordinates = item[special] && item[special].split(',')
      x = Number(coordinates[0])
      y = Number(coordinates[1])
    }
    pointList.push([x, y])
  }
  return { data: data, hopCount: hopCount, pointCol: pointList }
}

function drawOLLine (layerSource, id, polCol, className, PatrolPath, row) {
  // layerSource.clear()
  let linestring = new ol.geom.LineString(polCol) // 坐标数组
  // var lineFeature = new ol.Feature(linestring,null,style_line);
  var lineFeature = new ol.Feature({
    geometry: linestring,
    finished: false
  })

  if (PatrolPath === 'PatrolPath') { // 巡检
    lineFeature.setId('hisTrackLine')
    lineFeature.setStyle(trackIcon['route'])
  } else if (PatrolPath === 'firstName') {
    lineFeature.setId('firstLine')
    lineFeature.setStyle(trackIcon['route'])
  } else if (PatrolPath === 'secondName') {
    lineFeature.setId('secondLine')
    lineFeature.setStyle(trackIcon['patrolPath'])
  } else {
    lineFeature.setStyle(trackIcon['patrolPath'])
    lineFeature.setId('hisTrackLinePatrolPath')
  }

  // 2、生成轨迹
  let startMarker = new ol.Feature({
    geometry: new ol.geom.Point(polCol[0])
  })
  let endMarker = new ol.Feature({
    geometry: new ol.geom.Point(polCol[polCol.length - 1])
  })
  if (PatrolPath === 'secondName') {
    startMarker.setStyle(trackIcon['start'])
    endMarker.setStyle(trackIcon['end'])
  } else {
    startMarker.setStyle(trackIcon['startMarker'])
    endMarker.setStyle(trackIcon['endMarker'])
  }

  if (row) {
    startMarker.setProperties({
      'id': id,
      'msg': row,
      'data-type': 'startMarker'
    })
    endMarker.setProperties({
      'id': id,
      'msg': row,
      'data-type': 'endMarker'
    })
  }
  layerSource && layerSource.addFeature(lineFeature)
  layerSource && layerSource.addFeature(startMarker)
  layerSource && layerSource.addFeature(endMarker)
  return { lineFeature: lineFeature, lineLength: linestring.getLength() }
}

function createPathStyle (color) {
  const style = {
    stroke: { width: 3, color: color },
    fill: { color: 'rgba(255,255,255,0.2)'},
  }
  return new ol.style.Style({
    stroke: new ol.style.Stroke(style.stroke),
    fill: new ol.style.Fill(style.fill)
  })
}

//根据告警时间查找距离告警时间最近的位置
function getWarnPosition (row, attDate) {
  let time = null
  let beginTime = Date.parse(row.begin_time)
  let warnTime = Date.parse(attDate)
  time = Math.abs(warnTime-beginTime)
  return time
}

function setCardCoord (cardID, group, card, type, map, mapType) {
  let duration = 1000 * 0.95
  let positionLay = map.getOverlayById('position' + cardID)
  let x = card.x
  let y = card.y
  let pos = [x, y]
  let oldpos = group.getGeometry().getCoordinates()
  if ((oldpos[0] === x && oldpos[1] === y) && type !== 'hydraulic') return
  if (type === 'vehicle') {
    let msg = {}
    msg['group'] = group
    group = rotateIcon({msg, x, y, oldpos})
  }
  group && group.getGeometry() && group.getGeometry().setCoordinates(pos)
  if (positionLay) {
    positionLay.setPosition(pos)
  }
  let viewZoom = map.getView().getZoom()
  let style = group.getStyle()
  let text = style ? style.getText() : ''
  let localTime = mapType && mapType === 'HISTORY' ? moment(new Date(card.locationTime)).format('YYYY-MM-DD HH:mm:ss') : ''
  let speed = type !== 'hydraulic' ? `|${card['speed'].toFixed(2)}m/s` : ''
  let newText = `${cardID || String(cardID)}${speed} ${localTime}`
  text && text.setText(newText)
  if (type === 'hydraulic' && (viewZoom > 21 || viewZoom > 23)) {
    const status = card.hydraulicStatus
    const scale = viewZoom < 23 ? 0.13 : 0.18
    const p = {
      rotation: 0,
      rotateWithView: true,
      src: status === 0 ? '/img/hy.png' : '/img/redhy.png',
      scale: scale
    }
    style.setImage(new ol.style.Icon(p))
  }
  group.set('card-speed', card['speed'])
  group.set('data-number', cardID)
  return group
}

function setOrAnimate (card, cardTypeName, group, map, setMove) {
  let curView = map.getView()
  let curZoom = curView.getZoom()
  let setOrAnimate = setMove // 0：动画；1：定位
  setOrAnimate = 1
  let isAnimate = false // 是否做动画
  let isMove = null
  if (cardTypeName === 'vehicle') {
    isAnimate = setOrAnimate === 0 ? true : false
  } else { // 人员 < 21 不做动画
    if (curZoom < 21) {
      isAnimate = false
    } else {
      let curExtent = curView.calculateExtent()
      let coords = {
        x: card['x'],
        y: card['y']
      }
      // 在可视范围内
      if (coords.x > curExtent[0] && coords.x < curExtent[2] && coords.y > curExtent[1] && coords.y < curExtent[3]) {
        // if (curZoom < 21) { // 可视范围内的显示小点 不做动画
        //   isAnimate = false
        // } else {
        //   isAnimate = setOrAnimate === 1 ? false : true
        // }
        isAnimate = setOrAnimate === 1 ? false : true
      } else {
        // if (curZoom >= 21) { // 显示人员图标时，更新人员位置
        //   isAnimate = false
        // } else { // 显示人员小圆点时，不做移动处理
        //   isMove = 'nomove'
        // }
        isAnimate = false
      }
    }
  }
  return isMove ? isMove : isAnimate
}

function getShowPoint (evt, tt) {
  let tbox = tt.getBoundingClientRect()  // tips 视区
  let mbox = tt.parentElement.getBoundingClientRect()  // 地图视区

  // 点击事件在地图视窗中的坐标(ex, ey)
  let ex = evt.pixel ? evt.pixel[0] : evt.clientX
  let ey = evt.pixel ? evt.pixel[1] : evt.clientY - 40 //div 时减去 head-nav高度

  let offset = 5
  let px = 0
  let py = 0
  if (mbox.width - ex > tbox.width) { // 当点击点右边空间足够时，显示在点击点的右边
    px = ex + offset
  } else if (ex > tbox.width) { // 当点击点左边空间足够时，显示在点击点的左边
    px = ex - tbox.width - offset
  } else { // 居中显示
    px = (mbox.width - tbox.width) / 2
  }

  if (mbox.height - ey > tbox.height) { // 当点击点下边空间足够时，显示在点击点的下边
    py = ey + offset
  } else if (ey > tbox.width) { // 当点击点上边空间足够时，显示在点击点的上边
    py = ey - tbox.height - offset
  } else {  // 居中显示
    py = (mbox.height - tbox.height) / 2
  }

  return {
    x: px,
    y: py
  }
}

/*
* 拖拽设置默认居中
*/
function setPointCenter (dragTarget) {
  if (!dragTarget) return
  dragTarget.style.left = `50%`
  dragTarget.style.top = `50%`
  dragTarget.style.marginLeft = `-${dragTarget.offsetWidth/2}px`
  dragTarget.style.marginTop = `-${dragTarget.offsetHeight/2}px`
}

function dealHydraulic (data) {
  if (!data) return
  let hydraulic = null
  let length = data[0].hydraulicCode
  if (data.length === 1) {
    hydraulic = completHydraulic(data, length)
  } else {
    data = data.sort(function (a, b) {
      return b - a
    })
    let length = data[0].hydraulicCode
    hydraulic = completHydraulic(data, length)
  }
  return hydraulic
}

function completHydraulic (data, length) {
  let hydraulic = []
  if (data.length === 1) {
    for (let i = 0; i < length; i++) {
      let currentData = data[0]
      const currentDataCode = length - i
      const x = i === 0 ? data[0].x - 1 : data[0].x - i
      currentData.x = x
      currentData.name = `${currentDataCode}`
      currentData.hydraulicCode = currentDataCode
      hydraulic.push(currentData)
      if (i === length -1) continue
    }
    console.log('hydraulic', hydraulic)
  } else {
    for (let i = 0; i < data; i++) {
    
    }
  }
  return data
}

export { formatLength, formatArea, drawSymbol, showDetailOrBriefLabel, convertSVGPath2Coord, toJson, createLabelStyleStaff, judgeZoomlevel, stringDivider, dealMapDatas, getPolylineBYPoints, drawOLLine, createPathStyle, getWarnPosition, setCardCoord, setOrAnimate, getShowPoint, setPointCenter, createLabelStyleVehicle, createLabelStyleHydraulic, dealHydraulic }
