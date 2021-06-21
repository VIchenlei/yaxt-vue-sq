import { getAction, deleteAction, putAction, postAction, httpAction, scanPostAction, scanHttpAction, scanPutAction, scanGetAction, scanDeleteAction } from '@/api/manage'
import Vue from 'vue'
import {UI_CACHE_DB_DICT_DATA } from "@/store/mutation-types"


//角色管理
const addRole = (params)=>postAction("/sys/role/add",params);
const editRole = (params)=>putAction("/sys/role/edit",params);
const checkRoleCode = (params)=>getAction("/sys/role/checkRoleCode",params);
const queryall = (params)=>getAction("/sys/role/queryall",params);

//用户管理
const addUser = (params)=>postAction("/sys/user/add",params);
const editUser = (params)=>putAction("/sys/user/edit",params);
const queryUserRole = (params)=>getAction("/sys/user/queryUserRole",params);
const getUserList = (params)=>getAction("/sys/user/list",params);
const frozenBatch = (params)=>putAction("/sys/user/frozenBatch",params);
//验证用户是否存在
const checkOnlyUser = (params)=>getAction("/sys/user/checkOnlyUser",params);
//改变密码
const changePassword = (params)=>putAction("/sys/user/changePassword",params);

//权限管理
const addPermission= (params)=>postAction("/sys/permission/add",params);
const editPermission= (params)=>putAction("/sys/permission/edit",params);
const getPermissionList = (params)=>getAction("/sys/permission/list",params);
const getSystemMenuList = (params)=>getAction("/sys/permission/getSystemMenuList",params);
const getSystemSubmenu = (params)=>getAction("/sys/permission/getSystemSubmenu",params);
const getSystemSubmenuBatch = (params) => getAction('/sys/permission/getSystemSubmenuBatch', params)

const queryTreeList = (params)=>getAction("/sys/permission/queryTreeList",params);
const queryTreeListForRole = (params)=>getAction("/sys/role/queryTreeList",params);
const queryListAsync = (params)=>getAction("/sys/permission/queryListAsync",params);
const queryRolePermission = (params)=>getAction("/sys/permission/queryRolePermission",params);
const saveRolePermission = (params)=>postAction("/sys/permission/saveRolePermission",params);
const queryPermissionsByUser = (params)=>getAction("/sys/permission/getUserPermissionByToken",params);
const loadAllRoleIds = (params)=>getAction("/sys/permission/loadAllRoleIds",params);
const getPermissionRuleList = (params)=>getAction("/sys/permission/getPermRuleListByPermId",params);
const queryPermissionRule = (params)=>getAction("/sys/permission/queryPermissionRule",params);

// 部门管理
const queryDepartTreeList = (params)=>getAction("/sys/sysDepart/queryTreeList",params);
const queryIdTree = (params)=>getAction("/sys/sysDepart/queryIdTree",params);
const queryParentName   = (params)=>getAction("/sys/sysDepart/queryParentName",params);
const searchByKeywords   = (params)=>getAction("/sys/sysDepart/searchBy",params);
const deleteByDepartId   = (params)=>deleteAction("/sys/sysDepart/delete",params);

//二级部门管理
const queryDepartPermission = (params)=>getAction("/sys/permission/queryDepartPermission",params);
const saveDepartPermission = (params)=>postAction("/sys/permission/saveDepartPermission",params);
const queryTreeListForDeptRole = (params)=>getAction("/sys/sysDepartPermission/queryTreeListForDeptRole",params);
const queryDeptRolePermission = (params)=>getAction("/sys/sysDepartPermission/queryDeptRolePermission",params);
const saveDeptRolePermission = (params)=>postAction("/sys/sysDepartPermission/saveDeptRolePermission",params);
const queryMyDepartTreeList = (params)=>getAction("/sys/sysDepart/queryMyDeptTreeList",params);

//日志管理
const deleteLog = (params)=>deleteAction("/sys/log/delete",params);
const deleteLogList = (params)=>deleteAction("/sys/log/deleteBatch",params);

//数据字典
  const addDict = (params)=>postAction("/sys/dict/add",params);
  const editDict = (params)=>putAction("/sys/dict/edit",params);
  const treeList = (params)=>getAction("/sys/dict/treeList",params);
  const addDictItem = (params)=>postAction("/sys/dictItem/add",params);
  const editDictItem = (params)=>putAction("/sys/dictItem/edit",params);

