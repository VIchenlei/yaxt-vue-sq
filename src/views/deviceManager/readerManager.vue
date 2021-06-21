<template>
  <div>
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="扫描IP范围" style="white-space: nowrap;">
              <a-input-group compact>
                <a-input style=" width: 120px; text-align: center" placeholder="0.0.0.0" v-model="queryParam.ip1"/>
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input style="width: 120px; text-align: center; border-left: 0" placeholder="255.255.255.255" v-model="queryParam.ip2"/>
              </a-input-group>
            </a-form-item>
          </a-col>

          <a-col :xl="5" :lg="7" :md="8" :sm="24">
            <a-form-item label="分站类型">
              <j-dict-select-tag placeholder="请选择分站类型" v-model="queryParam.type" dictCode="reader_device_type"/>
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="7" :md="8" :sm="24">
            <a-form-item label="分站编号">
              <a-input-number style=" width: 120px; text-align: center" placeholder="请输入分站编号" v-model="queryParam.code"/>
            </a-form-item>
          </a-col>
          <a-col :xl="5" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" name="search">查询</a-button>
              <a-button type="primary" @click="searchQuery" style="margin-left: 8px" name="realSearch">扫描</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :xl="5" :lg="6" :md="7" :sm="24">
            <a-form-item label="升级文件">
              <a-select :showSearch="true" :allowClear="true" style="width: 200px" @change="fileChange">
                <a-select-option v-for="item in files" :key="item.id">
                  {{ item.filename }}-{{item.version}}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="2" :lg="3" :md="4" :sm="12">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button
                type="primary"
                :disabled="selectFile === null"
                :loading="uploading"
                style="margin-left: 8px"
                @click="handleUpload"
              >
                {{ uploading ? '升级中' : '升级' }}
              </a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- table区域-begin -->
    <a-spin :spinning="spinning">
      <div>
        <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
          <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
        </div>
        <a-row type="flex" justify="space-around">
          <a-col :span="7" class="device-content">
            <a-table
              ref="table"
              size="middle"
              bordered
              rowKey="id"
              :columns="columns"
              :dataSource="dataSource"
              :pagination="ipagination"
              :loading="loading"
              :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
              class="j-table-force-nowrap"
              @change="handleTableChange"
              :customRow="customRowFn">
              <span slot="type" slot-scope="text, record">{{getDeviceTypeText(record)}}</span>
            </a-table>
          </a-col>
          <a-col :span="8" class="device-content">
            <div class="device-title">
              <span>设备参数</span>
              <a-button type="primary" @click="setDevice">设置</a-button>
            </div>
            <a-descriptions layout="vertical" bordered>
              <a-descriptions-item v-for="(label, index) in deviceRevealLabels" :key="index" :label="label">
                {{getDeviceValue(index)}}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
          <a-col :span="8" class="device-content">
            <div class="device-title">
              <span>设备网络参数</span>
              <a-button type="primary" @click="setIntertDevice">设置</a-button>
            </div>
            <a-descriptions layout="vertical" bordered>
              <a-descriptions-item v-for="(label, index) in deviceRevealLabels" :key="index" :label="`网络${label}`">
                {{getDeviceValue(index)}}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>

      </div>
    </a-spin>
    <reader-device-modal ref="deviceModalForm" @ok="modalFormOk"></reader-device-modal>
    <reader-intert-device-modal ref="deviceIntertModalForm" @ok="modalFormOk"></reader-intert-device-modal>
  </div>
</template>

