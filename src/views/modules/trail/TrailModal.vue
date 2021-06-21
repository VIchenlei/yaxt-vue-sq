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

        <a-form-item label="轨迹" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['trail', validatorRules.trail]" placeholder="请输入轨迹"></a-input>
        </a-form-item>
        <a-form-item label="卡号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['ident']" placeholder="请输入卡号" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="速度" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['speed']" placeholder="请输入速度" style="width: 100%"/>
        </a-form-item>

      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'


  export default {
    name: "TrailModal",
    components: { 
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        width:800,
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
          trail: {
            initialValue: '',
            rules: [
              { required: true, message: '请输入路径!'}
            ]
          },
        },
        url: {
          add: "/trail/",
          edit: "/trail/",
        }
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'trail','ident','speed'))
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
            formData['mapId'] = window.xdata.state.mapService.mapID
            console.log("表单提交数据",formData, method)
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
        this.form.setFieldsValue(pick(row,'trail','ident','speed'))
      },

      
    },
    watch: {
      '$store.state.stateStore.trailModal': {
        handler (result) {
          this.visible = result.isVisible
          if (this.visible) {
            this.add()
            const points = result.trail
            this.validatorRules.trail.initialValue = points
          }
        },
        deep: true
      },
    },
  }
</script>