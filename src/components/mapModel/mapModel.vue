<template>
  <div id="components-modal-demo-position" v-if="isVisible">
    <a-modal
      :title="title"
      v-model="isVisible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
      :getContainer="() => mapElement"
      centered
    >
      <div v-if="ajaxName === 'leave' && showInput">
        <a-form-item label="撤离方式:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
          <a-select :default-value="form.sendType[selectSendType].label" style="width:100%" @change="sendTypeChange">
            <a-select-option v-for="item in form.sendType" :key="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="selectSendType === 1" label="区域路径" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
          <a-input-number :disabled="true" :value="points" placeholder="请输入路径" style="width: 100%"/>
          <img class="jump-icon" src="/img/jump.png" @click="jumpMap">
        </a-form-item>
      </div>
      <div v-if="ajaxName === 'stopcall' || !showInput">
        <a-result :status="status" :title="resultTitle">
        </a-result>
        <p class="tips">{{ modalText }}</p>
      </div>
    </a-modal>
  </div>
</template>

<script>
  import { sendCallReq, stopCallReq, callLeave } from '@/api/api';
  
  export default {
    data() {
      return {
        resultTitle: '',
        modalText: '',
        status: '',
        isVisible: false,
        confirmLoading:false,
        ajaxName: '',
        sendMsg: null,
        mapElement: null,
        form: {
          layout: 'vertical',
          sendType: [{key: 0, label:'一键撤离'},{key: 1, label:'选定区域撤离'}],
          coltype: {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          }
        },
        selectSendType: 0,
        validatorRules: {
          points: {
            initialValue: '',
            rules: [
              { required: true, message: '请输入路径!'}
            ]
          },
        },
        points: null,
        showInput: false
      }
    },
    methods: {
      handleOk(e) {
        this.confirmLoading = true;
        if (this.ajaxName === 'leave') {
          let params = {
            mapId: window.xdata.state.mapService.mapID
          }
          if (this.selectSendType === 1 && this.showInput) params['points'] = this.points
          console.log('发送撤离', params)
          callLeave(params).then((res) => {
            console.log('leave 返回参数',res)
          })
        } else if (this.ajaxName === 'call') {
          let params = this.sendMsg;
          params['mapId'] = window.xdata.state.mapService.mapID;
          console.log('params',params);
          sendCallReq(params).then((res => {
            console.log('call 返回参数',res)
          }))
        } else if (this.ajaxName === 'stopcall') {
          stopCallReq().then((res) => {
            console.log('stopCall  返回参数',res)
          })
        }
        
        setTimeout(() => {
          this.$store.commit('stateStore/changeMapModel',{
            type: false,
            modalText: '',
            resultStatus: '',
            resultTitle: '',
            sendMsg: null,
            title: '',
          })
          this.confirmLoading = false;
          this.selectSendType = 0
          this.points = null
          this.showInput = false
        }, 1000);
        this.$store.commit('stateStore/changeSendCall',{
          type: false,
          data: null
        })
      },
      handleCancel(e) {
        this.$store.commit('stateStore/changeMapModel',{
          type: false,
          modalText: '',
          resultStatus: '',
          resultTitle: '',
          sendMsg: null,
          title: ''
        })
        this.selectSendType = 0
      },
      sendTypeChange(evt) {
        this.selectSendType = evt
      },
      jumpMap() {
        this.$store.dispatch('olMapLeaveLayer/drawLeaveArea')
        this.handleCancel()
      }
    },
    watch: {
      '$store.state.stateStore.mapModel': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.isVisible = result.isVisible
          this.status = result.resultStatus
          this.resultTitle = result.resultTitle
          this.modalText = result.modalText
          this.ajaxName = result.ajaxName
          this.sendMsg = result.sendMsg
          this.title = result.title
          this.showInput = result.showInput || this.showInput
          if (result.points) {
            this.selectSendType = 1
            this.points = result.points
          }
        },
        deep: true
      }
    }
  }
</script>

<style lang="less" scoped>
.tips {
  text-align: center;
  color: coral;
}
.jump-icon {
  width: 16px;
  height: 16px;
  margin: 0 5px;
  cursor: pointer;
}
::v-deep .ant-form-item-children {
  display: flex;
  align-items: center;
}
</style>
