<template>
  <div id="components-modal-demo-position" v-if="isVisible">
    <a-modal
      v-model="isShow"
      title="人员当天历史数据"
      @cancel="handleCancle"
      :footer="null"
      width="70%"
      :getContainer="() => mapElement"
      centered>
      <div class="search-list">
        <a-range-picker v-model="rangeDefultValue">
          <template slot="dateRender" slot-scope="current">
            <div class="ant-calendar-date" :style="getCurrentStyle(current)">
              {{ current.date() }}
            </div>
          </template>
        </a-range-picker>
        <a-button type="primary" @click="getStaffCurve">
          查询
        </a-button>
      </div>
      <div>
        <div>
          <a-radio-group v-model="radioValue" @change="radioChange">
            <a-radio :value="'max'">
              最大值
            </a-radio>
            <a-radio :value="'min'">
              最小值
            </a-radio>
            <a-radio :value="'avg'">
              平均值
            </a-radio>
          </a-radio-group>
        </div>
        <div class="chartcont" style="width:100%;height:400px;"></div>
      </div>
    </a-modal>
  </div>
</template>
<script>
  import {mapState} from 'vuex'
  import moment from 'moment';
  import { getStaffCurveReq } from '@/api/api';
  var echarts = require('echarts');
  // :default-value="rangeDefultValue"
  export default {
    name: "staffCurve",
    components: {

    },
    data () {
      return {
        isVisible: false,
        isShow: false,
        rangeDefultValue: [moment(new Date(), 'YYYY/MM/DD'), moment(new Date(), 'YYYY/MM/DD')],
        radioValue: 'max',
        chartsData: null,
        mapElement: null
      }
    },
    computed: {
    },
    mounted () {
      
    },
    methods: {
      handleCancle () {
        this.$store.commit('stateStore/changeStaffCurve',{type: false})
      },
      getCurrentStyle(current, today) {
        const style = {};
        if (current.date() === 1) {
          style.border = '1px solid #1890ff';
          style.borderRadius = '50%';
        }
        return style;
      },
      radioChange(e) {
        this.initCharts()
      },
      getStaffCurve() {
        let startTime = Array.from(this.rangeDefultValue.values())[0].format('YYYY-MM-DD')
        let endTime = Array.from(this.rangeDefultValue.values())[1].format('YYYY-MM-DD')
        let params = {
          startTime: `${startTime}`,
          endTime: `${endTime}`, 
          mapCode: window.xdata.state.mapService.mapID
        }
        getStaffCurveReq(params).then((res) => {
          console.log(res)
          if (res.code === 200) {
            this.chartsData = res.result
            this.initCharts()
          }
        })
      },
      staffcharts(options) {
        let config = {
          grid: {
            bottom: 80
          },
          dataZoom: [
            {
                show: true,
                realtime: true,
                start: 80,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 65,
                end: 85
            }
          ],
          xAxis: {
              type: 'category',
              data: options.record.map(function (str) {
                return str.replace(' ', '\n')
              })
          },
          yAxis: {
              type: 'value'
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              return `${params[0].axisValue}：${params[0].data}人`
            }
          },
          series: [{
              data: options.data,
              type: 'line'
          }]
        }
        return config
      },
      initCharts () {
        if (this.chartsData) {
          let initdom = document.querySelector('.chartcont')
          initdom && echarts.dispose(initdom)
          let staffCharts = echarts.init(initdom)
          let chartsMsg = {
            record: this.chartsData.recordtime,
            data: this.chartsData[this.radioValue]
          }
          let option = this.staffcharts(chartsMsg)
          staffCharts.setOption(option)
        }
      }
    },
    watch: {
      '$store.state.stateStore.staffCurve': {
        handler (result) {
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.isShow = result.isVisible
          this.isVisible = result.isVisible
          if(this.isShow) {
            this.getStaffCurve()
          }
        },
        deep: true
      }
    },
    destroyed() {
      
    }
  }
</script>
<style scoped>
.search-list {
  display: flex;
  justify-content: space-around;
}
</style>