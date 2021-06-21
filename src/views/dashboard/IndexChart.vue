<template>
  <div class="page-header-index-wide">
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">

        <a-card title="当前人员总数" style="width: 100%">
          <h2 style='font-size: 2rem;color:#1890FF'>
            {{socketData&&socketData.ts_staff_count?socketData.ts_staff_count:0}}  <span style='font-size: 1rem;color:black'>人</span>
          </h2>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">

        <a-card title="当前车辆总数" style="width: 100%">
          <h2 style='font-size: 2rem;color:#1890FF'>
            {{socketData&&socketData.ts_vehicle_count?socketData.ts_vehicle_count:0}}  <span style='font-size: 1rem;color:black'>辆</span>
          </h2>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">

        <a-card title="当前报警总数" style="width: 100%">
          <h2 style='font-size: 2rem;color:#1890FF'>
            {{socketData&&socketData.ts_alert_count?socketData.ts_alert_count:0}}  <span style='font-size: 1rem;color:black'>条</span>
          </h2>
        </a-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <a-card title="当前呼救总数" style="width: 100%">
          <h2 style='font-size: 2rem;color:#1890FF'>
            {{socketData&&socketData.ts_help?socketData.ts_help.length:0}}  <span style='font-size: 1rem;color:black'>条</span>
          </h2>
        </a-card>
      </a-col>
    </a-row>

    <a-card :loading="loading" :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">
          <a-tab-pane loading="true" tab="人员按区域分布" key="1">
            <div ref="chartStaffArea" class="chartContainer"></div>
          </a-tab-pane>
          <a-tab-pane tab="车辆按区域分布" key="2">
            <div ref="chartVehicleArea" class="chartContainer"></div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>

    <a-card :loading="loading" :bordered="false" title="下井人数历史曲线图" :style="{ marginTop: '24px',minHeight:'350px' }">
      <div ref="chartCountHistory" class="chartContainer" style='width: 100%;min-height: 350px'></div>
    </a-card>

  </div>
</template>

