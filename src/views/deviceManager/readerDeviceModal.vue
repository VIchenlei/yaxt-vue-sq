<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row>
          <template v-for="(name, index) in currentNames">
            <a-col :xs="24" :sm="12" :key="index" v-if="showInput(index)">
              <a-form-item :label="currentLabels[index]" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <a-input v-decorator="[name]" :placeholder="`请输入${currentLabels[index]}`" style="width: 100%"/>
              </a-form-item>
            </a-col>
          </template>
          <template v-for="(name, index) in currentNames">
            <a-col :xs="24" :sm="12" :key="index" v-if="showSelect(index)">
              <a-form-item :label="currentLabels[index]" :labelCol="labelCol" :wrapperCol="wrapperCol">
                <j-dict-select-tag type="list" v-decorator="[name]" :trigger-change="true" :dictCode="getDictCode(name)" :placeholder="`请选择${currentLabels[index]}`"/>
              </a-form-item>
            </a-col>
          </template>
        </a-row>
      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import { DEVICEUPDATADEF } from './device_updata_def'

  export default {
    name: "readerDeviceModal",
    components: { 
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        width: '80%',
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
        },
        url: {
          add: "/busiDeviceScan/",
          edit: "/busiDeviceScan/",
        },
        currentNames: DEVICEUPDATADEF.device_configuration.names,
        currentLabels: DEVICEUPDATADEF.device_configuration.labels,
        types: DEVICEUPDATADEF.device_configuration.types,
        completionRecord: null
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record, completionRecord) {
        this.completionRecord = completionRecord;
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          let fieldVal = pick(this.model, this.currentNames)
          console.log('fieldVal', fieldVal)
          this.form.setFieldsValue(fieldVal)
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            formData = Object.assign(formData, this.completionRecord);
            console.log("表单提交数据",method,formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
         
        })
      },
      handleCancel () {
        this.close()
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row, this.currentNames))
      },
      showInput(index) {
        let type = this.types[index];
        if (['NUMBER', 'STRING'].includes(type)) return true;
        return false;
      },
      showSelect(index) {
        let type = this.types[index];
        if (type === 'SELECT') return true;
        return false;
      },
      /*字典项*/
      getDictCode(name) {
        if (name === 'type') return 'reader_device_type'

        if (['oneReceivingFrequency', 'twoReceivingFrequency'].includes(name)) {
          return 'RECEIVING_FREQUENCY_POINT'
        }

        if (['lightFontShap', 'lightReverseShap'].includes(name)) return 'LIGHT_SHAP'

        if (['oneTransmitPower', 'twoTransmitPower'].includes(name)) return 'TRANSMIT_POWER'

        if (['oneCommunicationRate', 'twoCommunicationRate'].includes(name)) return 'COMMUNICATION_RATE'

        if (['onePulseReptFrequency', 'twoPulseReptFrequency'].includes(name)) return 'PULSE_REPT_FREQUENCY'

        if (['onePreambleCode', 'twoPreambleCode'].includes(name)) return 'PREAMBLE_CODE'

        if (['onePreambleCodeLength', 'twoPreambleCodeLength'].includes(name)) return 'PREAMBLE_CODE_LENGTH'

        if (['onePac', 'twoPac'].includes(name)) return 'PREAMBLE_CODE_PAC'

        if (name === 'multidimposmode') return 'MULTIDIMPOSMODE'

        if (name === 'multidimposseq') return 'MULTIDIMPOSSEQ'

        return name
      }
    }
  }
</script>
<style lang="less" scoped>
.hide {
  display: none;
}
</style>