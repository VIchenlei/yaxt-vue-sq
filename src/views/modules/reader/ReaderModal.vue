<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOkBtn"
    @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <a-row>

          <a-col :xs="24" :sm="12">
            <a-form-item label="分站编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number ref="code" v-decorator="['code', validatorRules.code]" placeholder="请输入分站编号" style="width: 100%" @change="changeCode"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="分站类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['readerType', validatorRules.readerType]" :trigger-change="true" dictCode="reader_type" placeholder="请选择分站类型"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="地图" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['mapId', validatorRules.mapId]" :trigger-change="true" dictCode="busi_map,name,id" placeholder="请选择地图"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="区域" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['areaId', validatorRules.areaId]" :trigger-change="true" dictCode="busi_area,name,id" placeholder="请选择区域"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="分站简称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['briefName']" placeholder="请输入分站简称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="分站名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['name', validatorRules.name]" placeholder="请输入分站名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="x坐标" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number ref="pointX" v-decorator="['pointX', validatorRules.pointX]" placeholder="请输入x坐标" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="y坐标" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number ref="pointY" v-decorator="['pointY', validatorRules.pointY]" placeholder="请输入y坐标" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="z坐标" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['pointZ', validatorRules.pointZ]" placeholder="请输入z坐标" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="ip地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['ip']" placeholder="请输入ip地址"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="端口号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['port', validatorRules.port]" placeholder="请输入端口号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="设备类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['deviceType', validatorRules.deviceType]" :trigger-change="true" dictCode="reader_device_type" placeholder="请选择设备类型"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="定位维度" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['dimension', validatorRules.dimension]" :trigger-change="true" dictCode="dimension" placeholder="请选择定位维度"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="是否考勤分站" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['attendanceFlag', validatorRules.attendanceFlag]" :trigger-change="true" dictCode="attendance_flag" placeholder="请选择是否考勤分站"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="分站状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['status', validatorRules.status]" :trigger-change="true" dictCode="reader_status" placeholder="请选择分站状态"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="是否是特殊分站" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['specialFlag', validatorRules.specialFlag]" :trigger-change="true" dictCode="is_special" placeholder="请选择是否是特殊分站"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="是否可以模拟成定位卡" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['enableSimulateCard', validatorRules.enableSimulateCard]" :trigger-change="true" dictCode="enable_simulate_card" placeholder="请选择是否可以模拟成定位卡"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="此分站是否开启电池供电告警功能" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="radio" v-decorator="['needPowerAlarm', validatorRules.needPowerAlarm]" :trigger-change="true" dictCode="need_power_alarm" placeholder="请选择此分站是否开启电池供电告警功能"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="分站供电类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['powerSupply', validatorRules.powerSupply]" :trigger-change="true" dictCode="reader_power_supply" placeholder="请选择分站供电类型"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="天线1坐标x" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number ref="aerialaX" v-decorator="['aerialaX', validatorRules.aerialaX]" placeholder="请输入天线1坐标x" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="天线1坐标y" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number ref="aerialaY" v-decorator="['aerialaY', validatorRules.aerialaY]" placeholder="请输入天线1坐标y" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="天线1坐标z" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['aerialaZ', validatorRules.aerialaZ]" placeholder="请输入天线1坐标z" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="天线2坐标x" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number ref="aerialbX" v-decorator="['aerialbX', validatorRules.aerialbX]" placeholder="请输入天线2坐标x" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="天线2坐标y" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number ref="aerialbY" v-decorator="['aerialbY', validatorRules.aerialbY]" placeholder="请输入天线2坐标y" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="天线2坐标z" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['aerialbZ', validatorRules.aerialbZ]" placeholder="请输入天线2坐标z" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['remark']" placeholder="请输入备注"></a-input>
            </a-form-item>
          </a-col>

        </a-row>
        <div class="disc-content">
          <div>
            <span class="color-tips" v-for="(color, index) in colors" :key="index" >
              <span>天线{{index+1}}</span>
              <span class="path-color" :style="`background:${color}`"></span>
            </span>
          </div>
          <div class="disc-wrap">
            <canvas class="canvas" width="120" height="120" ref="canvas"></canvas>
            <div class="circle">
              <img src="/img/reader.png" alt="">
            </div>
          </div>
        </div>
      </a-form>

      <!-- 子表单区域 -->
      <a-tabs v-model="activeKey" @change="handleChangeTabs">
        <a-tab-pane tab="分站路径表" :key="refKeys[0]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[0]"
            :loading="readerRouteTable.loading"
            :columns="readerRouteTable.columns"
            :dataSource="readerRouteTable.dataSource"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true"
            :drawPath="drawPath"
            @drawMapPath="drawMapPath"
            @added="added">
          </j-editable-table>
        </a-tab-pane>

        <a-tab-pane tab="基准卡与分站的偏移量表" :key="refKeys[1]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[1]"
            :loading="cardReaderRelationTable.loading"
            :columns="cardReaderRelationTable.columns"
            :dataSource="cardReaderRelationTable.dataSource"
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
  import { FormTypes,getRefPromise, VALIDATE_NO_PASSED, validateFormAndTables  } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { validateDuplicateValue } from '@/utils/util'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import { httpAction } from '@/api/manage'
  import { duplicateCheck, getNearlyReaderPath } from '@api/api'
  import { clone } from '../../../utils/mapUtils'
  import { Circle, getAantennaAngle, getOffsetLeft, getOffsetTop, check, spotchange, getmoveto, respotchange, getCanvasList, getReaderCoord } from './rs-disc'
  import getters from '../../../store/getters'

  const colors = ['#FFAA03', '#0AB300'] // 配置天线
  let circles = [] // 储存canvas 清除之前的信息 便于重新绘制
  let index = null // 选中圆球索引 
  let isDragging = false //控制能拖动圆球
  let previousSelectedCircle = null
  const antennaNames = {
    0: ['aerialaX', 'aerialaY'],
    1: ['aerialbX', 'aerialbY']
  }

  export default {
    name: 'ReaderModal',
    mixins: [JEditableTableMixin],
    components: {
      JDictSelectTag,
    },
    data() {
      return {
        colors: colors,
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
        addDefaultRowNum: 1,
        validatorRules: {
          code: {
            rules: [
              { required: true, message: '请输入分站编号!'},
              { validator: this.validateCode }
            ]
          },
          readerType: {
            rules: [
              { required: true, message: '请输入分站类型!'},
            ]
          },
          mapId: {
            rules: [
              { required: true, message: '请输入地图!'},
            ]
          },
          areaId: {
            rules: [
              { required: true, message: '请输入区域!'},
            ]
          },
          name: {
            rules: [
              { required: true, message: '请输入分站名称!'},
            ]
          },
          pointX: {
            initialValue: '',
            rules: [
              { required: true, message: '请输入x坐标!'},
            ]
          },
          pointY: {
            initialValue: '',
            rules: [
              { required: true, message: '请输入y坐标!'},
            ]
          },
          pointZ: {
            initialValue: 0,
            rules: [
              { required: false, message: '请输入z坐标!'},
            ]
          },
          port: {
            initialValue: 10001,
            rules: [
              { required: false, message: '请输入port!'},
            ]
          },
          deviceType: {
            rules: [
              { required: true, message: '请输入设备类型!'},
            ]
          },
          dimension: {
            rules: [
              { required: true, message: '请输入定位维度!'},
            ]
          },
          attendanceFlag: {
            initialValue: 0,
            rules: [
              { required: true, message: '请输入是否考勤分站!'},
            ]
          },
          powerSupply: {
            initialValue: 0,
            rules: [
              { required: true, message: '请输入供电类型!'},
            ]
          },
          status: {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入分站状态!'},
            ]
          },
          specialFlag: {
            initialValue: 0,
            rules: [
              { required: true, message: '请输入是否是特殊分站!'},
            ]
          },
          enableSimulateCard: {
            initialValue: 0,
            rules: [
              { required: true, message: '请输入是否可以模拟成定位卡!'},
            ]
          },
          needPowerAlarm: {
            initialValue: 0,
            rules: [
              { required: true, message: '请输入此分站是否开启电池供电告警功能!'},
            ]
          },
          aerialaX: {
            initialValue: 0,
            rules: [
              { required: false, message: '请输入天线1x坐标!'},
            ]
          },
          aerialaY: {
            initialValue: 0,
            rules: [
              { required: false, message: '请输入天线1y坐标!'},
            ]
          },
          aerialaZ: {
            initialValue: 2.5,
            rules: [
              { required: false, message: '请输入天线1z坐标!'},
            ]
          },
          aerialbX: {
            initialValue: 0,
            rules: [
              { required: false, message: '请输入天线2x坐标!'},
            ]
          },
          aerialbY: {
            initialValue: 0,
            rules: [
              { required: false, message: '请输入天线2y坐标!'},
            ]
          },
          aerialbZ: {
            initialValue: 2.5,
            rules: [
              { required: false, message: '请输入天线2z坐标!'},
            ]
          },
        },
        refKeys: ['readerRoute', 'cardReaderRelation', ],
        tableKeys:['readerRoute', 'cardReaderRelation', ],
        activeKey: 'readerRoute',
        // 分站路径表
        readerRouteTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '路径编号',
              key: 'code',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [
                { required: true, message: '${title}不能为空' },
                {
                  pattern: /^[0-9]*$/, // 正则
                  message: '${title}必须输入数字'
                },
                // { handler: this.validatePathCode },
                {
                  unique: true,
                  message: '${title}不能重复'
                },
              ],
            },
            {
              title: '覆盖范围起始坐标x',
              key: 'beginX',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '覆盖范围起始坐标y',
              key: 'beginY',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '覆盖范围起始坐标z',
              key: 'beginZ',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: 0,
            },
            {
              title: '覆盖范围结束坐标x',
              key: 'endX',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '覆盖范围结束坐标y',
              key: 'endY',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '覆盖范围结束坐标z',
              key: 'endZ',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: 0,
            },
            {
              title: '排序',
              key: 'sort',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
          ]
        },
        // 基准卡与分站的偏移量表
        cardReaderRelationTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '标识卡编号',
              key: 'ident',
              type: FormTypes.select,
              dictCode:"busi_card,card_no,ident,card_type=155",
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '距分站x轴偏移量',
              key: 'offsetX',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '距分站y轴偏移量',
              key: 'offsetY',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '天线编号',
              key: 'aerialNumber',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '是否作为更新坐标分站',
              key: 'isFlag',
              type: FormTypes.select,
              dictCode: "is_update_point_flag",
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: 0,
            },
          ]
        },
        url: {
          add: "/reader/add",
          edit: "/reader/edit",
          readerRoute: {
            list: '/reader/queryReaderRouteByMainId'
          },
          cardReaderRelation: {
            list: '/reader/queryCardReaderRelationByMainId'
          },
        },
        readerRouteList: null,
        drawPath: true,
        data: null,
        isEditPath: false,
        pathRadius: 50,
        context: null,
      }
    },
    watch: {
      '$store.state.stateStore.readerModal': {
        handler (result) {
          console.log('add', result)
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.visible = result.isVisible;
          if (this.visible) {
            this.readerRouteTable.dataSource = [];
            const coords = result && result.coords;
            this.edit({
              pointX: Math.round(Number(coords[0]) * 10) / 10,
              pointY: Math.round(Number(coords[1]) * 10) / 10,
              pointZ: 0,
              port: 10001,
              aerialaX: Math.round(Number(coords[0]) * 10) / 10,
              aerialaY: Math.round(Number(coords[1]) * 10) / 10,
              aerialaZ: 2.5,
              aerialbX: Math.round(Number(coords[0]) * 10) / 10,
              aerialbY: Math.round(Number(coords[1]) * 10) / 10,
              aerialbZ: 2.5
            });
            this.drawPath = true;
            this.isEditPath = false;
            this.addedPath(coords);
          }
        },
        deep: true
      },
      '$store.state.stateStore.readerEdit': {
        handler (result) {
          console.log('edit', result)
          this.mapElement = this.$store.state.stateStore.mapContainer;
          this.visible = result.isVisible;
          if (this.visible) {
            this.data = result.rows;
            this.edit(result.rows);
            this.drawPath = true;
            this.readerRouteTable.dataSource = result.rows.readerRouteList;
            this.isEditPath = false;
          }
        },
        deep: true
      }
    },
    methods: {
      initCircle() {
        console.log('初始渲染circle')
        circles = [];
        let canvas = this.$refs.canvas;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        canvas.addEventListener('mousedown', this.canvasClick.bind(this), false);
        canvas.addEventListener('mousemove', this.dragCircle.bind(this), false);
        canvas.addEventListener('mouseup', this.stopDragging.bind(this), false);
        let coords = getCanvasList(this.model.pointX, this.model.pointY, this.model)
        // let coords = [{x: 110, y: 60}, {x: 10, y: 60}]
        colors.forEach((color, i) => {
          coords[i] && this.addRandomCircle(coords[i].x, coords[i].y, color)
        })

        for (var i = 0; i < circles.length; i++) {
          let circle = circles[i]
          if (circle.color === colors[i]) index = i
        }
      },
      canvasClick(e) {
        let canvas = this.canvas
        // 取得画布上被单击的点
        const clickX = e.pageX - getOffsetLeft(canvas)
        const clickY = e.pageY - getOffsetTop(canvas)
        // 查找被单击的圆圈
        for (let i = circles.length - 1; i >= 0; i--) {
          const circle = circles[i]
          //使用勾股定理计算这个点与圆心之间的距离
          const distanceFromCenter = Math.sqrt(Math.pow(circle.x - clickX, 2) + Math.pow(circle.y - clickY, 2))
          // 判断这个点是否在圆圈中
          if (distanceFromCenter <= circle.radius) {
            // 清除之前选择的圆圈
            if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false
            previousSelectedCircle = circle

            //选择新圆圈
            circle.isSelected = true

            // 使圆圈允许拖拽
            isDragging = true

            //更新显示
            this.drawCircles()

            //停止搜索
            return
          }
        }
      },
      dragCircle(e) {
        let canvas = this.canvas
        // 判断圆圈是否开始拖拽
        const a = {}
        if (isDragging == true) {
          a.x = e.clientX - getOffsetLeft(canvas)
          a.y = e.clientY - getOffsetTop(canvas)
          const b = spotchange(a)
          // 判断拖拽对象是否存在
          if (previousSelectedCircle != null) {
            // 取得鼠标位置
            const x = e.pageX - getOffsetLeft(canvas)
            const y = e.pageY - getOffsetTop(canvas)
            if (check(b.x, b.y)) {
              // 将圆圈移动到鼠标位置
              previousSelectedCircle.x = x
              previousSelectedCircle.y = y
              const co = getmoveto(b.x, b.y, isDragging, this.pathRadius)
              const tar = respotchange(co)
              const o = co.z
              // 更新画布
              this.drawCircles(tar.x, tar.y)
            }
          }
        }
      },
      stopDragging() {
        isDragging = false
        const {x, y} = circles[index]
        const angle = getAantennaAngle(60, 60, x, y) //60 60为圆盘中心坐标，根据canvas宽高而定
        let values = getReaderCoord(this.model.pointX, this.model.pointY, 2, angle)
        this.$refs[antennaNames[index][0]].$el.querySelector('input').value = values.x
        this.$refs[antennaNames[index][1]].$el.querySelector('input').value = values.y
        this.model[antennaNames[index][0]] = values.x
        this.model[antennaNames[index][1]] = values.y
        let fieldval = pick(this.model,'code','readerType','mapId','areaId','briefName','name','pointX','pointY','pointZ','ip','port','deviceType','dimension','attendanceFlag','status','specialFlag','enableSimulateCard','needPowerAlarm','aerialaX','aerialaY','aerialaZ','aerialbX','aerialbY','aerialbZ', 'remark')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        console.log(`选择天线${index+1}`,`angle:${angle}`, `x:${values.x}, y:${values.y}`)
      },
      addRandomCircle(x, y, color) {
        // 为圆圈计算一个随机大小和位置
        const radius = 6

        // 创建一个新圆圈
        const circle = new Circle(x, y, radius, color)
        // 把它保存在数组中
        circles.push(circle)
        // 重新绘制画布
        this.drawCircles()
      },
      drawCircles(x, y) {
        // 清除画布，准备绘制
        let canvas = this.canvas
        this.context.clearRect(0, 0, canvas.width, canvas.height)
        this.context.beginPath()
        this.context.lineWidth = 1
        this.context.arc(60, 60, 50, Math.PI * 0, Math.PI * 2, false) // 绘制内层圆弧
        this.context.strokeStyle = '#0078b4'
        this.context.stroke()

        this.context.beginPath()
        this.context.arc(60, 60, 50, Math.PI * 0, Math.PI * 2, false) // 绘制外侧圆弧
        this.context.strokeStyle = '#0099FF '
        this.context.lineCap = "round"
        this.context.lineWidth = 4
        this.context.stroke()

        // 遍历所有圆圈
        for (let i = 0; i < circles.length; i++) {
          const circle = circles[i]
          if (circle.isSelected && x && y) {
            if (circle.color === colors[i]) index = i
            circle.x = x
            circle.y = y
          }
          //绘制圆点与中心连接线段
          this.context.beginPath()
          this.context.moveTo(60, 60)
          this.context.lineTo(circle.x, circle.y)
          this.context.lineWidth = 2
          this.context.strokeStyle = circle.color
          this.context.stroke()
          // 绘制圆圈
          this.context.globalAlpha = 0.85
          this.context.beginPath()
          this.context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
          this.context.fillStyle = '#fff'
          this.context.strokeStyle = circle.color

          this.context.lineWidth = circle.isSelected ? 2 : 1
          this.context.fill()
          this.context.stroke()
        }
      },
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        let fieldval = pick(this.model,'code','readerType','mapId','areaId','briefName','name','pointX','pointY','pointZ','ip','port','deviceType','dimension','attendanceFlag','status','specialFlag','enableSimulateCard','needPowerAlarm','aerialaX','aerialaY','aerialaZ','aerialbX','aerialbY','aerialbZ', 'remark')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
          this.initCircle()
        })
        // 加载子表数据
        if (this.model.id && !this.isEditPath) {
          let params = { id: this.model.code }
          this.requestSubTableData(this.url.readerRoute.list, params, this.readerRouteTable)
          this.requestSubTableData(this.url.cardReaderRelation.list, { id: this.model.code }, this.cardReaderRelationTable)
        }
      },
      cosle() {
        this.$emit('close');
        this.readerRouteTable.dataSource = [];
      },
      /** 发起请求，自动判断是执行新增还是修改操作 */
      requestReader(formData) {
        let url = this.url.add, method = 'post'
        if (this.model.id) {
          url = this.url.edit
          method = 'put'
        }
        this.confirmLoading = true
        httpAction(url, formData, method).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.$emit('ok')
            this.close()
            this.$store.dispatch('olMapReaderLayer/updateFeatures')
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      },
      /** 确定按钮点击事件 */
      handleOkBtn() {
        const username = this.$store.getters.userInfo.username
        if (username !== 'admin') return this.$message.warning('请更换账号，更改分站信息！')
        /** 触发表单验证 */
        this.getAllTable().then(tables => {
          /** 一次性验证主表和所有的次表 */
          return validateFormAndTables(this.form, tables)
        }).then(allValues => {
          if (typeof this.classifyIntoFormData !== 'function') {
            throw this.throwNotFunction('classifyIntoFormData')
          }
          let formData = this.classifyIntoFormData(allValues)
          if (this.model.id) {
            let roads = []
            for (let i = 0; i < formData.readerRouteList.length; i++) {
              let path = formData.readerRouteList[i]
              delete path.id
              roads.push(path)
            }
            formData.readerRouteList = roads
          }
          console.log('formData', formData)
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
          readerRouteList: allValues.tablesValue[0].values,
          cardReaderRelationList: allValues.tablesValue[1].values,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'code','readerType','mapId','areaId','briefName','name','pointX','pointY','pointZ','ip','port','deviceType','dimension','attendanceFlag','status','specialFlag','enableSimulateCard','needPowerAlarm','aerialaX','aerialaY','aerialaZ','aerialbX','aerialbY','aerialbZ', 'remark'))
      },
      validateCode(rule, value, callback) {
        this.validateMount(value, callback, 'busi_reader');
      },
      validatePathCode(type, value, row, column, callback, target) {
        this.validateMount(value, callback, 'busi_reader_route');
      },
      validateMount(value, callback, tableName) {
        if (!value) {
          tableName === 'busi_reader_route' ? callback(true) : callback()
        } else {
          var params = {
            tableName: tableName,
            fieldName: 'code',
            fieldVal: value,
            dataId: this.model.id
          };
          duplicateCheck(params).then((res) => {
            console.log(res)
            if (res.success) {
              tableName === 'busi_reader_route' ? callback(true) : callback()
            } else {
              tableName === 'busi_reader_route' ? callback(false, "编号已存在!") : callback("编号已存在!")
            }
          })
        }
      },
      drawMapPath(evt) {
        this.isEditPath = true
        let name = evt && evt.target.getAttribute('name');
        let fieldsValues = this.form.getFieldsValue(['code','readerType','mapId','areaId','briefName','name','pointX','pointY','pointZ','ip','port','deviceType','dimension','attendanceFlag','status','specialFlag','enableSimulateCard','needPowerAlarm','aerialaX','aerialaY','aerialaZ','aerialbX','aerialbY','aerialbZ'])
        fieldsValues['readerRouteList'] = this.readerRouteTable.dataSource;
        fieldsValues = this.getReaderValue(fieldsValues);
        if (name === 'add') {
          this.$store.dispatch('olMapReaderPathLayer/addDrawPath', fieldsValues);
        } else if (name === 'edit') {
          if (!fieldsValues.readerRouteList.length) return this.$message.warning('未配置分站路径');
          console.log(fieldsValues);
          this.$store.dispatch('olMapReaderPathLayer/editDrawPath', fieldsValues);
        }
        this.$store.commit('stateStore/changeReaderEdit', {
          type: false,
          rows: fieldsValues
        });
      },
      getReaderValue(fieldsValues) {
        let rows = clone(this.model);
        for (const key in fieldsValues) {
          rows[key] = fieldsValues[key]
        }
        return rows
      },
      changeCode(value) {
        let readerList = this.readerRouteTable.dataSource;
        for (const row of readerList) {
          row.readerCode = value;
        }
      },
      // 手动新增分站路径
      added() {
        this.addedPath();
      },
      addedPath(coords) {
        let pointX = null, pointY = null, num = 1, readerCode = null;
        if (coords) {
          pointX = Math.round(Number(coords[0]) * 10) / 10;
          pointY = Math.round(Number(coords[1]) * 10) / 10;
        } else {
          pointX = this.$refs.pointX.value;
          pointY = this.$refs.pointY.value;
        }
        let point = `${pointX},${pointY}`;
        let params = {point, num};
        getNearlyReaderPath(params).then((res) => {
          if (res.code === 200) {
            let datas = res.result;
            for (let i = 0; i < datas.length; i++) {
              const data = datas[i];
              readerCode = readerCode ? readerCode : data.readerCode;
              let readerPathCode = `${readerCode}${this.readerRouteTable.dataSource.length + 1}`;
              this.readerRouteTable.dataSource.push({
                code: readerPathCode,
                beginX: data.beginX,
                beginY: data.beginY,
                beginZ: data.beginZ,
                endX: data.endX,
                endY: data.endY,
                endZ: data.endZ,
                angle: null,
                sort: this.readerRouteTable.dataSource.length + 1,
                readerCode: data.readerCode,
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .disc-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .color-tips {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .path-color {
        width: 20px;
        height: 10px;
        display: block;
        margin-left: 5px;
      }
    }
  }
  .disc-wrap {
    display: inline-block;
    position: relative;
    background: #f8f8f8;
    margin-left: 10px;
    .canvas {
      vertical-align: middle;
      cursor: pointer;
    }
    .circle {
      width: 30px;
      height: 30px;
      position: absolute;
      top: 50%;
      left: 50%;
      background: #F1F2F3;
      border-radius: 50%;
      box-shadow: 0 3px 7px 2px rgba(0,0,0,0.20);
      margin-top: -15px;
      margin-left: -15px;
      user-select: none;
      img {
        width: 100%;
        height: 100%;
      }
    }
    
 }
</style>