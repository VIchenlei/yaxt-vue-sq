<template>
  <fullscreen :fullscreen.sync="fullscreen" >
    <div id="data-view"
         :style="{
            'transformOrigin':'center top',
            'transform':`scale(${scalseNum},${scalseNum})`,
            '-webkit-transform':`scale(${scalseNum},${scalseNum})`,
            '-moz-transform':`scale(${scalseNum},${scalseNum})`,
            '-o-transform':`scale(${scalseNum},${scalseNum})`,
            '-ms-transform':`scale(${scalseNum},${scalseNum})`,
            'position':'relative'
         }">
      <div id="Frame">
        <iframe width="100%" height="100%" src="https://www.thingjs.com/s/a3abc159484c6b6d8b3945af?params=105b0f77fd24654d4eebc434e9" frameborder="0"></iframe>
      </div>
      <a-row>
        <a-col :span="6" style="min-width: 300px;">
          <screenSubComponent :carCount='carCount' :staffCount='staffCount'></screenSubComponent>
        </a-col>
        <a-col :span="6" :offset="1" style="min-width: 300px;" @click="subMenuToggleFun">
          <ul class="optionList" style="display: flex;justify-content: space-around">
            <li>
              <span class="icon carOption" title="车辆"></span>
            </li>
            <li>
              <span class="icon manOption" title="人员"></span>
            </li>
            <li style="position: relative">
              <span id="fenzhanBtn">
                 <span class="icon coverageOption"></span><a-icon type="down" class="iconDown"/>
              </span>
              <a-menu v-show="fenZhanToggle" class="optionDialog" id="coverageMenu">
                  <a-menu-item key="0">
                    <span class="containerOfIcon">
                      <span class="iconSmall fenZhan"></span>
                    </span>
                    分站
                  </a-menu-item>
                  <a-menu-item key="1">
                    <span class="containerOfIcon">
                      <span style="display: inline-block;height: 19px;width: 22px" ></span>
                    </span>
                    分站路径
                  </a-menu-item>
                  <a-menu-item key="2">
                    <span class="containerOfIcon"><span class="iconSmall deadZone"></span></span>
                    盲区显示
                  </a-menu-item>
                  <a-menu-item key="3">
                    <span class="containerOfIcon"><span class="iconSmall camera"></span></span>
                    摄像头
                  </a-menu-item>
                  <a-menu-item key="4">
                    <span class="containerOfIcon"><span class="iconSmall lanMark"></span></span>
                    地标
                  </a-menu-item>
                  <a-menu-item key="5">
                    <span class="containerOfIcon"><span class="iconSmall allMap"></span></span>
                    全图
                  </a-menu-item>
                  <a-menu-item key="6">
                    <span class="containerOfIcon"><span class="iconSmall faultage"></span></span>
                    断层
                  </a-menu-item>
                  <a-menu-item key="7">
                    <span class="containerOfIcon"><span class="iconSmall manInArea"></span></span>
                    区域人员
                  </a-menu-item>
                </a-menu>

            </li>
            <li style="position: relative">
              <span id="searchBtn">
                 <span class="icon selectOption"></span>
                  <a-icon type="down" class="iconDown"/>
              </span>
              <a-menu v-show="searchToggle" class="optionDialog" id="searchMenu" style="width: 115px">
                  <a-menu-item key="0">
                    <span class="iconSmall reactFindCar"></span>矩形查车
                  </a-menu-item>
                  <a-menu-item key="1">
                    <span class="iconSmall circleFindCar"></span>圆形查车
                  </a-menu-item>
                  <a-menu-item key="2">
                    <span class="iconSmall polygonFindCar"></span>多边形查车
                  </a-menu-item>
                  <a-menu-item key="3">
                    <span class="iconSmall reactFindMan"></span>矩形查人
                  </a-menu-item>
                  <a-menu-item key="4">
                    <span class="iconSmall circleFindMan"></span>圆形查人
                  </a-menu-item>
                  <a-menu-item key="5">
                    <span class="iconSmall polygonFindMan"></span>多边形查人
                  </a-menu-item>
                </a-menu>
            </li>
            <li style="position: relative">
              <span id="measureBtn">
                 <span class="icon measureOption"></span>
                  <a-icon type="down" class="iconDown"/>
              </span>
              <a-menu v-show="measureToggle" class="optionDialog" id="measureMenu" style="width: 115px;">
                  <a-menu-item key="0">
                    <span class="iconSmall length"></span>长度
                  </a-menu-item>
                  <a-menu-item key="1">
                    <span class="iconSmall proportion"></span>面积
                  </a-menu-item>
                  <a-menu-item key="2">
                    <span class="iconSmall newArea"></span>新增区域
                  </a-menu-item>
                  <a-menu-item key="3">
                    <span class="iconSmall newLandMark"></span>新增地标
                  </a-menu-item>
                  <a-menu-item key="4">
                    <span class="iconSmall newDeadArea"></span>新增禁区
                  </a-menu-item>
                  <a-menu-item key="5">
                    <span class="iconSmall fenZhan"></span>新增分站
                  </a-menu-item>
                  <a-menu-item key="6">
                    <span style="display: inline-block;width: 22px;height: 19px"></span>新增采空点
                  </a-menu-item>
                  <a-menu-item key="7">
                    <span style="display: inline-block;width: 22px;height: 19px"></span>新增交点
                  </a-menu-item>
                  <a-menu-item key="8">
                    <span style="display: inline-block;width: 22px;height: 19px"></span>删除交点
                  </a-menu-item>
                </a-menu>
            </li>
            <li>
              <span class="icon coord" title="坐标"></span>
            </li>
            <li style="position: relative">
              <span id="areaBtn">
                 <span class="icon showAreaOption" title="显示区域"></span>
                  <a-icon type="down" class="iconDown"/>
              </span>
              <a-menu v-show="areaToggle" class="optionDialog" id="areaMenu" style="width: 90px;text-align: center;">
                  <a-menu-item key="0">
                    普通区域
                  </a-menu-item>
                  <a-menu-item key="1">
                    禁入区域
                  </a-menu-item>
                  <a-menu-item key="2">
                    猴车区域
                  </a-menu-item>
                  <a-menu-item key="3">
                    考勤区域
                  </a-menu-item>
                  <a-menu-item key="4">
                    特殊区域
                  </a-menu-item>
                  <a-menu-item key="5">
                    工作面区域
                  </a-menu-item>
                </a-menu>
            </li>
          </ul>
        </a-col>
        <a-col :span="8" :offset="1" style="min-width: 340px;position: relative" @click="subMenuToggleFun">
          <ul class="optionList" @click="optionChange" style="display: flex;justify-content: space-around">
            <li>
              <a-icon :class="showSelectInput?'iconSearchInfo iconSearchInfoActive':'iconSearchInfo'" type="search"  title="搜索人员、车辆、分站、地标"  @click="showSelectInput=!showSelectInput"/>
            </li>
            <li>
              <span class="icon warning" style='position: relative' title="告警">
                <mark class='warningNum'>10</mark>
              </span>
            </li>
            <li>
              <span class="icon cancelPosition" title="取消定位"></span>
            </li>
            <li>
              <span class="icon startCall" title="发起呼叫"></span>
            </li>
            <li>
              <span class="icon stopCall" title="停止呼叫"></span>
            </li>
            <li>
              <span class="icon upWell" title="手动升井"></span>
            </li>
            <li>
              <span class="icon evacuate" title="一键撤离"></span>
            </li>
            <li>
              <span class="icon manCountChart" title="人员数量历史曲线"></span>
            </li>
            <li>
              <span class="icon faultWarning" title="地质断层告警设置"></span>
            </li>
            <li>
              <span class="icon about" title="地质断层告警设置"></span>
            </li>
            <li>
              <span class='two-three'>2D/3D</span>
            </li>
            <li>
              <span class="icon fullScreen" title="全屏" @click="fullscreen=!fullscreen"></span>
            </li>
          </ul>
          <a-input-search placeholder="请输入人员、车辆、分站、地标信息" style="width: 200px;position: absolute;top:40px;left: 0"  v-show="showSelectInput"/>
        </a-col>
      </a-row>
      <a-col :span="6" :style='collapsed?{"width":"80px"}:""'>
          <dv-border-box-6  class="menuBox boxuncoll" v-show="!collapsed" :backgroundColor="'rgba(0,0,0,0.2)'">
            <h3 style="margin-top: 15px;padding-top: 15px;box-sizing: border-box;height: 39px">
              <span class="themeColor">
                <span v-if="activeTabIndex==1">车辆按区域分布</span>
                <span v-else-if="activeTabIndex==2">人员按部门分布</span>
                <span v-else-if="activeTabIndex==3">人员按区域分布</span>
                <span v-else-if="activeTabIndex==4">人员呼叫</span>
                <span v-else-if="activeTabIndex==5">呼救列表</span>
              </span>
            </h3>
            <aside class="menuContainer" @click="subMenuToggleFun">
              <a-icon class="collapseIcon" :type="'double-left'" @click="toggleCollapsed"/>
              <a-tabs default-active-key="1" tab-position="left" class="tabPane" @change="tabChange">
                <a-tab-pane key="1">
                  <span slot="tab">
                    <i :class="activeTabIndex==1?'activeCar icon':'car icon'" ></i>
                  </span>
                  <a-col :span="24">
                    <div>
                      <a-table :columns="columns" :data-source="data" class="infoTable" :pagination="false">
                        <a-table slot="expandedRowRender" slot-scope="record" :data-source='carDetail' :columns='carDetailColumn' :pagination="false" class='infoTable'>
                          <span slot='operation' slot-scope='operate'>
