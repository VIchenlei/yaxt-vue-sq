import TWEEN from '@tweenjs/tween.js'
/**
   * 获得初始位置，如果前一次动画存在，中断之
   * @param {*} obj
   * @param {*} positionObj
   * @return [x, y]
   */
function getStartPosition (obj, positionObj) {
  let startPosition = stopPreviewAnimation(obj, positionObj)
  if (!startPosition) {
    let geometry = obj.getGeometry()
    startPosition = geometry && geometry.getCoordinates()
  }

  return startPosition
}

/**
 * 如果上一次动画尚未完成，则结束上一次动画，并将对象直接移动到上一次动画的目标位置，并返回该位置
 * @param {*} obj 图标对象
 * @param {*} positionObj 定位动画对象（水纹扩散动画）
 */
function stopPreviewAnimation (obj, positionObj) {
  let ret = null
  let isStopped = stopAnimationLoop(obj)
  if (isStopped) {
    // 注意：中断动画时，需要同时停掉 tween，否则会触发 tween.onComplete()
    stopTween(obj)

    // 如果是主动中断的动画，需要把坐标移动到目标位置
    ret = obj.get('xpos')
    moveto(obj, positionObj, ret)
  }

  return ret
}

/**
 *  停止 obj 上的动画循环
 * @param {*} obj
 * @return 是否中断
 */
function stopAnimationLoop (obj) {
  let ret = false
  let preRaf = obj && obj.get('rafId')
  if (preRaf && parseInt(preRaf, 10) > 0) {
    // 取消队列中的 animation frame，就不会执行 doAnimate()，相当于中断了 animation loop。
    cancelAnimationFrame(preRaf)
    obj.set('rafId', null)

    ret = true
  }

  return ret
}

/**
 * Stop the tween on obj
 * @param {*} obj
 */
function stopTween (obj) {
  let tween = obj.get('xtween')
  if (tween) {
    tween.stop()
    obj.set('xtween', null)
  }
}

/**
 * 在地图上，将 obj、pObj 移动到 pos 位置
 * @param {*} obj OpenLayers 对象
 * @param {*} pObj OpenLayers Overlay对象
 * @param {*} pos 坐标[x,y]
 * @return {*} 坐标
 */
function moveto (obj, pObj, pos) {
  let geometry = obj && obj.getGeometry()
  pObj && pObj.setPosition(pos)
  geometry && geometry.setCoordinates(pos)
}

function animate (data) {
  let obj = data.msg
  let pObj = data.positionLay
  let x = data.x
  let y = data.y
  let duration = data.duration
  let subType = data.type
  if (!obj) {
    console.log('Animate object is NULL')
    return
  }
  let startPosition = getStartPosition(obj, pObj)
  if (!startPosition) return
  if (x === startPosition[0] && y === startPosition[1]) {
    // Not change the position, NO need animation
    return
  }
  if (subType !== 'staff') { // 人员、掘进机、采煤机不旋转
    obj = rotateIcon({msg: {group: obj}, x, y, startPosition})
  }
  let targetPosition = [x, y]
  let tween = new TWEEN.Tween(startPosition).to(targetPosition, duration)
  tween.onUpdate(function () {
    moveto(obj, pObj, startPosition)
  })
  tween.onComplete(function () {
    // 如果是调用 tween.stop() 中断动画, 则不会触发 tween.onCompplete()
    stopAnimationLoop(obj)
  })
  tween.start()

  // Start the animation loop.
  let animationFrameID = requestAnimationFrame(doAnimate)
  if (obj && obj.getProperties()) {
    obj.getProperties().rafId = animationFrameID
  }
  // obj.set('rafId', animationFrameID)
  obj.set('xpos', targetPosition)
  obj.set('xtween', tween) // save tween object for stopping it later.

  function doAnimate () {
  // 注意：每次rAF调用，都会生成一个新的 rAF ID，所以这里每次都需要更新这个ID
    animationFrameID = requestAnimationFrame(doAnimate)
    // TODO: 如何缩减掉这一步操作？？？
    // 方案：
    // 1. 如果需要中断当前动画，则设置一个标识，在目标对象的下一次动画帧启动之前，判断是否需要中断动画，如果需要，则把对象移动到目标位置，且不再启动新的动画帧，
    // 2. 让本次动画完成，然后再 tween.onComplete 中启动下一次动画（如果有的话）；
    // obj && obj.set('rafId', animationFrameID)
    if (obj && obj.getProperties()) {
      obj.getProperties().rafId = animationFrameID
    }

    TWEEN.update()
  }
}

/**
 * 车辆根据行进方向旋转图标
 * @param {*} msg
 * @param {*} x
 * @param {*} y
 * @param {*} startPosition
 */
function rotateIcon (data) {
  let {msg, x, y, oldpos: startPosition} = data
  // icon.transform.baseVal.clear()
  if(!startPosition) return
  let feature = msg.group
  // feature.setStyle(this.initFeature(0))

  let startx = startPosition[0]
  let starty = startPosition[1]
  let dx = x - startx
  let dy = starty - y
  let color = feature.getProperties().color

  let angle = getAngle(dx, dy)

  let style = feature && feature.getStyle()
  let img = style && style.getImage()

  if (img) {
  // 如果是小范围内移动（delta<1）且旋转角度（ >= 90度 | PI/2），则忽略旋转
    let previewAngle = img.getRotation()
    let da = Math.abs(previewAngle - angle)
    if (!(da >= Math.PI / 9 && Math.abs(dx) < 1 && Math.abs(dy) < 1)) {
      angle = color && color.includes('cmj') ? 0.2 : angle
      img.setRotation(angle)
    }
  }

  // // 如果角度在 170~180之间，且移动距离很短（<MAX_BACKOFF_OFFSET），则忽略旋转
  // // TODO 这里的角度，是与 x 轴的夹角，所以需要计算本次与上次角度之差才对？？？
  // if (!(angle > MAX_BACKOFF_ANGLE && angle <= Math.PI && dx < MAX_BACKOFF_OFFSET && dy < MAX_BACKOFF_OFFSET)) { // 小幅度偏移内，如果是旋转 180 度，忽略
  //   // 转换为弧度

  //   let style = feature && feature.getStyle()
  //   let img = style && feature.getImage()
  //   img && img.setRotation(angle)
  // }

  return feature
}

/**
 * 从 x 轴到点 (dx, dy) 之间的弧度
 * @param {*} dx
 * @param {*} dy
 */
function getAngle (dx, dy) {
  // atan2() 返回从正向 x 轴到点 (dx,dy) 之间的弧度。
  let angle = Math.atan2(dy, dx)

  // // （angle * 180 / Math.PI）转换为角度
  // let angle = Math.atan2(dy, dx) * 180 / Math.PI

  return angle
}

export {animate, rotateIcon, getStartPosition, stopPreviewAnimation, stopAnimationLoop, stopTween, moveto}