//字典标签专用（通过code获取字典数组）
export const ajaxGetDictItems = (code, params)=>getAction(`/sys/dict/getDictItems/${code}`,params);
//从缓存中获取字典配置
function getDictItemsFromCache(dictCode) {
  if (Vue.ls.get(UI_CACHE_DB_DICT_DATA) && Vue.ls.get(UI_CACHE_DB_DICT_DATA)[dictCode]) {
    let dictItems = Vue.ls.get(UI_CACHE_DB_DICT_DATA)[dictCode];
    //console.log("-----------getDictItemsFromCache----------dictCode="+dictCode+"---- dictItems=",dictItems)
    return dictItems;
  }
}

//系统通告
const doReleaseData = (params)=>getAction("/sys/annountCement/doReleaseData",params);
const doReovkeData = (params)=>getAction("/sys/annountCement/doReovkeData",params);
//获取系统访问量
const getLoginfo = (params)=>getAction("/sys/loginfo",params);
const getVisitInfo = (params)=>getAction("/sys/visitInfo",params);

// 根据部门主键查询用户信息
const queryUserByDepId = (params)=>getAction("/sys/user/queryUserByDepId",params);
// 重复校验
const duplicateCheck = (params)=>getAction("/sys/duplicate/check",params);
// 加载分类字典
const loadCategoryData = (params)=>getAction("/sys/category/loadAllData",params);
const checkRuleByCode = (params) => getAction('/sys/checkRule/checkByCode', params)
//我的通告
const getUserNoticeInfo= (params)=>getAction("/sys/sysAnnouncementSend/getMyAnnouncementSend",params);

/*获取图层api*/
const getMapByCode = (params)=> getAction("/map/queryCode",params);
const getMapList = (params)=> getAction("/map/all",params);
const getLandmarkList = (params)=> getAction(`/landmark/all/${params.mapID}`,params);
const getReaderList = (params)=> getAction(`/reader/all/${params.mapID}`,params);
const editSubstation = (params)=> putAction(`/reader/edit`,params);
const addSubstation = (params)=> postAction(`/reader/route/add`,params);
const getGoafList = (params)=> getAction(`/goaf/all/${params.mapID}`,params);
const getAreaList = (params)=> getAction(`/area/all/${params.mapID}`,params);
const getCameraList = (params)=> getAction(`/camera/all/${params.mapID}`,params);
const getLightList = (params)=> getAction(`/light/list/${params.mapID}`,params);
const getVehicleStaffReq = (params) => getAction("/position/group",params);
const getStaffPhotoList = (params) => getAction("/position/dept",params);
const getStaffTotal = (params) => postAction(`/chart/screen/count/staff/${params.mapID}`);
const getCallListReq = (params) => postAction("/call/list/1",params);
const getHelpListReq = (params) => postAction("/call/list/2",params);
const getStaffCurveReq = (params) => postAction("/statistical/",params);
const sendCallReq = (params) => postAction("/call/",params);
const stopCallReq = (params)=> putAction("/call/cancel/all",params);
const stopCallList = (url,params)=> putAction(url,params);
const callLeave = (params)=> getAction("/call/quit",params);
const getCurrentLeader = (params) => getAction("/leaderArrange/current",params);
const getAlarm = (params) => getAction("/alert/",params);
const getAllAlarm = (params) => getAction("/alert/all",params);
const getAreaPersonCount = (params) => getAction("/position/area/customize",params);
const getAreaPersonList = (params) => getAction("/position/page",params);
const getSVByCardId = (params) => getAction("/card/",params);
const getCardAll = (params) => getAction("/card/all",params);
const getLandmarkByCode = (params) => getAction("/landmark/queryCode",params);
const getAreaByCode = (params) => getAction("/area/queryCode",params);
const getGoafByCode = (params) => getAction("/goaf/queryCode",params);
const getReaderByCode = (code,params) => postAction(`/reader/${code}`,params);
const getStaffMineCard = (params) => getAction(`/position/all/staff/${params.mapID}`,params);
const getVehicleMineCard = (params) => getAction(`/position/all/vehicle/${params.mapID}`,params);
const getPositionCard =  (params) => getAction('/position/page', params);
const getAllUpList = (params) => getAction(`/up/all/${params.type}/${params.mapID}`,params);
const sendUpMine = (params) => putAction("/up/",params);
const getAllReaderPath = (params) => getAction('/reader/all/route',params);
const getReaderPathById = (params) => getAction('/reader/queryReaderRouteByMainId', params);
const getIdent = (ident, params) => getAction(`/position/card/${ident}`,params);
const getStaffPath = (params) => getAction('/alert/staffPathHis',params);
const getSearchAll = (name, params) => getAction(`/search/${name}`,params);
const setForbidMine = (params) => postAction('/rptStaffForbid/',params);
const getSanlv = (params) => getAction('/rate/all',params);
const getNearlyReaderPath = (params) => getAction('/reader/route/nearly', params);
const getUpdateFiles = (params) => getAction('/busiUpdateFile/');

