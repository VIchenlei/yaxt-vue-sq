/*
  各个图层需要调用函数
*/
import ol from 'openlayers'
import { AREALAYERDEF } from '../mapUtils/areaLayerDef'

function createFillStyle (canvas, context) {
  let patten = getPatten(canvas, context)
  let style = new ol.style.Style({
    stroke: new ol.style.Stroke({ width: 1, color: [192, 192, 192] }),
    fill: new ol.style.Fill({
      color: patten
    })
  })
  return style
}
function getPatten (canvas, context) {
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
  return context.createPattern(canvas, 'repeat')
}

function getVisibleAreaType (visiblearea) {
  let visibleAreaType = visiblearea
  visibleAreaType = visibleAreaType && visibleAreaType.substr(5)
  visibleAreaType = visibleAreaType && Number(visibleAreaType)
  return visibleAreaType
}

function createPolygonStyle (text, type) {
  let style = {
    stroke: { width: 1, color: [255, 255, 165] },
    fill: { color: [255, 203, 255, 0.4] },
    text: { text: text, font: '12px', scale: 1.2, fill: new ol.style.Fill({color: '#009fff'})}
  }
  if (AREALAYERDEF.hasOwnProperty(type)) {
    let styleObj = AREALAYERDEF[type]
    style.stroke.color = styleObj.strokeColor
    style.fill.color = styleObj.fillColor
    style.text.fill = new ol.style.Fill(styleObj.textFill)
  }
  return new ol.style.Style({
    stroke: new ol.style.Stroke(style.stroke),
    fill: new ol.style.Fill(style.fill),
    text: new ol.style.Text(style.text)
  })
}

function createCountStyle (feature) {
  return new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 0, 1)'
      }),
      radius: 35,
      stroke: ol.style.Stroke(
        {
          color: '#000000',
          width: 2
        }
      )
    }),
    text: new ol.style.Text({
      text: feature.get('totle'),
      font: '25px',
      fill: new ol.style.Fill({
        color: '#000000'
      })
    })
  })
}

