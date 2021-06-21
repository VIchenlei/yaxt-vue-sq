/*
  获取图层配置
*/
import { getLandmarkList, getReaderList, getAreaList, getCameraList, getLightList, getMapList, getAllReaderPath  } from '@/api/api'
const drawLayers = {
  landmark: {
    method: getLandmarkList, // 请求图层方法
    address: 'olMapLandmarkLayer/drawLandmarker'
  },
  reader: {
    method: getReaderList,
    address: 'olMapReaderLayer/drawReaders'
  },
  area: {
    method: getAreaList,
    address: 'olMapAreaLayer/drawInitArea'
  },
  camera: {
    method: getCameraList,
    address: 'olMapCameraLayer/drawCamera'
  },
  readerPath: {
    method: getAllReaderPath,
    address: 'olMapReaderPathLayer/drawPath'
  },
  antenna: {
    method: getReaderList,
    address: 'olMapAntennaLayer/drawAntennas'
  },
  light: {
    method: getLightList,
    address: 'olMapLightLayer/showLight'
  },
  fault: {
    method: getMapList,
    address: 'olMapFaultLayer/drawFault'
  },
  underground: {
    method: getMapList,
    address: 'olMapFaultLayer/drawUnderground'
  }
}

export { drawLayers }