<!--                           <img src='../../assets/img/location.png' alt='' title='定位' class='imgBtn' style='margin-top: 0;'>-->
<!--                            <img src='../../assets/img/earth.png' alt='' class='imgBtn' title='跟踪' style='margin-top: 0'>-->
<!--                            <br>-->
<!--                            <img src='../../assets/img/track.png' alt='' title='历史轨迹' class='imgBtn'>-->
<!--                            <img src='../../assets/img/checkwork.png' alt='' title='考勤' class='imgBtn'>-->
                          </span>
                        </a-table>
                      </a-table>
                    </div>
                  </a-col>
                </a-tab-pane>
                <a-tab-pane key="2">
                  <span slot="tab">
                    <i :class="activeTabIndex==2?'activeMan icon':'man icon'" ></i>
                  </span>
                  <a-col :span="24">
                    <div>
                      <a-table :columns="columnSection" :data-source="data" class="infoTable" :pagination="false">
                        <a-table slot="expandedRowRender" slot-scope="record" :data-source='staffDetail' :columns='staffDetailColumn' :pagination="false" class='infoTable'>
                          <span slot='operation' slot-scope='operate'>
<!--                            <img src='../../assets/img/location.png' alt='' title='定位' class='imgBtn' style='margin-top: 0;margin-left: 15px;'>-->
<!--                            <img src='../../assets/img/earth.png' alt='' class='imgBtn' title='跟踪' style='margin-top: 0'>-->
<!--                            <br>-->
<!--                            <img src='../../assets/img/call.png' alt='' title='呼叫' class='imgBtn'>-->
<!--                            <img src='../../assets/img/track.png' alt='' title='历史轨迹' class='imgBtn'>-->
<!--                            <img src='../../assets/img/checkwork.png' alt='' title='考勤' class='imgBtn'>-->
                          </span>
                        </a-table>
                      </a-table>
                    </div>
                  </a-col>
                </a-tab-pane>
                <a-tab-pane key="3">
                   <span slot="tab">
                    <i :class="activeTabIndex==3?'activeManArea icon':'manArea icon'" ></i>
                  </span>
                  <a-col :span="24">
                    <div>
                      <a-table :columns="columnArea" :data-source="data" class="infoTable" :pagination="false">
                        <a-table slot="expandedRowRender" slot-scope="record" :data-source='staffDetail' :columns='staffDetailColumn' :pagination="false" class='infoTable'>
                          <span slot='operation' slot-scope='operate'>
