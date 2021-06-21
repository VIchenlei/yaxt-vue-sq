<template>
  <div>
    <a-table :columns="columns" :data-source="trackList" rowKey="ident">
      <span class="operate" slot="view" slot-scope="text, record" @click="handleOperate(record, 'view')">查看</span>
      <span class="operate" slot="trail" slot-scope="text, record" @click="handleOperate(record, 'trail')">轨迹</span>
    </a-table>
  </div>
</template>

<script>

const tableColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '卡号',
    dataIndex: 'ident',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '职务',
    dataIndex: 'post',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '部门',
    dataIndex: 'dept',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '查看',
    dataIndex: 'view',
    ellipsis: true,
    align: 'center',
    width: '60px',
    scopedSlots: {customRender: 'view'}
  },
  {
    title: '轨迹',
    dataIndex: 'trail',
    ellipsis: true,
    align: 'center',
    width: '60px',
    scopedSlots: {customRender: 'trail'}
  },
]
export default {
  props: {
    trackList: {
      type: Array,
      default: [],
    },
    operate:{
      type: Function,
      default: null,
    }
  },
  data() {
    return {
      list: null,
      columns: tableColumns,
    };
  },
  computed: {},
  created() {},
  mounted() {
    console.log('trackList', this.trackList)
  },
  methods: {
    handleOperate(record, name) {
      this.operate(record, name);
    }
  }
}
</script>

<style lang="less" scoped>
  .operate {
    cursor: pointer;
    color: #09f;
  }
</style>