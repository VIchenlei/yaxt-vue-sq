<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    :getContainer="() => mapElement"
    centered
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['code', validatorRules.code]" placeholder="请输入编号"></a-input>
        </a-form-item>
        <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['name', validatorRules.name]" placeholder="请输入名称"></a-input>
        </a-form-item>
        <a-form-item label="路径" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input :disabled="true" v-decorator="['path', validatorRules.path]" placeholder="请输入路径"></a-input>
          <img class="jump-icon" src="/img/jump.png" @click="jumpMap">
        </a-form-item>
        <a-form-item label="地图" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['mapId', validatorRules.mapId]" :trigger-change="true" dictCode="busi_map,name,id" placeholder="请选择地图"/>
        </a-form-item>

      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import { duplicateCheck } from '@api/api'


  export default {
    name: "GoafModal",
    components: { 
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
              { required: true, message: '请输入编号!'},
              { validator: this.validateCode }
            ]
          },
          name: {
            rules: [
              { required: true, message: '请输入名称!'},
            ]
          },
          path: {
            initialValue: '',
            rules: [
              { required: true, message: '请输入路径!'},
            ]
          },
          mapId: {
            rules: [
              { required: true, message: '请输入地图!'},
            ]
          },
        },
        url: {
          add: "goaf/add",
          edit: "/goaf/edit",
        },
      }
    },
    created () {
    },
    watch: {
      '$store.state.stateStore.goafModal': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.visible = result.isVisible
          if (this.visible) {
            this.add()
            const points = result.points
            this.validatorRules.path.initialValue = points
            console.log(this.validatorRules.path.initialValue)
          }
        },
        deep: true
      },
      '$store.state.stateStore.goafEdit': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.visible = result.isVisible
          if (this.visible) {
            this.data = result.rows
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
          this.form.setFieldsValue(pick(this.model,'code','name','path','mapId'))
        })
      },
      close () {
        this.$emit('close');
        this.$store.commit('stateStore/changeGoafEdit', {
          rows: null
        });
        this.$store.commit('stateStore/changeGoafModal', {
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
                this.$store.dispatch('olMapFillAreaLayer/updateGoafs')
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
        this.form.setFieldsValue(pick(row,'code','name','path'))
      },
      jumpMap() {
        this.$store.dispatch('olMapFillAreaLayer/mapDrawGoaf', this.data)
        this.$store.commit('stateStore/changeGoafEdit', {
          type: false
        });
      },
      validateCode(rule, value, callback) {
        if (!value) {
          callback()
        } else {
          var params = {
            tableName: 'busi_goaf',
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
<style lang="less" scoped>
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