<!--                            <img src='../../assets/img/location.png' alt='' title='定位' class='imgBtn' style='margin-top: 0;margin-left: 15px;'>-->
<!--                            <img src='../../assets/img/earth.png' alt='' class='imgBtn' title='跟踪' style='margin-top: 0'>-->
<!--                            <br>-->
<!--                            <img src='../../assets/img/call.png' alt='' title='呼叫' class='imgBtn'>-->
<!--                            <img src='../../assets/img/track.png' alt='' title='历史轨迹' class='imgBtn'>-->
<!--                            <img src='../../assets/img/checkwork.png' alt='' title='考勤' class='imgBtn'>-->
                          </span>
                        </a-table>
                      </a-table>
                    </div>
                  </a-col>
                </a-tab-pane>
                <a-tab-pane key="4">
                  <span slot="tab">
                    <i :class="activeTabIndex==4?'activeManCall icon':'manCall icon'" ></i>
                  </span>
                  <a-col :span="24">
                    <div>
                      <a-table :columns="columnManCall" :data-source="data" class="infoTable" :pagination="false"/>
                    </div>
                  </a-col>
                </a-tab-pane>
                <a-tab-pane key="5">
                  <span slot="tab">
                    <i :class="activeTabIndex==5?'activeCallList icon':'callList icon'" ></i>
                  </span>
                  <a-col :span="24">
                    <div>
                      <a-table :columns="columnCallList" :data-source="data" class="infoTable" :pagination="false"/>
                    </div>
                  </a-col>
                </a-tab-pane>
              </a-tabs>
            </aside>
          </dv-border-box-6>
          <dv-border-box-6  class="menuBox boxcoll" v-show="collapsed" :backgroundColor="'rgba(0,0,0,0.2)'">
            <h3 style="margin-top: 15px;padding-top: 15px;box-sizing: border-box;height: 39px">
            </h3>
            <aside class="menuContainer" @click="subMenuToggleFun">
              <a-icon class="collapseIcon" :type="'double-right'" @click="toggleCollapsed"/>
              <a-tabs default-active-key="1" tab-position="left" class="tabPane" @change="tabChange">
                <a-tab-pane key="1">
                  <span slot="tab">
                    <i :class="activeTabIndex==1?'activeCar icon':'car icon'" ></i>
                  </span>
                </a-tab-pane>
                <a-tab-pane key="2">
                  <span slot="tab">
                    <i :class="activeTabIndex==2?'activeMan icon':'man icon'" ></i>
                  </span>
                </a-tab-pane>
                <a-tab-pane key="3">
                   <span slot="tab">
                    <i :class="activeTabIndex==3?'activeManArea icon':'manArea icon'" ></i>
                  </span>
                </a-tab-pane>
                <a-tab-pane key="4">
                  <span slot="tab">
                    <i :class="activeTabIndex==4?'activeManCall icon':'manCall icon'" ></i>
                  </span>
                </a-tab-pane>
                <a-tab-pane key="5">
                  <span slot="tab">
                    <i :class="activeTabIndex==5?'activeCallList icon':'callList icon'" ></i>
                  </span>
                </a-tab-pane>
              </a-tabs>
            </aside>
          </dv-border-box-6>
      </a-col>
    </div>
  </fullscreen>
