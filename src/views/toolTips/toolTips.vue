<template>
  <div class="tool-tips" v-if="isVisible">
    <a-modal
      v-model="isVisible"
      :title="title"
      :footer="false"
      :mask='false'
      @cancel="handleCancel"
      centered
      :width="360"
      :getContainer="() => mapElement"
      class="tool-dialog"
    >
      <div class="op-panel">
        <span name="state" ref="state" class="tab-icon" @click='switchTo'>实时状态</span>
        <span name="info" ref="info" class="tab-icon" @click='switchTo'>基本信息</span>
      </div>
      <div class="tool-tips-content" v-if="topic === 'state'">
        <div>实时内容</div>
      </div>
      <div class="tool-tips-content" v-if="topic === 'info'">
        <p v-for="(item, index) in infoFields.labels" :key="index" class="tool-tips-info">
          <span class="lable">{{item}}：</span>
          <span class="value" :title="getInfoValue(index)">{{ getInfoValue(index) }}</span>
        </p>
        <p v-if="subtype === 'reader'" class="tool-tips-info">
          <span class="lable">分站路径：</span>
          <span class="value">
            <a-checkbox @change="onChange" :checked="isCheck">
              
            </a-checkbox>
          </span>
        </p>
        <div class="tool-foot hide-on-mb" v-if="showLand" @click='handleLand'>
          <a-button type="primary"  class="btn-sure" data-type="edit">编辑</a-button>
          <a-button type="primary"  class="btn-cancel" data-type="delete">删除</a-button>
        </div>
      </div>     
    </a-modal>
  </div>
</template>

