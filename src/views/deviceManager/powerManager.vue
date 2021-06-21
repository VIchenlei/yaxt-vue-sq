<template>
  <div>
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="扫描IP范围" style="white-space: nowrap;">
              <a-input-group compact>
                <a-input style=" width: 100px; text-align: center" placeholder="0.0.0.0" v-model="queryParam.startIp"/>
                <a-input
                  style=" width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                  placeholder="~"
                  disabled
                />
                <a-input style="width: 100px; text-align: center; border-left: 0" placeholder="255.255.255.255" v-model="queryParam.endIp"/>
              </a-input-group>
            </a-form-item>
          </a-col>

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="电源类型">
              <j-dict-select-tag placeholder="请选择电源类型" v-model="queryParam.deviceType" dictCode="device_type"/>
            </a-form-item>
          </a-col>
          <a-col :xl="2" :lg="3" :md="4" :sm="12">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery">扫描</a-button>
            </span>
          </a-col> -->
          <a-col :xl="3" :lg="4" :md="5" :sm="12">
            <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
              <a-button> <a-icon type="upload" /> 点击选择升级文件 </a-button>
            </a-upload>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button
                type="primary"
                :disabled="fileList.length === 0"
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
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>
      <a-row type="flex" justify="space-around">
        <a-col :span="12" class="device-content">
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
            <span slot="deviceType">隔爆电源</span>
            <a slot="handle" slot-scope="text, record" @click="showRealPower($event, record)">实时电路</a>
          </a-table>
        </a-col>
        <a-col :span="10" class="device-content">
          <div class="device-title">
            <span>设备参数</span>
            <a-button type="primary" @click="setDevice">设置</a-button>
          </div>
          <a-descriptions layout="vertical" bordered :column="4">
            <a-descriptions-item label="电源编号">
              {{getDeviceValue('powerNumber')}}
            </a-descriptions-item>
            <a-descriptions-item label="设备名称">
              {{getDeviceValue('deviceType')}}
            </a-descriptions-item>
            <a-descriptions-item label="设备ip">
              {{getDeviceValue('ip')}}
            </a-descriptions-item>
            <a-descriptions-item label="版本">
              {{getDeviceValue('version')}}
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
        <!-- <a-col :span="8" class="device-content">
          <div class="device-title">
            <span>设备网络参数</span>
            <a-button type="primary" @click="setIntertDevice">设置</a-button>
          </div>
          <a-descriptions layout="vertical" bordered>
            <a-descriptions-item label="网络设备名称">
              大分站
            </a-descriptions-item>
            <a-descriptions-item label="网络设备编号">
              10001
            </a-descriptions-item>
            <a-descriptions-item label="网络设备ip">
              192.168.0.240
            </a-descriptions-item>
            <a-descriptions-item label="网络设备名称">
              大分站
            </a-descriptions-item>
            <a-descriptions-item label="网络设备编号">
              10001
            </a-descriptions-item>
            <a-descriptions-item label="网络设备ip">
              192.168.0.240
            </a-descriptions-item>
            <a-descriptions-item label="网络设备名称">
              大分站
            </a-descriptions-item>
            <a-descriptions-item label="网络设备编号">
              10001
            </a-descriptions-item>
            <a-descriptions-item label="网络设备ip">
              192.168.0.240
            </a-descriptions-item>
          </a-descriptions>
        </a-col> -->
      </a-row>
      
    </div>
    <power-device-modal ref="deviceModalForm" @ok="modalFormOk"></power-device-modal>
    <power-intert-device-modal ref="deviceIntertModalForm" @ok="modalFormOk"></power-intert-device-modal>
    <real-power-modal></real-power-modal>
  </div>
</template>

