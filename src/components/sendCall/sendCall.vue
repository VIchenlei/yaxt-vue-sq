<template>
  <div id="components-modal-demo-position" v-if="isVisible">
    <a-modal
      title="发起呼叫"
      v-model="isVisible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
      :getContainer="() => mapElement"
      centered
    > 
      <a-form-item label="全员呼叫:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
        <a-select :default-value="form.sendType[0].label" style="width:100%" @change="sendTypeChange">
          <a-select-option v-for="item in form.sendType" :key="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="呼叫类型:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
        <a-select :default-value="form.levelType[0].label" style="width:100%" @change="levelTypeChange">
          <a-select-option v-for="item in form.levelType" :key="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="井下区域:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
        <a-select
          mode="multiple"
          :default-value="[]"
          style="width:100%"
          :disabled="disabledArea"
          @change="areaChange"
        >
          <a-select-option v-for="item in areas" :key="item.code">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="井下人员:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
        <a-select
          mode="multiple"
          :default-value="[]"
          style="width:100%"
          @change="staffChange"
          :disabled="disabledStaff"
        >
          <a-select-option v-for="item in staffs" :key="item.ident">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="呼叫时间:" :labelCol="form.coltype.labelCol" :wrapperCol="form.coltype.wrapperCol">
        <a-select :default-value="form.sendTimes[0].label" style="width:100%" @change="sendTimeChange">
          <a-select-option v-for="item in form.sendTimes" :key="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-modal>
  </div>
</template>

<script>
  import { sendCallReq } from '@/api/api';
  
  export default {
    data() {
      return {
        isVisible: false,
        confirmLoading: false,
        form: {
          layout: 'vertical',
          sendType: [{key: 0, label:'全员呼叫'},{key: 1, label:'定员呼叫'}],
          levelType: [{key: 1, label:'一般呼叫'},{key: 2, label:'紧急呼叫'}],
          sendTimes: [{key: 5, label:'5分钟'},{key: 10, label:'10分钟'},{key: 20, label:'20分钟'},{key: 60, label:'60分钟'}],
          coltype: {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
          }
        },
        staffs: null,
        areas: null,
        selectStaff: null,
        selectArea: null,
        selectSendType: 0,
        selectlevelType: 1,
        selectSendTime: 5,
        disabledArea: true,
        disabledStaff: true,
        mapElement: null
      }
    },
    methods: {
      handleOk(e) {
        let sendMsg = {'callTime': this.selectSendTime, 'level': this.selectlevelType, 'type': this.selectSendType}
        if (this.selectSendType === 1) {
          if (this.selectStaff) {
            sendMsg['idents'] = this.selectStaff
          } else if (this.selectArea) {
            sendMsg['areas'] = this.selectArea
          }

        }
        this.$store.commit('stateStore/changeMapModel',{
          type: true,
          modalText: '',
          resultStatus: 'warning',
          resultTitle: '您确认要发送“呼叫”消息吗？',
          ajaxName: 'call',
          sendMsg: sendMsg,
          showInput: false,
        })
      },
      handleCancel(e) {
        this.$store.commit('stateStore/changeSendCall',{
          type: false,
          data: null
        })
        this.disabledArea = true 
        this.disabledStaff = true
        this.staffs = null
        this.areas = null
        this.selectStaff = null
        this.selectArea = null
        this.selectSendType = 0
        this.selectlevelType = 1
        this.selectSendTime = 5
      },
      sendTypeChange(evt) {
        this.selectSendType = evt
        if (this.selectSendType) {
          this.disabledArea = false 
          this.disabledStaff = false
        } else {
          this.disabledArea = true 
          this.disabledStaff = true
        }
      },
      levelTypeChange(evt) {
        this.selectlevelType = evt
      },
      areaChange(evt) {
        this.selectArea = evt.toString()
        this.disabledStaff = false
        if (this.selectArea === '') this.disabledArea = false
      },
      staffChange(evt) {
        this.selectStaff = evt.toString()
        this.disabledArea = false
        if (this.selectStaff === '') this.disabledStaff = false
      },
      sendTimeChange(evt) {
        this.selectSendTime = evt
      },
    },
    watch: {
      '$store.state.stateStore.sendCall': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.isVisible = result.isVisible
          if (result.data) {
            this.staffs = result.data.staffs
            this.areas = result.data.areas
          } else {
            this.staffs = null
            this.areas = null
          }
          if (!this.isVisible) {
            this.disabledArea = true 
            this.disabledStaff = true
            this.selectStaff = null
            this.selectArea = null
          }
        },
        deep: true
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
