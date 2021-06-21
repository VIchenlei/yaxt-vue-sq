<template>
  <div>
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="卡号编号">
              <a-input placeholder="请输入卡号编号" v-model="queryParam.cardNo"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="卡类型">
              <j-dict-select-tag placeholder="请选择卡类型" v-model="queryParam.cardType" dictCode="card_type"/>
            </a-form-item>
          </a-col>

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
              <a-button> <a-icon type="upload" /> 点击选择升级文件 </a-button>
            </a-upload>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
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
        @change="handleTableChange">
      </a-table>
    </div>
  </div>
</template>

<script>
  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDictSelectTag from '@/components/dict/JDictSelectTag'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import { filterObj } from '@/utils/util'
  import { getCardAll } from '@/api/api';

  export default {
    name: "cardManager",
    components: {
      JDictSelectTag
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
            title:'卡号编号',
            align:"center",
            dataIndex: 'cardNo'
          },
          {
            title:'卡类型',
            align:"center",
            dataIndex: 'cardTypeName'
          },
          {
            title:'卡唯一标识',
            align:"center",
            dataIndex: 'ident'
          },
  
        ],
        url: {
          list: "/colliery.modules.mdm/card/list",
          delete: "/colliery.modules.mdm/card/delete",
          deleteBatch: "/colliery.modules.mdm/card/deleteBatch",
          exportXlsUrl: "/colliery.modules.mdm/card/exportXls",
        },
        dictOptions:{},
        dataSource: [],
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
      }
    },
    created() {

    },
    mounted() {
      this.initParamsInfo()
    },
    methods: {
      initParamsInfo(cardNo, cardType){
        this.selfParam={}
        let getConfig = {}
        getCardAll({cardNo, cardType}).then((res) => {
          if (res.success) {
            if(res.result && res.result.length>0){
              for(let i of res.result){
                this.selfParam['self_'+i.paramName]=(!this.$route.query[i.paramName])?"":this.$route.query[i.paramName]
              }
            }
          } else {
            this.$message.warning(res.message)
          }
          this.dataSource = res.result
        })
      },
      searchReset() {
        var that = this;
        that.queryParam = {}
        this.initParamsInfo()
      },
      searchQuery() {
        var params = this.getQueryParams();
        this.initParamsInfo(params.cardNo, params.cardType)
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam, this.sorter,this.selfParam);
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
    },
    watch: {
      '$route'() {
        this.initParamsInfo()
      }
    },
  }
</script>
<style scoped>

</style>