/**
 * [clone 深度克隆对象]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

//查找一条线段覆盖的多条路径
function getCoverLine(coord, pathGather) {
  let singleShortPath = []
  for (let i = 0; i < coord.length; i++) {
    if (i < coord.length - 1) {
      let obj = {
        start_point: {
          x: coord[i][0],
          y: coord[i][1]
        },
        end_point: {
          x: coord[i + 1][0],
          y: coord[i + 1][1]
        }
      }
      let shortPath = getshortPath(obj, pathGather)
      singleShortPath.push(shortPath)
    }
  }
  const key = 'code'
  singleShortPath = unique(singleShortPath, key)
  return singleShortPath
}

function getshortPath(pointObj, pathGather) {
  let roadPathGather = clone(pathGather)
  roadPathGather = roadPathGather.map(item => {
    item.bpoint = {
      x: Number(Number(item.beginX).toFixed(1)),
      y: Number(Number(item.beginY).toFixed(1)),
    }
    item.epoint = {
      x: Number(Number(item.endX).toFixed(1)),
      y: Number(Number(item.endY).toFixed(1)),
    }
    let disAS = pointToLineDistance(pointObj.start_point.x, pointObj.start_point.y, item.bpoint.x, item.bpoint.y, item.epoint.x, item.epoint.y)[0]
    let disAE = pointToLineDistance(pointObj.end_point.x, pointObj.end_point.y, item.bpoint.x, item.bpoint.y, item.epoint.x, item.epoint.y)[0]
    item.distance = disAS + disAE
    return item
  })

  roadPathGather.sort(function(a, b) {
    return a.distance - b.distance
  })
  return roadPathGather[0]
}

/* 求点到直线的距离函数
* xx,yy 所画线段x,y
*/
function pointToLineDistance (xx, yy, x1, y1, x2, y2) {
  let ang1, ang2, ang, m
  let result = 0

  // 分别计算三条边的长度
  const a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy))
  if (a === 0) {
    return [0, {
      x: x1,
      y: y1
    }]
  }
  const b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy))
  if (b === 0) {
    return [0, {
      x: x2,
      y: y2
    }]
  }
  const c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
  // 如果线段是一个点则退出函数并返回距离
  if (c === 0) {
    result = a
    return [result, {
      x: x1,
      y: y1
    }]
  }

  // 如果点(xx,yy到点x1,y1)这条边短
  if (a < b) {
    // 如果直线段AB是水平线。得到直线段AB的弧度
    if (y1 === y2) {
      if (x1 < x2) {
        ang1 = 0
      } else {
        ang1 = Math.PI
      }
    } else {
      m = (x2 - x1) / c
      if (m - 1 > 0.00001) {
        m = 1
      }

      ang1 = Math.acos(m)
      if (y1 > y2) {
        ang1 = Math.PI * 2 - ang1
      } // 直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度
    }

    m = (xx - x1) / a
    if (m - 1 > 0.00001) {
      m = 1
    }

    ang2 = Math.acos(m)
    if (y1 > yy) {
      ang2 = Math.PI * 2 - ang2
    } // 直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度

    ang = ang2 - ang1
    if (ang < 0) {
      ang = -ang
    }

    if (ang > Math.PI) {
      ang = Math.PI * 2 - ang
    }

    // 如果是钝角则直接返回距离
    if (ang > Math.PI / 2) {
      return [a, {
        x: x1,
        y: y1
      }]
    }

    // 返回距离并且求得当前距离所在线段的坐标
    if (x1 === x2) {
      return [b * Math.sin(ang), {
        x: x1,
        y: yy
      }]
    } else if (y1 === y2) {
      return [b * Math.sin(ang), {
        x: xx,
        y: y1
      }]
    }

    // 直线的斜率存在且不为0的情况下
    let x = 0,
      y = 0
    const k1 = ((y2 - y1) / (x2 - x1))
    const kk = -1 / k1
    const bb = yy - xx * kk
    const b1 = y2 - x2 * k1
    x = (b1 - bb) / (kk - k1)
    y = kk * x + bb
    return [a * Math.sin(ang), {
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1))
    }]
  }
  // 如果两个点的纵坐标相同，则直接得到直线斜率的弧度
  if (y1 === y2) {
    if (x1 < x2) {
      ang1 = Math.PI
    } else {
      ang1 = 0
    }
  } else {
    m = (x1 - x2) / c
    if (m - 1 > 0.00001) {
      m = 1
    }
    ang1 = Math.acos(m)
    if (y2 > y1) {
      ang1 = Math.PI * 2 - ang1
    }
  }
  m = (xx - x2) / b
  if (m - 1 > 0.00001) {
    m = 1
  }

  ang2 = Math.acos(m) // 直线(x2-x1)-(xx,yy)斜率的弧度
  if (y2 > yy) {
    ang2 = Math.PI * 2 - ang2
  }

  ang = ang2 - ang1
  if (ang < 0) {
    ang = -ang
  }

  if (ang > Math.PI) {
    ang = Math.PI * 2 - ang
  } // 交角的大小

  // 如果是对角则直接返回距离
  if (ang > Math.PI / 2) {
    return [b, {
      x: x2,
      y: y2
    }]
  }

  // 如果是锐角，返回计算得到的距离,并计算出相应的坐标
  if (x1 === x2) {
    return [b * Math.sin(ang), {
      x: x1,
      y: yy
    }]
  } else if (y1 === y2) {
    return [b * Math.sin(ang), {
      x: xx,
      y: y1
    }]
  }

  // 直线的斜率存在且不为0的情况下
  let x = 0,
    y = 0
  const k1 = ((y2 - y1) / (x2 - x1))
  const kk = -1 / k1
  const bb = yy - xx * kk
  const b1 = y2 - x2 * k1
  x = (b1 - bb) / (kk - k1)
  y = kk * x + bb
  return [b * Math.sin(ang), {
    x: Number(x.toFixed(1)),
    y: Number(y.toFixed(1))
  }]
}

function unique(list, key) {
  var result = [];
  for (var i = 0; i < list.length; i++) {
    if (i == 0) result.push(list[i]);
    let b = false;
    if (result.length > 0 && i > 0) {
      for (var j = 0; j < result.length; j++) {
        if (result[j][key] == list[i][key]) {
          b = true;
          //break;
        }
      }
      if (!b) {
        result.push(list[i]);
      }
    }
  }
  return result;
}

//计算开始点、结束点到路径的距离
function getStartAndEndPath (xx, yy, x1, y1, x2, y2) {
  return pointToLineDistance (xx, yy, x1, y1, x2, y2)[1]
}

export { createFillStyle, getVisibleAreaType, createPolygonStyle, createCountStyle, clone, getCoverLine, unique, getStartAndEndPath, pointToLineDistance }