/*删除图层基本信息api*/
const deleteLandmarkById = (params)=>deleteAction("/landmark/delete",params);
const deleteReaderById = (params)=>deleteAction("/reader/delete",params);
const deleteAreaById = (params)=>deleteAction("/area/delete",params);
const deleteGoafById = (params)=>deleteAction("/goaf/delete",params);

/*图层新增基本信息api*/
const sendAreaList = (params)=> postAction("/area/add",params);

/*人员区域基本信息api*/
const getStaffs = (params)=> getAction("/staff/all",params);
// const getAreas = (mapID, params)=> getAction(`area/all${mapID}`,params);

/*告警复位api*/
const getResetAlarm = (params)=> getAction("/alert/reset",params);
const getResetAlarmAll = (params)=> getAction("/alert/reset/all",params);

/*历史轨迹api*/
const searchCard = (keywords, type, flag, params)=> getAction(`/${type}/search/${flag}/${keywords}`, params);
const getTrackList = (params)=> getAction("/trail/info",params);
const getTrailExport = (url,params)=> getAction(`/trail/export?${url}`, params)

//三率日报
const getDaily=(params)=>getAction('/rate/daily/'+params)
//三率月报-队组
const getMonth=(params)=>getAction('/busiWorkReport/month',params)
//三率月报平均值
const getMonthMean=(params)=>getAction('/busiWorkReport/month/mean',params)
//工作面
const getWorkface=(params)=>getAction('/workface/list',params)

/*电源数据*/
const getBatteryList = (params) => getAction('/busiDevicePower/list', params);
const getRealPower = (params) => getAction('/busiDevicePower/queryPowerMonitoringByPowerId', params);

/*设备扫描、升级*/
const getDeviceScan = (url, params) => getAction(`${url}`, params);
const getDeiceUpdate = (params, method) => httpAction('/busiDeviceScan/update', params, method);

export {
  getDeviceScan,
  addRole,
  editRole,
  checkRoleCode,
  addUser,
  editUser,
  queryUserRole,
  getUserList,
  queryall,
  frozenBatch,
  checkOnlyUser,
  changePassword,
  getPermissionList,
  addPermission,
  editPermission,
  queryTreeList,
  queryListAsync,
  queryRolePermission,
  saveRolePermission,
  queryPermissionsByUser,
  loadAllRoleIds,
  editSubstation,
  addSubstation,
  getPermissionRuleList,
  queryPermissionRule,
  queryDepartTreeList,
  queryIdTree,
  queryParentName,
  searchByKeywords,
  deleteByDepartId,
  deleteLog,
  deleteLogList,
  addDict,
  editDict,
  treeList,
  addDictItem,
  editDictItem,
  doReleaseData,
  getStaffPhotoList,
  doReovkeData,
  getLoginfo,
  getVisitInfo,
  queryUserByDepId,
  duplicateCheck,
  queryTreeListForRole,
  getSystemMenuList,
  getSystemSubmenu,
  getSystemSubmenuBatch,
  loadCategoryData,
  checkRuleByCode,
  queryDepartPermission,
  saveDepartPermission,
  queryTreeListForDeptRole,
  queryDeptRolePermission,
  saveDeptRolePermission,
  queryMyDepartTreeList,
  getUserNoticeInfo,
  getDictItemsFromCache,
  getMapByCode,
  getMapList,
  getLandmarkList,
  getReaderList,
  getVehicleStaffReq,
  getGoafList,
  getAreaList,
  getCameraList,
  getLightList,
  getCallListReq,
  getHelpListReq,
  getStaffCurveReq,
  sendCallReq,
  stopCallReq,
  getCurrentLeader,
  getAlarm,
  getResetAlarm,
  getResetAlarmAll,
  sendAreaList,
  getSVByCardId,
  getAreaPersonCount,
  getLandmarkByCode,
  getAreaByCode,
  getGoafByCode,
  deleteLandmarkById,
  getReaderByCode,
  deleteReaderById,
  deleteAreaById,
  deleteGoafById,
  getStaffs,
  // getAreas,
  getStaffMineCard,
  getVehicleMineCard,
  getAllUpList,
  sendUpMine,
  stopCallList,
  getAllReaderPath,
  getAreaPersonList,
  getIdent,
  getAllAlarm,
  getStaffPath,
  getSearchAll,
  setForbidMine,
  getReaderPathById,
  searchCard,
  getTrackList,
  getSanlv,
  callLeave,
  getStaffTotal,
  getDaily,
  getMonth,
  getMonthMean,
  getWorkface,
  getCardAll,
  getRealPower,
  getBatteryList,
  getPositionCard,
  getNearlyReaderPath,
  getUpdateFiles,
  getDeiceUpdate,
  getTrailExport
}



