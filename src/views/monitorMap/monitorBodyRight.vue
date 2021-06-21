<template>
  <div class="monitorBodyRight">
    <a-icon class="collapseIcon" :type="stateShow ? 'double-right' : 'double-left'" @click="toggleStateShow"/>
    <div v-show="stateShow" class="sanlv-body">
      <dv-border-box-12  id="slCount" :backgroundColor="'rgba(0,0,0,0.2)'">
        <h3>
          <span class="themeColor">
            全矿三率分析
          </span>
        </h3>
        <div class="overview-echarts">
          <div v-for="(rateDef, index) in rateDefs" :key="index" :class="rateDef.warpName">
            <div :class="rateDef.className" style="width:100%;height:120px;"></div>
            <span>{{rateDef.title}}</span>
          </div>
        </div>
      </dv-border-box-12>
      <div class="monitorBodyRightContent">
        <div class="menuContainer boxuncoll">
          <!-- <a-icon class="collapseIcon" :type="stateShow ? 'double-right' : 'double-left'" @click="toggleStateShow"/> -->
          <div>
            <div class="rate-dept" v-for="(deprRateDef, index) in deptRateDefs" :key="index">
              <div :class="deprRateDef.warpName" style="width:100%;height:160px;"></div>
              <span>{{deprRateDef.text}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="monitorBodyRightContent boxcoll" v-show="!stateShow" style="width:80px;">
      <div class="menuContainer">
        <a-icon class="collapseIcon" :type="stateShow ? 'double-right' : 'double-left'" @click="toggleStateShow"/>
      </div>
    </div> -->
  </div>
</template>

<script>
  import AreaChartTy from '@/components/chart/AreaChartTy'
  import Bar from '@/components/chart/Bar'
  import BarMultid from '@/components/chart/BarMultid'
  import DashChartDemo from '@/components/chart/DashChartDemo'
  import LineChartMultid from '@/components/chart/LineChartMultid'
  import Liquid from '@/components/chart/Liquid'
  import MiniBar from '@/components/chart/MiniBar'
  import MiniArea from '@/components/chart/MiniArea'
  import MiniProgress from '@/components/chart/MiniProgress'
  import Pie from '@/components/chart/Pie'
  import Radar from '@/components/chart/Radar'
  import RankList from '@/components/chart/RankList'
  import TransferBar from '@/components/chart/TransferBar'
  import Trend from '@/components/chart/Trend'
  import BarAndLine from '@/components/chart/BarAndLine'
  import { getSanlv } from '@api/api'
  var echarts = require('echarts');
  import { gauge, rateBar } from '../../store/def/graph_def'

  const rateDefs = [
    {
      warpName: 'overviewBD',
      className: 'overview-BD',
      title: '开机率'
    },
    {
      warpName: 'overviewWD',
      className: 'overview-WD',
      title: '工时利用率'
    },
    {
      warpName: 'overviewRD',
      className: 'overview-RD',
      title: '正规循环率'
    }
  ]

   const deptRateDefs = [
    {
      warpName: 'rate-dept_boot',
      className: 'dept_boot',
      text: '队组开机率(%)'
    },
    {
      warpName: 'rate-dept_worktime',
      className: 'dept_worktime',
      text: '队组工时利用率(%)'
    },
    {
      warpName: 'rate-dept_rugular',
      className: 'dept_rugular',
      text: '队组正规循环率(%)'
    }
  ]
  export default {
    props: {
    
    },
    components: {
      Bar, MiniBar, BarMultid, AreaChartTy, LineChartMultid,
      Pie, Radar, DashChartDemo, MiniProgress, RankList,
      TransferBar, Trend, Liquid, MiniArea, BarAndLine
    },
    data () {
      return {
        height: 420,
        areaData: [],
        stateShow: true,
        deptRate: null,
        totalRate: null,
        rateDefs: rateDefs,
        deptRateDefs: deptRateDefs,
        deptMap: new Map(),
      }
    },
    computed: {
      
    },
    created () {
      // this.loadAreaData()
    },
    mounted () {
      this.init();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.chartResize);
    },
    methods: {
      init() {
        let self = this;
        // setInterval(() => {
          getSanlv().then((res) => {
            console.log('三率数据', res)
            if (res.success) {
              self.deptRate = res.result.deptRate;
              self.totalRate = res.result.totalRate;
              this.initTotaldate();
              this.initDeptRate();
            }
          })
        // }, 6000);
      },
      // loadData(x, y, max, min, before = '', after = '月') {
      //   let data = []
      //   for (let i = 0; i < 12; i += 1) {
      //     data.push({
      //       [x]: `${before}${i + 1}${after}`,
      //       [y]: Math.floor(Math.random() * max) + min
      //     })
      //   }
      //   return data
      // },
      toggleStateShow() {
        this.stateShow=!this.stateShow
      },
      chartResize() {
        this.totalChart.resize();
      },
      initTotaldate() {
        let datasArr = this.totalRate;
        for (let i = 0; i < this.rateDefs.length; i++){
          let rateDef = this.rateDefs[i];
          this.initTotaldateCharts(datasArr[i], rateDef.className, rateDef.title);
        }
      },
      initTotaldateCharts(row, name, title) {
        name = `.${name}`;
        let initdom = this.$el.querySelector(name);
        if (!initdom) return
        echarts.dispose(initdom);
        this.totalChart = echarts.init(initdom);
        let value = row && row.value ? Number(row.value).toFixed(0) : 0
        let msg = {
          title: title,
          data: [{value: value}],
          max: name == '.overview-WD' ? 14 : 100
        }
        let option = gauge(msg)
        this.totalChart.setOption(option)
        window.addEventListener('resize', this.chartResize)
      },
      initDeptRate() {
        let datasArr = this.deptRate;
        for (let i = 0; i < this.deptRateDefs.length; i++){
          let rateDef = this.deptRateDefs[i]
          // this.splitDeptData(datasArr[i], rateDef.className)
          this.initDeptdateCharts(datasArr[i], rateDef.className, rateDef.text);
        }
      },
      splitDeptData(rows, name) {
        if (!this.deptMap.get(name)) {
          let ret = new Map()
          this.deptMap.set(name, ret)
        }
        console.log('deptMap', this.deptMap)
      },
      initDeptdateCharts(row, name, text) {
        let series = []
        let xAxis = row.xaxis.split(',');
        let yAxis = row.yaxis.split(',');
        // let data = Array.from(this.deptMap.get(key).values())
        // data.sort(function(a,b){return a[1]-b[1]})
        let domname = `.rate-${name}`
        let initdom = this.$el.querySelector(domname);
        if (!initdom) return
        echarts.dispose(initdom);
        let chart = echarts.init(initdom)
        let msg = {
          xAxis: xAxis,
          yAxis: yAxis,
          key: name
        }
        let option = rateBar(msg)
        chart.setOption(option)
      }
    }
  }
