<template>
  <div class="percentList-month">
    <div class="title">
      <h2>沙曲二矿“数字化”管理工作调度月报</h2>
      <a-form-model ref="form" layout="inline" :model="form" @submit.native.prevent>
        <a-form-model-item label="月份" prop="date"
          ><a-month-picker v-model="form.date" placeholder="请选择月份" @change="onChangeMonth"
        /></a-form-model-item>
        <a-form-model-item label="队组" prop="group">
          <j-dict-select-tag placeholder="请选择" v-model="form.group" dictCode="work_scheduling_production" />
        </a-form-model-item>
        <a-form-model-item label="工作面" prop="space">
          <a-select v-model="form.space" allowClear>
            <a-select-option v-for="item in spaceList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option></a-select
          ></a-form-model-item
        >
        <a-form-model-item>
          <a-button type="primary" icon="search" @click="queryDate">
            查询
          </a-button>
          <a-button @click="reset" type="primary" icon="reload" style="margin-left:18px;">
            重置
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="survey" v-show="isSurvey">
      <h3>沙曲概况</h3>
      <div class="content">
        <!-- 开机率 -->
        <div class="content-item" ref="totalPower"></div>
        <!-- 正规循环率 -->
        <div class="content-item" ref="totalCircul"></div>
        <!-- 利用率 -->
        <div class="content-item" ref="totalUse"></div>
      </div>
    </div>
    <div class="team" v-show="isTeam">
      <h3>沙曲队组</h3>
      <div class="content">
        <div
          class="content-item"
          v-for="(item, index) in optionTeam"
          :key="index"
          :id="'teamItem' + `${index + 1}`"
          :ref="'teamItem' + `${index + 1}`"
        ></div>
      </div>
    </div>
    <a-empty v-show="!(isTeam || isSurvey)" style="margin:20px 0;" />
  </div>
</template>