</template>

<script>
import { getAllStaff } from "@api/inbigscreen"
import store from '@/store/'
import screenSubComponent from '@views/jeecg/screenSubComponent'
export default {
  name: 'InsideBigScreen',
  components:{
    screenSubComponent
  },
  data(){
    return{
      collapsed:false,
      activeTabIndex:1,
      showSelectInput:false,
      fullscreen:false,
      fenZhanToggle:false,
      searchToggle:false,
      measureToggle:false,
      areaToggle:false,
      scalseNum:1,
      initHeight:document.documentElement.clientHeight,
      initWidth:document.documentElement.clientWidth,
      stopTimer:false,
      websock: null,
      lockReconnect:false,
      heartCheckIn:null,
      staffCount:0,
      carCount:0,
      carDetail:[
        {
          key: '1',
          name: '车辆1',
          driver: "李四",
          speed: '12',
        }
      ],
      staffDetail:[
        {
          key: '1',
          name: '王五',
          driver: "12-30 09:39:02",
          speed: '12',
        }
      ],
      carDetailColumn:[
        {
          title:"车辆名称",
          dataIndex:"name",
          align:'center',
          ellipsis:true
        },
        {
          title:"司机",
          dataIndex:"driver",
          align:'center',
          ellipsis:true
        },
        {
          title:"速度",
          dataIndex:"speed",
          align:'center',
          ellipsis:true
        },{
          title:"操作",
          align:'center',
          dataIndex:"operation",
          scopedSlots: { customRender: 'operation' }
        }
      ],
      staffDetailColumn:[
        {
          title:"姓名",
          dataIndex:"name",
          align:'center',
          ellipsis:true
        },
        {
          title:"入井时间",
          align:'center',
          dataIndex:"driver",
          ellipsis:true
        },
        {
          title:"操作",
          align:'center',
          dataIndex:"operation",
          scopedSlots: { customRender: 'operation' }
        }

      ],
      data:[
        {
          key: '1',
          name: '北辅',
          age: 2,
          address: 'New York No. 1 Lake Park',
        }, {
          key: '2',
          name: '北翼辅运巷',
          age: 5,
          address: 'New York No. 1 Lake Park',
        }, {
          key: '3',
          name: '换装站',
          age: 3,
          address: 'New York No. 1 Lake Park',
        },{
          key: '4',
          name: '胶轮车存放硐室',
          age: 1,
          address: 'New York No. 1 Lake Park',
        },{
          key: '5',
          name: '南翼辅运巷',
          age: 2,
          address: 'New York No. 1 Lake Park',
        },{
          key: '6',
          name: '西翼辅运巷',
          age: 4,
          address: 'New York No. 1 Lake Park',
        },{
          key: '7',
          name: 'W2307工作面',
          age: 2,
          address: 'New York No. 1 Lake Park',
        },{
          key: '8',
          name: 'W3305工作面',
          age: 1,
          address: 'New York No. 1 Lake Park',
        },{
          key: '9',
          name: '无轨胶轮车检修加油硐室',
          age: 1,
          address: 'New York No. 1 Lake Park',
        },
      ],
      columns: [
        {
          title: '区域',
          dataIndex: 'name',
          ellipsis:true

        },
        {
          title: '车辆',
          dataIndex: 'age',
          ellipsis:true

        }
      ],
      columnSection: [
        {
          title: '部门',
          dataIndex: 'name',
          ellipsis:true

        },
        {
          title: '人数',
          dataIndex: 'age',
          ellipsis:true

        }
      ],
      columnArea: [
        {
          title: '区域',
          dataIndex: 'name',
          ellipsis:true

        },
        {
          title: '人数',
          dataIndex: 'age',
          ellipsis:true

        }
      ],
      columnManCall: [
        {
          title: '发起人',
          dataIndex: 'name',
          ellipsis:true

        },
        {
          title: '呼叫人',
          dataIndex: 'age',
          ellipsis:true

        },
        {
          title: '发起时间',
          dataIndex: 'age',
          ellipsis:true

        },
        {
          title: '操作',
          dataIndex: 'age',
          ellipsis:true

        }
      ],
      columnCallList: [
        {
          title: '姓名',
          dataIndex: 'name',
          ellipsis:true
        },
        {
          title: '呼救时间',
          dataIndex: 'age',
          ellipsis:true
        },
        {
          title: '操作',
          dataIndex: 'age',
          ellipsis:true

        }
      ],
    }
  },
  created() {

  },
  mounted() {
    this.resize_window();
    window.addEventListener('resize', () => {
      this.resize_window();
    });
    this.websocketInitIn();
    this.heartCheckInFunIn();
  },
  methods:{
    toggleCollapsed(){
      this.collapsed=!this.collapsed
    },
    tabChange(key){
      this.activeTabIndex=key;
    },
    optionChange(key){
      console.log(key)
    },
    subMenuToggleFun(e){
      let elementCoverage=document.getElementById("coverageMenu");
      let fenBtn=document.getElementById("fenzhanBtn");
      if(elementCoverage){
        if(!elementCoverage.contains(e.target)&&!fenBtn.contains(e.target)){
          this.fenZhanToggle=false;
        }else if(!elementCoverage.contains(e.target)&&fenBtn.contains(e.target)){
          this.fenZhanToggle=!this.fenZhanToggle
        }else{
          this.fenZhanToggle=true
        }
      }
      let elementSearch=document.getElementById("searchMenu");
      let searchBtn=document.getElementById("searchBtn");
      if(elementSearch){
        if(!elementSearch.contains(e.target)&&!searchBtn.contains(e.target)){
          this.searchToggle=false;
        }else if(!elementSearch.contains(e.target)&&searchBtn.contains(e.target)){
          this.searchToggle=!this.searchToggle;
        }else{
          this.searchToggle=true
        }
      }
      let elementMeasure=document.getElementById("measureMenu");
      let measureBtn=document.getElementById("measureBtn");
      if(elementMeasure){
        if(!elementMeasure.contains(e.target)&&!measureBtn.contains(e.target)){
          this.measureToggle=false;
        }else if(!elementMeasure.contains(e.target)&&measureBtn.contains(e.target)){
          this.measureToggle=!this.measureToggle;
        }else{
          this.measureToggle=true
        }
      }
      let elementArea=document.getElementById("areaMenu");
      let areaBtn=document.getElementById("areaBtn");
      if(elementArea){
        if(!elementArea.contains(e.target)&&!areaBtn.contains(e.target)){
          this.areaToggle=false;
        }else if(!elementArea.contains(e.target)&&areaBtn.contains(e.target)){
          this.areaToggle=!this.areaToggle;
        }else{
          this.areaToggle=true
        }
      }
    },
    resize_window(){
      let w_height = Number(document.documentElement.clientHeight / this.initHeight);
      let w_width = Number(document.documentElement.clientWidth / this.initWidth);
      this.scalseNum = w_height>w_width?w_width:w_height;
    },
    closeDialog(){
      this.fenZhanToggle=false;
      this.searchToggle=false;
      this.measureToggle=false;
      this.areaToggle=false;
    },
    websocketInitIn: function () {
      var userId = store.getters.userInfo.id;
      var url = window._CONFIG['domianURL'].replace("https://","wss://").replace("http://","ws://")+"/websocket/"+userId;
      this.websock = new WebSocket(url);
      this.websock.onopen = this.websocketOnopen;
      this.websock.onerror = this.websocketOnerror;
      this.websock.onmessage = this.websocketOnmessage;
      this.websock.onclose = this.websocketOnclose;
    },
    websocketOnopen(){
      this.websocketSendIn('{"requestUrl":"position.card.totalInit"}');
      this.websocketSendIn('{"requestUrl":"position.card.total"}');
      this.heartCheckIn.reset().start();
    },
    websocketSendIn(text) {
      try {
        this.websock.send(text);
      } catch (err) {
        console.log("send failed (" + err.code + ")");
      }
    },
    websocketOnmessage: function (e) {
      this.heartCheckIn.reset().start();
      var data =JSON.parse(e.data);
      if(data.requestUrl=="position.card.totalInit"||data.requestUrl=="position.card.total"){
        this.staffCount=parseInt(data.result.staff);
        this.carCount=parseInt(data.result.vehicle);
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
      var that = this;
      if(that.lockReconnect) return;
      that.lockReconnect = true;
      setTimeout(function () {
        that.websocketSendIn();
        that.lockReconnect = false;
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
    }
  },
  destroyed() {
    this.closeSocketConnect()
  }
}
</script>

<style scoped>
  html,body,#app,main{
    height: 100%;
  }
  .themeColor{
    color:#71FcF4
  }
  #data-view{
    min-height:900px;
    padding: 20px;
    height: 100%;
  }
  #personCarCount{
    height:200px;
    color:#71FcF4;
  }
  h3{
    text-align: center;
    color:#fff
  }
  .menuBox{
    min-height: 580px;
    margin-top: 40px;
  }
  .boxcoll{
    width:80px;
  }
  .boxuncoll{
    width: 100%;
  }
  .person_car{
    height:80px;
    margin-top: 30px;
    line-height: 80px;
    text-align: center;
    font-size: 22px;
    font-weight: bold;
  }
  .menuContainer{
    padding: 0 20px 35px 5px;
    margin-bottom: 20px;
  }
  .collapseIcon{
    margin-bottom: 20px;
    margin-left: 27px;
    color:#fff;
    font-weight: bold;
    font-size: 20px;
  }
  .tabPane{
    color:#fff;
  }
  .menuContainer ::v-deep .ant-tabs-left-bar,::v-deep .ant-tabs-left-content{
    border: none!important;
  }
  .icon{
    display: inline-block;
    background-image: url("../../assets/img/icon.png");
    width: 25px;
    height: 25px;
  }
  .iconSmall{
    display: inline-block;
    background-image: url("../../assets/img/icon.png");
    width:21px;
    height:19px;
    position: relative;
    top:5px;
    margin-right: 1px;
  }
  .car{
    background-position-y:-46px ;
  }
  .activeCar{
    background-position-y:-71px ;
  }
  .man{
    background-position:-25px -44px;
  }
  .activeMan{
    background-position:-25px -69px;
  }
  .manArea{
    background-position:-50px -44px;
  }
  .activeManArea{
    background-position:-50px -69px;
  }
  .manCall{
    background-position:-148px -44px;
  }
  .activeManCall{
    background-position:-148px -69px;
  }
  .callList{
    background-position:-198px -44px;
  }
  .activeCallList{
    background-position:-198px -69px;
  }
  .carOption{
    background-position-y:-90px ;
    width:22px;
  }
  .carOption:hover{
    background-position-y:-112px ;
    position: relative;
    height: 20px;
    top:3px
  }
  .manOption{
    background-position:-17px -93px ;
    width:20px;
    height:22px;
    position: relative;
    top:3px;
  }
  .manOption:hover{
    background-position:-17px -112px ;
  }
  .coverageOption{
    background-position:-35px -93px ;
    width:20px;
    height:22px;
    position: relative;
    top:4px;
  }
  .coverageOption:hover{
    background-position:-35px -112px ;
  }
  .selectOption{
    background-position:-54px -93px ;
    width:20px;
    height:22px;
    position: relative;
    top:4px;
  }
  .selectOption:hover{
    background-position:-54px -112px ;

  }
  .iconDown{
    position: relative;
    bottom: 2px;
    color:#fff
  }
  .fenZhan{
    background-position-y:-132px ;
  }
  .deadZone{
    background-position-y:-165px ;
  }
  .camera{
    background-position:-35px -132px ;
  }
  .lanMark{
    background-position:-72px -132px ;
  }
  .allMap{
    background-position:-182px -132px ;
  }
  .faultage{
    background-position:-35px -165px ;
    top:4px
  }
  .manInArea{
    background-position:-203px -132px ;
  }
  .reactFindCar{
    background-position-y:-165px ;
  }
  .circleFindCar{
    background-position:-19px -165px ;
    width:19px;
    margin-right: 4px;
    left: 1px;
  }
  .polygonFindCar{
    background-position:-35px -165px ;
  }
  .reactFindMan{
    background-position:-54px -165px ;
  }
  .circleFindMan{
    background-position:-74px -165px ;
    width:19px;
    margin-right: 4px;
    left: 1px;
  }
  .polygonFindMan{
    background-position:-93px -165px ;
  }
  .measureOption{
    background-position:-74px -93px ;
    width:20px;
    height:22px;
    position: relative;
    top:4px;
  }
  .measureOption:hover{
    background-position:-74px -112px ;
  }
  .length{
    background-position-y:-198px ;
    margin-right: 0;
  }
  .proportion{
    background-position:-18px -198px ;
    width: 18px;
    margin-right: 4px;
  }
  .newArea{
    background-position:-35px -198px ;
  }
  .newLandMark{
    background-position:-54px -198px ;
  }
  .newDeadArea{
    background-position-y:-165px ;
  }
  .coord{
    background-position:-92px -96px ;
    width: 18px;
    height: 18px;
    margin-top:8px
  }
  .coord:hover{
    background-position:-92px -115px ;

  }
  .showAreaOption{
    background-position:-51px -131px ;
    height: 19px;
    margin-top: 6px;
  }
  .showAreaOption:hover{
    background-position:-51px -148px ;
  }
  .iconSearchInfo{
    color:#fff;
    font-size:21px;
    position: relative;
    top:6px;
    font-weight: bold
  }
  .iconSearchInfo:hover{
    color:#0099ff!important;
  }
  .iconSearchInfoActive{
    color:#0099ff!important;
  }
  .warning{
    height:20px;
    position: relative;
    top:6px;
    background-position-y:-2px
  }
  .warning:hover{
    background-position:-2px -23px ;
    top:6px;
  }
  .cancelPosition{
    background-position:-51px 5px ;

  }
  .cancelPosition:hover{
    background-position:-51px -21px ;
    position: relative;
    top:5px;
  }
  .startCall{
    background-position:-75px 5px ;
  }
  .startCall:hover{
    background-position:-75px -21px ;
    position: relative;
    top:5px;
  }
  .stopCall{
    background-position:-96px 5px ;
  }
  .stopCall:hover{
    background-position:-96px -21px ;
    position: relative;
    top:5px;
  }
  .upWell{
    background-position:-118px 4px ;
    position: relative;
    top:1px;
  }
  .upWell:hover{
    background-position:-118px -22px ;
    top:6px;
  }
  .evacuate{
    background-position:-138px 4px ;
    position: relative;
    top:1px
  }
  .evacuate:hover{
    background-position:-138px -23px ;
    position: relative;
    top:7px
  }
  .manCountChart{
    background-position:-162px 4px ;
    position: relative;
    top:1px
  }
  .manCountChart:hover{
    background-position:-162px -21px ;
    position: relative;
    top:5px
  }
  .faultWarning{
    background-position:-258px 4px ;
  }
  .faultWarning:hover{
    background-position:-258px -21px ;
    position: relative;
    top:4px
  }
  .about{
    background-position:-184px 4px ;
  }
  .about:hover{
    background-position:-184px -21px ;
    position: relative;
    top:4px
  }
  .fullScreen{
    background-position:-232px 4px ;
  }
  .fullScreen:hover{
    background-position:-232px -21px ;
    position: relative;
    top:4px
  }
  .infoTable{
    max-height: 450px;
    overflow: auto;
    /*width:297px*/
  }
  .infoTable ::v-deep table,.infoTable ::v-deep  th{
    color:#fff !important;
    background: transparent !important;
  }
  .infoTable ::v-deep tr:hover td{
    background: transparent !important;
  }
  ::v-deep .ant-table-thead > tr > th, ::v-deep .ant-table-tbody > tr > td{
    padding: 10px 0 !important;
  }
  ::v-deep .infoTable  .infoTable  .ant-table-thead > tr > th, ::v-deep .infoTable  .infoTable  .ant-table-tbody > tr > td{
    padding: 5px 0 !important;
  }
  .optionList{
    list-style: none;
    color:#fff;
    margin:0 0 20px 0;
    padding: 0;
    background: rgba(0,0,0,0.6);
    border-radius: 5px;
    box-shadow: 4px  4px  10px #fff;
    height: 35px;
  }
  .optionList>li{
    float: left;
    padding: 2px;
  }
  .optionList>li:hover{
    cursor: pointer;
  }
  ::v-deep .ant-dropdown-placement-bottomCenter{
    margin-top: 10px !important;
  }
  .optionDialog{
    border-radius: 5px;
    background: rgba(0,0,0,0.6);
    color:#fff;
    width: 110px;
    position: absolute;
    border: none;
    top:36px;
    left: -32px;
  }
  ::v-deep .ant-menu-item-selected{
    background: rgba(255,255,255,0.1) !important;
  }
  .containerOfIcon{
    display: inline-block;
    width: 25px;
    text-align: left;
  }
  .optionList>li li{
    width: 100% !important;
    padding: 0 10px;
  }
  #Frame{
    height: 100%;
    position: absolute;
    left:0;
    top:0;
    right:0;
    bottom: 0;
    z-index: -1;
  }
  @keyframes warningNUM
  {
    from {color: rgba(255,0,0,0.5);}
    to {color: red;}
  }

  @-moz-keyframes warningNUM
  {
    from {color: rgba(255,0,0,0.5);}
    to {color: red;}
  }

  @-webkit-keyframes warningNUM
  {
    from {color: rgba(255,0,0,0.5);}
    to {color: red;}
  }
  .warningNum{
    animation: warningNUM 0.8s infinite ease;
    -moz-animation: warningNUM 0.8s infinite ease;
    -webkit-animation: warningNUM 0.8s infinite ease;
    animation-direction:alternate;
    -webkit-animation-direction:alternate;
    -moz-animation-direction:alternate;
    position: absolute;
    color:red;
    left:18px;
    top:-8px;
    font-weight: 1000;
    font-size: 12px;
    outline: #fff;
    background: transparent;
  }
  ::v-deep tr.ant-table-expanded-row, ::v-deep tr.ant-table-expanded-row:hover{
    background: rgba(0,0,0,0.5);
  }
  ::v-deep .ant-table-row-expand-icon{
    color:black;
  }
  ::v-deep .ant-table-row-expand-icon-cell,::v-deep .ant-table-expand-icon-th{
    width: 25px;
  }
  ::v-deep .ant-table-expanded-row>td:last-child{
    padding: 16px !important;
  }
  ::v-deep .ant-tabs .ant-tabs-left-content{
    padding-left: 6px;
  }

  .imgBtn{
    width: 15px;
    height: 15px;
    margin: 5px 10px 0 0;
    border: 1px solid transparent;
    box-sizing: content-box;
  }
  .imgBtn:hover{
    cursor: pointer;
    width:17px;
    height:17px;
    border: none;
  }
  .two-three{
    position: relative;
    top: 5px
  }
  .two-three:hover{
    color:#0099ff
  }
</style>