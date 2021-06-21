<template>
  <div>
    <a-form :form="form">
      <a-row>

        <a-col :xs="24" :sm="12">
          <a-form-item label="标识卡编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <j-dict-select-tag type="list" v-decorator="['ident']" :trigger-change="true" dictCode="busi_card,card_no,ident, card_type=155" placeholder="请选择标识卡编号"/>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item label="距区域第一个坐标点的X轴偏移量" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number v-decorator="['offsetX']" placeholder="请输入距区域第一个坐标点的X轴偏移量" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item label="距区域第一个坐标点的Y轴偏移量" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number v-decorator="['offsetY']" placeholder="请输入距区域第一个坐标点的Y轴偏移量" style="width: 100%"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script>
  import pick from 'lodash.pick'
  import { getAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"

  export default {
    name: 'CardAreaRelationForm',
    components: { 
      JDictSelectTag,
    },
    data () {
      return {
        form: this.$form.createForm(this),
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        labelCol2: {
          xs: { span: 24 },
          sm: { span: 3 },
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
        validatorRules: {
        },
        confirmLoading: false,
      }
    },
    methods:{
      initFormData(url,id){
        this.clearFormData()
        if(!id){
          this.edit({})
        }else{
          getAction(url,{id:id}).then(res=>{
            if(res.success){
              let records = res.result
              if(records && records.length>0){
                this.edit(records[0])
              }
            }
          })
        }
      },
      edit(record){
        this.model = Object.assign({}, record)
        console.log("CardAreaRelationForm-edit",this.model);
        let fieldval = pick(this.model,'ident','offsetX','offsetY')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
      },
      getFormData(){
        let formdata_arr = []
        this.form.validateFields((err, values) => {
          if (!err) {
            let formdata = Object.assign(this.model, values)
            let isNullObj = true
            Object.keys(formdata).forEach(key=>{
              if(formdata[key]){
                isNullObj = false
              }
            })
            if(!isNullObj){
              formdata_arr.push(formdata)
            }
          }else{
            this.$emit("validateError","基准卡与工作面的偏移量表表单校验未通过");
          }
        })
        console.log("基准卡与工作面的偏移量表表单数据集",formdata_arr);
        return formdata_arr;
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'ident','offsetX','offsetY'))
      },
      clearFormData(){
        this.form.resetFields()
        this.model={}
      }
    
    }
  }
</script>