<script>
  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'
  import {filterMultiDictText, filterDictTextByCache} from '@/components/dict/JDictSelectUtil'
  import { filterObj } from '@/utils/util'
  import { getRealPower, getBatteryList } from '@/api/api'
  import powerDeviceModal from './powerDeviceModal.vue'
  import powerIntertDeviceModal from './powerIntertDeviceModal.vue'
  import RealPowerModal from './realPowerModal.vue'


  export default {
    name: "powerManager",
    components: {
      JDictSelectTag,
      powerDeviceModal,
      powerIntertDeviceModal,
      RealPowerModal
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
        description: '电源设备维护界面',
        columns: [
          {
            title:'电源编号',
            align:"center",
            dataIndex: 'powerNumber'
          },
          {
            title:'电源类型',
            align:"center",
            dataIndex: 'deviceType',
            scopedSlots: { customRender: 'deviceType' }
          },
          {
            title:'ip地址',
            align:"center",
            dataIndex: 'ip'
          },
          {
            title:'操作',
            align:"center",
            dataIndex: 'handle',
            scopedSlots: { customRender: 'handle' }
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
        dataSource: [],
        deviceRecord: null,
      }
    },
    created() {

    },
    mounted() {
      let params = {
        pageNo: 1,
        pageSize: 10
      }
      this.getList(params);
    },
    methods: {
      initParamsInfo(params){
        let getConfig = {}
        // 获取扫描的当前所有分站
        console.log('筛选条件',params)
        // getCardAll({cardNo, cardType}).then((res) => {
        //   if (res.success) {
            
        //   } else {
        //     this.$message.warning(res.message)
        //   }
        //   this.dataSource = res.result
        // })
      },
      searchQuery() {
        var params = this.getQueryParams();
        this.initParamsInfo(params)
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam, this.sorter);
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectionRows = selectionRows
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
        this.ipagination = pagination
        let params = {
          pageNo: pagination.current,
          pageSize: pagination.pageSize
        }
        this.getList(params);
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
        const { fileList } = this;
        const formData = new FormData();
        fileList.forEach(file => {
          formData.append('files[]', file);
        });
        this.uploading = true;
        reqwest({
          // 升级文件地址
          // url: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
          url: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
          method: 'post',
          processData: false,
          data: formData,
          success: () => {
            this.fileList = [];
            this.uploading = false;
            this.$message.success('标识卡升级成功');
          },
          error: () => {
            this.uploading = false;
            this.$message.error('标识卡升级失败');
          },
        });
        console.log('打印选择的',this.selectionRows)
      },
      customRowFn(record) {
        return {
          on: {
            click: () => {
              // 根据点击分站数据去获取相关设备信息
              this.deviceRecord = record;
            }
          }
        }
      },
      modalFormOk() {
        // 新增/修改 成功时，重载列表
        this.searchQuery()
      },
      setDevice() {
        if (!this.deviceRecord) return;
        let record = {
          powerNumber: this.deviceRecord.powerNumber,
          deviceType: this.deviceRecord.deviceType,
          ip: this.deviceRecord.ip,
          version: this.deviceRecord.version,
        }
        console.log(record);
        this.$refs.deviceModalForm.edit(record);
        this.$refs.deviceModalForm.title = "设置";
        this.$refs.deviceModalForm.disableSubmit = false;
      },
      setIntertDevice() {
        let record = {'code': 1, 'readerType': '电源1', 'readerEndIp': '192.168.0.240'}
        this.$refs.deviceIntertModalForm.edit(record);
        this.$refs.deviceIntertModalForm.title = "设置";
        this.$refs.deviceIntertModalForm.disableSubmit = false;
      },
      showRealPower(evt, data) {
        evt.stopPropagation();
        const id = data.id;
        getRealPower({id}).then((res) => {
          if (res.code === 200) {
            let result = res.result;
            if (result.busiPowerLevels && result.busiPowerLevels.length > 0) {
              this.$store.commit('stateStore/changeRealPowerModal', {
                type: true,
                rows: result.busiPowerLevels
              })
            } else {
              this.$message.warning('未配置电路！');
            }
            
          } else {
            this.$message.warning(res.message);
          }
        })
      },
      getList(params) {
        getBatteryList(params).then((res) => {
          if (res.code === 200) {
            this.dataSource = res.result.records;
          }
        })
      },
      getDeviceValue(name) {
        if (!this.deviceRecord) return '';
        let value = this.deviceRecord[name];
        if (name === 'deviceType') value = '隔爆电源'
        return value;
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