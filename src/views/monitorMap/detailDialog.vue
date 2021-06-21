<template>
  <div class="detail-dialog" v-show="isVisible">
    <a-modal
      v-model="isVisible"
      :title="title"
      :footer="false"
      :mask='false'
      @cancel="handleCancel"
      centered
      width="90%"
      :getContainer="() => mapElement"
      class="dlg-dialog"
    >
      <div class="dlg-header">
        <div class="search">
          <a-form-item label="卡号:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
            <!-- <a-select :showSearch="true" :value="selectIdent" :allowClear="true" style="width: 200px" @change="cardChange">
              <a-select-option v-for="item in searchData" :key="item.ident">
                {{ item.ident }}
              </a-select-option>
            </a-select> -->
            <a-input placeholder="请输入卡号" ref="searchIdent" :value="selectIdent" @change="cardChange"/>
          </a-form-item>
          <a-form-item label="名称:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
            <!-- <a-select :showSearch="true" :value="selectName" :allowClear="true" style="width: 200px" @change="cardTypeChange">
              <a-select-option v-for="item in searchData" :key="item.ident" :value="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select> -->
            <a-input placeholder="请输入名称" ref="searchName" :value="selectName" @change="cardTypeChange"/>
          </a-form-item>
        </div>
        <div>
          <a-button type="primary" @click="doSearch">
            查询
          </a-button>
          <a-button v-if="showSendCallBtn" type="primary" @click="sendCall">
            呼叫所有
          </a-button>
          <!-- <a-button type="primary" @click="askFile">
            导出
          </a-button> -->
        </div>
      </div>
      <div class="dlg-body">
        <a-table 
          class="infoTable" 
          :columns="tableColumns" 
          :data-source="data" 
          rowKey="id"
          :pagination="ipagination"
          @change="handleTableChange">
          <img slot="handle" slot-scope="text, record" class="location" src="/img/location.png" alt="" @click="toggleLcate(record)">
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { getStaffMineCard, getVehicleMineCard, getIdent, getMapByCode, getPositionCard } from '@/api/api'
import { dealMapDatas } from '../../store/map/mapUtils/OlMapUtils'
import { detailColumns } from './map_def'
export default {
  components: {
    
  },
  data() {
    return {
      isVisible: false,
      title: '车辆',
      form: {
        layout: 'horizontal',
        staffID: '',
        deptID: '',
      },
      cardType: null,
      data: null,
      tableColumns: null,
      form: {
        layout: 'vertical',
        coltype: {
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
        }
      },
      searchData: null,
      selectName: null,
      selectIdent: null,
      mapElement: null,
      ipagination:{
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + "-" + range[1] + " 共" + total + "条"
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
      },
      showSendCallBtn: false,
      areaId: null,
      points: null,
      shape: null,
    };
  },
  watch: {
    '$store.state.stateStore.detailDialog': {
      handler (result) {
        this.mapElement = this.$store.state.stateStore.mapContainer
        this.isVisible = result.isVisible
        this.cardType = result.cardType
        this.data = result.data ? result.data.records : null
        this.ipagination.total = this.data ? result.data.total : 0
        this.total = this.ipagination.total
        this.searchData = this.data
        this.points = result.points
        this.shape = result.shape
        this.areaId = result.areaId
        let title = null
        let columnsType = null
        let tableColumns = null
        if (this.data) {
          columnsType = this.cardType.includes('staff') ? 'staff' : 'vehicle'
          tableColumns = detailColumns[columnsType]
        }
        this.showSendCallBtn = this.cardType && this.cardType.includes('staff') ? true : false
        let length = this.total
        length = length || 0
        switch (this.cardType) {
          case 'staff':
            title = `当前人数:${length}`
            break;
          case 'vehicle':
            title = `当前车辆数:${length}`
            break;
          case 'staffArea':
            title = `区域人数:${length}`
            break;
          case 'staffDept':
            title = `部门人数:${length}`
            break;
          case 'staffOccupation':
            title = `当前岗位人数:${length}`
            break;
          case 'vehicleArea':
            title = `区域车辆数:${length}`
            break;
          default:
            console.log('UNKNOWN object： ', this.cardType)
            break;
        }
        this.tableColumns = tableColumns
        this.title = title
      },
      deep: true
    }
  },
  mounted() {

  },
  methods: {
    doSearch(pagination) {
      let mapID = window.xdata.state.mapService.mapID
      let params = pagination ? {mapID, pageNo: pagination.current, pageSize: pagination.pageSize, type: this.cardType} : {mapID}
      if (this.cardType === 'staffArea') {
        params = { pageNo: pagination.current, pageSize: pagination.pageSize, areaId: this.areaId, type: 'staff' }
      }
      if (this.points && this.shape) {
        params= { points: this.points, shape: this.shape, type: this.cardType}
        params['mapId'] = window.xdata.state.mapService.mapID
      }
      console.log('params', params)
      if ((!this.selectName && !this.selectIdent) && pagination) {
        this.getCardList(params);
      } else {
        if (this.selectName && this.selectIdent) {
          params['name'] = this.selectName;
          params['ident'] = this.selectIdent;
          this.getCardList(params);
        }
        if (this.selectName) {
          params['name'] = this.selectName;
          this.getCardList(params);
        }
        if (this.selectIdent) {
          params['ident'] = this.selectIdent;
          this.getCardList(params);
        }   
      }
    },
    getCardList(params) {
      getPositionCard(params).then((res) => {
        console.log(res)
        if (res.code === 200) {
          this.$store.commit('stateStore/changeDetailDialog', {
            type: true,
            cardType: this.cardType,
            data: res.result,
            points: this.points,
            shape: this.shape,
            areaId: this.areaId,
          })
        }
      })
    },
    sendCall() {
      this.$store.commit('stateStore/changeMapModel',{
        type: true,
        modalText: '',
        resultStatus: 'warning',
        resultTitle: '您确认要发送“全部呼叫”消息吗？',
        ajaxName: 'call',
        sendMsg: {'callTime': 5, 'level': 1, 'type': 0},
        showInput: false,
      })
    },
    askFile() {
      console.log('导出文件')
    },
    handleCancel() {
      this.$store.commit('stateStore/changeDetailDialog', {
        type: false,
        data: null,
        cardType: null,
        areaId: null,
        points: null,
        shape: null,
        areaId: null,
      })
      this.selectIdent = null;
      this.selectName = null;
      this.ipagination.current = 1;
      this.ipagination.pageSize = 10;
      this.ipagination.total = 0;
    },
    cardChange(evt) {
      this.selectIdent = evt ? evt.target.value : null
    },
    cardTypeChange(evt) {
      this.selectName = evt ? evt.target.value  : null
    },
    toggleLcate(data) {
      const { ident } = data
      let mapID = data.mapCode
      getIdent(ident).then((res) => {
        if (res.code === 200) {
          let result = res.result
          if (result) {
            this.handleCancel()
            let x = result.x
            let y = result.y
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
    },
    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter).length > 0) {
        this.sorter.column = sorter.field
        this.sorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      console.log(pagination)
      this.doSearch(pagination)
    },
  },
}
</script>

<style lang="less" scoped>
  .dlg-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .search{
      display: flex;
      justify-content: space-between;
      align-items: center;
      ::v-deep .ant-form-item {
        margin-right: 10px;
        display: flex;
        margin-left: 5px;
      }
      ::v-deep .ant-form-item-label {
        width: 50px;
      }
    }
    button {
      margin: 0 5px 24px;
    }
  }
  .location {
    width: 16px;
    cursor: pointer;
  }
</style>