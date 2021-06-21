<template>
  <div class="alarm-dialog" v-show="alarmList.isVisible">
    <div class="dlg-header alarm-header">
      <span class="dlg-title">
        <span>实时告警</span>
      </span>
      <span @click="handleCancel">
        <a-icon type="close" />
      </span>
    </div>
    <div class="dlg-body">
      <!-- <div class="reset-alarm">
        <button @click="resetAllAlarm">复位全部告警</button>
      </div> -->
      <div v-for="(item, idx) in lists" :key="idx">
        <div class="alarm-title">
          <span class="title">{{getTitle(item)}}</span>
          <span class="tips">（告警条数：{{getSize(item)}}条）</span>
        </div>
        <a-table 
          :columns="getColumns(item)" 
          :data-source="getRows(item)" 
          rowKey="id"
          :pagination="getPagination(item)">
            <span slot="name" slot-scope="text, record" class="name" @click="handleOperate(record)">{{record.name}}</span>
            <img slot="locate" slot-scope="text, record" class="location" :src="locateIcon" alt="" @click="toggleLcate(record)">
            <!-- <a slot="operate" slot-scope="text, record" class="operate" @click="resetAlarmDone(record)">复位</a> -->
        </a-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getResetAlarm, getResetAlarmAll, getIdent, getStaffPath, getReaderByCode, getMapByCode} from '@/api/api';
import { dealMapDatas, setPointCenter } from '../../store/map/mapUtils/OlMapUtils'
import { alarmColmuns } from './alarm_columns_def'
import { mapState } from "vuex";
const columns = [
  {
    title: '告警类型',
    dataIndex: 'typeName',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '告警开始时间',
    dataIndex: 'startTime',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '告警开始对象',
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '所属地图',
    dataIndex: 'mapName',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '定位',
    dataIndex: 'locate',
    ellipsis: true,
    align: 'center',
    width: '40px',
    scopedSlots: { customRender: 'locate' },
  },
  // {
  //   title: '操作',
  //   dataIndex: 'operate',
  //   ellipsis: true,
  //   align: 'center',
  //   width: '40px',
  //   scopedSlots: { customRender: 'operate' },
  // },
];

