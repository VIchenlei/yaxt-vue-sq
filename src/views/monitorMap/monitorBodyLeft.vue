<template>
  <div class="monitorBodyLeft">
    <a-icon class="collapseIcon" :type="stateShow ? 'double-left' : 'double-right'" @click="toggleStateShow"/>
    <div class="real-time-body" v-show="stateShow">
      <screenSubComponent :carCount='carCount' :staffCount='staffCount'></screenSubComponent>
      <div class="monitorBodyLeftContent">
        <h3>
          <span class="themeColor">
            {{topicDefs[activeTabIndex].label}}
          </span>
        </h3>
        <div class="menuContainer boxuncoll">
          <a-tabs v-model="activeTabIndex" tab-position="left" class="tabPane" @change="tabChange">
            <a-tab-pane :key="index" v-for="(topicDef, index) in topicDefs">
              <span slot="tab">
                <i :class=" activeTabIndex==index ? `active${topicDef.iconName} icon`: `${topicDef.iconName} icon`" ></i>
              </span>
              <a-col :span="24">
                <div>
                  <a-table class="infoTable" :columns="tableColumns" :data-source="tableData" :expandRowByClick="isExpandClick" :pagination="false" :expandIconColumnIndex="-1" rowKey="id" :customRow="Rowclick" :expandedRowKeys="expandedRowKeys" @expandedRowsChange="expandedRowsChange">
                    <p v-if="expandedColumns" slot="expandedRowRender" slot-scope="record"  style="margin: 0">
                      <a-table class="infoTable" :columns="expandedColumns" :data-source="record.dataList" :pagination="ipagination" :expandIconColumnIndex="-1" rowKey="record.ident" @change="handleTableChange">
                        <img v-if="showLocate(topicDef.iconName)" slot="handle" slot-scope="text, record" class="location" src="/img/location.png" alt="" @click="toggleLcate(topicDef.iconName, record)">
                        <span v-else-if="showCall(topicDef.iconName)" slot="handle" slot-scope="text, record" @click="stopCall(topicDef.iconName, record)">取消</span>
                      </a-table>
                    </p>
                    <!-- <img v-if="topicDef.iconName === 'manCall'" slot="handle" slot-scope="text, record" class="location" src="/img/location.png" alt="" @click="toggleLcate(topicDef.iconName, record)"> -->
                    <span v-if="['manCall', 'callList'].includes(topicDef.iconName)" slot="handle" slot-scope="text, record" @click="stopCall(topicDef.iconName, record)">取消</span>
                  </a-table>
                </div>
              </a-col>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { topicDefs, tableColumns, expandedColumns } from './map_def.js'
import { getVehicleStaffReq, getCallListReq, stopCallList, getIdent, getMapByCode, getPositionCard } from '@/api/api'
import { dealMapDatas } from '../../store/map/mapUtils/OlMapUtils'
import screenSubComponent from '@views/jeecg/screenSubComponent'
import {mapState} from 'vuex'

