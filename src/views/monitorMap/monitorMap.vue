<template>
  <div class="monitormapContainer" ref="container">
    <div id= "monitormap"></div>
    <alarm-list></alarm-list>
    <div class= "monitorHeader">
      <mapTopbar :defalutMapType="mapType"></mapTopbar>
      <operateList></operateList>
    </div>
    <monitorBody></monitorBody>
    <monitorFooter :websock="websock"></monitorFooter>
    <staffCurve></staffCurve>
    <mapModel></mapModel>
    <cardModel></cardModel>
    <tool-tips></tool-tips>
    <send-call></send-call>
    <detail-dialog></detail-dialog>
    <hand-upmine></hand-upmine>
    <busi-inspection-modal></busi-inspection-modal>
    <goaf-modal></goaf-modal>
    <trail-modal></trail-modal>
    <helpme-list></helpme-list>
  </div>
</template>

<script>

import operateList from '../../components/mapOperateList/operateList'
import AlarmList from './alarmList.vue'
import staffCurve from '../../components/staffCurve/staffCurve'
import mapModel from '../../components/mapModel/mapModel'
import cardModel from '../../components/cardModel/cardModel'
import mapTopbar from './mapTopbar'
import monitorBody from './monitorBody'
import monitorFooter from './monitorFooter'
import { getAllAlarm, getMapList, getReaderList, getHelpListReq } from '@/api/api';
import { dealMapDatas } from '../../store/map/mapUtils/OlMapUtils'
import ToolTips from '../toolTips/toolTips'
import SendCall from '../../components/sendCall/sendCall.vue'
import DetailDialog from './detailDialog.vue'
import HandUpmine from '../../components/handUpmine/handUpmine.vue'
import BusiInspectionModal from '../modules/inspection/BusiInspectionModal.vue'
import { mapState } from "vuex";
import GoafModal from '../modules/goaf/goafModal.vue'
import TrailModal from '../modules/trail/TrailModal.vue'
import HelpmeList from './helpmeList.vue'

