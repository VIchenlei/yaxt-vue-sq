<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    :getContainer="() => mapElement"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="地标编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['code', validatorRules.code]" placeholder="请输入地标编号"></a-input>
        </a-form-item>
        <a-form-item label="地标名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['name', validatorRules.name]" placeholder="请输入地标名称"></a-input>
        </a-form-item>
        <a-form-item label="所属地图" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['mapId', validatorRules.mapId]" :trigger-change="true" dictCode="busi_map,name,id" placeholder="请选择所属地图"/>
        </a-form-item>
        <a-form-item label="所属区域" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['areaId', validatorRules.areaId]" :trigger-change="true" dictCode="busi_area,name,id" placeholder="请选择所属区域"/>
        </a-form-item>
        <a-form-item label="坐标x" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['pointX', validatorRules.pointX]" placeholder="请输入坐标x" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="坐标y" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['pointY', validatorRules.pointY]" placeholder="请输入坐标y" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="坐标z" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['pointZ']" placeholder="请输入坐标z" style="width: 100%"/>
        </a-form-item>

      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import { duplicateCheck } from '@api/api'


  export default {
    name: "BusiLandmarkModal",
    components: { 
      JDictSelectTag,
    },
    data () {
      return {
        mapElement: null,
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
          code: {
            rules: [
              { required: true, message: '请输入地标编号!'},
              { validator: this.validateCode }
            ]
          },
          name: {
            rules: [
              { required: true, message: '请输入地标名称!'},
            ]
          },
          mapId: {
            rules: [
              { required: true, message: '请输入所属地图!'},
            ]
          },
          areaId: {
            rules: [
              { required: true, message: '请输入所属区域!'},
            ]
          },
          pointX: {
            initialValue: 0,
            rules: [
              { required: true, message: '请输入坐标x!'},
            ]
          },
          pointY: {
            initialValue: 0,
            rules: [
              { required: true, message: '请输入坐标y!'},
            ]
          },
        },
        url: {
          add: "/landmark/add",
          edit: "/landmark/edit",
        }
      }
    },
    created () {
    },
    watch: {
      '$store.state.stateStore.landmarkModal': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.visible = result.isVisible
          if (this.visible) {
            this.add()
            const coords = result.coords
            this.validatorRules.pointX.initialValue = Math.round(Number(coords[0]) * 10) / 10
            this.validatorRules.pointY.initialValue = Math.round(Number(coords[1]) * 10) / 10
          }
        },
        deep: true
      },
      '$store.state.stateStore.landmarkEdit': {
        handler (result) {
          this.visible = result.isVisible
          if (this.visible) {
            this.mapElement = this.$store.state.stateStore.mapContainer
            this.edit(result.rows)
          }
        },
        deep: true
      }
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
          this.form.setFieldsValue(pick(this.model,'code','name','mapId','areaId','pointX','pointY','pointZ'))
        })
      },
      close () {
        this.$emit('close');
        this.$store.commit('stateStore/changeLandmarkEdit', {
          rows: null
        });
        this.$store.commit('stateStore/changeLandmarkModal', {
          type: false,
          coords: null
        });
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
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
                this.$store.dispatch('olMapLandmarkLayer/updateFeatures')
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
        this.form.setFieldsValue(pick(row,'code','name','mapId','areaId','pointX','pointY','pointZ'))
      },
      validateCode(rule, value, callback) {
        if (!value) {
          callback()
        } else {
          var params = {
            tableName: 'busi_landmark',
            fieldName: 'code',
            fieldVal: value,
            dataId: this.model.id
          };
          duplicateCheck(params).then((res) => {
            console.log(res)
            if (res.success) {
              callback()
            } else {
              callback("编号已存在!")
            }
          })
        }
      }
      
    }
  }
</script>