</script>

<style lang="less" scoped>
  .monitorBodyRight {
    position: absolute;
    right: 0;
    // width: 420px;
    height: 610px;
    .sanlv-body {
      width: 420px;
    }
    .collapseIcon{
      color: #fff;
      font-weight: bold;
      font-size: 20px;
      position: absolute;
      right: 10px;
      top: 20px;
      z-index: 999;
    }
    #slCount {
      height:180px;
      color:#71FcF4;
      h3 {
        text-align: center;
        .themeColor{
          color:#71FcF4
        }
      }
      .overview-echarts {
        display: flex;
        width: 100%;
        .overviewBD, .overviewWD, .overviewRD {
          position: relative;
          width: 33.3%;
          display: flex;
          flex-direction: column;
          span {
            position: absolute;
            bottom: 0;
            font-size: 14px;
            width: 100%;
            text-align: center;
          } 
        }   
      } 
    }
    .monitorBodyRightContent {
      display: flex;
      margin-top: 10px;
      color: white;
      flex-direction: column;
      position: absolute;
      right: 0px;
      height: 500px;
      width: 100%;
      .menuContainer{
        padding: 5px 0 35px 5px;
        margin-bottom: 20px;
        border: 1px solid #09f;
        box-shadow: 0 1px 6px 1px #009fff;
        opacity: .8;
        max-height: 500px;
        overflow-y: scroll;
        border-radius: 4px;
        .rate-dept {
          height: 192px;
          position: relative;
          padding-left: 7px;
          margin-top: 10px;
          .rate-dept_boot {
            canvas {
              top: -23px;
            }
          }
          span {
            position: absolute;
            bottom: 5px;
            left: 152px;
            color: #0082DE;
            font-size: 14px;
          }
        }
      }
      // .collapseIcon{
      //   color: #fff;
      //   font-weight: bold;
      //   font-size: 20px;
      //   position: absolute;
      //   right: 10px;
      //   top: 20px;
      //   z-index: 999;
      // }
      .icon{
        display: inline-block;
        background-image: url("../../assets/img/icon.png");
        width: 25px;
        height: 25px;
      }
    }
  }
</style>
