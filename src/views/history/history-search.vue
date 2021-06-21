<template>
  <div class="search">
    <a-form layout="inline" @keyup.enter.native="searchQuery">
      <a-form-item label="部门">
        <j-dict-select-tag placeholder="请选择部门" v-model="queryParam.deptId" dictCode="sys_depart,depart_name,id"/>
      </a-form-item>
      <a-form-item label="职务">
        <j-dict-select-tag placeholder="请选择职务" v-model="queryParam.postId" dictCode="sys_position,name,id"/>
      </a-form-item>
      <a-form-item label="名称">
        <a-input-number placeholder="请输入名称" v-model="queryParam.name"/>
      </a-form-item>
      <a-form-item label="卡号">
        <a-input placeholder="请输入卡号" v-model="queryParam.ident"/>
      </a-form-item>
      <a-form-item label="区域">
        <j-dict-select-tag placeholder="请选择区域" v-model="queryParam.areaId" dictCode="busi_area,name,id"/>
      </a-form-item>
      <a-form-item label="分站">
        <j-dict-select-tag placeholder="请选择分站" v-model="queryParam.readerCode" dictCode="busi_reader,name,id"/>
      </a-form-item>
      <a-form-item label="开始~结束时间" class="form-time" v-if="!checked">
        <a-range-picker :show-time="{ format: 'HH:mm:ss' }" @change="onChangeDateTime" :default-value="defaultTime" :format="'YYYY-MM-DD HH:mm:ss'"/>
      </a-form-item>
      <a-form-item label="日期" v-else-if="checked">
        <a-date-picker @change="onChangeDate" :default-value="defaultAttDate"/>
      </a-form-item>
    </a-form>
    <div class="check-box">
      <a-checkbox @change="onChange">按考勤查询</a-checkbox>
      <a-button type="primary" @click="doSearchParams">
        查询
      </a-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  props: {
    type: {
      type: Number,
      default: null,
    },
    doSearch: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      queryParam: {},
      defaultTime: [
        moment(`${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`, 'YYYY-MM-DD HH:mm:ss'),
        moment(`${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`, 'YYYY-MM-DD HH:mm:ss'),
      ],
      dateTime: [
        `${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`,
        `${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
      ],
      attDate: `${moment(new Date()).format('YYYY-MM-DD')}`,
      defaultAttDate:moment(`${moment(new Date()).format('YYYY-MM-DD')}`, 'YYYY-MM-DD'),
      checked: false,
    }
  },
  computed: {},
  created() {},
  mounted() {
    console.log('type', this.type)
  },
  methods: {
    searchQuery(evt) {

    },
    onChangeDateTime(date, dateString) {
      this.dateTime = dateString;
      console.log('dateTime', dateString)
    },
    onChangeDate(date, dateString) {
      this.attDate = dateString;
    },
    onChange(evt) {
      this.checked = evt.target.checked;
    },
    doSearchParams() {
      let flag = this.checked === true ? 1 : 0
      let params = Object.assign({flag: flag, type: this.type}, this.queryParam);
      params = flag === 0 ? Object.assign(params, {startTime: this.dateTime[0], endTime: this.dateTime[1]}) : Object.assign(params, {attDate: this.attDate});

      for (const key in params) {
        if (params[key] !==0 && !params[key]) delete params[key];
      }

      // console.log('params', params);
      this.doSearch(params);
    }
  },
}
</script>

<style lang="less" scoped>
  .search{
    display: flex;
    justify-content: space-between;
    // align-items: center;
    flex-direction: column;
    padding: 40px 0;
    ::v-deep .ant-form-item {
      margin-right: 10px;
      margin-left: 5px;
    }
    ::v-deep .ant-form-item-label {
      width: 50px;
    }
    ::v-deep .ant-form-item-control-wrapper {
      width: 200px;
    }
    ::v-deep .ant-input-number {
      width: 200px;
    }
    ::v-deep .form-time .ant-form-item-label {
      width: 110px;
    }
    .check-box {
      padding: 10px 15px;
    }
  }
</style>