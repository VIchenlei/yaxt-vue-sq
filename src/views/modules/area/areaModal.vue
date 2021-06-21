<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOkBtn"
    @cancel="handleCancel"
    :getContainer="() => mapElement"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="区域编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input ref="code" v-decorator="['code', validatorRules.code]" placeholder="请输入区域编号"></a-input>
        </a-form-item>
        <a-form-item label="区域名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['name', validatorRules.name]" placeholder="请输入区域名称"></a-input>
        </a-form-item>
        <a-form-item label="区域类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['areaType', validatorRules.areaType]" :trigger-change="true" dictCode="area_type" placeholder="请选择区域类型"/>
        </a-form-item>
        <a-form-item label="区域业务列表" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-multi-select-tag type="list_multi" v-decorator="['areaList']" :trigger-change="true" dictCode="area_list" placeholder="请选择区域业务列表"/>
        </a-form-item>
        <a-form-item label="地图" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['mapId', validatorRules.mapId]" :trigger-change="true" dictCode="busi_map,name,id" placeholder="请选择地图"/>
        </a-form-item>
        <a-form-item label="人数上限" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['maxPeople', validatorRules.maxPeople]" placeholder="请输入人数上限" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="车辆上限" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['maxCar', validatorRules.maxCar]" placeholder="请输入车辆上限" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="人停留时长上限(m)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['maxStandTime', validatorRules.maxStandTime]" placeholder="请输入人停留时长上限" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="人车速度(m/s)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['speedPeopleCar']" placeholder="请输入人车速度(m/s)" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="料车速度(m/s)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['speedCarriageCar']" placeholder="请输入料车速度(m/s)" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="特种车速度(m/s)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['speedSpecialCar']" placeholder="请输入特种车速度(m/s)" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="坐标" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input :disabled="true" v-decorator="['points', validatorRules.points]" placeholder="请输入坐标"></a-input>
          <img class="jump-icon" src="/img/jump.png" @click="jumpMap">
        </a-form-item>
        <a-form-item label="车辆角度" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['carAngle']" placeholder="请输入车辆角度" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="是否是工作区域" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="radio" v-decorator="['workAreaFlag', validatorRules.workAreaFlag]" :trigger-change="true" dictCode="is_work_area" placeholder="请选择是否是工作区域"/>
        </a-form-item>
        <a-form-item label="区域描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['description', validatorRules.description]" placeholder="请输入区域描述"></a-input>
        </a-form-item>

      </a-form>

      <!-- 子表单区域 -->
      <a-tabs v-model="activeKey">
        <a-tab-pane tab="基准卡与工作面的偏移量表" :key="refKeys[0]" :forceRender="true">
          <card-area-relation-form ref="cardAreaRelationForm" @validateError="validateError"></card-area-relation-form>
        </a-tab-pane>
      
      </a-tabs>

    </a-spin>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  // import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { FormTypes,getRefPromise, VALIDATE_NO_PASSED, validateFormAndTables  } from '@/utils/JEditableTableUtil'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import JMultiSelectTag from "@/components/dict/JMultiSelectTag"
  import CardAreaRelationForm from './CardAreaRelationForm.vue'
  import { duplicateCheck } from '@api/api'


  export default {
    name: "AreaModal",
    // mixins: [JEditableTableMixin],
    components: {
      CardAreaRelationForm,
      JDictSelectTag,
      JMultiSelectTag,
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
          sm: { span: 7 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
          code: {
            rules: [
              { required: true, message: '请输入区域编号!'},
              { validator: this.validateCode }
            ]
          },
          name: {
            rules: [
              { required: true, message: '请输入区域名称!'},
            ]
          },
          areaType: {
            rules: [
              { required: true, message: '请输入区域类型!'},
            ]
          },
          mapId: {
            rules: [
              { required: true, message: '请输入地图!'},
            ]
          },
          maxPeople: {
            rules: [
              { required: true, message: '请输入人数上限!'},
            ]
          },
          maxCar: {
            rules: [
              { required: true, message: '请输入车辆上限!'},
            ]
          },
          maxStandTime: {
            rules: [
              { required: true, message: '请输入人停留时长上限!'},
            ]
          },
          points: {
            initialValue: '',
            rules: [
              { required: true, message: '请输入坐标!'},
            ]
          },
          description: {
            rules: [
              { required: false, message: '请输入区域描述!'},
            ]
          },
          workAreaFlag: {
            initialValue: 0
          }
        },
        refKeys: ['cardAreaRelation', ],
        tableKeys:[],
        activeKey: 'cardAreaRelation',
        // 基准卡与工作面的偏移量表
        cardAreaRelationTable: {
          loading: false,
          dataSource: [],
          columns: [
          ]
        },
        url: {
          add: "/area/add",
          edit: "/area/edit",
          cardAreaRelation: {
            list: '/area/queryCardAreaRelationByMainId'
          },
        }
      }
    },
    created () {
    },
    watch: {
      '$store.state.stateStore.areaModal': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.visible = result.isVisible
          if (this.visible) {
            this.add()
            const points = result.points
            this.validatorRules.points.initialValue = points
          }
        },
        deep: true
      },
      '$store.state.stateStore.areaEdit': {
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
      getAllTable() {
        return new Promise(resolve => {
          resolve([]);
        })
      },
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'code','name','areaType','areaList','mapId','maxPeople','maxCar','maxStandTime','speedPeopleCar','speedCarriageCar','speedSpecialCar','points','carAngle','workAreaFlag','description'))
          this.$refs.cardAreaRelationForm.initFormData(this.url.cardAreaRelation.list,this.model.id)
        })
      },
      close () {
        this.$emit('close');
        this.$store.commit('stateStore/changeAreaEdit', {
          rows: null
        });
        this.$store.commit('stateStore/changeAreaModal', {
          type: false,
          coords: null
        });
      },
      /** 确定按钮点击事件 */
      handleOkBtn() {
        /** 触发表单验证 */
        this.getAllTable().then(tables => {
          /** 一次性验证主表和所有的次表 */
          return validateFormAndTables(this.form, tables)
        }).then(allValues => {
          if (typeof this.classifyIntoFormData !== 'function') {
            throw this.throwNotFunction('classifyIntoFormData')
          }
          let formData = this.classifyIntoFormData(allValues)
          // if (this.model.id) {
          //   let roads = []
          //   for (let i = 0; i < formData.readerRouteList.length; i++) {
          //     let path = formData.readerRouteList[i]
          //     delete path.id
          //     roads.push(path)
          //   }
          //   formData.readerRouteList = roads
          // }
          // 发起请求
          return this.requestReader(formData)
        }).catch(e => {
          if (e.error === VALIDATE_NO_PASSED) {
            // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
            this.activeKey = e.index == null ? this.activeKey : this.refKeys[e.index]
          } else {
            console.error(e)
          }
        })
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        return {
          ...main, // 展开
          cardAreaRelationList: this.$refs.cardAreaRelationForm.getFormData(),
        }
      },
      /** 发起请求，自动判断是执行新增还是修改操作 */
      requestReader(formData) {
        let that = this
        let url = this.url.add, method = 'post'
        if (this.model.id) {
          url = this.url.edit
          method = 'put'
        }
        this.confirmLoading = true
        httpAction(url,formData,method).then((res)=>{
          if(res.success){
            console.log("新增区域成功", res)
            that.$message.success(res.message);
            that.$emit('ok');
            this.$store.dispatch('olMapAreaLayer/updateAreas')
          }else{
            that.$message.warning(res.message);
          }
        }).finally(() => {
          that.confirmLoading = false;
          // that.close();
        })
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
            console.log("表单提交数据",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                console.log("新增区域成功", res)
                that.$message.success(res.message);
                that.$emit('ok');
                this.$store.dispatch('olMapAreaLayer/updateAreas')
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              // that.close();
            })
          }

        })
      },
      handleCancel () {
        this.close()
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'code','name','areaType','areaList','mapId','maxPeople','maxCar','maxStandTime','speedPeopleCar','speedCarriageCar','speedSpecialCar','points','carAngle','workAreaFlag','description'))
      },
      jumpMap() {
        this.$store.dispatch('olMapAreaLayer/mapDrawArea', this.data)
        this.$store.commit('stateStore/changeAreaEdit', {
          type: false
        });
      },
      validateCode(rule, value, callback) {
        if (this.$refs.code.value !== value) {
          if (!value) {
            callback()
          } else {
            var params = {
              tableName: 'busi_reader',
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
        } else {
          callback()
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
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