export default {
  props: {
   
  },
  components: {
    screenSubComponent
  },
  data () {
    return {
      stateShow: true,
      topicDefs: topicDefs,
      activeTabIndex: 0,
      tableColumns: null,
      tableData:null,
      expandedColumns: null,
      isExpandClick: true,
      expandedRowKeys: [],
      ipagination:{
        current: 1,
        pageSize: 10,
        total: 90,
        showLessItems: true,
        simple: true
      },
      selectRecords: null,
    }
  },
  computed: {
    ...mapState({
      staffCount: state => state.cardStore.overview.staff,
      carCount: state => state.cardStore.overview.vehicle,
    })
  },
  created () {
    
  },
  mounted () {
    this.getVehicleStaff(this.topicDefs[0])
  },
  methods: {
    iconEvent (topicDef) {
      let fnName = topicDef.fnName
      this[fnName] && this[fnName](topicDef)
    },
    changeState() {
      this.state = !this.state
    },
    getVehicleStaff(topicDef) {
      let mapId = window.xdata.state.mapService.mapID
      this.tableColumns = tableColumns[this.activeTabIndex]
      this.expandedColumns = ['man','car','manArea', 'manDept'].includes(topicDef.iconName) ? expandedColumns[topicDef.iconName] : null
      let params = {groupType:topicDef.groupType, type:topicDef.tType, mapId}
      getVehicleStaffReq(params).then((res) => {
        if (res.code === 200) {
          let datas = res.result;
          this.tableData = datas;
          for (let i = 0; i < this.tableData.length; i++) {
            this.tableData[i]['dataList'] = [];
          }
        }
      })
    },
    getCallList(topicDef) {
      getCallListReq().then((res) => {
        if (res.code === 200) {
          this.tableColumns = tableColumns[this.activeTabIndex]
          this.expandedColumns = null
          this.tableData = res.result
        }
      })
    },
    getHelpList(topicDef) {
      this.tableColumns = tableColumns[this.activeTabIndex];
      this.expandedColumns = null;
      let helpList = this.$store.state.helpStore.helpList;
      helpList = Array.from(helpList.rows.values());
      this.tableData = helpList;
    },
    toggleStateShow() {
      this.stateShow=!this.stateShow
    },
    tabChange(key){
      this.isExpandClick = key === 4 || key === 5 ? false : true
      this.activeTabIndex=key;
      this.selectRecords = null;
      this.ipagination = {
        current: 1,
        pageSize: 10,
        total: 0,
        showLessItems: true,
        simple: true
      }
      this.expandedRowKeys = [];
      this.iconEvent(this.topicDefs[this.activeTabIndex]);
    },
    showLocate(name) {
      if (['man','car','manArea','manDept'].includes(name)) return true
      return false 
    },
    showCall(name) {
      if (name === 'manCall') return true
      if (name === 'callList') return true
      return false 
    },
    toggleLcate(name, data) {
      const { ident } = data
      let mapID = data.mapCode
      getIdent(ident).then((res) => {
        if (res.code === 200) {
          let result = res.result
          if (result) {
            let x = result.x
            let y = result.y
            if (mapID !== xdata.state.mapService.mapID) { 
              getMapByCode({code: mapID}).then((res) => {
                if (window.monitormap.childNodes[0]) {
                  window.monitormap.removeChild(window.monitormap.childNodes[0])
                }
                if (res.code === 200) {
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
    stopCall(name, data) {
      let url = null;
      if (name === 'manCall') url = `/call/cancel/1/${data.id}`;
      if (name === 'callList') url = `/call/cancel/2/${data.id}`;
      stopCallList(url).then((res) => {
        if (res.code === 200) {
          this.$message.success('处理成功！');
          if (name === 'manCall') {
            this.iconEvent(this.topicDefs[this.activeTabIndex]);
          }
        } else {
          this.$message.warning('处理失败！');
        }
      })
    },
    async getTableDatas(data, iconName) {
      let groupType = this.topicDefs[this.activeTabIndex].groupType;
      let type = data.type;
      let params = {groupType, type, mapId: window.xdata.state.mapService.mapID};
      if (iconName === 'car') params['areaId'] = data.id;
      if (iconName === 'man') params['deptId'] = data.id;
      if (iconName === 'manArea') params['areaId'] = data.id;
      if (iconName === 'manDept') params['postId'] = data.id;
      this.changePageData(params, data);
    },
    async getCardList(params) {
      let rows = [];
      await getPositionCard(params).then((res) => {
        if (res.code === 200) {
          rows = res.result.records;
          this.ipagination.total = res.result.total;
        }
      })
      return rows;
    },
    Rowclick(record, index) {
      return {
        on: {
          click: () => {
            let that = this;
            let iconName = that.topicDefs[that.activeTabIndex].iconName;
            if (['manCall', 'callList'].includes(iconName)) return;
            that.selectRecords = record;
            for (let i = 0; i < that.tableData.length; i++) {
              if (that.tableData[i].id === record.id) {
                that.getTableDatas(record, iconName);
              } 
            }
          },
        }
      };
    },
    expandedRowsChange(key) {
      if (key.length === 0) {
        this.expandedRowKeys = key;
      } else {
        this.expandedRowKeys = [key[key.length - 1]];
      }
    },
    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter).length > 0) {
        this.sorter.column = sorter.field
        this.sorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      if (!this.selectRecords) return;
      let data = this.selectRecords;
      let iconName = this.topicDefs[this.activeTabIndex].iconName;
      let type = data.type;
      let params = {
        type, 
        mapId: window.xdata.state.mapService.mapID,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (iconName === 'car') params['areaId'] = data.id;
      if (iconName === 'man') params['deptId'] = data.id;
      if (iconName === 'manArea') params['areaId'] = data.id;
      if (iconName === 'manDept') params['postId'] = data.id;
      this.changePageData(params, data);
    },
    async changePageData(params, data) {
      let rows = [];
      rows = await this.getCardList(params);
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].id === data.id) {
          this.tableData[i].dataList = rows;
          this.$forceUpdate();
        } else {
          this.tableData[i].dataList = []
        }
      }
      return rows;
    }
  },
  watch: {
    '$store.state.helpStore.helpList': {
      handler (result) {
        if (this.activeTabIndex === 5) {
          let helpList = Array.from(result.rows.values());
          this.tableData = helpList;
        }
      },
      deep: true
    },
    '$store.state.mapService.mapID': {
      handler (result) {
        this.activeTabIndex = 0;
        this.tabChange(this.activeTabIndex);
      },
      deep: true
    },
  },
}
</script>

<style lang="less" scoped>
.monitorBodyLeft{
  position: absolute;
  left: 10px;
  height: 600px;
  display: flex;
  flex-direction: column;
  .collapseIcon{
    color: #fff;
    font-weight: bold;
    font-size: 20px;
    position: absolute;
    left: 10px;
    top: 20px;
    z-index: 999;
  }
  .real-time-body {
    width: 420px;
  }
  ::v-deep .ant-table-pagination li {
    color: #fff;
    input {
     color: rgba(0, 0, 0, 0.65);
    }
  }
  #personCarCount{
    height:120px;
  }
  #personCarCount ::v-deep .person_car {
    margin-top: -10px;
  }
  .monitorBodyLeftContent {
    display: flex;
    margin-top: 10px;
    color: white;
    flex-direction: column;
    h3{
      margin-top: 15px;
      padding-top: 15px;
      box-sizing: border-box;
      height: 39px;
      color: #71FcF4;
      text-align: center;
    }
    .menuContainer{
      padding: 5px 0 35px 5px;
      margin-bottom: 20px;
      border: 1px solid #09f;
      box-shadow: 0 1px 6px 1px #009fff;
      opacity: .8;
      border-radius: 4px;
    }
    
    .icon{
      display: inline-block;
      background-image: url("../../assets/img/icon.png");
      width: 25px;
      height: 25px;
    }
    .car{
      background-position-y:-46px ;
    }
    .activecar{
      background-position-y:-71px ;
    }
    .man{
      background-position:-25px -44px;
    }
    .activeman{
      background-position:-25px -69px;
    }
    .manArea{
      background-position:-50px -44px;
    }
    .activemanArea{
      background-position:-50px -69px;
    }
    .manDept{
      background-position:-75px -44px;
    }
    .activemanDept{
      background-position:-75px -69px;
    }
    .manCall{
      background-position:-148px -44px;
    }
    .activemanCall{
      background-position:-148px -69px;
    }
    .callList{
      background-position:-198px -44px;
    }
    .activecallList{
      background-position:-198px -69px;
    }
  }
  .boxcoll{
    width:80px;
  }
  .boxuncoll{
    width: 100%;
  }
}
.infoTable{
    max-height: 450px;
    overflow: auto;
  }
.infoTable ::v-deep table,.infoTable ::v-deep  th{
  color:#fff !important;
  background: transparent !important;
}
.infoTable ::v-deep .ant-table-expand-icon-th, .infoTable ::v-deep .ant-table-expanded-row>td{
  padding: 0 0 0 4px;
}
.infoTable ::v-deep tr{
  background: transparent !important;
}
.infoTable ::v-deep td{
  background: rgba(0,0,0,0.5) !important;
}
.infoTable ::v-deep td{
  padding: 0;
  padding: 16px 0;
}
.infoTable ::v-deep th{
  padding: 16px 0;
}
.infoTable ::v-deep tr:hover td{
  background: transparent !important;
  cursor: pointer;
}
.infoTable ::v-deep p td, .infoTable ::v-deep p th {
  padding: 5px 8px;
  white-space: nowrap;
}
.infoTable ::v-deep .ant-table-row-expand-icon-cell, .infoTable ::v-deep .ant-table-expand-icon-th, .infoTable ::v-deep .ant-table-expanded-row>td:first-child{
  display: none !important;
}
.menuContainer ::v-deep .ant-tabs-left-bar,::v-deep .ant-tabs-left-content{
  border: none!important;
}
.infoTable ::v-deep .ant-table-placeholder{
  background-color: rgba(0, 0, 0, 0.65)!important;
}
.infoTable ::v-deep .ant-empty-description{
  color: white!important;
}
.infoTable ::v-deep .ant-empty-normal{
      margin: 100px 0!important;
}
.location{
  width: 16px;
  cursor: pointer;
}
</style>
