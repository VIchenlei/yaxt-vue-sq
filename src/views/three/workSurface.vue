<template>
  <div id="threeContainer">
    <h1 id='threeTitle'>4304工作面实时监控大屏</h1>
    <div id="info" v-show="showAnchor" :style="{left:anchorX+'px',top:anchorY+'px'}">
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
            海拔：{{  cardDetail&&cardDetail.currentStatusDto?cardDetail.currentStatusDto.z:null }}
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
    <ul class='targetGroup'>
      <!-- <li @click='fly(pointAll)'>视点一</li>
       <li @click='fly(pointTwo)'>视点二</li>
       <li @click='fly(pointThree)'>视点三</li>-->
      <li @click='changeViewPoint(0)'>全景视角</li>
      <li @click='changeViewPoint(1)'>第一人称视角</li>

    </ul>
  </div>
</template>

<script>
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls  } from 'three/examples/jsm/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


import { getSVByCardId ,getTrackList } from '@api/api'
import moment from 'moment'
import $ from 'jquery'
export default {
  name: 'three',
  data () {
    return {
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
      yyzjModel:null,
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
      isLoaderStaff:true,
      loadSuccess:true,
      staffIdArr:[],
      carModel:null,
      gmjModel:null,
      historyChart:null,
      staffChart:null,
      vehicleChart:null,
      skyBox:[require("@assets/imgThreejs/fronted.png"), require("@assets/imgThreejs/back.png"),require("@assets/imgThreejs/top.png"),
        require("@assets/imgThreejs/bottom.png"),require("@assets/imgThreejs/left.png"),require("@assets/imgThreejs/right.png")],
      startLabel:require("@assets/imgThreejs/startPoint.png"),
      followPoints:[],
      historyImg:require("@assets/imgThreejs/history.png"),
      historyActiveImg:require("@assets/imgThreejs/historyactive.png"),
      isHistory:false,
      historyCardName:null,
      historyPoints:[],
      lockCameraMobility:10,
      pointAll:{
        cam:[202.48248238981873, -225.41013219025078, -239.72811602919197],
        tar:[233.773740259282,-232.08490185499397,-238.45685699446463]
      },
      pointOne:{
        camera:[197.3647762536939,-225.30838592330662,-193.97954604596262],
        target:[216.4085403975504,-218.23798553951661,-232.51270250217516]
      },

      controls:null,
      pointerLockControls:null,
      machineGroup:null,
      moveForward : false,
      moveBackward : false,
      moveLeft : false,
      moveRight : false,
      isFirstPoint:false,
      changeViewPoint:null,
      animationArr:{}
    }
  },
  mounted() {
    let that=this;
    let prevTime = performance.now();

    this.websocketInitIn();
    this.heartCheckInFunIn();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 200000);
    this.camera.position.set(193.52704721343542,-224.77220004520004,-135.82855661981768);
    let point = new THREE.PointLight(0xffffff);
    point.position.set(0, 500, 0);
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
    // let axisHelper = new THREE.AxisHelper(5000);
    // that.scene.add(axisHelper);

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(0x646464);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.setAttribute("minHeight", "880px")
    $("#threeContainer").append(this.renderer.domElement);

    function initOrbit() {
      that.controls = new OrbitControls(that.camera, that.renderer.domElement);
      that.controls.listenToKeyEvents(window); // optional
      that.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      that.controls.dampingFactor = 0.5;
      that.controls.screenSpacePanning = true;
      that.controls.minDistance = 5;
      that.controls.maxDistance = 10000;
      that.controls.maxPolarAngle = Math.PI;
      that.controls.target = new THREE.Vector3(304.10974705678916, -236.92310059001946, -105.80072393484154);
    }
    initOrbit();
    function initPointerLock() {
      that.pointerLockControls = new PointerLockControls(that.camera, that.renderer.domElement);
    }
    that.changeViewPoint=function(point){
      if(point===0){
        that.isFirstPoint=false;
        if(that.pointerLockControls) that.pointerLockControls.dispose();
        initOrbit();
        that.camera.position.set(that.pointAll.cam[0],that.pointAll.cam[1],that.pointAll.cam[2]);
        that.controls.target=new THREE.Vector3(that.pointAll.tar[0],that.pointAll.tar[1],that.pointAll.tar[2]);
      }else{
        that.isFirstPoint=true;
        if(that.controls) that.controls.dispose();
        initPointerLock();
        that.pointerLockControls.lock();
        that.camera.position.set(that.pointOne.cam[0],that.pointOne.cam[1],that.pointOne.cam[2]);
        that.camera.lookAt(that.pointOne.tar[0],that.pointOne.tar[1],that.pointOne.tar[2]);
      }
    }


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
    // this.scene.add(skyBox);


    let mixers=[];
    let clock=new THREE.Clock();
    let fbxLoader=new FBXLoader();
    let mtlLoader = new MTLLoader();


    //   machineMtlUrl='../../../machine/machine.mtl',
    //   machineObjUrl='../../../machine/machine.obj';
    //   mtlLoader.load(machineMtlUrl, (material) => {
    //     let machineLoader = new OBJLoader();
    //     machineLoader.setMaterials(material);
    //     machineLoader.load(machineObjUrl, (card3D) => {
    //       that.cmjModel = card3D.children[0];
    //       that.cmjModel.rotateY(Math.PI/3.438067);
    //     });
    //   });
    mtlLoader.load('../../../W4304/yyzj.mtl', (material) => {
      let objLoader = new OBJLoader();
      objLoader.setMaterials(material);
      objLoader.load('../../../W4304/yyzj.obj', (obj3D) => {
        that.yyzjModel=obj3D;
        that.yyzjModel.rotateY(Math.PI/3.438067);
      });
    });
    /*mtlLoader.load('../../../shaqu/W4304.mtl', (material) => {
      let objLoader = new OBJLoader();
      objLoader.setMaterials(material);
      objLoader.load('../../../shaqu/W4304.obj', (obj3D) => {
        this.buildings = obj3D;
        this.buildings.name="buildings";
        this.buildings.position.set(0,0,0)
        this.buildings.rotateY(Math.PI/3.438067);
        this.scene.add(this.buildings);
      });
    });*/
    mtlLoader.load('../../../W4304/machineGroup.mtl', (material) => {
      let objLoader = new OBJLoader();
      objLoader.setMaterials(material);
      objLoader.load('../../../W4304/machineGroup.obj', (obj3D) => {
        obj3D.name="machineGroup";
        obj3D.rotateY(Math.PI/3.438067);
        this.machineGroup=obj3D;
      });
    });
    let staffMtlUrl = '../../../orangeWorker/staff.mtl',
      staffObjUrl = '../../../orangeWorker/staff.obj';
    mtlLoader.load(staffMtlUrl, (material) => {
      let cardLoader = new OBJLoader();
      cardLoader.setMaterials(material);
      cardLoader.load(staffObjUrl, (card3D) => {
        that.staffModel = card3D.children[0];
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
    /*for(let i=0;i<20;i++) {
       new GLTFLoader().load('../../../orangeWorker/worker.gltf',(a)=> {
         let gltf=a.clone()
         gltf.scene.traverse(function(child) {
            if (child.isMesh) {
              child.material.emissive =  child.material.color;
              child.material.emissiveMap = child.material.map ;
            }
         });
         mixers["gltf"+i]  = new THREE.AnimationMixer( gltf.scene );
         mixers["gltf"+i].clipAction(gltf.animations[0]).play();
         gltf.scene.position.set(  174.55613575999996,-227,-70-2*i)
         that.scene.add(gltf.scene)
      })
    }*/
   /* fbxLoader.load("../../../orangeWorker/w1.fbx",function(worker){
      console.log(worker)
        worker.traverse(function(child) {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
      mixers["worker1"]  = new THREE.AnimationMixer( worker );
      mixers["worker1"].clipAction(worker.animations[0]).play();
      worker.position.set(  174.55613575999996,-220,-70-2);
      worker.scale.set(2,2,2)
      that.scene.add(worker)
    })
*/
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

    this.initCard=function(cardInfo,type) {
      if(type===1) {
        // if (!that.scene.getObjectByName(cardInfo.ident) && that.staffIdArr.indexOf(cardInfo.ident)===-1 && that.loadSuccess) {
        if (!that.scene.getObjectByName(cardInfo.ident) && that.staffModel) {
          // that.loadSuccess=false;
          // fbxLoader.load('../../../orangeWorker/worker.FBX',function(worker){
          //   console.log(worker);
          //   // worker.run();
          //   worker.traverse(function(child) {
          //     if (child.isMesh) {
          //       child.castShadow = true;
          //       child.receiveShadow = true;
          //     }
          //   });
          //   mixers[cardInfo.ident.toString()] = new THREE.AnimationMixer(worker);
          //   that.animationArr[cardInfo.ident.toString()]=mixers[cardInfo.ident.toString()].clipAction(worker.animations[0]);
          //   that.animationArr[cardInfo.ident.toString()].play();
          that.cardArr.push(that.staffModel.clone());
          that.cardArr[that.cardArr.length - 1].name = cardInfo.ident;
          that.cardArr[that.cardArr.length - 1].cardType = type;
          that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x*2-759.452, -226.8, -cardInfo.y*2+ 861.07);
          that.scene.add(that.cardArr[that.cardArr.length - 1]);
          that.oldPosition["cardArr" + cardInfo.ident] = {
            x: that.cardArr[that.cardArr.length - 1].position.x,
            y: that.cardArr[that.cardArr.length - 1].position.y,
            z: that.cardArr[that.cardArr.length - 1].position.z
          };
          //   that.loadSuccess=true;
          // })
        }
      }else if(type===2){
        if (!that.scene.getObjectByName(cardInfo.ident))  {
          if(cardInfo.color==="cmjON" && that.gmjModel){
            mixers["gmj"]  = new THREE.AnimationMixer( that.gmjModel.scene );
            for (let i=0;i<that.gmjModel.animations.length;i++){
              mixers["gmj"].clipAction(that.gmjModel.animations[i]).play();
            }
            that.cardArr.push(that.gmjModel.scene);
            that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x * 2 - 759.452, -225.8, -cardInfo.y * 2 + 861.07-0.15);
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
            that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x*2-759.452 ,-225.4, -cardInfo.y*2+ 861.07);
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
          cardInfo.x=cardInfo.loc.x+(1.345)*3;
          cardInfo.y=cardInfo.loc.y-(0.266669)*3-0.1;
          that.cardArr[that.cardArr.length - 1].name = "yyzj";
          that.cardArr[that.cardArr.length - 1].cardType = type;
          that.cardArr[that.cardArr.length - 1].position.set(cardInfo.x*2-759.452,-227, -cardInfo.y*2+ 861.07);
          that.scene.add(that.cardArr[that.cardArr.length - 1]);
          that.oldPosition["cardArryyzj"] = {
            x: that.cardArr[that.cardArr.length - 1].position.x,
            y: -227,
            z: that.cardArr[that.cardArr.length - 1].position.z
          };
          for(let i =1;i<149;i++){
            let zjClone=that.yyzjModel.clone();
            zjClone.name="zj"+(i+1);
            zjClone.position.set(that.cardArr[that.cardArr.length - 1].position.x+1.46605*(i-1),-227,that.cardArr[that.cardArr.length - 1].position.z+0.29067*(i-1));
            that.scene.add(zjClone);
          }
          that.pointAll.cam=[cardInfo.x*2-759.452-19.45 ,-219, -cardInfo.y*2+ 861.07+48.586];
          that.pointAll.tar=[cardInfo.x*2-759.452+101.283 ,-231.45, -cardInfo.y*2+ 861.07-7.167];
          that.pointOne.cam=[cardInfo.x*2-759.452+1.065 ,-225, -cardInfo.y*2+ 861.07+0.55];
          that.pointOne.tar=[cardInfo.x*2-759.452+101.71 ,-260, -cardInfo.y*2+ 861.07+23.78];
          if(that.controls) {
            that.camera.position.set(that.pointAll.cam[0],that.pointAll.cam[1],that.pointAll.cam[2]);
            that.controls.target=new THREE.Vector3(that.pointAll.tar[0],that.pointAll.tar[1],that.pointAll.tar[2])
          }
          that.machineGroup.position.set(cardInfo.x*2-759.452-1.345*4.6,-227,-cardInfo.y*2+ 861.07-0.266669*4.6);
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
        /*let builds=[];
        that.scene.traverse(function(obj) {
          if (obj.type == "Group") {
            builds = obj.children;
          }
        })
        let intersects = raycaster.intersectObjects(builds);
        if (intersects.length > 0) {
          let selected = intersects[0];//取第一个物体
          that.pointVisible=true;
          that.pointZ=selected.point.y;
          console.log(selected.point)
        }*/
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
        for(let key=0;key<that.cardArr.length;key++){
          if(that.newPosition["cardArr" + that.cardArr[key].name]&&that.oldPosition["cardArr" + that.cardArr[key].name]) {
            if (that.renderTimes < 60) {
              that.cardArr[key].position.x += (that.newPosition["cardArr" + that.cardArr[key].name].x - that.oldPosition["cardArr" + that.cardArr[key].name].x) / 60;
              that.cardArr[key].position.z += (that.newPosition["cardArr" + that.cardArr[key].name].z - that.oldPosition["cardArr" + that.cardArr[key].name].z) / 60;
            } else if (that.renderTimes === 60) {
              that.cardArr[key].position.x = that.newPosition["cardArr" + that.cardArr[key].name].x;
              that.cardArr[key].position.z = that.newPosition["cardArr" + that.cardArr[key].name].z;
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
                zjClone.position.set(that.cardArr[key].position.x + 1.43915 * (i - 1), -227, that.cardArr[key].position.z + 0.266669 * (i - 1))
              };
              that.machineGroup.position.set(that.cardArr[key].position.x-1.345*4.6,-227,-that.cardArr[key].position.z-0.266669*4.6);
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

    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    function animate(){
      if(that.isFirstPoint) {
        const time = performance.now();
        that.pointerLockControls.isLocked=true;
        const delta = (time - prevTime) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 225 * 100.0 * delta;
        direction.z = Number(that.moveForward) - Number(that.moveBackward);
        direction.x = Number(that.moveRight) - Number(that.moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions
        if (that.moveForward || that.moveBackward) velocity.z -= direction.z *  delta *that.lockCameraMobility;
        if (that.moveLeft || that.moveRight) velocity.x -= direction.x * delta * that.lockCameraMobility;
        that.pointerLockControls.moveRight(-velocity.x * delta);
        that.pointerLockControls.moveForward(-velocity.z * delta);
        that.pointerLockControls.getObject().position.y += (velocity.y * delta); // new behavior
        if (that.pointerLockControls.getObject().position.y < -225) {
          velocity.y = 0;
          that.pointerLockControls.getObject().position.y = -225;
        }
        prevTime = time;
      }else {
        that.controls.update();
      }
      requestAnimationFrame(animate);
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
    let keyDownTimeOut;
    function onKeyDown ( event ) {
      switch ( event.code ) {
        case 'ArrowUp':
        case 'KeyW':
          that.moveForward = true;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          that.moveLeft = true;
          break;

        case 'ArrowDown':
        case 'KeyS':
          that.moveBackward = true;
          break;

        case 'ArrowRight':
        case 'KeyD':
          that.moveRight = true;
          break;
        case 'KeyQ':
          if(that.isFirstPoint){
            that.changeViewPoint(0)
          }else{
            that.changeViewPoint(1)
          }
          break;
      }
      if(that.moveForward || that.moveLeft || that.moveBackward || that.moveRight){
        keyDownTimeOut=setTimeout(function(){
          that.lockCameraMobility=30;
        },1000)
      }
    }

    function onKeyUp ( event ) {
      switch ( event.code ) {
        case 'ArrowUp':
        case 'KeyW':
          that.moveForward = false;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          that.moveLeft = false;
          break;

        case 'ArrowDown':
        case 'KeyS':
          that.moveBackward = false;
          break;

        case 'ArrowRight':
        case 'KeyD':
          that.moveRight = false;
          break;
      }
      if(!that.moveForward && !that.moveLeft && !that.moveBackward && !that.moveRight){
        that.lockCameraMobility=10;
        clearTimeout(keyDownTimeOut);
      }
    }
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
  },
  methods:{
    moment,
    /* fly(target){
       let that=this;
       //获取当前camera位置
       let camPosition=new THREE.Vector3(this.camera.position.x,this.camera.position.y,this.camera.position.z);         //获取摄像机当前位置
       let newPosition=new THREE.Vector3(target.camera[0],target.camera[1],target.camera[2]);     //设置目标位置
       let curve=addLines(camPosition,newPosition).curve;    //绘制贝塞尔曲线
       //取curve的50个点
       let points=curve.getPoints(50);
       let index=0;
       //摄像机每50毫秒移动一个点的位置
       let a=setInterval(function () {
         that.camera.position.set(points[index].x,points[index].y,points[index].z);
         that.camera.lookAt(new THREE.Vector3(0,0,0))
         index++;
         if(index>50){
           clearInterval(a);
         }
         // that.controls.target=new THREE.Vector3(...target.target);
       },50);
       // 添加线条
       function addLines(v0, v3) {
         // 计算向量夹角
         let angle = v0.angleTo(v3) * 270 / Math.PI / 10; // 0 ~ Math.PI
         let aLen = angle * 50,
           hLen = angle * angle * 120;
         let p0 = new THREE.Vector3(0, 0, 0);

         // 开始，结束点
         // let v0 = groupDots.children[0].position;
         // let v3 = groupDots.children[1].position;

         // 法线向量
         let rayLine = new THREE.Ray(p0, getVCenter(v0.clone(), v3.clone()));

         // 顶点坐标
         let vtop = rayLine.at(hLen / rayLine.at(1).distanceTo(p0));

         // 控制点坐标
         let v1 = getLenVcetor(v0.clone(), vtop, aLen);
         let v2 = getLenVcetor(v3.clone(), vtop, aLen);

         // 绘制贝塞尔曲线
         let curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
         let geo = new THREE.BufferGeometry();
         geo.vertices = curve.getPoints(50);
         let mat = new THREE.LineBasicMaterial({color: 0xff0000});

         return {
           curve: curve,
           lineMesh: new THREE.Line(geo, mat)
         };
       }

       // 计算v1,v2 的中点
       function getVCenter(v1, v2) {
         let v = v1.add(v2);
         return v.divideScalar(2);
       }

       // 计算V1，V2向量固定长度的点
       function getLenVcetor(v1, v2, len) {
         let v1v2Len = v1.distanceTo(v2);
         return v1.lerp(v2, len / v1v2Len);
       }
     },*/
    getCalendarContainer(){
      return triggerNode => triggerNode.parentNode;
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
      if(data.requestUrl === "card.location"){
        if(this.preData.hasOwnProperty("staff")||this.preData.hasOwnProperty("vehicle")||this.preData.hasOwnProperty("hydraulic")){
          if(this.newPosition!=={}){
            for(let key in this.newPosition){
              this.oldPosition[key]=this.newPosition[key];
            }
          }
          let currIds=[];
          let currCarIds=[];
          //本次数据的idents
          for(let l in data.staff){
            currIds.push(data.staff[l].ident);
          }
          for(let k in data.vehicle){
            currIds.push(data.vehicle[k].ident)
            currCarIds.push(data.vehicle[k].ident)
          }
          // for(let i=0;i<data.hydraulic.length;i++){}
          currIds.push("yyzj");
          // }
          //如果新数据有删除，将缓存数据删除对应的条目
          for(let n in this.preIds){
            if(currIds.indexOf(this.preIds[n])===-1){
              this.scene.remove(this.scene.getObjectByName(this.preIds[n]));
            }
          }
          for(let n in this.staffIdArr){
            if(currCarIds.indexOf(this.staffIdArr[n])===-1){
              this.staffIdArr.splice(n,1)
            }
          }
          this.preData=data;
          //渲染新的模型||新的坐标
          let idArr=[];
          if(this.preData.hydraulic) {
            for(let key in this.preData.hydraulic) {
              if(this.preData.hydraulic[key].hydraulicCode===149) {
                if (!this.scene.getObjectByName("yyzj")) {
                  this.initCard(this.preData.hydraulic[key], 3);
                }
                if(((this.preData.hydraulic[key].x * 2 - 759.452-this.oldPosition.x)>=0.6&&(this.preData.hydraulic[key].x * 2 - 759.452-this.oldPosition.x<=-0.6))||
                  ((-this.preData.hydraulic[key].y * 2 + 861.07-this.oldPosition.z)>=0.6&&(-this.preData.hydraulic[key].y * 2 + 861.07-this.oldPosition.z)<=-0.6)) {
                  this.newPosition["cardArryyzj"] = {
                    x: this.preData.hydraulic[key].x * 2 - 759.452,
                    y: -227,
                    z: -this.preData.hydraulic[key].y * 2 + 861.07,
                  };
                }
                idArr.push("yyzj");
              }
            }
          }
          if(this.preData.staff) {
            for (let i = 0; i < this.preData.staff.length; i++) {
              // if( this.preData.staff[i].areaId==="1386206980825157634" || this.preData.staff[i].areaId==="1384033488121892866") {
              if( this.preData.staff[i].areaId==="1386206980825157634" ) {
                if (!this.scene.getObjectByName(this.preData.staff[i].ident) && this.staffIdArr.indexOf(this.preData.staff[i].ident)===-1) {
                  this.initCard(this.preData.staff[i], 1);
                }
                this.newPosition["cardArr" + this.preData.staff[i].ident] = {
                  x: this.preData.staff[i].x * 2 - 759.452,
                  y: this.preData.staff[i].z * 2,
                  z: -this.preData.staff[i].y * 2 + 861.07,
                };
                idArr.push(this.preData.staff[i].ident);
              }
            }
          }
          if(this.preData.vehicle) {
            for (let k = 0; k < this.preData.vehicle.length; k++) {
              // if( this.preData.vehicle[k].areaId==="1384033488121892866") {
              if( this.preData.vehicle[k].color==="cmjON") {
                if(this.preData.vehicle[k].color==="cmjON" && this.animationArr[this.preData.vehicle[k].ident.toString()]){
                  if(this.preData.vehicle[k].speed === 0){
                    // this.animationArr[this.preData.vehicle[k].ident.toString()].stop();
                  }else{
                    this.animationArr[this.preData.vehicle[k].ident.toString()].play();
                  }
                }
                if (!this.scene.getObjectByName(this.preData.vehicle[k].ident)) this.initCard(this.preData.vehicle[k], 2);
                this.newPosition["cardArr" + this.preData.vehicle[k].ident] = {
                  x: this.preData.vehicle[k].x * 2 - 759.452,
                  y: this.preData.vehicle[k].z * 2,
                  z: -this.preData.vehicle[k].y * 2 + 861.07,
                };
                idArr.push(this.preData.vehicle[k].ident);
              }
            }
          }
          this.renderTimes=0;
          this.preIds=idArr;
        }else{
          this.preData=data;
          for(let i=0;i<this.preData.staff.length;i++){
            this.staffIdArr.push(this.preData.staff[i].ident)
          }
          for(let i=0;i<this.preData.staff.length;i++){
            if( this.preData.staff[i].areaId==="1386206980825157634" ) this.initCard(this.preData.staff[i],1);
            this.preIds.push(this.preData.staff[i].ident);
          }
          for(let i=0;i<this.preData.vehicle.length;i++){
            if( this.preData.vehicle[i].color==="cmjON") this.initCard(this.preData.vehicle[i],2)
            this.preIds.push(this.preData.vehicle[i].ident)
          }
          for(let key in this.preData.hydraulic) {
            if(this.preData.hydraulic[key].hydraulicCode===149) {
              this.initCard(this.preData.hydraulic[key], 3);
              this.preIds.push("yyzj")
            }
          }
        }
      }
      if(data.requestUrl === "ts.show"){
        // console.log(data)
        /*  this.getAreaStaffChart(data.ts_staff);
          this.getVehicleAreaChart(data.ts_vehicle);
          this.getCountHistoryChart(data.ts_staff_charts);*/
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
#threeTitle{
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
.targetGroup{
  list-style: none;
  margin:0;
  position:absolute;
  left:5%;
  top:30%;
}
.targetGroup li{
  margin-bottom: 30px;
  font-size: 1rem;
  color:#fff;
  box-shadow: 0 0 2px 2px  #fff;
  text-align: center;
  padding: 5px 10px;
  background: rgba(25,25,112,0.4);
  border-radius: 5px;
}
.targetGroup li:hover{
  cursor: pointer;
  box-shadow: 0 0 3px 3px  #fff;
}
</style>