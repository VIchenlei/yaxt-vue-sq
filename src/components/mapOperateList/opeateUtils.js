/*
  获取人员、区域数据
*/
import { getAllUpList, getAreaList } from '@api/api'
async function getStaffAndAreaData () {
  let staffs = null, areas = null
  let mapID = window.xdata.state.mapService.mapID
  await getAllUpList({type:2, mapID: window.xdata.state.mapService.mapID}).then((res)=> {
    if (res.code === 200) {
      staffs = res.result
    }
  })
  await getAreaList({mapID}).then((res)=> {
    if (res.code === 200) {
      areas = res.result
    }
  })
  return { staffs, areas }
}

export { getStaffAndAreaData }