export default {
  name: 'monitorMap',
  props: {

  },
  components: {
    operateList,
    staffCurve,
    mapModel,
    cardModel,
    mapTopbar,
    monitorBody,
    monitorFooter,
    AlarmList,
    ToolTips,
    SendCall,
    DetailDialog,
    HandUpmine,
    BusiInspectionModal,
    GoafModal,
    TrailModal,
    HelpmeList
  },
  data () {
    return {
      mapType: 'MONITOR',
      websock: null,
      lockReconnect:false,
      heartCheckIn:null,
      element: null
    }
  },
  computed: {
    ...mapState({
      mapID: state => state.mapService.mapID
    })
  },
  created () {

  },
  mounted () {
    this.resize_window();
    window.addEventListener('resize', () => {
      this.resize_window();
    });
    this.$store.commit('mapService/changeMapType',{mapType: this.mapType})
    this.createMap();
    this.websocketInitIn();
    this.heartCheckInFunIn();
    this.$store.commit('stateStore/changeAlarm',{type: true});
    this.$store.commit('helpStore/changeHelp',{type: true, rows: new Map()});
    this.getAllAlarmData();
    this.getHelpList();
    this.init()
  },
  methods: {
    init() {
      const element = this.$refs.container
      this.$store.commit('stateStore/changeMapContainer', {mapContainer: element})
    },
    websocketInitIn: function () {
      var userId = this.$store.getters.userInfo.id;
      // let wurl = 'http://124.193.200.138:60008';
      // var url = wurl.replace("https://","wss://").replace("http://","ws://")+"/websocket/"+userId;
      var url = window._CONFIG['domianURL'].replace("https://","wss://").replace("http://","ws://")+"/websocket/"+userId+`/${this.mapID}`;
      //  var url = window._CONFIG['domianURL'].replace("https://","wss://").replace("http://","ws://")+"/websocket/"+userId;
      this.websock = new WebSocket(url);
      this.websock.onopen = this.websocketOnopen;
      this.websock.onerror = this.websocketOnerror;
      this.websock.onmessage = this.websocketOnmessage;
      this.websock.onclose = this.websocketOnclose;
    },
    websocketOnopen(){
      this.heartCheckIn.reset().start();
    },
    websocketSendIn (text) {
      try {
        this.websock.send(text);
        this.lockReconnect = true;
      } catch (err) {
        console.log("send failed (" + err.code + ")");
      }
    },
    websocketOnmessage: function (e) {
      this.heartCheckIn.reset().start();
      let data = e.data && JSON.parse(e.data)
      if(data.requestUrl == "card.location"){
        this.$store.dispatch('cardStore/cardUpdatePos', data)
        // console.log('card.location', data)
      } else if (data.requestUrl == "hydraulic.support.status") {
        this.$store.dispatch('olMapHydraulic/updateStatus', data)
      } else if (data.requestUrl == "up.mine") {
        console.log('upmine', data)
        this.$store.dispatch('olMapCardLayer/removeCard', data)
      } else if (data.requestUrl == 'help.add') {
        console.log('help.add', data)
        this.$store.dispatch('helpStore/updateHelp', data.result);
      } else if (data.requestUrl == 'help.sub') {
        this.$store.dispatch('helpStore/removeHelp', data.result);
      } else if (data.requestUrl == "alert.total") {
        console.log('alert.total', data)
        this.$store.dispatch('alarmStore/updateAlarm', data)
      } else if (data.requestUrl == "alert.add") {
        // console.log('增量',data)
        this.$store.dispatch('alarmStore/addAlarm', data)
      } else if (data.requestUrl == "alert.remove") {
        // console.log('移出',data)
        this.$store.dispatch('alarmStore/removeAlarm', data)
      } else if (data.requestUrl == "reader.status") {
        // console.log('reader.status', data)
        if (!data.length) return;
        // getReaderList({mapID: this.mapID}).then((res) => {
        //   if (res.code === 200) {
        //     this.$store.dispatch('olMapReaderLayer/updateStates', {data: data.result, rows: res.result})
        //   }
        // })

      }
    },
    websocketOnclose: function (e) {
      console.log("connection closed (" + e.code + ")");
      if (e.code == 1006) {
        console.log('try connection server')
        this.websocketInitIn();
      } else {
        this.lockReconnect = false;
        this.reconnect();
      }
    },
    websocketOnerror: function (e) {
      console.log('websocket errorMsg',e)
      if (e.code === 1006) {
        this.websocketOnopen()
      } else {
        this.lockReconnect = false;
        this.reconnect();
      }
    },
    reconnect() {
      var that = this;
      if(that.lockReconnect) return;
      setTimeout(function () {
        that.websocketSendIn("HeartBeat");
      }, 5000);
    },
    heartCheckInFunIn(){
      var that = this;
      that.heartCheckIn = {
        timeout: 20000,
        timeoutObj: null,
        serverTimeoutObj: null,
        reset: function(){
          clearTimeout(this.timeoutObj);
          clearTimeout(this.serverTimeoutObj);
          return this;
        },
        start: function(){
          var self = this;
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
    resize_window(){
      let w_height = Number(document.documentElement.clientHeight / this.initHeight);
      let w_width = Number(document.documentElement.clientWidth / this.initWidth);
      this.scalseNum = w_height>w_width?w_width:w_height;
    },
    createMap(){
      /*加载地图*/
      getMapList().then((res) => {
        if(res.code === 200){
          let resData = res.result
          resData.forEach(item => {
            if (item.defaultMap == '1') {
              let data = dealMapDatas(item)
              this.$store.dispatch('mapService/initMap', data)
            }
          });
        }
      })
    },
    getAllAlarmData() {
      getAllAlarm().then((res) => {
        if (res.success) {
          this.$store.dispatch('alarmStore/updateAlarm', res);
        }
      })
    },
    getHelpList() {
      getHelpListReq().then((res) => {
        console.log('呼救',res)
        if (res.code === 200) {
          this.$store.dispatch('helpStore/updateHelp', res.result);
        }
      })
    }
  },
  watch: {
    '$store.state.mapService.mapID': {
      handler (result) {
        this.closeSocketConnect()
        this.websocketInitIn();
      },
      deep: true
    }
  },
  destroyed() {
    console.log('销毁页面')
    this.closeSocketConnect()
  }
}
</script>

<style lang="less">
  .monitormapContainer {
    position: relative;
    height: 100%;
    width: auto;
    object-fit: contain;
    position: fixed !important;
    top: 0px !important;
    right: 0px !important;
    bottom: 0px !important;
    left: 0px !important;
    box-sizing: border-box !important;
    min-width: 0px !important;
    max-width: none !important;
    min-height: 0px !important;
    max-height: none !important;
    width: 100% !important;
    height: 100% !important;
    transform: none !important;
    margin: 0px !important;
    z-index: 999!important;
    #monitormap{
      height: 100%;
      width: 100%;
      background: url('../../assets/img/bg.png') center center;
      background-size: cover;
      .ol-viewport{
        height: 100%;
        width: 100%;
      }
      .ol-overlaycontainer-stopevent{
        // visibility: hidden;
        position: relative;
        height: 0;
        .ol-zoom {
          position: absolute;
          top: -120px;
          right: 16px;
          .ol-zoom-in, .ol-zoom-out {
            min-width: 30px;
            position: absolute;
            right: -1.28px;
            top: -35.2px;
            width: 32px;
            height: 30px;
            color: #fff;
            background: rgba(255, 255, 255, 0.5);;
            border: none;
            cursor: pointer;
          }
          .ol-zoom-out {
            top: 50px
          }
        }
        .ol-zoom, .ol-control {
          bottom: 10px;
          background: none;
          right: 10px
        }
        .ol-attribution, .ol-zoomslider {
          display: none !important
        }
        .ol-rotate {
          position: absolute;
          top: -200px;
          height: 4px;
          bottom: 0 ;
          right: 10px;
          button {
            min-width: 32px;
            height: 32px;
            border-radius: 50%;
            width: 16px;
            background: rgba(255,255,255,.5);
            border: none;
            cursor: pointer;
          }
          img {
            width: 100%;
            height: auto;
          }
        }
      }
      .deletebox{
        position: relative;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 0 4px 2px 4px;
        opacity: 0.7;
        white-space: nowrap;
      }
      .deletebox-static{
        background-color: white;
        color: red;
        font-weight: bold;
        cursor: pointer;
      }
      .tooltip{
        position: relative;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        opacity: 0.7;
        white-space: nowrap;
      }
      .tooltip-static{
        background: white;
        color: black;
        border: 1px solid #0099ff;
        &:before{
          border-top: 6px solid rgba(0, 0, 0, 0.5);
          border-top-color: #ffcc33;
          border-right: 6px solid transparent;
          border-left: 6px solid transparent;
          content: "";
          position: absolute;
          bottom: -6px;
          margin-left: -7px;
          left: 50%;
        }
      }
      .ol-mouse-position{
        position: absolute;
        right: 180px;
        bottom: 10px;
        z-index: 999;
        color: cornsilk;
      }
    }
    .monitorHeader{
      width: 100%;
      display: flex;
      position: absolute;
      left: 50%;
      color: #fff;
      top: 20px;
      z-index: auto;
      transform: translateX(-50%);
      justify-content: center;
      .icons-list {
        margin: 0 3rem;
      }
      .mapTopbar {
        // flex: 1.5;
      }
    }
    #css_animation, #css_animation_alarm{
      width: 50px;
      height:50px;
      border-radius: 25px;
      transform: scale(0);
      animation: myfirst 3s;
      animation-iteration-count: infinite;
    }
    #css_animation{
      background-color: rgba(255, 255, 255, 0.9);
    }
    #css_animation_alarm{
      background-color: rgba(255, 0, 0, 0.9);
    }
    @keyframes myfirst{
      to{
        transform: scale(2);
        background-color: rgba(0, 0, 0, 0);
      }
    }
  }


</style>
