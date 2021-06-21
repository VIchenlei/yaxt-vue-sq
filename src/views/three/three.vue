<template>
  <div id="threeContainer">
    <h1 class='threeTitle'>沙曲2号矿实时监控大屏</h1>
    <div class='threeTitle' style='top:3.5rem'>
      <a-input-search placeholder="请输入卡号" style="width: 200px;" v-model='searchId' @search="onSearch" />
    </div>
    <a-icon type="double-right" style="left:30px;top:20px;position: absolute;z-index:99999;color:#fff;font-size :1.5em;cursor: pointer"  @click='leftToggle' :rotate='leftRo'/>
    <a-icon type="double-left" style="right:30px;top:20px;position: absolute;z-index:99999;color:#fff;font-size :1.5em;cursor: pointer"  @click='rightToggle' :rotate='rightRo'/>
    <div class="chartList" style="left:10px;top:10px" v-show='leftTable' >
      <dv-decoration-7>&nbsp;&nbsp;人员按区域分布&nbsp;&nbsp;</dv-decoration-7>
      <div ref="chartStaffArea" class="chartContainer"></div>
    </div>
    <div class="chartList" style="right:10px;top:10px" v-show='rightTable'>
      <dv-decoration-7>&nbsp;&nbsp;车辆按区域分布&nbsp;&nbsp;</dv-decoration-7>
      <div ref="chartVehicleArea" class="chartContainer"></div>
    </div>
    <div class="chartList" style="top:35%;left:10px;padding-left: 1rem" v-show='leftTable'>
      <dv-decoration-7>&nbsp;&nbsp;人员下井历史曲线&nbsp;&nbsp;</dv-decoration-7>
      <div ref="chartCountHistory" class="chartContainer" style='height: 100%;margin-top:0.5rem'></div>
    </div>
    <div class="chartList" style="top:35%;right:10px" v-show='rightTable'>
      <dv-decoration-7 style="margin-bottom: 1.5rem">&nbsp;&nbsp;告警列表&nbsp;&nbsp;</dv-decoration-7>
      <ul style="margin-bottom: 10px;color:#61d2f7" v-if='alertData.length>0'>
        <li>
          <span class="listItem" style="width: 35%;">告警类型</span>
          <span class="listItem" style="width: 20%;">编号</span>
          <span class="listItem" style="width: 40%;">告警开始时间</span>
        </li>
      </ul>
      <vue-seamless-scroll v-if='alertData.length>0' :data="alertData" class="seamless-warp"  :class-option="classOption">
        <ul>
          <li class="Carousel_li" v-for="(item,index) in alertData" :key="index">
            <span class="listItem" style="width: 35%;">{{item.typeName}}</span>
            <span class="listItem" style="width: 20%;">{{item.ident}}</span>
            <span class="listItem" style="width: 40%;">{{item.startTime}}</span>
          </li>
        </ul>
      </vue-seamless-scroll>
      <p v-if='alertData.length===0' class='haveNoData'>
        暂无数据
      </p>
    </div>
    <div class="chartList" style="top:69%;left:10px" v-show='leftTable'>
      <dv-decoration-7 style="margin-bottom: 1.5rem">&nbsp;&nbsp;人员呼叫&nbsp;&nbsp;</dv-decoration-7>
      <ul style="margin-bottom: 10px;color:#61d2f7" v-if="callData.length>0">
        <li>
          <span class="listItem" style="width: 35%;">发起人</span>
          <span class="listItem" style="width: 20%;">呼叫人</span>
          <span class="listItem" style="width: 40%;">呼叫时间</span>
        </li>
      </ul>
      <vue-seamless-scroll v-if="callData.length>0" :data="callData" class="seamless-warp"  :class-option="classOption">
        <ul>
          <li class="Carousel_li" v-for="(item,index) in callData" :key="index">
            <span class="listItem" style="width: 35%;">{{item.sendName}}</span>
            <span class="listItem" style="width: 20%;">{{item.receiveName}}</span>
            <span class="listItem" style="width: 40%;">{{item.sendTime}}</span>
          </li>
        </ul>
      </vue-seamless-scroll>
      <p v-if='callData.length===0' class='haveNoData'>
        暂无数据
      </p>
    </div>
    <div class="chartList" style="top:69%;right:10px" v-show='rightTable'>
      <dv-decoration-7 style="margin-bottom: 1.5rem">&nbsp;&nbsp;呼救列表&nbsp;&nbsp;</dv-decoration-7>
      <ul style="margin-bottom: 10px;color:#61d2f7" v-if='helpData.length>0'>
        <li>
          <span class="listItem" style="width: 40%;">姓名</span>
          <span class="listItem" style="width: 55%;">呼救时间</span>
        </li>
      </ul>
      <vue-seamless-scroll v-if="helpData.length>0" :data="helpData" class="seamless-warp"  :class-option="classOption">
        <ul>
          <li class="Carousel_li" v-for="(item,index) in helpData" :key="index">
            <span class="listItem" style="width: 40%;">{{item.sendName}}</span>
            <span class="listItem" style="width: 55%;">{{item.sendTime}}</span>
          </li>
        </ul>
      </vue-seamless-scroll>
      <p v-if='helpData.length===0' class='haveNoData'>
        暂无数据
      </p>
    </div>
    <div id="info" v-show="showAnchor" :style="{left:anchorX+30+'px',top:anchorY-100+'px'}">
      <div id="dragger">
        <span>信息卡</span>
        <span id="closeUIAnchor" @click="closeAnchor($event)">&times;</span>
      </div>
      <div style="overflow: hidden;padding: 15px">
        <h3>基本信息</h3>
        <ul class="primInfo" v-if="anchorType==='staff'">
          <li>
            卡号：{{ cardDetail?cardDetail.ident:null }}
          </li>
          <li>
            工号：{{ cardDetail?cardDetail.code:null }}
          </li>
          <li>
            姓名：{{ cardDetail?cardDetail.name:null }}
          </li>
          <li>
            性别：{{ cardDetail?cardDetail.sex:null }}
          </li>
          <li>
            部门：{{ cardDetail?cardDetail.deptName:null }}
          </li>
          <li>
            职务：{{ cardDetail?cardDetail.post:null }}
          </li>
          <li>
            工种：{{ cardDetail?cardDetail.workTypeName:null }}
          </li>
        </ul>
        <ul class="primInfo" v-if="anchorType==='vehicle'">
          <li>
            卡号：{{ cardDetail?cardDetail.ident:null }}
          </li>
          <li>
            车牌：{{ cardDetail?cardDetail.name:""}}
          </li>
          <li>
            类型：{{ cardDetail?cardDetail.type:null }}
          </li>
          <li>
            部门：{{ cardDetail?cardDetail.deptName:null }}
          </li>
        </ul>
        <img id="staffHead" :src="staffHead" alt="">
      </div>
      <div id="stateContainer">
        <h3>当前状态</h3>
        <ul  v-if="anchorType==='staff'">
          <li>
            下井：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.startTime:null }}
          </li>
          <li>
            时长：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.workTime:null }}
          </li>
          <li>
            电量：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.power:null }}
          </li>
          <li>
            状态：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.stayFlag:null }}
          </li>
          <li>
            时间：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.currentTime:null }}
          </li>
          <li>
            位置：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.position:null }}
          </li>
          <li>
            东经：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.x:null }}
          </li>
          <li>
            北纬：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.y:null }}
          </li>
          <li>
            海拔：{{ cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.z:null }}
          </li>
        </ul>
        <ul v-if="anchorType==='vehicle'">
          <li>
            出车：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.startTime?cardDetail.currentStatusDto.startTime:""}}
          </li>
          <li>
            时长：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.workTime?cardDetail.currentStatusDto.workTime:""}}
          </li>
          <li>
            司机：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.driverName?cardDetail.currentStatusDto.driverName:""}}
          </li>
          <li>
            速度：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.speed?cardDetail.currentStatusDto.speed:""}}
          </li>
          <li>
            电量：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.power?cardDetail.currentStatusDto.power:""}}
          </li>
          <li>
            状态：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.stayFlag?cardDetail.currentStatusDto.stayFlag:""}}
          </li>
          <li>
            时间：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.currentTime?cardDetail.currentStatusDto.currentTime:""}}
          </li>
          <li>
            位置：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.position?cardDetail.currentStatusDto.position:""}}
          </li>
          <li>
            东经：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.x?cardDetail.currentStatusDto.x:""}}
          </li>
          <li>
            北纬：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.y?cardDetail.currentStatusDto.y:""}}
          </li>
          <li>
            海拔：{{ cardDetail.currentStatusDto&&cardDetail.currentStatusDto.y?cardDetail.currentStatusDto.z:""}}
          </li>
        </ul>
      </div>
      <div id="anchorFooter">
        <ul style='margin-bottom: 10px;'>
          <li>
            <img :src="locationNameArr.indexOf(activeCardName)!==-1?locatingImg:locationImg" alt="" title="定位" @click="locationModel()">
          </li>
          <li>
            <img id="staffFollow" alt="" title="跟踪" :src='isFollow?earthingImg:earthImg' @click="follow()">
          </li>
          <li>
            <img id="historyPath" alt="" title="历史轨迹" :src='isHistory?historyActiveImg:historyImg' @click="historyPath">
          </li>
        </ul>
        <a-range-picker
          :show-time="{
            defaultValue: [moment('00:00:00', 'HH:mm'), moment('11:59:59', 'HH:mm:ss')],
          }"
          v-show='showPicker'
          @ok='queryPath'
          ormat="YYYY-MM-DD HH:mm:ss"
          :getPopupContainer="getCalendarContainer()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { getSVByCardId ,getTrackList } from '@api/api'