export default {
  data() {
    return {
      // visible: false,
      columns: columns,
      pagination: null,
      // alarmRows: null,
      // lists: [],
      locateIcon: '/img/location.png'
    };
  },
  // watch: {
  //   '$store.state.stateStore.alarmList': {
  //     handler (result) {
  //       this.visible = result.isVisible
  //       this.alarmRows = result.rows
  //       this.lists = this.alarmRows && Array.from(this.alarmRows.keys())
  //     },
  //     deep: true
  //   }
  // },
  computed: {
    ...mapState({
      alarmList: state => state.stateStore.alarmList,
    }),
    lists () {
      this.alarmRows = this.alarmList.rows
      return this.alarmList.rows && Array.from(this.alarmList.rows.keys())
    }
  },
  mounted() {
    let dragTarget = this.$root.$el.querySelector('.alarm-dialog')
    let dragHandle = this.$root.$el.querySelector('.alarm-header')
    
    window.setDialogDraggable(dragTarget, dragHandle)
  },
  methods: {
    handleCancel() {
      this.$store.commit('stateStore/changeAlarm',{type: false, rows: this.$store.state.stateStore.alarmList.rows})
    },
    getTitle(key) {
      let data = this.alarmRows && this.alarmRows.get(key)
      if (!data || !data.size) return ''
      data = data && Array.from(data.values())
      let title = `${data[0].typeGroup}-${data[0].typeName}`
      return title
    },
    getSize(key) {
      let data = this.alarmRows && this.alarmRows.get(key)
      return data.size || 0
    },
    getPagination(key) {
      let data = this.alarmRows && this.alarmRows.get(key)
      return data && data.size > 10 ? true : false
    },
    toggleLcate(data) {
      const { type, typeGroup, ident } = data
      let mapID = data.mapCode
      if (typeGroup === '人员报警' || typeGroup === '车辆超速报警') {
        getIdent(ident).then((res) => {
          if (res.code === 200) {
            let result = res.result
            if (result) {
              // this.handleCancel()
              let x = result.x
              let y = result.y
              mapID = result.mapCode
              if (mapID !== xdata.state.mapService.mapID) {
                getMapByCode({code: mapID}).then((res) => {
                  if (res.code === 200) {
                    if (window.monitormap.childNodes[0]) {
                      window.monitormap.removeChild(window.monitormap.childNodes[0])
                    }
                    let data = dealMapDatas(res.result)
                    this.$store.dispatch('mapService/initMap', data)
                    this.$store.dispatch('locateService/toggleLocating', {
                      cards: [ident],
                      symbolType: 'card',
                      position: [x, y],
                      mapID: mapID
                    })
                  }
                })
              } else {
                this.$store.dispatch('locateService/toggleLocating', {
                  cards: [ident],
                  symbolType: 'card',
                  position: [x, y],
                  mapID: mapID
                })
              }
            }
          }
        })
      } else if (typeGroup === '设备报警') {
        getReaderByCode(ident).then((res) => {
          if (res.code === 200) {
            let result = res.result
            if (result) {
              let x = result.pointX
              let y = result.pointY
              if (mapID !== xdata.state.mapService.mapID ) {
                getMapByCode({code: mapID}).then((res) => {
                  if (res.code === 200) {
                    if (window.monitormap.childNodes[0]) {
                      window.monitormap.removeChild(window.monitormap.childNodes[0])
                    }
                    let data = dealMapDatas(res.result)
                    this.$store.dispatch('mapService/initMap', data)
                    this.$store.dispatch('olMapReaderLayer/startLocation', {
                      cards: [ident],
                      symbolType: 'reader',
                      position: [x, y],
                      mapID: mapID
                    })
                  }
                })
              } else {
                this.$store.dispatch('olMapReaderLayer/startLocation', {
                  cards: [ident],
                  symbolType: 'reader',
                  position: [x, y],
                  mapID: mapID
                })
              }
            }
          }
        })
      }
    },
    getColumns(key) {
      let columns = [1, 3].includes(parseInt(key, 10)) ? alarmColmuns[parseInt(key, 10)] : this.columns
      return columns
    },
    getRows(key) {
      let data = this.alarmRows && this.alarmRows.get(key)
      data = data && Array.from(data.values())
      data = this.sortRows(data)
      return data
    },
    sortRows(data) {
      data = data.sort(function (a, b) {
          return a.startTime < b.startTime ? 1 : -1
      })
      return data
    },
    resetAlarmDone(data){
      const { id } = data
      getResetAlarm({ids: id}).then((res) => {
        if (res.code === 200) {
          this.$message.success('复位成功！')
        }
      })
    },
    resetAllAlarm(){
      getResetAlarmAll().then((res) => {
        if (res.code === 200) {
          this.$message.success('复位成功！')
        }
      })
    },
    handleOperate(data) {
      const { type, startTime } = data
      if (type === 7) { // 7路径偏移告警类型
        getStaffPath({ident: data.ident}).then((res) => {
          if (res.code === 200) {
            this.$store.dispatch('olMapRoutePlan/showRoutePlan', {result: res.result, startTime})
          }
        })
      }
    }
  },
}
</script>

<style lang="less" scoped>
  .alarm-dialog {
    position: absolute;
    top: 60px;
    right: 10px;
    width: 600px;
    font-size: 14px;
    color: #666;
    max-height: 480px;
    background: #f5f5f5;
    z-index: 99;
    box-shadow: 0 5px 6px 4px rgba(0, 0, 0, 0.14);
    z-index: 9999;
    .dlg-header {
      width: 100%;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      color: white;
      background: #09f;
      cursor: move;
      i {
        cursor: pointer;
      }
    }
    .dlg-body {
      .reset-alarm {
        padding: 10px;
        button {
          border: 1px solid #09f;
          color: #09f;
          cursor: pointer;
          border-radius: 2px;
        }
      }
      .alarm-title {
        padding: 10px;
        .title {
          font-weight: bold;
          color: #333;
        }
        .tips {
          font-size: 12px;
        }
      }
      max-height: 438px;
      overflow: auto;
      ::v-deep td, ::v-deep th {
        padding: 6px 2px !important;
      }
      .location {
        width: 16px;
        cursor: pointer;
      }
      .operate {
        width: 32px;
        cursor: pointer;
      }
      .name {
        cursor: pointer;
      }
    }
  }
</style>