<script>
  import '@/assets/less/TableExpand.less'
  import pick from 'lodash.pick'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import { filterObj } from '@/utils/util'
  import { getDeviceScan, getDictItemsFromCache, ajaxGetDictItems, getUpdateFiles, getDeiceUpdate  } from '@/api/api'
  import { DEVICEREVEAL, DEVICEUPDATADEF } from './device_updata_def'
  import readerDeviceModal from './readerDeviceModal.vue'
  import readerIntertDeviceModal from './readerIntertDeviceModal.vue'

  export default {
    name: "readerManager",
    components: {
      JDictSelectTag,
      readerDeviceModal,
      readerIntertDeviceModal
    },
    data() {
      return {
        queryInfo: [],
        queryParam: {},
        selfParam:{
        },
        sorter: {
          column: '',
          order: 'desc',
        },
        selectedRowKeys: [],
        description: '标识卡表管理页面',
        columns: [
          {
            title:'分站编号',
            align:"center",
            dataIndex: 'code'
          },
          {
            title:'分站类型',
            align:"center",
            dataIndex: 'type',
            scopedSlots: { customRender: 'type' }
          },
          {
            title:'ip地址',
            align:"center",
            dataIndex: 'ip'
          },

        ],
        url: {
          list: "/colliery.modules.mdm/card/list",
          delete: "/colliery.modules.mdm/card/delete",
          deleteBatch: "/colliery.modules.mdm/card/deleteBatch",
          exportXlsUrl: "/colliery.modules.mdm/card/exportXls",
        },
        dictOptions:{},
        loading: false,
        ipagination:{
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 共" + total + "条"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        fileList: [],
        uploading: false,
        // 假数据
        dataSource:null,
        spinning: false,
        deviceRevealNames: DEVICEREVEAL.names,
        deviceRevealLabels: DEVICEREVEAL.labels,
        deviceRecord: null,
        files: null,
        selectFile: null,
        searchType: 'search'
      }
    },
    created() {
      this.initParamsInfo(this.getQueryParams());
      //根据字典Code, 初始化字典数组
      ajaxGetDictItems("reader_device_type", null).then((res) => {
        if (res.success) {
          this.dictOptions = res.result;
        }
      });
      this.getFiles();
    },
    mounted() {

    },
    methods: {
      getFiles() {
        getUpdateFiles({pageNo: 100, pageSize: 1}).then((res) => {
          console.log('升级文件', res)
          if (res.code === 200) {
            this.files = res.result.records;
          } else {
            this.$message.warning('获取升级文件失败！');
          }
        })
      },
      initParamsInfo(params){
        // 获取扫描的当前所有分站
        console.log('筛选条件',params);
        this.spinning = true;
        let url = this.searchType === 'search' ? '/busiDeviceScan/' : '/busiDeviceScan/test';
        getDeviceScan(url, params).then((res) => {
          console.log(res)
          this.spinning = false;
          if (res.code === 200) {
            if (this.searchType === 'search') {
              this.dataSource = res.result.records;
              this.ipagination.total = res.result.total;
              if (this.deviceRecord) {
                this.deviceRecord = this.dataSource.find(item => item.id === this.deviceRecord.id);
              }
            } else if (this.searchType === 'realSearch') {
              this.searchType = 'search';
              this.initParamsInfo(params);
            }
            
          } else {
            let tips = this.searchType !== 'search' && res.code === 500 ? '网络环境差，请重新尝试！' : '扫描失败！'
            this.$message.warning(tips);
          }
        })
      },
      searchQuery(evt) {
       this.searchType = evt.target.name;
        var params = this.getQueryParams();
        if (!params) return;
        this.initParamsInfo(params);
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam);
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        let queryParam = filterObj(param);
        if ((Reflect.has(queryParam, 'ip1') && !Reflect.has(queryParam, 'ip2')) || (!Reflect.has(queryParam, 'ip1') && Reflect.has(queryParam, 'ip2'))) {
          this.$message.warning('请检查ip地址输入是否正确！');
          return false
        }
        console.log('params', queryParam);
        return queryParam
      },
      // realSearchQuery() {
      //   console.log('实时扫描');
      //   var params = this.getQueryParams();
      //   if (!params) return;
      //   params['url'] = '/busiDeviceScan/test'
      //   this.initParamsInfo(params);
      // },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectionRows = selectionRows
        console.log('selectedRowKeys', this.selectedRowKeys)
      },
      onClearSelected() {
        this.selectedRowKeys = [];
        this.selectionRows = [];
      },
      handleTableChange(pagination, filters, sorter) {
        if (Object.keys(sorter).length > 0) {
          this.sorter.column = sorter.field
          this.sorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
        }
        this.ipagination = pagination;
        this.initParamsInfo(this.getQueryParams())
      },
      handleRemove(file) {
        const index = this.fileList.indexOf(file);
        const newFileList = this.fileList.slice();
        newFileList.splice(index, 1);
        this.fileList = newFileList;
      },
      beforeUpload(file) {
        this.fileList = [...this.fileList, file];
        return false;
      },
      handleUpload() {
        if (this.selectedRowKeys.length === 0) {
          return this.$message.warning('请选择需要升级的设备！');
        }
        let data = [];
        for (let i = 0; i < this.selectedRowKeys.length; i++) {
          const selectKey = this.selectedRowKeys[i];
          data.push({deviceid: selectKey, fileid: this.selectFile});
        }
        const params = {
          s:JSON.stringify(data)
        }
        console.log(params)
        getDeiceUpdate(params, 'put').then((res) => {
          console.log('返回升级结果', res)
        })
        // console.log(this.selectionRows)
      },
      customRowFn(record) {
        return {
          on: {
            click: () => {
              // 根据点击分站数据去获取相关设备信息
              console.log('点击的分站数据',record)
              this.deviceRecord = record
            }
          }
        }
      },
      modalFormOk() {
        // 新增/修改 成功时，重载列表
        console.log('重新加载')
        // this.searchQuery()
        this.initParamsInfo({})
      },
      setDevice() {
        if (!this.deviceRecord) return this.$message.warning('请选择设备！');
        this.deviceRecord.oneTransmitPower = Number(this.deviceRecord.oneTransmitPower);
        this.deviceRecord.twoTransmitPower = Number(this.deviceRecord.twoTransmitPower);
        this.deviceRecord.onePulseReptFrequency = Number(this.deviceRecord.onePulseReptFrequency);
        this.deviceRecord.twoPulseReptFrequency = Number(this.deviceRecord.twoPulseReptFrequency);
        let record = pick(this.deviceRecord, DEVICEUPDATADEF['device_configuration'].names);
        record = Object.assign(record, {id: this.deviceRecord.id});
        let completionRecord = pick(this.deviceRecord, DEVICEUPDATADEF['network_configuration'].names);
        completionRecord = Object.assign(completionRecord, {id: this.deviceRecord.id});
        console.log('record', record, completionRecord)
        this.$refs.deviceModalForm.edit(record, completionRecord);
        this.$refs.deviceModalForm.title = "设备参数";
        this.$refs.deviceModalForm.disableSubmit = false;
      },
      setIntertDevice() {
        if (!this.deviceRecord) return this.$message.warning('请选择设备！');
        this.deviceRecord.oneTransmitPower = Number(this.deviceRecord.oneTransmitPower);
        this.deviceRecord.twoTransmitPower = Number(this.deviceRecord.twoTransmitPower);
        this.deviceRecord.onePulseReptFrequency = Number(this.deviceRecord.onePulseReptFrequency);
        this.deviceRecord.twoPulseReptFrequency = Number(this.deviceRecord.twoPulseReptFrequency);
        let record = pick(this.deviceRecord, DEVICEUPDATADEF['network_configuration'].names);
        record = Object.assign(record, {id: this.deviceRecord.id});
        let completionRecord = pick(this.deviceRecord, DEVICEUPDATADEF['device_configuration'].names);
        completionRecord = Object.assign(completionRecord, {id: this.deviceRecord.id});
        console.log('record', record, completionRecord)
        this.$refs.deviceIntertModalForm.edit(record, completionRecord);
        this.$refs.deviceIntertModalForm.title = "设备网络参数";
        this.$refs.deviceIntertModalForm.disableSubmit = false;
      },
      /*设备参数、网络参数默认展示字段value*/
      getDeviceValue(index) {
        if (!this.deviceRecord) return
        const name = this.deviceRevealNames[index];
        let value = this.deviceRecord[name];
        if (name === 'type') {
          value = this.dictOptions && this.dictOptions.find(item => item.value == value).text;
        }
        return value;
      },
      /*设备转文字*/
      getDeviceTypeText(record) {
        const key = record.type;
        const value = this.dictOptions && this.dictOptions.find(item => item.value == key).text;
        return value;
      },
      /*选择升级文件*/
      fileChange(data) {
        console.log(data);
        this.selectFile = data ? data : null;
      }
    },
    watch: {

    },
  }
</script>
<style scoped>
.device-content{
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 5px;
}
.device-title{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px
}
</style>