<template>
  <div class="upmine-dialog" v-show="isVisible">
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
            <a-select :showSearch="true" :value="selectIdent" :allowClear="true" style="width: 200px" @change="cardChange">
              <a-select-option v-for="item in searchData" :key="item.ident">
                {{ item.ident }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="名称:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
            <a-select :showSearch="true" :value="selectName" :allowClear="true" style="width: 200px" @change="cardTypeChange">
              <a-select-option v-for="item in searchData" :key="item.ident" :value="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <div>
          <a-button type="primary" @click="doSearch">
            查询
          </a-button>
          <a-button type="primary" name="checked" @click="upmine">
            升井选中
          </a-button>
          <a-button type="primary" name="timecard" @click="upmine">
            升井20小时人员
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
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          rowKey="id">
            <span slot="forbinFlag" slot-scope="text, record">{{record.forbinFlag ? '是' : '否'}}</span>
            <a slot="handle" slot-scope="text, record" @click="joinBlackList(record)">加入禁止下井黑名单</a>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { getAllUpList, sendUpMine, setForbidMine } from '@/api/api'
import { upminColumns } from '../../views/monitorMap/map_def'
import moment from "moment"
export default {
  data() {
    return {
      isVisible: false,
      title: '手动升井',
      form: {
        layout: 'horizontal',
        staffID: '',
        deptID: '',
        workTime: '0',
        coltype: {
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
        }
      },
      cardType: null,
      data: null,
      tableColumns: null,
      searchData: null,
      selectName: null,
      selectIdent: null,
      selectedRowKeys: [],
      mapElement: null
    };
  },
  watch: {
    '$store.state.stateStore.upmine': {
      handler (result) {
        console.log('result', result)
        this.mapElement = this.$store.state.stateStore.mapContainer
        this.isVisible = result.isVisible
        if (result.data) {
          this.data = result.data
          this.tableColumns = upminColumns['staff']
        } else {
          this.data = null
          this.tableColumns = null
        }
        this.searchData = this.data
        
      },
      deep: true
    }
  },
  mounted() {
    
  },
  methods: {
    doSearch() {
      if (!this.selectName && !this.selectIdent) {
        this.getList()
      } else {
        if (this.selectName && this.selectIdent) {
          this.data = this.data.filter(item => this.selectIdent === item.ident && this.selectName && item.name)
        }
        if (this.selectName) {
          this.data = this.data.filter(item => this.selectName === item.name)
        }
        if (this.selectIdent) {
          this.data = this.data.filter(item => this.selectIdent === item.ident)
        }   
      }
    },
    getList() {
      getAllUpList({type:1, mapID: window.xdata.state.mapService.mapID}).then((res) => {
        if (res.code === 200) {
          this.$store.commit('stateStore/changeUpmine', {
            type: true,
            data: res.result
          })
        }
      })
    },
    upmine(evt) {
      const target = evt.target
      const name = target.getAttribute('name')
      if (name === 'checked') {
        const upList = this.selectedRowKeys
        sendUpMine({ids:upList,type:1}).then((res) => {
          if (res.code === 200) {
            this.$message.success('升井成功');
            this.getList();
          }         
        })
      } else if (name === 'timecard') {
        sendUpMine({type:2}).then((res) => {
          if (res.code === 200) {
            this.$message.success('升井成功');
            this.getList();
          }
        })
      }
      this.selectedRowKeys = []
    },
    askFile() {
    },
    handleCancel() {
      this.$store.commit('stateStore/changeUpmine', {
        type: false,
        data: null
      })
      this.selectIdent = null;
      this.selectName = null;
    },
    joinBlackList(data) {
      let { ident, forbinFlag } = data
      if (forbinFlag === 1) {
        this.$message.warning('该人员已加入禁止下井名单')
        return
      }
      let now = moment(Date.parse(new  Date())).format('YYYY-MM-DD HH:mm:ss')
      let endYear = new Date().getFullYear() + 1
      let endtime = `${endYear}-${moment(Date.parse(new  Date())).format('MM-DD hh:mm:ss')}`

      let blackListMsg = {
        ident,
        startTime: now,
        endTime: endtime,
      }
      setForbidMine(blackListMsg).then((res) => {
        if (res.code === 200) {
          this.$message.success('加入成功!')
          this.getList()
        }
      }) 
    },
    cardChange(evt) {
      this.selectIdent = evt ? evt : null
    },
    cardTypeChange(evt) {
      this.selectName = evt ? evt : null
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    }
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
      }
      ::v-deep .ant-form-item-label {
        width: 50px;
      }
    }
    button {
      margin: 0 5px;
    }
  }
  .location {
    width: 16px;
    cursor: pointer;
  }
</style>