<template>
  <div class="icons-list">
    <a-dropdown v-for="(item, index) in shortcutItems" :key="index" :trigger="['click','visibleChange']" :id="item.name" :visible="isShowTooldown(item)" placement="bottomCenter" :overlayStyle="overlayStyle">
      <a-tooltip placement="leftTop">
        <template slot="title">
          <span>{{ item.label }}</span>
        </template>
        <a v-if="item.name === 'search'" class="ant-dropdown-link" :id="item.name">
          <a-input-search placeholder="请输入人员、车辆、分站、地标信息" style="width: 200px" @input="inputSearch" @search="doSearch"  v-model="nameValue"/>
        </a>
        <a v-else class="ant-dropdown-link" @click="switchItem" :id="item.name">
          <i class="icon" :class="item.name"></i>
          <a-badge v-if="item.name === 'alarm'" :count="alarmCount" :overflowCount="10000">
          </a-badge>
        </a>
      </a-tooltip>
      <a-menu slot="overlay" v-show="searchList.length > 0" class="ident-list">
        <a-menu-item v-for="(list, i) in searchList" :key="i" @click="handleLocate(list)" :id="list.id">
          <a>
            <span :title="list.name">{{ list.name }}</span>
          </a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
  import { tools } from '../../views/monitorMap/map_topbar_def'
  import { getLandmarkList, sendCallReq, getAllUpList, getSearchAll, getMapByCode } from '@/api/api'
  import { getStaffAndAreaData } from './opeateUtils'
  import { dealMapDatas } from '../../store/map/mapUtils/OlMapUtils'
  import { mapState } from "vuex";
  export default {
    data() {
      return {
        shortcutItems: tools.shortcutItems,
        status: true,
        isFullScreen: false,
        searchList: [],
        overlayStyle: {width:'200px'},
        mapElement: null,
        // alarmCount: 1000,
        nameValue: null,
      }
    },
    computed: {
      ...mapState({
        alarmCount: state => state.alarmStore.alarmCount
      })
    },
    methods: {
      iconEvent (fnName) {
        // this.$store.commit('mapService/changeMouse', {flag: this.status})
        this.status = !this.status
        // this.$store.dispatch('olMapMeasureLayer/mapMeasure',{geometry: 1})
        // getLandmarkList().then((res) => {
        //   if (res.success) {
        //     let result = res.result
        //     this.$store.dispatch('olMapLandmarkLayer/drawLandmarker', result.records)
        //   }
        // })
      },
      inputSearch(evt) {
        let value = evt.target.value
        this.getSearchList(value)
        // this.searchList.push({id: 1, name: 'wwafa', x: 54, y: 8, ident: 1002})
      },
      doSearch(value) {
        this.getSearchList(value)
      },
      getSearchList(value) {
        if (value) {
          getSearchAll(value).then((res) => {
            if (res.code === 200) {
              this.searchList = res.result
            }
            //  else {
            //   this.$message.error('检索失败')
            // }
          })
        } else {
          this.searchList = []
        }
        
      },
      // 是否显示下拉列表
      isShowTooldown(data) {
        const { name } = data
        if (name === 'search') return true
        return false
      },
      handleLocate(list) {
        console.log(list)
        this.nameValue = list.name;
        let x = list.x
        let y = list.y
        let mapID = list.mapCode
        if (mapID !== window.xdata.state.mapService.mapID) {
          getMapByCode({code: mapID}).then((res) => {
            if (res.code === 200) {
              if (window.monitormap.childNodes[0]) {
                window.monitormap.removeChild(window.monitormap.childNodes[0])
              }
              let data = dealMapDatas(res.result)
              this.$store.dispatch('mapService/initMap', data)
              this.$store.dispatch('locateService/toggleLocating', {
                cards: [list.ident],
                symbolType: 'card',
                position: [x, y],
                mapID: mapID
              })
            }
          })
        } else {
          this.$store.dispatch('locateService/toggleLocating', {
            cards: [list.ident],
            symbolType: 'card',
            position: [x, y],
            mapID: mapID
          })
        }
        this.searchList = []
      },
      switchItem (evt) {
        this.mapElement = this.$store.state.stateStore.mapContainer
        evt.preventDefault()
        let target = evt.target
        let tagName = target.tagName
        if (tagName !== 'I') return
        this.searchList = []
        let opName = target.parentElement.id
        const doItem = {
          search: ()=> {
           
          },
          alarm: ()=> {
            let isVisible = this.$store.state.stateStore.alarmList.isVisible
            this.$store.commit('stateStore/changeAlarm',{type: !isVisible, rows: this.$store.state.stateStore.alarmList.rows})
          },
          location: ()=> {
            let keys = this.$store.state.locateService.locates && Array.from(this.$store.state.locateService.locates.keys())
            this.$store.dispatch('locateService/cardStopLocating',{ cards:keys })
          },
          sendcall: ()=> {
            getStaffAndAreaData().then((res => {
              this.$store.commit('stateStore/changeSendCall',{
                type: true,
                data: res
              })
            }))
            
          },
          stopcall: ()=> {
            this.$store.commit('stateStore/changeMapModel',{
              type: true,
              modalText: '提示：如果发送，将会取消您当前正在进行中的全部呼叫。',
              resultStatus: 'warning',
              resultTitle: '您确认要发送“停止呼叫”消息吗？',
              ajaxName: 'stopcall',
              title: '停止呼叫',
            })
          },
          handupMine: ()=> {
            getAllUpList({type:1, mapID: window.xdata.state.mapService.mapID}).then((res) => {
              if (res.code === 200) {
                this.$store.commit('stateStore/changeUpmine', {
                  type: true,
                  data: res.result
                })
              }
            })
          },
          leave: ()=> {
            this.$store.commit('stateStore/changeMapModel',{
              type: true,
              modalText: '提示：如果发送，井下人员收到“马上撤离”的信息。',
              resultStatus: 'warning',
              resultTitle: '您确认要发送“撤离”消息吗？',
              ajaxName: 'leave',
              title: '发送撤离',
              showInput: true,
            })
          },
          staffcurve: ()=> {
            this.$store.commit('stateStore/changeStaffCurve',{type: true})
          },
          geowarn: ()=> {
            
          },
          aboutus: ()=> {
            
          },
          fullscreen: ()=> {
            this.fullScreen()
          }
        }
        doItem[opName]()
      },
      requestFullScreen (element) {
        let requestMethod = element.requestFullScreen ||
          element.webkitRequestFullScreen ||
          element.mozRequestFullScreen ||
          element.msRequestFullScreen
        if (requestMethod) {
          requestMethod.call(element)
        }
      },
      exitFullScreen () {
        let exitMethod = document.cancelFullScreen ||
          document.webkitCancelFullScreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen
        if (exitMethod) {
          exitMethod.call(document)
        }
      },
      fullScreen () {
        this.isFullScreen = !this.isFullScreen
        if (this.isFullScreen || window.document.body.clientHeight !== window.screen.height) {
          this.requestFullScreen(document.getElementsByClassName('monitormapContainer')[0])
        } else {
          this.exitFullScreen()
        }
      },
    }
  }
</script>

<style lang="less" scoped>
  @import "../../style/operateList.less";
  .ident-list {
    max-height: 265px;
    overflow-y: auto;
  }
</style>