<script>
import {TOOLTIPSDEF, delfun, EDITADRESS} from '../../store/def/tool_tips_def'
import { deleteLandmarkById } from '@api/api'
import { setPointCenter } from '../../store/map/mapUtils/OlMapUtils'
export default {
  data() {
    return {
      isVisible: false,
      data: null,
      title: '',
      activeTab: null,
      subtype: null,
      showLand: true,
      topic: '',
      notShowPath: false,
      infoFields: null,
      stateFields: null,
      mapElement: null,
      isCheck: null,
    };
  },
  watch: {
    '$store.state.stateStore.toolModal': {
      handler (result) {
        this.mapElement = this.$store.state.stateStore.mapContainer
        this.isVisible = result.isVisible
        this.data = result.data
        this.subtype = result.subtype
        if (this.isVisible) {
          this.showTooltips(this.data)
          const symbol = this.subtype && TOOLTIPSDEF[this.subtype]
          this.title = symbol.title
          this.infoFields = symbol.info
          this.stateFields = symbol.state
          this.isCheckBox()
        }  
      },
      deep: true
    },
  },
  methods: {
    getInfoValue(index) {
      const key = this.infoFields.names[index]
      let data = this.data[key]
      if (key === 'workAreaFlag') data = data === 1 ? '是' : '否'
      if (key === 'needDisplay') data = data === 0 ? '检查用户不可见' : '所有用户可见' 
      return data
    },
    handleCancel() {
      this.$store.commit('stateStore/changeToolModal', {
        type: false,
        data: null,
        subtype: null
      })
    },
    switchTo(evt) {
      let tab = evt.currentTarget
      if (tab === this.activeTab) return false
      this.showTab(tab)
      console.log('切换状态')
    },
    showTooltips(data) {
      const names = ['landmark', 'area', 'goaf', 'reader']
      this.$nextTick(function () {
        if (names.includes(this.subtype)) {
          this.$refs['state'] && this.$refs['state'].classList.add('hide')
          this.showLand = this.subtype === 'landmark' ? true : false     
          this.showTab(this.$refs.info)
        } else {
          this.$refs['state'] && this.$refs['state'].classList.remove('hide')
          this.showLand = false
          this.showTab(this.$refs.state)
        }
        if(['reader', 'area', 'goaf'].includes(this.subtype)){
          this.showLand = this.notShowPath ? false : true
        }

        let dragTarget = this.$root.$el.querySelector('.tool-dialog')
        let dragHandle = this.$root.$el.querySelector('.ant-modal-header')
        
        window.setDialogDraggable(dragTarget, dragHandle)
        setTimeout(() => {
          setPointCenter(dragTarget) // 设置对话框默认居中
        }, 10);
      })
    },
    showTab(tab) {
      if (!tab) return
      const topic = tab.getAttribute('name')
      // this.switchtab(topic)
      this.setActiveTab(tab)
      this.topic = topic
    },
    switchtab(topic){
      // const data = this.symbol[topic]
      // data.rec = xdata.metaStore.formatRecord(data.def, data.rec, null)
      // this.data = data
      // this.hasData = !!this.data.rec
    },
    setActiveTab(tab) {
      if (!tab || tab === this.activeTab) return
      if (this.activeTab) {
        this.activeTab.classList.remove('active')
      }
      tab.classList.add('active')
      this.activeTab = tab
    },
    handleLand(evt) {
      const type = evt.target.getAttribute('data-type')
      if (type === 'edit') {
        this.$store.commit(`${EDITADRESS[this.subtype]}`, {
          type: true,
          rows: this.data
        })
        this.handleCancel()
      }
      if (type === 'delete') this.delete()
    },
    delete() {
      this.$confirm({
        content: `是否确认删除？`,
        onOk: () => {
          const id = this.data.id;
          let code = this.data.code;
          const subtype = this.subtype;
          if (subtype === 'reader') {
            code = `${code}-${this.data.deviceType}`;
            this.$store.dispatch('olMapReaderPathLayer/removePathFeature', this.data);
          } 
          delfun(subtype, {id: id}).then((res) => {
            let tips = res.code === 200 ? '删除成功' : res.message;
            this.$message.success(tips);
            if (res.code === 200) {
              if (subtype === 'landmark') {
                this.$store.dispatch('olMapLandmarkLayer/removeFeature', code);
              } else if (subtype === 'reader') {
                this.$store.dispatch('olMapReaderLayer/removeFeature', code);    
              } else if (subtype === 'area') {
                this.$store.dispatch('olMapAreaLayer/removeFeature', code);
              } else if (subtype === 'goaf') {
                this.$store.dispatch('olMapFillAreaLayer/removeFeature', code);
              }
            }
          })
          this.handleCancel()
        }
      })
    },
    onChange(e) {
      let code = this.data.code;
      let checked = e.target.checked
      this.$store.commit('stateStore/switchShow', {code, checked})
      this.$store.dispatch('olMapReaderPathLayer/showPath', {data: this.data, checked})
      this.isCheckBox()
    },
    isCheckBox() {
      let code = this.data.code;
      let rows = this.$store.state.stateStore.showReaderPath;
      this.isCheck = rows.get(parseInt(code, 10))
    }
  }
}
</script>

<style lang="less" scoped>
  .tool-tips {
    width: 360px;
    height: 400px;
  }
  .op-panel {
    height: 40px;
    background: #f1f1f1;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 5px;
    span {
      cursor: pointer;
      flex: auto;
      height: 100%;
      align-items: center;
      justify-content: center;
      display: flex;
    }
    .active{
      border-bottom: 2px solid #09f;
      color: #009fff;
    }
    .hide {
      display: none;
    }
  }
  .tool-tips-content {
    padding: 0 10px;
    max-height: 400px;
    overflow: auto;
    .tool-tips-info {
      display: flex;
      justify-content: space-around;
      align-items: center;
      line-height: 26px;
      .label {
        white-space: nowrap
      }
      .value {
        flex: auto;
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 280px;
      }
    }
    .tool-foot {
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex: 0 0 6px;
      padding: 2px;
    }
  }
</style>
<style>
  .tool-dialog .ant-modal-header {
    background: #09f;
    padding: 10px;
    cursor: move;
  }
  .tool-dialog .ant-modal-title {
    color: #fff;
  }
  .tool-dialog .ant-modal-body{
    padding: 0;
  }
  .tool-dialog .ant-modal-close {
    top: -6px;
  }
</style>