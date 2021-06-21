<template>
  <div class="dlg-dialog help-dialog" v-show="helpList.isVisible && lists.length">
    <div class="dlg-header help-header">
      <span class="dlg-title">
        <span>呼救</span>
      </span>
      <span @click="handleCancel">
        <a-icon type="close" />
      </span>
    </div>
    <div class="dlg-body">
      <a-table 
        :columns="tableColumns" 
        :data-source="lists" 
        rowKey="id">
          <a slot="handle" slot-scope="text, record" class="handle" @click="removetHelp(record)">标记</a>
      </a-table>
    </div>
  </div>
</template>

<script>
import { stopCallList } from '@api/api'
import { mapState } from "vuex";

const tableColumns = [
    {
      title: '姓名',
      dataIndex: 'sendName',
    },
    {
      title: '呼救时间',
      dataIndex: 'sendTime',
    },
    {
      title: '操作',
      dataIndex: 'handle',
      scopedSlots: { customRender: 'handle' }
    }
  ]

export default {
  data() {
    return {
      tableColumns: tableColumns
    };
  },
  computed: {
    ...mapState({
      helpList: state => state.helpStore.helpList,
    }),
    lists () {
      return this.helpList.rows && Array.from(this.helpList.rows.values())
    }
  },
  mounted() {
    let dragTarget = this.$root.$el.querySelector('.help-dialog')
    let dragHandle = this.$root.$el.querySelector('.help-header')
    
    window.setDialogDraggable(dragTarget, dragHandle)
  },
  methods: {
    removetHelp(data) {
      let url = `/call/cancel/2/${data.id}`
      stopCallList(url).then((res) => {
        res.code === 200 ? this.$message.success('处理成功！') : this.$message.warning('处理失败！')
      })
    },
    handleCancel() {
      this.$store.commit('helpStore/changeHelp',{type: false, rows: this.$store.state.helpStore.helpList.rows})
    },
  },
}
</script>

<style lang="less" scoped>
  .dlg-dialog {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 330px;
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
      
    }
  }
</style>