<script>
import { getMonth, getWorkface, getMonthMean } from '@api/api'
import moment from 'moment'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      spaceList: [],
      form: {
        date: undefined,
        dateString: '',
        group: '',
        space: ''
      },
      isSurvey: true,
      isTeam: true,
      //综合开机率配置
      optionTotalPower: {
        title: {
          //图标标题
          text: '开机率概况',
          x: '15px',
          // y: '10px',
          textStyle: {
            fontSize: '14px',
            fontWeight: '600'
          }
        },
        color:["#5470c6"],
        tooltip: {},
        legend: {
          //顶部图例选中
          orient: 'horizontal', //图例布局方式
          x: 'center',
          y: 'top',
          textStyle: {
            color: '#333' // 图例文字颜色
          },
          data: ['开机率']
        },
        xAxis: {
          data: [],
          axisLabel: { rotate: -40 } //x轴标题倾斜度
        },
        yAxis: {
          name: '率值（%）'
        },
        dataZoom: {
          // 区域缩放控制器
          bottom: 20,
          left: "10%",
          width: '80%',
          height: 20
        },
        series: [
          {
            name: '开机率',
            type: 'bar',
            data: []
          }
        ]
      },
      //综合工时利用率配置
      optionTotalUse: {
        title: {
          //图标标题
          text: '工时利用率概况',
          x: '15px',
          // y: '10px',
          textStyle: {
            fontSize: '14px',
            fontWeight: '600'
          }
        },
        color:["#fac858"],
        tooltip: {},
        legend: {
          //顶部图例选中
          orient: 'horizontal', //图例布局方式
          x: 'center',
          y: 'top',
          textStyle: {
            color: '#333' // 图例文字颜色
          },
          data: ['工时利用率']
        },
        xAxis: {
          data: [],
          axisLabel: { rotate: -40 } //x轴标题倾斜度
        },
        yAxis: {
          name: '率值（%）'
        },
        dataZoom: {
          // 区域缩放控制器
          bottom: 20,
          left: "10%",
          width: '80%',
          height: 20
        },
        series: [
          {
            name: '工时利用率',
            type: 'bar',
            data: []
          }
        ]
      },
      //综合开机率配置
      optionTotalCircul: {
        title: {
          //图标标题
          text: '正规循环率概况',
          x: '15px',
          // y: '10px',
          textStyle: {
            fontSize: '14px',
            fontWeight: '600'
          }
        },
        color:["#91cc75"],
        tooltip: {},
        legend: {
          //顶部图例选中
          orient: 'horizontal', //图例布局方式
          x: 'center',
          y: 'top',
          textStyle: {
            color: '#333' // 图例文字颜色
          },
          data: ['正规循环率']
        },
        xAxis: {
          data: [],
          axisLabel: { rotate: -40 } //x轴标题倾斜度
        },
        yAxis: {
          name: '率值（%）'
        },
        dataZoom: {
          // 区域缩放控制器
          bottom: 20,
          left: "10%",
          width: '80%',
          height: 20
        },
        series: [
          {
            name: '正规循环率',
            type: 'bar',
            data: []
          }
        ]
      },
      optionTeam: [],
      //每个队组三率模板
      optionTeamItem: {}
    }
  },
  mounted() {
    this.init()
  },
  updated() {
    this.draw()
  },
  methods: {
    moment,
    //绘制图表
    draw() {
      //队组绘制
      for (let index = 1; index < this.optionTeam.length + 1; index++) {
        var chartDom = document.getElementById(`teamItem${index}`)
        var option = this.optionTeam[index - 1]
        echarts.init(chartDom).setOption(option)
      }
    },
    //查询
    queryDate() {
      // 平均三率
      let param = {
        arrDate: this.form.dateString
      }
      this.optionTotalPower.xAxis.data = []
      this.optionTotalPower.series[0].data = []
      this.optionTotalUse.xAxis.data = []
      this.optionTotalUse.series[0].data = []
      this.optionTotalCircul.xAxis.data = []
      this.optionTotalCircul.series[0].data = []
      getMonthMean(param).then(res => {
        if (res.result.length == 0) {
          this.isSurvey = false
          return
        } else {
          this.isSurvey = true
          this.optionTotalPower
          function compare(arrDate) {
            return function(a, b) {
              return a[arrDate].substr(8) - b[arrDate].substr(8)
            }
          }
          var resArr = res.result.sort(compare('arrDate'))
          var averData = res.result.reduce((pre, cur) => {
            let index = pre.findIndex(item => item.reportType === cur.reportType)
            if (~index) {
              pre[index].data.push(cur)
            } else {
              pre.push({
                data: [cur],
                reportType: cur.reportType
              })
            }
            return pre
          }, [])
          averData.forEach(ele => {
            switch (ele.reportType) {
              case 1:
                ele.data.forEach(v => {
                  this.optionTotalPower.xAxis.data.push(v.arrDate.substr(5))
                  this.optionTotalPower.series[0].data.push(v.rate)
                })
                break
              case 2:
                ele.data.forEach(v => {
                  this.optionTotalCircul.xAxis.data.push(v.arrDate.substr(5))
                  this.optionTotalCircul.series[0].data.push(v.rate)
                })
                break
              case 3:
                ele.data.forEach(v => {
                  this.optionTotalUse.xAxis.data.push(v.arrDate.substr(5))
                  this.optionTotalUse.series[0].data.push(v.rate)
                })
                break
              default:
                break
            }
          })
          //综合开机率绘制
          echarts.init(this.$refs.totalPower).setOption(this.optionTotalPower)
          //综合正规循环率绘制
          echarts.init(this.$refs.totalCircul).setOption(this.optionTotalCircul)
          //综合工时利用率绘制
          echarts.init(this.$refs.totalUse).setOption(this.optionTotalUse)
          
        }
      })
      // 队组三率
      let params = {
        today: this.form.dateString,
        actual: '',
        arrDate: '',
        id: '',
        name: this.form.group,
        plan: '',
        rate: '',
        reportType: '',
        workType: '',
        workfaceId: this.form.space
      }
      this.optionTeam = []
      getMonth(params).then(response => {
        if (response.result.length == 0) {
          this.isTeam = false
        } else {
          this.isTeam = true
          // 排序
          function compare(arrDate) {
            return function(a, b) {
              return a[arrDate].substr(8) - b[arrDate].substr(8)
            }
          }
          var resArr = response.result.sort(compare('arrDate'))
          //分队
          var teamData = resArr.reduce((pre, cur) => {
            let index = pre.findIndex(item => item.name === cur.name)
            if (index >= 0) {
              pre[index].data.push(cur)
            } else {
              pre.push({
                data: [cur],
                name: cur.name
              })
            }
            return pre
          }, [])
          //分天
          var datyData = []
          teamData.forEach(v => {
            let ele = {}
            ele.name = v.name
            var dateArr = v.data.reduce((pre, cur) => {
              let index = pre.findIndex(item => item.arrDate === cur.arrDate)
              if (~index) {
                pre[index].data.push(cur)
              } else {
                pre.push({
                  data: [cur],
                  arrDate: cur.arrDate
                })
              }
              return pre
            }, [])
            ele.dateArr = dateArr
            datyData.push(ele)
          })
          // 分率
          var optionDate = []
          for (let i = 0; i < datyData.length; i++) {
            let item = {
              dataZoom: {
                // 区域缩放控制器
                bottom: 20,
                height: 20,
                left: "10%",
                width: "80%"
              },
              title: {
                //图标标题
                text: '',
                x: '15px',
                // y: '10px',
                textStyle: {
                  fontSize: '14px',
                  fontWeight: '600'
                }
              },
              width:'80%',
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  crossStyle: {
                    color: '#999'
                  }
                }
              },
              toolbox: {
                feature: {
                  dataView: { show: true, readOnly: false },
                  magicType: { show: true, type: ['line', 'bar'] },
                  restore: { show: true },
                  saveAsImage: { show: true }
                }
              },
              legend: {
                data: ['开机率', '正规循环率', '工时利用率']
              },
              xAxis: [
                {
                  axisLabel: { rotate: -40 }, //x轴标题倾斜度
                  type: 'category',
                  data: [],
                  axisPointer: {
                    type: 'shadow'
                  }
                }
              ],
              yAxis: [
                {
                  type: 'value',
                  name: '开机率/正规循环率',
                  min: 0,
                  // max: 100,
                  // interval: 20,
                  axisLabel: {
                    formatter: '{value} %'
                  }
                },
                {
                  type: 'value',
                  name: '工时利用率',
                  min: 0,
                  // max: 100,
                  // interval: 20,
                  axisLabel: {
                    formatter: '{value} %'
                  }
                }
              ],
              series: [
                {
                  name: '开机率',
                  type: 'bar',
                  data: []
                },
                {
                  name: '正规循环率',
                  type: 'bar',
                  data: []
                },
                {
                  name: '工时利用率',
                  type: 'line',
                  yAxisIndex: 1,
                  data: []
                }
              ]
            }
            item.title.text = this.mapTitle(datyData[i].name)
            for (let j = 0; j < datyData[i].dateArr.length; j++) {
              item.xAxis[0].data.push(datyData[i].dateArr[j].arrDate.substr(5))

              for (let n = 0; n < datyData[i].dateArr[j].data.length; n++) {
                switch (datyData[i].dateArr[j].data[n].reportType) {
                  case 1:
                    item.series[0].data.push(datyData[i].dateArr[j].data[n].rate)
                    break
                  case 2:
                    item.series[1].data.push(datyData[i].dateArr[j].data[n].rate)
                    break
                  case 3:
                    item.series[2].data.push(datyData[i].dateArr[j].data[n].rate)
                    break
                  default:
                    break
                }
              }
            }
            optionDate.push(item)
          }
          //按队排序
          this.mapArr.forEach(v => {
            var index = optionDate.findIndex(item => {
              return item.title.text == v.title
            })
            if (index >= 0) {
              this.optionTeam.push(optionDate[index])
            }
          })
          console.log('optionArroptionArroptionArr', this.optionTeam)
        }
      })
    },
    //初始化
    init() {
      var curYear = new Date().getFullYear()
      var month = new Date().getMonth() + 1
      var curMonth = month < 10 ? `0${month}` : `${month}`
      var curDay = new Date().getDate()
      this.form.dateString = `${curYear}-${curMonth}-${curDay}`
      this.queryDate()
      //工作面查询
      getWorkface({ pageNo: '1', pageSize: '100' }).then(res => {
        this.spaceList = res.result.records
      })
      //队组数据字典查询
      initDictOptions('work_scheduling_production').then(res => {
        if (res.success) {
          this.mapArr = res.result
        }
      })
    },
    mapTitle(str) {
      let index = this.mapArr.findIndex(item => item.value == str)
      return this.mapArr[index].text
    },
    //选择月份date  dateString"2021-06"
    onChangeMonth(date, dateString) {
      this.form.dateString = `${dateString}-01`
    },
    //点击重置
    reset() {
      this.$refs.form.resetFields()
      var curYear = new Date().getFullYear()
      var month = new Date().getMonth() + 1
      var curMonth = month < 10 ? `0${month}` : `${month}`
      var curDay = new Date().getDate()
      this.form.dateString = `${curYear}-${curMonth}-${curDay}`
      this.queryDate()
    }
  }
}
</script>

<style lang="less">
.percentList-month {
  padding-bottom: 20px;
  .ant-input {
    width: 210px;
  }
  .ant-select-enabled {
    width: 210px;
  }
  background-color: #fff;
  .title {
    padding: 20px 40px;
    border-bottom: 1px solid #ddd;
    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
  }
  .survey {
    padding: 20px;
    background-color: #fff;
    width: 100%;
    h3 {
      font-weight: 500;
      margin-left: 20px;
    }
    .content {
      margin-top: 15px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      .content-item {
        padding-top: 10px;
        margin-left: 15px;
        height: 240px;
        width: 600px;
        border-radius: 6px;
        border: 1px solid #ddd;
        box-shadow: 3px 3px 2px 2px #ddd;
      }
    }
  }
  .team {
    padding: 20px;
    background-color: #fff;
    width: 100%;
    h3 {
      font-weight: 500;
      margin-left: 20px;
    }
    .content {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      padding-left: 15px;
      .content-item {
        padding-top: 15px;
        margin-top: 15px;
        height: 250px;
        width: 49.45%;
        border-radius: 6px;
        border: 1px solid #ddd;
        box-shadow: 3px 3px 2px 2px #ddd;
      }
    }
  }
}
</style>