<script>
  import ChartCard from '@/components/ChartCard'
  import ACol from "ant-design-vue/es/grid/Col"
  import ATooltip from "ant-design-vue/es/tooltip/Tooltip"
  import MiniArea from '@/components/chart/MiniArea'
  import MiniBar from '@/components/chart/MiniBar'
  import MiniProgress from '@/components/chart/MiniProgress'
  import RankList from '@/components/chart/RankList'
  import Bar from '@/components/chart/Bar'
  import LineChartMultid from '@/components/chart/LineChartMultid'
  import HeadInfo from '@/components/tools/HeadInfo.vue'

  import Trend from '@/components/Trend'
  import { getLoginfo,getVisitInfo } from '@/api/api'


  export default {
    name: "IndexChart",
    components: {
      ATooltip,
      ACol,
      ChartCard,
      MiniArea,
      MiniBar,
      MiniProgress,
      RankList,
      Bar,
      Trend,
      LineChartMultid,
      HeadInfo
    },
    data() {
      return {
        loading: true,
        center: null,
        loginfo:{},
        visitFields:['ip','visit'],
        visitInfo:[],
        indicator: <a-icon type="loading" style="font-size: 24px" spin />,
        socketData:[],
        websock:null,
        heartCheckIn:null,
        lockReconnect:null,
        historyChart:null,
        staffChart:null,
        vehicleChart:null,
      }
    },
    created() {
      setTimeout(() => {
        this.loading = !this.loading
      }, 1000)
      this.initLogInfo();
      this.websocketInitIn();
      this.heartCheckInFunIn();
    },
    mounted() {
      let that=this;
      window.addEventListener( 'resize', function(){
        if(that.staffChart) {
          that.staffChart.resize()
        }
        if(that.vehicleChart) {
          that.vehicleChart.resize()
        }
        if(that.historyChart) {
          that.historyChart.resize()
        }
      }, false );
    },
    methods: {
      initLogInfo () {
        getLoginfo(null).then((res)=>{
          if(res.success){
            Object.keys(res.result).forEach(key=>{
              res.result[key] =res.result[key]+""
            })
            this.loginfo = res.result;
          }
        })
        getVisitInfo().then(res=>{
          if(res.success){
             this.visitInfo = res.result;
           }
         })
      },
      getCountHistoryChart(data){
        let chart=this.$refs.chartCountHistory;
        if(chart){
          if(!this.historyChart) {
            this.historyChart=this.$echarts.init(chart);
          }
          let option={
            tooltip: {
              trigger: 'axis',
              axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
              }
            },
            legend: {
              data: ['max', 'min']
            },
            xAxis: {
              type: 'category',
              data: data.name,
              axisTick: {
                alignWithLabel: true
              },
              axisLabel:{
                interval: 0,
                rotate:-30,
                color:'rgb(0,0,0)'
              }
            },
            yAxis: {
              type: 'value',
              axisLabel:{color:'rgb(0,0,0)'},
            },
            series: [{
              name:"max",
              data: data.max,
              type: 'line',
              smooth: true,
            },{
              name:"min",
              data: data.min,
              type: 'line',
              smooth: true,
            }]
          };
          this.historyChart.setOption(option);
        }
      },
      getVehicleAreaChart(data){
        let chart=this.$refs.chartVehicleArea;
        if(chart){
          if(!this.vehicleChart) {
            this.vehicleChart = this.$echarts.init(chart);
          }
          let name=[],value=[];
          for(let i=0;i<data.length;i++){
            name.push(data[i].name);
            value.push(data[i].value);
          }
          let option={
            color:["#1890FF"],
            tooltip: {
              trigger: 'axis',
              axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
              }
            },
            xAxis: {
              type: 'category',
              data: name,
              axisTick: {
                alignWithLabel: true
              },
              axisLabel:{
                interval: 0,
                rotate:-30,
              }

            },
            yAxis: {
              type: 'value',
              minInterval: 1
            },
            series: [{
              data: value,
              type: 'bar',
            }]
          };
          this.vehicleChart.setOption(option);
        }
      },
      getAreaStaffChart(data){
        let chart=this.$refs.chartStaffArea;
        if(chart){
          if(!this.staffChart){
            this.staffChart=this.$echarts.init(chart);
          }
          let name=[],value=[];
          for(let i=0;i<data.length;i++){
            name.push(data[i].name);
            value.push(data[i].value);
          }
          let option={
            color:["#1890FF"],
            tooltip: {
              trigger: 'axis',
              axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
              }
            },
            xAxis: {
              type: 'category',
              data: name,
              axisTick: {
                alignWithLabel: true
              },
              axisLabel:{
                interval: 0,
                rotate:-30,
              }
            },
            yAxis: {
              type: 'value',
              minInterval: 1
            },
            series: [{
              data: value,
              type: 'bar',
            }]
          };
          this.staffChart.setOption(option);
        }
      },
      websocketInitIn: function () {
        // 暂时恢复成1，后端调整完毕后改为-99
        let url = window._CONFIG['domianURL'].replace("https://","wss://").replace("http://","ws://")+"/websocket/shaqu/-99";
        // let url = 'ws://192.168.2.179:8080/websocket/shaqu/1';
        this.websock = new WebSocket(url);
        this.websock.onopen = this.websocketOnopen;
        this.websock.onerror = this.websocketOnerror;
        this.websock.onmessage = this.websocketOnmessage;
        this.websock.onclose = this.websocketOnclose;
      },
      websocketOnopen(){
        this.heartCheckIn.reset().start();
      },
      websocketSendIn() {
        try {
          this.websock.send();
        } catch (err) {
          console.log("send failed (" + err.code + ")");
        }
      },
      websocketOnmessage: function (e) {
        this.heartCheckIn.reset().start();
        let data =JSON.parse(e.data);
        if(data.requestUrl === "ts.show"){
          this.socketData=data;
          this.getAreaStaffChart(data.ts_staff);
          this.getVehicleAreaChart(data.ts_vehicle);
          this.getCountHistoryChart(data.ts_staff_charts)
        }
      },
      websocketOnclose: function (e) {
        console.log("connection closed (" + e.code + ")");
        this.reconnect();
      },
      websocketOnerror: function (e) {
        this.reconnect();
      },
      reconnect() {
        let that = this;
        if(this.lockReconnect) return;
        this.lockReconnect = true;
        setTimeout(function () {
          that.websocketSendIn();
          that.lockReconnect = false;
        }, 5000);
      },
      heartCheckInFunIn(){
        let that = this;
        this.heartCheckIn = {
          timeout: 20000,
          timeoutObj: null,
          serverTimeoutObj: null,
          reset: function(){
            clearTimeout(this.timeoutObj);
            clearTimeout(this.serverTimeoutObj);
            return this;
          },
          start: function(){
            let self = this;
            this.timeoutObj = setTimeout(function(){
              that.websocketSendIn("HeartBeat");
              self.serverTimeoutObj = setTimeout(function(){
                that.websock.close();
              }, self.timeout)
            }, this.timeout)
          }
        }
      },
      closeSocketConnect(){
        this.websock.close()
      },
    },
    destroyed() {
      this.closeSocketConnect()
    }
  }
</script>

<style lang="less" scoped>
  .circle-cust{
    position: relative;
    top: 28px;
    left: -100%;
  }
  .extra-wrapper {
    line-height: 55px;
    padding-right: 24px;

    .extra-item {
      display: inline-block;
      margin-right: 24px;

      a {
        margin-left: 24px;
      }
    }
  }

  /* 首页访问量统计 */
  .head-info {
    position: relative;
    text-align: left;
    padding: 0 32px 0 0;
    min-width: 125px;

    &.center {
      text-align: center;
      padding: 0 32px;
    }

    span {
      color: rgba(0, 0, 0, .45);
      display: inline-block;
      font-size: .95rem;
      line-height: 42px;
      margin-bottom: 4px;
    }
    p {
      line-height: 42px;
      margin: 0;
      a {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  }
  .chartContainer{
    width: 100%;
    min-height:350px
  }
</style>