import moment from 'moment'
import $ from 'jquery'
export default {
  name: 'three',
  data () {
    return {
      searchId:null,
      showPicker:false,
      showAnchor:false,
      anchorType:null,
      anchorX:null,
      anchorY:null,
      locationImg:require("@assets/img/location.png"),
      locatingImg:require("@assets/img/locating.png"),
      earthImg:require("@assets/img/earth.png"),
      earthingImg:require("@assets/img/earthing.png"),
      activeCardName:null,
      scene:null,
      camera:null,
      renderer:null,
      buildings:null,
      cardArr:[],
      locationNameArr:[],
      locationModel:null,
      isFollow:false,
      followCardName:null,
      websock: null,
      lockReconnect:false,
      heartCheckIn:null,
      preData:[],
      preIds:[],
      initCard:null,
      oldPosition:{},
      newPosition:{},
      alertData:[],
      callData:[],
      helpData:[],
      cardDetail:null,
      staffHead:null,
      renderTimes:0,
      staffModel:null,
      carModel:null,
      historyChart:null,
      staffChart:null,
      yyzjModel:null,
      machineGroup:null,
      yyzjY:null,
      gmjModel:null,
      vehicleChart:null,
      skyBox:[require("@assets/imgThreejs/fronted.png"), require("@assets/imgThreejs/back.png"),require("@assets/imgThreejs/top.png"),
        require("@assets/imgThreejs/bottom.png"),require("@assets/imgThreejs/left.png"),require("@assets/imgThreejs/right.png")],
      startLabel:require("@assets/imgThreejs/startPoint.png"),
      endLabel:require("@assets/imgThreejs/endPoint.png"),
      followPoints:[],
      historyImg:require("@assets/imgThreejs/history.png"),
      historyActiveImg:require("@assets/imgThreejs/historyactive.png"),
      isHistory:false,
      historyCardName:null,
      historyPoints:[],
      onSearch:null,
      leftTable:true,
      rightTable:true,
      leftRo:0,
      rightRo:0,
    }
  },
  mounted() {
    let that=this;
    this.websocketInitIn();
    this.heartCheckInFunIn();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 5, 200000);
    this.camera.position.set(-456, -200, 2400);
    // this.camera.position.set(0, 500, 0);
    this.camera.lookAt(-456, -334, 1749);
    let point = new THREE.PointLight(0xffffff);
    point.position.set(0, 5000, 0);
    let ambient = new THREE.AmbientLight(0xffffff);

    this.scene = new THREE.Scene();
    this.scene.add(point);
    this.scene.add(ambient);

    // this.renderer = new THREE.WebGLRenderer();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      precision: "highp", //着色器的精度。可以是"highp", "mediump" 或 "lowp". 默认为"highp"，如果设备支持的话。
      logarithmicDepthBuffer: false,
      // alpha:true
    });
    // this.renderer.setClearAlpha(0.1);
    // let axisHelper = new THREE.AxisHelper(50);
    // that.scene.add(axisHelper);

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.setAttribute("minHeight", "880px")
    $("#threeContainer").append(this.renderer.domElement);

    let controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.listenToKeyEvents( window ); // optional
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.5;
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 10000;
    controls.maxPolarAngle = Math.PI/2 ;

    let skyGeometry = new THREE.BoxGeometry(200000, 200000, 200000);
    let materialArray = [];
    for (let i = 0; i < 6; i++) {
      materialArray.push(new THREE.MeshBasicMaterial({
          map: THREE.ImageUtils.loadTexture(this.skyBox[i]),
          side: THREE.BackSide
        }
      ));
    }
    let skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    let skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(skyBox);

    let mtlLoader = new MTLLoader();
    mtlLoader.load('../../../shaqu/shaqu.mtl', (material) => {
      let objLoader = new OBJLoader();
      objLoader.setMaterials(material);
      objLoader.load('../../../shaqu/shaqu.obj', (obj3D) => {
        /*let group=new THREE.Group();
         for(let k in obj3D.children){
           if(obj3D.children[k].name=="Text003"){
             group.add(obj3D.children[k])
           }
         }*/
        this.buildings = obj3D;

        this.buildings.name="buildings";
        this.buildings.position.set(0,0,0)
        this.buildings.rotateY(Math.PI/3.438067)
        this.scene.add(this.buildings);
      });
    });

    let loader = new GLTFLoader().setPath("../../../machine/");
    loader.load("gmj.gltf", function(gltf) {
      gltf.scene.traverse( function ( child ) {
        if ( child.isMesh ) {
          child.material.emissive =  child.material.color;
          child.material.emissiveMap = child.material.map ;
        }
      });
      that.gmjModel=gltf;
    });
    let staffMtlUrl = '../../../orangeWorker/staff.mtl',
      staffObjUrl = '../../../orangeWorker/staff.obj';
    mtlLoader.load(staffMtlUrl, (material) => {
      let cardLoader = new OBJLoader();
      cardLoader.setMaterials(material);
      cardLoader.load(staffObjUrl, (card3D) => {
        that.staffModel = card3D.children[0];
        // let a = card3D.children[0];
        // a.position.set(207.67319475074765, -227.3016588267935, -241.99880725834083);
        // a.scale.set(2,2,2);
        // that.scene.add(a)
      });
    });
    let carMtlUrl = '../../../carModel/pk.mtl',
      carObjUrl = '../../../carModel/pk.obj';
    mtlLoader.load(carMtlUrl, (material) => {
      let cardLoader = new OBJLoader();
      cardLoader.setMaterials(material);
      cardLoader.load(carObjUrl, (card3D) => {
        that.carModel = card3D.children[0];
      });
    });
    mtlLoader.load('../../../W4304/yyzj.mtl', (material) => {
      let objLoader = new OBJLoader();
      objLoader.setMaterials(material);
      objLoader.load('../../../W4304/yyzj.obj', (obj3D) => {
        that.yyzjModel=obj3D;
        that.yyzjModel.rotateY(Math.PI/3.438067);
      });
    });
    mtlLoader.load('../../../machine/guaban.mtl', (material) => {
      let objLoader = new OBJLoader();
      objLoader.setMaterials(material);
      objLoader.load('../../../machine/guaban.obj', (obj3D) => {
        obj3D.name="machineGroup";
        obj3D.rotateY(Math.PI/3.438067);
        this.machineGroup=obj3D;
      });
    });
    this.onSearch=function(){
      if(!that.searchId || (!that.staffModel&&!that.carModel)) return  false;
      let target=that.scene.getObjectByName(parseInt(that.searchId));
      console.log(target)
      that.camera.position.set(target.position.x+50,target.position.y+50,target.position.z+50)
      controls.target=new THREE.Vector3(target.position.x,target.position.y,target.position.z);
    }
    let mixers=[];
    let clock=new THREE.Clock();
    this.initCard=function(cardInfo,type) {
      if(type===1) {
        if (!that.scene.getObjectByName(cardInfo.ident) && that.staffModel) {
          that.cardArr.push(that.staffModel.clone());
          // if(cardInfo.areaId!=="1386206980825157634") that.cardArr[that.cardArr.length - 1].scale.set(2,2,2);
          that.cardArr[that.cardArr.length - 1].name = cardInfo.ident;
          that.cardArr[that.cardArr.length - 1].cardType = type;
          that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x*2-759.452,cardInfo.z*2, -cardInfo.y*2+ 861.07);
          that.scene.add(that.cardArr[that.cardArr.length - 1]);
          that.oldPosition["cardArr" + cardInfo.ident] = {
            x: that.cardArr[that.cardArr.length - 1].position.x,
            y: that.cardArr[that.cardArr.length - 1].position.y,
            z: that.cardArr[that.cardArr.length - 1].position.z
          };
        }
      }else if(type===2){
        if (!that.scene.getObjectByName(cardInfo.ident))  {
          if(cardInfo.color==="cmjON" && that.gmjModel){
            mixers["gmj"]  = new THREE.AnimationMixer( that.gmjModel.scene );
            for (let i=0;i<that.gmjModel.animations.length;i++){
              mixers["gmj"].clipAction(that.gmjModel.animations[i]).play();
            }
            that.cardArr.push(that.gmjModel.scene);
            that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x * 2 - 759.452, cardInfo.z*2, -cardInfo.y * 2 + 861.07-0.15);
            that.cardArr[that.cardArr.length - 1].name = cardInfo.ident;
            that.cardArr[that.cardArr.length - 1].color = "cmjON";
            that.cardArr[that.cardArr.length - 1].cardType = type;
            that.scene.add(that.cardArr[that.cardArr.length - 1]);
            that.oldPosition["cardArr" + cardInfo.ident] = {
              x: that.cardArr[that.cardArr.length - 1].position.x,
              y: that.cardArr[that.cardArr.length - 1].position.y,
              z: that.cardArr[that.cardArr.length - 1].position.z
            };

          }else if(cardInfo.color!=="cmjON" && that.carModel){
            that.cardArr.push(that.carModel.clone());
            that.cardArr[that.cardArr.length - 1].rotation.y=cardInfo.bearing-Math.PI/3.438067;
            that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x*2-759.452 ,cardInfo.z*2-0.5, -cardInfo.y*2+ 861.07);
            that.cardArr[that.cardArr.length - 1].name = cardInfo.ident;
            that.cardArr[that.cardArr.length - 1].scale.set(0.8,0.8,0.8);
            that.cardArr[that.cardArr.length - 1].cardType = type;
            that.scene.add(that.cardArr[that.cardArr.length - 1]);
            that.oldPosition["cardArr" + cardInfo.ident] = {
              x: that.cardArr[that.cardArr.length - 1].position.x,
              y: that.cardArr[that.cardArr.length - 1].position.y,
              z: that.cardArr[that.cardArr.length - 1].position.z
            };
          }

        }
      }else if(type===3){
        if (!that.scene.getObjectByName("yyzj")&&that.yyzjModel&&that.machineGroup) {
          that.cardArr.push(that.yyzjModel.clone());
          // cardInfo.x=461.3+(1.345 +0.266669)*0;
          // cardInfo.y=446.0-(0.266669+1.3452)*0;
          cardInfo.x=cardInfo.loc.x+(1.345)*1.4;
          cardInfo.y=cardInfo.loc.y-(0.266669)*1.4-0.1;
          that.cardArr[that.cardArr.length - 1].name = "yyzj";
          that.cardArr[that.cardArr.length - 1].cardType = type;
          that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x*2-759.452,cardInfo.z*2, -cardInfo.y*2+ 861.07);
          that.scene.add(that.cardArr[that.cardArr.length - 1]);
          that.oldPosition["cardArryyzj"] = {
            x: that.cardArr[that.cardArr.length - 1].position.x,
            y: -227,
            z: that.cardArr[that.cardArr.length - 1].position.z
          };
          for(let i =1;i<149;i++){
            let zjClone=that.yyzjModel.clone();
            zjClone.name="zj"+(i+1);
            zjClone.position.set(that.cardArr[that.cardArr.length - 1].position.x+1.45605*(i-1),cardInfo.z*2,that.cardArr[that.cardArr.length - 1].position.z+0.29067*(i-1));
            that.scene.add(zjClone);
          }
          that.machineGroup.position.set(cardInfo.x*2-759.452-1.345*4.6,cardInfo.z*2,-cardInfo.y*2+ 861.07-0.266669*4.6);
          that.scene.add(that.machineGroup);

        }
      }
    }
    let raycaster = new THREE.Raycaster()
    let mouse = new THREE.Vector2(1,1);
    function onClick( event ) {
      if(event.target.tagName==="CANVAS") {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, that.camera);
        //获取点击模型，弹出信息框
        let surface=[];
        that.scene.traverse(function(obj) {
          if (obj.type === "Group") {
            surface = obj.children;
          }
        })
        let routeIntersects= raycaster.intersectObjects(surface);
        if (routeIntersects.length > 0) {
          let selected = routeIntersects[0];
          let  pointX=selected.point.x,
              pointZ=selected.point.z;
              if(pointX>150&&pointX<220&&pointZ>313&&pointZ<482){
              let arr=window.location.href.split("three");
              window.open(arr[0]+"three/workSurface")
            }
        }

        let intersects = raycaster.intersectObjects(that.cardArr);
        if (intersects[0]&&intersects[0].object&&intersects[0].object.type==="Mesh") {
          that.showAnchor = true;
          that.anchorX = event.clientX;
          that.anchorY = event.clientY;
          if(that.anchorY<=100) that.anchorY=100;
          if(that.anchorX<=30) that.anchorX=30;
          that.activeCardName=intersects[0].object.name;
          if(that.followCardName!==that.activeCardName) {
            that.isFollow=false;
          }else{
            that.isFollow=true;
          }
          if(that.historyCardName!==that.activeCardName){
            that.isHistory=false;
          }else{
            that.isHistory=true;
          }
          if(intersects[0].object.cardType===1){
            that.anchorType="staff";
            for(let k in that.preData.staff){
              if(that.preData.staff[k].ident===that.activeCardName){
                that.cardDetail=that.preData.staff[k];
                getSVByCardId({ident:that.activeCardName,type:"staff"}).then((response)=>{
                  if(response.success===true) that.cardDetail = response.result;
                  if (that.cardDetail.pic === "/") {
                    that.staffHead = require(`../../assets/img/worker_default.jpg`);
                  } else {
                    // that.staffHead  = `http://124.193.200.138:60023${that.cardDetail.pic}`
                    that.staffHead  = `${window.location.origin}${that.cardDetail.pic}`
                  }
                })
              }
            }
          }else{
            that.anchorType="vehicle";
            for(let k in that.preData.vehicle){
              if(that.preData.vehicle[k].ident===that.activeCardName){
                that.cardDetail=that.preData.vehicle[k];
                getSVByCardId({ident:that.activeCardName,type:"vehicle"}).then((response)=>{
                  if(response.success===true) that.cardDetail = response.result;
                })
              }
            }
          }
        }
      }
    }



    this.locationModel=function(){
      if(that.locationNameArr.indexOf(that.activeCardName)!==-1){
        that.scene.remove(that.scene.getObjectByName("follow"+that.activeCardName));
        that.locationNameArr.splice(that.locationNameArr.indexOf(that.activeCardName),1);
      }else {
        let targetPosition = that.scene.getObjectByName(that.activeCardName);
        let circle = that.scatterCircle(2, 0.2, 0.6, new THREE.Vector3(2, 2, 2), 0.05);
        circle.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
        circle.rotation.x += Math.PI / 2;
        circle.rotation.z += Math.PI / 2;
        that.locationNameArr.push(that.activeCardName);
        circle.name = "follow" + that.activeCardName;
        that.scene.add(circle);
      }
    }

    function render(){
      let delta=clock.getDelta();
      for (let k in mixers) {
        mixers[k].update(delta)
      }
      let beforeFollowPosition;
      if(that.followCardName) {
        beforeFollowPosition = that.scene.getObjectByName(that.followCardName).position;
      }
      if (that.cardArr&& that.newPosition&& that.oldPosition) {
        for(let key in that.cardArr){
          if(that.newPosition["cardArr" + that.cardArr[key].name]&&that.oldPosition["cardArr" + that.cardArr[key].name]) {
            if(that.renderTimes<60){
              that.cardArr[key].position.x += (that.newPosition["cardArr" + that.cardArr[key].name].x - that.oldPosition["cardArr" + that.cardArr[key].name].x) / 60;
              that.cardArr[key].position.z += (that.newPosition["cardArr" + that.cardArr[key].name].z - that.oldPosition["cardArr" + that.cardArr[key].name].z) / 60;
              that.cardArr[key].position.y += (that.newPosition["cardArr" + that.cardArr[key].name].y - that.oldPosition["cardArr" + that.cardArr[key].name].y) / 60;

            }else if(that.renderTimes===60){
              that.cardArr[key].position.x=that.newPosition["cardArr" + that.cardArr[key].name].x;
              that.cardArr[key].position.z=that.newPosition["cardArr" + that.cardArr[key].name].z;
              that.cardArr[key].position.y=that.newPosition["cardArr" + that.cardArr[key].name].y;
            }
            let rotateY = that.newPosition["cardArr" + that.cardArr[key].name].x - that.oldPosition["cardArr" + that.cardArr[key].name].x,
              rotateX = that.newPosition["cardArr" + that.cardArr[key].name].z - that.oldPosition["cardArr" + that.cardArr[key].name].z;
            if (that.cardArr[key].name !== "yyzj" && that.cardArr[key].color != "cmjON") {
              if (rotateX !== 0 && rotateY !== 0) {
                that.cardArr[key].rotation.y = Math.atan2(rotateY, rotateX);
              }
            }
            if (that.cardArr[key].name === "yyzj"){
              for (let i = 1; i < 149; i++) {
                let zjClone = that.scene.getObjectByName("zj" + (i + 1));
                zjClone.position.set(that.cardArr[key].position.x + 1.45605 * (i - 1), that.yyzjY*2, that.cardArr[key].position.z + 0.266669 * (i - 1))
              };
              that.machineGroup.position.set(that.cardArr[key].position.x-1.345*4.6,that.yyzjY*2,-that.cardArr[key].position.z-0.266669*4.6);
            }
          }

        }
        that.renderTimes++;
      }
      for(let k in that.locationNameArr){
        let cir=that.scene.getObjectByName("follow"+that.locationNameArr[k]);
        if(cir) {
          let model=that.scene.getObjectByName(that.locationNameArr[k])
          cir.position.set(model.position.x,model.position.y,model.position.z);
        }
      }
      if(that.followCardName){
        let followPosition=that.scene.getObjectByName(that.followCardName).position;
        that.followPoints.push(new THREE.Vector3(beforeFollowPosition.x,beforeFollowPosition.y,beforeFollowPosition.z),new THREE.Vector3(followPosition.x,followPosition.y,followPosition.z));
        // const curve = new THREE.CatmullRomCurve3 (that.followPoints);
        // const points = curve.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(that.followPoints);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const splineObject = new THREE.Line(geometry, material);
        that.scene.add(splineObject)
      }
      that.renderer.render(that.scene,that.camera);
    }
    function animate(){
      requestAnimationFrame(animate);
      controls.update();
      render();
    }
    animate();

    window.addEventListener( 'click', onClick, false );
    window.addEventListener( 'resize', function(){
      that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize( window.innerWidth, window.innerHeight );
      if(that.staffChart) {
        that.staffChart.resize()
        that.vehicleChart.resize()
        that.historyChart.resize()
      }
    }, false );
    $(document).on("mousedown","#dragger",function(e) {
      let positionDiv = $("#dragger").offset();
      let distenceX = e.pageX - positionDiv.left;
      let distenceY = e.pageY - positionDiv.top;
      $(document).mousemove(function(e) {
        let x = e.pageX - distenceX;
        let y = e.pageY - distenceY;

        if (x < 0) {
          x = 0;
        } else if (x > $(document).width() - $('#dragger').outerWidth(true)) {
          x = $(document).width() - $('#dragger').outerWidth(true);
        }

        if (y < 0) {
          y = 0;
        } else if (y > $(document).height() - $('#dragger').outerHeight(true)) {
          y = $(document).height() - $('#dragger').outerHeight(true);
        }
        $('#info').css({
          'left': x + 'px',
          'top': y + 'px'
        });
        $(document).mouseup(function() {
          $(document).off('mousemove');
        });
      });
    })
    that.renderer.domElement.addEventListener( 'wheel', function(ev){
      ev.preventDefault();
      let fov=that.camera.fov;
      if(ev.wheelDelta>0&&fov>0.1){
        if(fov<=1){
          fov-=0.02
        }else {
          fov -= (0.02 < fov ? 1 : 0);
        }
      }else if(fov>0){
        if(fov<1){
          fov+=0.02
        }else {
          fov += (fov < 75 ? 1 : 0);
        }
      }
      if(fov>75){
        controls.panSpeed=1
        controls.rotateSpeed=1
      }
      else if(fov>=50&&fov<=75){
        controls.panSpeed=5
        controls.rotateSpeed=1
      }
      if(fov>20&&fov<50){
        controls.panSpeed=1
        controls.rotateSpeed=1
      }else if(fov>=10&&fov<20){
        controls.panSpeed=1;
        controls.rotateSpeed=1
      }else if(fov>=5&&fov<10){
        controls.panSpeed=2;
        controls.rotateSpeed=0.2;
      }else if(fov>=1&&fov<5){
        controls.panSpeed=2;
        controls.rotateSpeed=0.1;
      }else if(fov<1){
        controls.panSpeed=5;
        controls.rotateSpeed=0.05;
      }else if(fov<0.9){
        controls.panSpeed=5;
        controls.rotateSpeed=0.02;
      }




      // if(fov>=20){
      //    controls.panSpeed=1
      //   controls.rotateSpeed=1
      // }else if(fov>=10&&fov<20){
      //   controls.rotateSpeed=1
      // }else if(fov>=5&&fov<10){
      //   controls.panSpeed=20;
      //   controls.rotateSpeed=0.2;
      // }else if(fov>=1&&fov<5){
      //   controls.panSpeed=50;
      //   controls.rotateSpeed=0.1;
      // }else if(fov<1) {
      //   controls.panSpeed = 100;
      //   controls.rotateSpeed = 0.05;
      // }


      that.camera.fov = fov;
      that.camera.updateProjectionMatrix();
      that.renderer.render(that.scene, that.camera);
    }, false );
  },
  methods:{
    leftToggle(){
      if(this.leftTable){
        this.leftTable=false;
        this.leftRo=180;
      }else{
        this.leftTable=true;
        this.leftRo=0;
      }

    },
    rightToggle(){
      if(this.rightTable){
        this.rightTable=false;
        this.rightRo=180;
      }else{
        this.rightTable=true;
        this.rightRo=0;
      }

    },
    moment,
    getCalendarContainer(){
      return triggerNode => triggerNode.parentNode;
    },
    getAreaStaffChart(data){
      let chart=this.$refs.chartStaffArea;
      if(chart){
        if(!this.staffChart){
          this.staffChart=this.$echarts.init(chart)
        }
        let option={
          series : [
            {
              name: '',
              type: 'pie',
              radius: '55%',
              roseType: 'angle',
              itemStyle: {
                // 阴影的大小
                shadowBlur: 200,
                // 阴影水平方向上的偏移
                shadowOffsetX: 0,
                // 阴影垂直方向上的偏移
                shadowOffsetY: 0,
                // 阴影颜色
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              backgroundColor: '#2c343c',
              data:data
            }
          ],
          tooltip: {
            trigger: 'item'
          }
        }
        this.staffChart.setOption(option);
      }
    },
    getVehicleAreaChart(data){
      let chart=this.$refs.chartVehicleArea;
      if(chart){
        if(!this.vehicleChart) {
          this.vehicleChart = this.$echarts.init(chart);
        }
        let option={
          series : [
            {
              name: '',
              type: 'pie',
              radius: '55%',
              roseType: 'angle',
              itemStyle: {
                // 阴影的大小
                shadowBlur: 200,
                // 阴影水平方向上的偏移
                shadowOffsetX: 0,
                // 阴影垂直方向上的偏移
                shadowOffsetY: 0,
                // 阴影颜色
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              backgroundColor: '#2c343c',
              data:data
            }
          ],
          tooltip: {
            trigger: 'item'
          }
        };
        this.vehicleChart.setOption(option);
      }
    },
    getCountHistoryChart(data){
      let chart=this.$refs.chartCountHistory;
      if(chart){
        if(!this.historyChart) {
          this.historyChart=this.$echarts.init(chart);
        }
        let option={
          xAxis: {
            type: 'category',
            data: data.name,
            axisLabel:{color:'rgb(255,255,255)'},
          },
          yAxis: {
            type: 'value',
            axisLabel:{color:'rgb(255,255,255)'},
          },
          series: [{
            data: data.avg,
            type: 'line',
            smooth: true,
          }]
        };
        this.historyChart.setOption(option);
      }
    },
    closeAnchor(e){
      e.stopPropagation();
      e.preventDefault();
      this.showAnchor=false;
      this.activeCardName=null
    },
    scatterCircle(r, init, ring, color, speed) {
      let uniform = {
        u_color: { value: color },
        u_r: { value: init },
        u_ring: {
          value: ring,
        },
      };

      let vs = `
        varying vec3 vPosition;
        void main(){
          vPosition=position;
          gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      let fs = `
        varying vec3 vPosition;
        uniform vec3 u_color;
        uniform float u_r;
        uniform float u_ring;

        void main(){
          float pct=distance(vec2(vPosition.x,vPosition.y),vec2(0.0));
          if(pct>u_r || pct<(u_r-u_ring)){
            gl_FragColor = vec4(1.0,0.0,0.0,0);
          }else{
            float dis=(pct-(u_r-u_ring))/(u_r-u_ring);
            gl_FragColor = vec4(u_color,dis);
          }
        }
      `;
      const geometry = new THREE.CircleGeometry(r, 120);
      let material = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        side: THREE.DoubleSide,
        uniforms: uniform,
        transparent: true,
        depthWrite: false,
      });
      const circle = new THREE.Mesh(geometry, material);

      function render() {
        uniform.u_r.value += speed || 0.1;
        if (uniform.u_r.value >= r) {
          uniform.u_r.value = init;
        }
        requestAnimationFrame(render);
      }
      render();

      return circle;
    },
    follow(){
      if(this.scene.getObjectByName("endPoint")) {
        this.scene.remove(this.scene.getObjectByName("endPoint"))
      }
      this.isFollow=!this.isFollow;
      if(this.isFollow){
        this.followCardName = this.activeCardName;
        let labelPoint=this.scene.getObjectByName("followStartPoint");
        let cardPoint = this.scene.getObjectByName(this.followCardName).position;
        if(labelPoint){
          labelPoint.position.set(cardPoint.x,cardPoint.y+1,cardPoint.z);
        }else {
          let spriteMap = new THREE.TextureLoader().load(this.startLabel);
          let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
          let sprite = new THREE.Sprite(spriteMaterial);
          sprite.name="followStartPoint";
          sprite.position.set(cardPoint.x,cardPoint.y+1,cardPoint.z);
          this.scene.add(sprite);
        }
      }else{
        this.followCardName=null;
        this.scene.remove(this.scene.getObjectByName("followStartPoint"))
      }
      this.followPoints=[];
      this.destroyLine();
    },
    queryPath(dates){
      this.historyCardName=this.activeCardName;
      let startTime=this.getLocalTime(dates[0]["_d"]);
      let endTime=this.getLocalTime(dates[1]["_d"]);
      let params = {
        startTime: startTime,
        endTime:endTime,
        ident: this.activeCardName,
        type: this.scene.getObjectByName(this.activeCardName).cardType=="1"?145 : 146,
        flag: "0",
      }
      getTrackList(params).then((response)=>{
        this.destroyLine();
        if(this.scene.getObjectByName("followStartPoint")){
          this.scene.remove(this.scene.getObjectByName("followStartPoint"))
        }
        if(this.scene.getObjectByName("endPoint")){
          this.scene.remove(this.scene.getObjectByName("endPoint"))
        }
        if(response.success===true&&response.result.myself.length>0){
          let list=response.result.myself[0].list;


          let spriteMap = new THREE.TextureLoader().load(this.startLabel);
          let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
          let sprite = new THREE.Sprite(spriteMaterial);
          sprite.name="followStartPoint";
          sprite.position.set(list[0].x*2-759.452,list[0].z*2,-list[0].y*2+ 861.07);
          this.scene.add(sprite);

          let spriteMapEnd = new THREE.TextureLoader().load(this.endLabel);
          let spriteMaterialEnd = new THREE.SpriteMaterial({ map: spriteMapEnd });
          let spriteEnd = new THREE.Sprite(spriteMaterialEnd);
          spriteEnd.name="endPoint";
          let length=list.length
          spriteEnd.position.set(list[length-1].x*2-759.452,-list[length-1].z*2,-list[0].y*2+ 861.07);
          this.scene.add(spriteEnd);



          let points=[];
          for(let k in list){
            points.push(new THREE.Vector3(list[k].x*2-759.452,list[k].z*2,-list[k].y*2+ 861.07));
          }
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ color: 0xFFA500 });
          const splineObject = new THREE.Line(geometry, material);
          this.scene.add(splineObject)
        }
        else if(response.result.myself.length===0){
          this.$message.error('暂无数据');
        }
      })
    },
    historyPath(){
      this.showPicker=!this.showPicker;
      this.isHistory=!this.isHistory;
      if(!this.isHistory){
        this.historyCardName=null;
        this.destroyLine();
      }
    },
    destroyLine(){
      let lineArr=[];
      this.scene.traverse(function(obj) {
        if(obj.type==="Line"){
          lineArr.push(obj)
        }
      })
      for(let k in lineArr){
        this.scene.remove(lineArr[k])
      }
    },
    getLocalTime(d){
      let date=new Date(d);
      let year=date.getFullYear();
      let month=date.getMonth()+1;
      let day=date.getDate();
      let hour=date.getHours();
      let min=date.getMinutes();
      let second=date.getSeconds();
      if(month<10){
        month="0"+month;
      }
      if(day<10){
        day="0"+day;
      }
      if(hour<10){
        hour="0"+hour;
      }
      if(min<10){
        min="0"+min;
      }
      if(second<10){
        second="0"+second;
      }
      return year+"-"+month+"-"+day+" "+hour+":"+min+":"+second;
    },
    websocketInitIn: function () {
      // let url = window._CONFIG['domianURL'].replace("https://","wss://").replace("http://","ws://")+"/websocket/"+userId;
      let url =window._CONFIG['domianURL'].replace("https://","wss://").replace("http://","ws://")+"/websocket/shaqu/1";
      // let url = 'ws://124.193.200.138:60008/websocket/shaqu/1';
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
      // console.log(data)
      if(data.requestUrl === "card.location"){
        if(this.preData.hasOwnProperty("staff")||this.preData.hasOwnProperty("vehicle")){
          if(this.newPosition!=={}){
            for(let key in this.newPosition){
              this.oldPosition[key]=this.newPosition[key];
            }
          }
          let currIds=[];
          //本次数据的idents
          for(let l in data.staff){
            currIds.push(data.staff[l].ident);
          }
          for(let k in data.vehicle){
            currIds.push(data.vehicle[k].ident);
          }
          currIds.push("yyzj");

          //如果新数据有删除，将缓存数据删除对应的条目
          for(let n in this.preIds){
            if(currIds.indexOf(this.preIds[n])===-1){
              this.scene.remove(this.scene.getObjectByName(this.preIds[n]));
            }
          }
          this.preData=data;
          //渲染新的模型||新的坐标
          let idArr=[];
          if(this.preData.hydraulic) {
            for(let key in this.preData.hydraulic) {
              if(this.preData.hydraulic[key].hydraulicCode===149) {
                this.preData.hydraulic[key].z-=2.8;
                this.yyzjY=this.preData.hydraulic[key].z
                if (!this.scene.getObjectByName("yyzj")) {
                  this.initCard(this.preData.hydraulic[key], 3);
                }
                if(((this.preData.hydraulic[key].x * 2 - 759.452-this.oldPosition.x)>=0.6&&(this.preData.hydraulic[key].x * 2 - 759.452-this.oldPosition.x<=-0.6))||
                  ((-this.preData.hydraulic[key].y * 2 + 861.07-this.oldPosition.z)>=0.6&&(-this.preData.hydraulic[key].y * 2 + 861.07-this.oldPosition.z)<=-0.6)) {
                  this.newPosition["cardArryyzj"] = {
                    x: this.preData.hydraulic[key].x * 2 - 759.452,
                    y: this.preData.hydraulic[key].z * 2 ,
                    z: -this.preData.hydraulic[key].y * 2 + 861.07,
                  };
                }
                idArr.push("yyzj");
              }
            }
          }
          if(this.preData.staff) {
            for (let i = 0; i < this.preData.staff.length; i++) {
              if(this.preData.staff[i].areaId==="1386206980825157634") this.preData.staff[i].z=this.yyzjY+0.1
              if (!this.scene.getObjectByName(this.preData.staff[i].ident)) this.initCard(this.preData.staff[i], 1);
              this.newPosition["cardArr" + this.preData.staff[i].ident] = {
                x: this.preData.staff[i].x*2-759.452,
                y: this.preData.staff[i].z*2,
                z: -this.preData.staff[i].y*2+ 861.07,
              };
              idArr.push(this.preData.staff[i].ident);
            }
          }
          if(this.preData.vehicle) {
            for (let k = 0; k < this.preData.vehicle.length; k++) {
              if(this.preData.vehicle[k].color==="cmjON") this.preData.vehicle[k].z=this.yyzjY;
              if (!this.scene.getObjectByName(this.preData.vehicle[k].ident)) this.initCard(this.preData.vehicle[k], 2);
              this.newPosition["cardArr" + this.preData.vehicle[k].ident] = {
                x: this.preData.vehicle[k].x*2-759.452,
                y: this.preData.vehicle[k].z*2,
                z: -this.preData.vehicle[k].y*2+ 861.07,
              };
              idArr.push(this.preData.vehicle[k].ident);
            }
          }
          this.renderTimes=0;
          this.preIds=idArr;
        }else{
          this.preData=data;
          for(let key in this.preData.hydraulic) {
            if(this.preData.hydraulic[key].hydraulicCode===149) {
              this.preData.hydraulic[key].z-=2.8;
              this.yyzjY=this.preData.hydraulic[key].z;
              this.initCard(this.preData.hydraulic[key], 3);
              this.preIds.push("yyzj")
            }
          }
          for(let i=0;i<this.preData.staff.length;i++){
            if(this.preData.staff[i].areaId==="1386206980825157634") this.preData.staff[i].z=this.yyzjY+0.1
            this.initCard(this.preData.staff[i],1)
            this.preIds.push(this.preData.staff[i].ident)
          }
          for(let i=0;i<this.preData.vehicle.length;i++){
            if(this.preData.vehicle[i].color==="cmjON") this.preData.vehicle[i].z=this.yyzjY;
            this.initCard(this.preData.vehicle[i],2)
            this.preIds.push(this.preData.vehicle[i].ident)
          }

        }
      }
      if(data.requestUrl === "ts.show"){
        // console.log(data)
        this.getAreaStaffChart(data.ts_staff);
        this.getVehicleAreaChart(data.ts_vehicle);
        this.getCountHistoryChart(data.ts_staff_charts);
        this.alertData=data.ts_alert;
        this.callData=data.ts_call;
        this.helpData=data.ts_help;
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
      if(that.lockReconnect) return;
      that.lockReconnect = true;
      setTimeout(function () {
        that.websocketSendIn();
        that.lockReconnect = false;
      }, 5000);
    },
    heartCheckInFunIn(){
      let that = this;
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
  computed: {
    classOption() {
      return {
        step: 0.3, //数值越大速度滚动越快
        limitMoveNum: 5, //开始无缝滚动的数据量  //this.fourDatata.length
        hoverStop: true, //是否开启鼠标悬停stop
        direction: 1, // 0向下 1向上 2向左 3向右
        openWatch: true, //开启数据实时监控刷新dom
        singleHeight: 0, //单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
        singleWidth: 0, //单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
        waitTime: 1000 //单步运动停止的时间(默认值1000ms)
      };
    },
  },
  destroyed() {
    this.closeSocketConnect()
  }
}
</script>
<style scoped>
#threeContainer{
  position: fixed;
  /*min-height: 880px;*/
  background-size: cover;
  overflow-x: hidden;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 999!important;
}
.threeTitle{
  width: 60%;
  position: absolute;
  left:20%;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: rgba(70,218,255,1);
  top:10px;
  letter-spacing: 0.5rem;
}
canvas{
  width: 100%;
}
h3{
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 5px;
  color:#fff
}
ul{
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}
#info{
  width:375px;
  font-size:12px;
  color:#ffffff;
  border-radius:8px;
  background:  rgba(0, 0, 0, .6);
  position: absolute;
  z-index: 999;
  moz-user-select: -moz-none;
  -moz-user-select: none;
  -o-user-select:none;
  -khtml-user-select:none;
  -webkit-user-select:none;
  -ms-user-select:none;
  user-select:none;
}
#dragger{
  cursor:move;
  height:40px;
  line-height:40px;
  background: linear-gradient(rgba(0, 0, 0, .6),rgba(0, 0, 0, .1),rgba(0, 0, 0, .6));
  font-size:14px;
  padding:0 15px;
}
#closeUIAnchor{
  float:right;
  font-size:22px;
  cursor:pointer
}
.primInfo{
  list-style: none;
  margin: 0;
  padding: 0;
  width: 60%;
  float: left
}
.primInfo li{
  margin: 5px 0;
}
#staffHead{
  width:30%;
  float: left;
  margin-top:20px;
}
#stateContainer{
  overflow: hidden;
  margin-top:10px;
  padding:0 15px 15px 15px
}
#stateContainer li{
  margin: 5px 0;
  float: left;
  width: 50%;
}
#anchorFooter{
  overflow: hidden;
  margin-top:10px;
  padding:0 15px 15px 15px;
  border-top:1px solid #eeeeee
}
#anchorFooter ul{
  overflow:hidden;
  height:40px;
}
#anchorFooter li{
  float:left;
  width:25%;
  text-align:center;
  line-height:40px;
}
#anchorFooter img{
  cursor:pointer;
  width:22px;
  margin-top:15px
}
.chartList{
  width: 22%;
  height:30%;
  position:absolute;
  background:rgba(0,0,0,0.5);
  border-radius: 5px;
  /*min-width: 384px;*/
  overflow: hidden;
  box-shadow: 0 0 3px 1px #fff;
}
.chartList .chartContainer{
  width: 100%;
  height: 80%;
  margin-top: 1.2rem;
}
.listItem{
  display: inline-block;
  text-align: center
}
.seamless-warp {
  height: 140px;
  overflow: hidden;
}
.Carousel_li{
  height: 35px;
  color:#fff;
}
.dv-decoration-7{
  /*position: relative !important;*/
  padding-top:1.5rem !important;
  width:100%;
  height:1.5rem;
  margin: 0 auto;
  color:rgba(70,218,255,1)
}
.haveNoData{
  position: absolute;
  top:40%;
  text-align: center;
  width: 100%;
  color:#ddd;
  letter-spacing: 1px;
}
</style>
