<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    :getContainer="() => mapElement"
    @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <a-row>
          <a-col :xs="24" :sm="12">
            <a-form-item label="路线名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['name', validatorRules.name]" placeholder="请输入路线名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="人员" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-search-select-tag v-decorator="['staffId', validatorRules.staffId]" dict="busi_staff,real_name,id" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="是否启动" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['status', validatorRules.status]" :trigger-change="true" dictCode="inspection_status" placeholder="请选择是否启动"/>
            </a-form-item>
          </a-col>

        </a-row>
      </a-form>

      <!-- 子表单区域 -->
      <a-tabs v-model="activeKey" @change="handleChangeTabs">
        <a-tab-pane tab="巡检路径表" :key="refKeys[0]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[0]"
            :loading="busiInspectionRoadTable.loading"
            :columns="busiInspectionRoadTable.columns"
            :dataSource="busiInspectionRoadTable.dataSource"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true"/>
        </a-tab-pane>

        <a-tab-pane tab="巡检分站表" :key="refKeys[1]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[1]"
            :loading="busiInspectionRenderTable.loading"
            :columns="busiInspectionRenderTable.columns"
            :dataSource="busiInspectionRenderTable.dataSource"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true"/>
        </a-tab-pane>

      </a-tabs>

    </a-spin>
  </j-modal>
</template>

<script>

  import pick from 'lodash.pick'
  import { FormTypes,getRefPromise } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { validateDuplicateValue } from '@/utils/util'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import JSearchSelectTag from '@/components/dict/JSearchSelectTag'

  export default {
    name: 'BusiInspectionModal',
    mixins: [JEditableTableMixin],
    components: {
      JDictSelectTag,
      JSearchSelectTag,
    },
    data() {
      return {
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
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 0,
        validatorRules: {
          name: {
            rules: [
              { required: true, message: '请输入路线名称!'},
            ]
          },
          staffId: {
            rules: [
              { required: true, message: '请输入人员!'},
            ]
          },
          status: {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入是否启动!'},
            ]
          },
        },
        refKeys: ['inspectionRoad', 'inspectionRender', ],
        tableKeys:['inspectionRoad', 'inspectionRender', ],
        activeKey: 'inspectionRoad',
        // 巡检路径表
        busiInspectionRoadTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '分站路径',
              key: 'readerPathId',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '停留时间',
              key: 'stayTime',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '开始坐标x',
              key: 'startX',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '开始坐标y',
              key: 'startY',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '结束坐标x',
              key: 'endX',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '结束坐标y',
              key: 'endY',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
          ]
        },
        // 巡检分站表
        busiInspectionRenderTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '分站id',
              key: 'renderId',
              type: FormTypes.select,
              dictCode:"busi_reader,name,id",
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '计划到达开始时间',
              key: 'startTime',
              type: FormTypes.datetime,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '计划到达结束时间',
              key: 'endTime',
              type: FormTypes.datetime,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
          ]
        },
        url: {
          add: "/inspection/add",
          edit: "/inspection/edit",
          busiInspectionRoad: {
            list: '/inspection/queryInspectionRoadByMainId'
          },
          busiInspectionRender: {
            list: '/inspection/queryInspectionRenderByMainId'
          },
        },
        mapElement: null
        // readerPlan: null
      }
    },
    methods: {
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      editBefore(record) {
        console.log(record)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        let fieldval = pick(this.model,'name','staffId','status')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.planId }
          this.editPath(this.url.busiInspectionRoad.list, params, this.busiInspectionRoadTable)
          this.editPath(this.url.busiInspectionRender.list, params, this.busiInspectionRenderTable)
        }
      },
      /** 查询某个tab的数据 */
      editPath(url, params, tab, success) {
        tab.loading = true
        getAction(url, params).then(res => {
          console.log(res)
          let { result } = res
          let dataSource = []
          if (result) {
            if (Array.isArray(result)) {
              dataSource = result
            } else if (Array.isArray(result.records)) {
              dataSource = result.records
            }
          }
          tab.dataSource = dataSource
          typeof success === 'function' ? success(res) : ''
        }).finally(() => {
          tab.loading = false
        })
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        return {
          ...main, // 展开
          inspectionRoadList: allValues.tablesValue[0].values,
          inspectionRenderList: allValues.tablesValue[1].values,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'name','staffId','status'))
      },
      handleCancel() {
        console.log('关闭')
        this.$emit('close');
        this.$store.commit('stateStore/changeInspectionModal', {
          type: false,
          path: null
        });
      },
    },
    watch: {
      '$store.state.stateStore.inspectionModal': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.visible = result.isVisible
          let path = result.path
          let routePlan = []
          if (this.visible) {
            let values = path.split(';')
            for (let i = 0; i < values.length; i++) {
              if (!values[i]) continue
              let value = values[i].split(',')
              routePlan.push({
                readerPathId: Number(value[0]),
                stayTime: 0,
                startX:  Number(value[2]) || 0,
                startY:  Number(value[3]) || 0,
                endX:  Number(value[4]) || 0,
                endY:  Number(value[5]) || 0,
              })
            }
            console.log(routePlan)
            this.add()
            // const points = result.points
            // this.validatorRules.points.initialValue = points
          }
          this.busiInspectionRoadTable.dataSource = routePlan
          console.log(this.busiInspectionRoadTable.dataSource)
        },
        deep: true
      },
    }
  }
</script>

<style scoped>
</style>