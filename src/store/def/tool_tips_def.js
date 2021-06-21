import {deleteLandmarkById, deleteReaderById, deleteAreaById, deleteGoafById} from '@api/api'
const TOOLTIPSDEF = {
  'reader': {
    title: '分站',
    // state:{
    //   names: ['ident', 'code', 'name', 'sex', 'deptName', 'workTypeName', 'post'],
    //   labels: ['卡号', '工号', '姓名', '性别', '部门', '工种', '职务']
    // },
    info: {
      names: ['code', 'name', 'deviceTypeName', 'mapName', 'areaName', 'dimensionName','powerName', 'statusName', 'pointX', 'pointY'],
      labels: ['分站编号', '分站名称','设备类型', '所属地图', '所属区域', '定位维度','掉电告警', '分站状态', 'x', 'y']
    }
  },
  'area':{
    title: '区域',
    info: {
      names: ['code', 'name', 'mapName', 'areaListName', 'areaTypeName', 'maxPeople', 'maxStandTime', 'maxCar', 'carAngle', 'points', 'speedCarriageCar', 'speedPeopleCar', 'speedSpecialCar', 'workAreaFlag', 'needDisplay'],
      labels: ['区域编号', '区域名称', '所属地图', '区域业务', '区域类型', '人数上限', '人停留时长上限', '车辆上限', '车辆角度', '坐标', '料车速度(m/s)', '人车速度(m/s)', '特种车速度(m/s)', '是否是工作区域', '是否对外可见']
    }
  },
  'landmark':{
    title: '地标',
    info: {
      names: ['code', 'name', 'areaName', 'mapName', 'pointX', 'pointY'],
      labels: ['编号', '名称', '所属区域', '所属地图', '坐标x', '坐标y']
    }
  },
  'goaf':{
    title: '采空区',
    info: {
      names: ['code', 'name', 'path'],
      labels: ['编号', '名称', '坐标']
    }
  }
}

function delfun(type, params) {
  if (type === 'landmark') {
    return deleteLandmarkById(params)
  } else if (type === 'reader') {
    return deleteReaderById(params)
  } else if (type === 'area') {
    return deleteAreaById(params)
  } else if (type === 'goaf') {
    return deleteGoafById(params)
  }
}

const EDITADRESS = {
  'landmark': 'stateStore/changeLandmarkEdit',
  'reader': 'stateStore/changeReaderEdit',
  'area': 'stateStore/changeAreaEdit',
  'goaf': 'stateStore/changeGoafEdit',
}

export {TOOLTIPSDEF, delfun, EDITADRESS}