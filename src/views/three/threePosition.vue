<template>
  <div id="threeContainer">
    <h1 id='threeTitle'>沙曲2号矿实时监控大屏</h1>
    <a-modal v-model="modelVisible" title="隶属分站" @ok="handleOk"  @cancel="handleCancel">
      <a-select
        :data="stationList"
        placeholder="请选择分站"
        v-model='substation'
        style='width: 100%;'
        show-search
        :filter-option="filterOption"
      >
        <a-select-option v-for="station in stationList" :key="station.id"  >
          {{ station.name }}
        </a-select-option>
      </a-select>
    </a-modal>
    <a-modal v-model="delModal" title="删除路径" @ok="handleOkDel"  @cancel="handleCancelDel">
      <p>确认删除当前路径吗？</p>
    </a-modal>
  </div>
</template>

<script>
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { getReaderList,addSubstation,editSubstation} from '@api/api'
import $ from 'jquery'
export default {
  name: 'three',
  data () {
    return {
      modelVisible:false,
      scene:null,
      camera:null,
      renderer:null,
      buildings:null,
      staffModel:null,
      skyBox:[require("@assets/imgThreejs/fronted.png"), require("@assets/imgThreejs/back.png"),require("@assets/imgThreejs/top.png"),
        require("@assets/imgThreejs/bottom.png"),require("@assets/imgThreejs/left.png"),require("@assets/imgThreejs/right.png")],
      lines:{},
      pointInLine:[],
      lineID:0,
      substation:null,
      delModal:false,
      delIndex:null,
      stationList:[],
      start:[],
      end:[],
      lineName:null,
      subZ:null,
      modalType:1,
      targetSubstation:null
    }
  },
  mounted() {
    let that=this;


    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 5, 200000);
    this.camera.position.set(-926.447, -200, 2400);
    // this.camera.position.set(0, 500, 0);
    this.camera.lookAt(-926.447, -334, 1776.5);
    let point = new THREE.PointLight(0xffffff);
    // point.position.set(-456, 5000, 1749);
    point.position.set(-456, 5000, 1749);
    let ambient = new THREE.AmbientLight(0xffffff);

    this.scene = new THREE.Scene();
    this.scene.add(point);
    this.scene.add(ambient);

    // this.renderer = new THREE.WebGLRenderer();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      precision: "highp", //着色器的精度。可以是"highp", "mediump" 或 "lowp". 默认为"highp"，如果设备支持的话。
      logarithmicDepthBuffer: false,
    });
    // let axisHelper = new THREE.AxisHelper(5000);
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
    controls.maxPolarAngle = Math.PI ;

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
        this.buildings = obj3D;
        this.buildings.name="buildings";
        // this.buildings.rotateY(-Math.PI);

        this.buildings.position.set(0,0,0);
        this.buildings.rotateY(Math.PI/3.438067)
        // this.buildings.position.set(1652,333.85,-735)
        this.scene.add(this.buildings);
      });
    });

    let staffMtlUrl = '../../../model/staff.mtl',
      staffObjUrl = '../../../model/staff.obj';
    mtlLoader.load(staffMtlUrl, (material) => {
      let cardLoader = new OBJLoader();
      cardLoader.setMaterials(material);
      cardLoader.load(staffObjUrl, (card3D) => {
        that.staffModel = card3D.children[0];
      });
    });
    getReaderList({mapID:2}).then((response)=>{
      if(response.success===true){
        that.stationList=response.result;
        that.substation=that.stationList[0].id;
        for(let k=0;k<that.stationList.length;k++){
          const geometry = new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3((that.stationList[k].pointX*2-759.452),that.stationList[k].pointZ+100,(-that.stationList[k].pointY*2+ 861.07)),
              new THREE.Vector3((that.stationList[k].pointX*2-759.452),that.stationList[k].pointZ-1000,(-that.stationList[k].pointY*2+ 861.07))]
          );
          const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
          const splineObject = new THREE.Line(geometry, material);
          that.scene.add(splineObject)

          let spriteOrigin = makeTextSprite( that.stationList[k].name,
            {
              fontsize: 30,
              borderColor: {r:255, g:0, b:0, a:0.4},/* 边框黑色 */
              backgroundColor: {r:255, g:255, b:255, a:0.9}/* 背景颜色 */
            } );
          spriteOrigin.name=that.stationList[k].name;
          spriteOrigin.position.set((that.stationList[k].pointX*2.-759.452),that.stationList[k].pointZ,(-that.stationList[k].pointY*2+ 861.07));
          that.scene.add(spriteOrigin);
          for(let i=0;i<that.stationList[k].readerRouteList.length;i++){
            if(that.stationList[k].readerRouteList[i].name) {
              const routePoint = new THREE.BufferGeometry().setFromPoints(
                [new THREE.Vector3(that.stationList[k].readerRouteList[i].beginX, that.stationList[k].readerRouteList[i].beginY, that.stationList[k].readerRouteList[i].beginZ),
                  new THREE.Vector3(that.stationList[k].readerRouteList[i].endX, that.stationList[k].readerRouteList[i].endY, that.stationList[k].readerRouteList[i].endZ)]
              );
              const materialLine = new THREE.LineBasicMaterial({ color: 0xff0000 });
              const splineObject = new THREE.Line(routePoint, materialLine);
              splineObject.name=that.stationList[k].readerRouteList[i].name;
              that.scene.add(splineObject);

              // splineObject.geometry.attributes.position.array[0]=0

              let sprite= makeTextSprite( that.stationList[k].readerRouteList[i].name,
                {
                  fontsize: 30,
                  borderColor: {r:0, g:255, b:0, a:0.4},/* 边框黑色 */
                  backgroundColor: {r:255, g:255, b:255, a:0.9}/* 背景颜色 */
                } );
              sprite.name=that.stationList[k].readerRouteList[i].name;
              sprite.position.x=that.stationList[k].readerRouteList[i].beginX+(that.stationList[k].readerRouteList[i].endX-that.stationList[k].readerRouteList[i].beginX)/2;
              sprite.position.y=that.stationList[k].readerRouteList[i].beginY+(that.stationList[k].readerRouteList[i].endY-that.stationList[k].readerRouteList[i].beginY)/2-2;
              sprite.position.z=that.stationList[k].readerRouteList[i].beginZ+(that.stationList[k].readerRouteList[i].endZ-that.stationList[k].readerRouteList[i].beginZ)/2;
              that.scene.add(sprite);
              // const line = new THREE.BufferGeometry().setFromPoints(
              //   [new THREE.Vector3(that.stationList[k].readerRouteList[i].beginX, that.stationList[k].readerRouteList[i].beginY, that.stationList[k].readerRouteList[i].beginZ),
              //     new THREE.Vector3(sprite.position.x,sprite.position.y,sprite.position.z)]
              // );
              // const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
              // const spline = new THREE.Line(line, material);
              // spline.name=that.stationList[k].readerRouteList[i].name;
              // that.scene.add(spline);

              let index=sprite.name.substr(4);
              if(index>=that.lineID){
                that.lineID=parseInt(index)+1;
              }
            }
          }
        }
      }
    })


    let raycaster = new THREE.Raycaster()
    let mouse = new THREE.Vector2(1,1);

    function onClick( event ) {
      if (event.ctrlKey) {
        if (event.target.tagName === "CANVAS") {
          that.modalType=1;
          event.preventDefault();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, that.camera);

          //获取鼠标点击位置
          let builds = [];
          that.scene.traverse(function(obj) {
            if (obj.type == "Group") {
              builds = obj.children;
            }
          })
          let intersects = raycaster.intersectObjects(builds);
          if (intersects.length > 0) {
            let selected = intersects[0];//取第一个物体
            that.pointInLine.push([selected.point.x, selected.point.y, selected.point.z]);
            if (that.pointInLine.length === 2) {
              const geometry = new THREE.BufferGeometry().setFromPoints(
                [new THREE.Vector3(that.pointInLine[0][0], that.pointInLine[0][1], that.pointInLine[0][2]),
                  new THREE.Vector3(that.pointInLine[1][0], that.pointInLine[1][1], that.pointInLine[1][2])]
              );
              const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
              const splineObject = new THREE.Line(geometry, material);
              splineObject.name="line"+that.lineID;
              let spriteOrigin = makeTextSprite( "line"+that.lineID,
                {
                  fontsize: 20,
                  borderColor: {r:0, g:255, b:0, a:0.4},/* 边框黑色 */
                  backgroundColor: {r:255, g:255, b:255, a:0.9}/* 背景颜色 */
                } );
              that.start=[that.pointInLine[0][0], that.pointInLine[0][1], that.pointInLine[0][2]];
              that.end=[that.pointInLine[1][0], that.pointInLine[1][1], that.pointInLine[1][2]];
              that.lineName=splineObject.name
              spriteOrigin.center = new THREE.Vector2(0, 0);
              spriteOrigin.name="title"+that.lineID;
              that.scene.add( spriteOrigin );
              spriteOrigin.position.set((that.pointInLine[1][0]-that.pointInLine[0][0])/2+that.pointInLine[0][0], (that.pointInLine[1][1]-that.pointInLine[0][1])/2+that.pointInLine[0][1]-3.3, (that.pointInLine[1][2]-that.pointInLine[0][2])/2+that.pointInLine[0][2]);
              that.scene.add(spriteOrigin);
              that.scene.add(splineObject);
              that.modelVisible=true;
            }
          }
        }
      }
      else if(event.shiftKey){
        if (event.target.tagName === "CANVAS") {
          that.modalType=2;
          event.preventDefault();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, that.camera);

          //获取鼠标点击位置
          //获取鼠标点击位置
          let builds = [];
          that.scene.traverse(function(obj) {
            if (obj.type == "Group") {
              builds = obj.children;
            }
          })
          let intersects = raycaster.intersectObjects(builds);
          if (intersects.length > 0) {
            let selected = intersects[0];//取第一个物体
            that.modelVisible=true;
            that.subZ=selected.point.y;
            // console.log(selected.point.x,selected.point.y,selected.point.z)
          }
        }
      }
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    function makeTextSprite(message, parameters) {
      if ( parameters === undefined ) parameters = {};
      let fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";
      /* 字体大小 */
      let fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;
      /* 边框厚度 */
      let borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;
      /* 边框颜色 */
      let borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
      /* 背景颜色 */
      let backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
      /* 创建画布 */
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      /* 字体加粗 */
      context.font = "Bold " + fontsize + "px " + fontface;
      /* 获取文字的大小数据，高度取决于文字的大小 */
      let metrics = context.measureText( message );
      let textWidth = metrics.width;
      /* 背景颜色 */
      context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
      /* 边框的颜色 */
      context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";
      context.lineWidth = borderThickness;
      /* 绘制圆角矩形 */
      roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
      /* 字体颜色 */
      context.fillStyle = "rgba(0, 0, 0, 1.0)";
      context.fillText( message, borderThickness, fontsize + borderThickness);
      /* 画布内容用于纹理贴图 */
      let texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      let spriteMaterial = new THREE.SpriteMaterial({ map: texture } );
      let sprite = new THREE.Sprite( spriteMaterial );
      /* 缩放比例 */
      sprite.scale.set(10,5,0);
      return sprite;

    }
    /* let spriteOrigin = makeTextSprite( " vector3(0, 0, 0) ",
       {
         fontsize: 20,
         borderColor: {r:255, g:0, b:0, a:0.4},/!* 边框黑色 *!/
         backgroundColor: {r:255, g:255, b:255, a:0.9}/!* 背景颜色 *!/
       } );
     spriteOrigin.center = new THREE.Vector2(0, 0);
     that.scene.add( spriteOrigin );
     spriteOrigin.position.set(0, 0, 0);*/



    function render(){
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
      }
      if(that.vehicleChart) {
        that.vehicleChart.resize()
      }
      if(that.historyChart) {
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
    /* that.renderer.domElement.addEventListener( 'wheel', function(ev){
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

       that.camera.fov = fov;
       that.renderer.render(that.scene, that.camera);
     }, false );*/
  },
  methods:{
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    handleOk(){
      if(this.modalType===1) {
        let sub=this.stationList.filter(item=>{
          if(item.id===this.substation){
            return item
          }
        });
        let lineNum=this.lineName.substr(4);
        let params = {
          "readerCode": sub[0].code,
          "code": sub[0].code + lineNum,
          "sort": sub[0].readerRouteList.length,
          "beginX": (this.start[0].toFixed(3)+759.452)/2,
          "beginY": this.start[1].toFixed(3),
          "beginZ": (this.start[2].toFixed(3)-861.07)/2,
          "endX": (this.end[0].toFixed(3)+759.452)/2,
          "endY": this.end[1].toFixed(3),
          "endZ":(this.end[2].toFixed(3)-861.07)/2,
          "name": this.lineName
        }
        if (!this.substation) return false;
        this.lines["line" + this.lineID] = [];
        this.lines["line" + this.lineID].push(this.pointInLine);
        this.pointInLine = [];
        this.lineID++;
        this.modelVisible = false;
        this.start = null;
        this.end = null;
        this.lineName = null;
        addSubstation(params).then((response)=>{
          if(response.success===true){
            this.modelVisible = false;
            this.$message.success(response.message);
          }else{
            this.scene.remove(this.scene.getObjectByName(this.lineName))
            this.scene.remove(this.scene.getObjectByName("title"+lineNum))
            this.$message.error(response.message)
          }
        })
      }else{
        let sub=this.stationList.filter(item=>{
          if(item.id===this.substation){
            return item
          }
        })
        let params={id:this.substation,pointZ:this.subZ,name:sub[0].name,code:sub[0].code};
        editSubstation(params).then((response)=>{
          if(response.success===true){
            this.modelVisible = false;
            let target=this.scene.getObjectByName(sub[0].name);
            this.scene.getObjectByName(sub[0].name).position.set(target.position.x,this.subZ,target.position.z)

            this.$message.success(response.message)

          }else{
            this.$message.error(response.message)
          }
        })
      }

    },
    handleOkDel(){
      this.scene.remove(this.scene.getObjectByName("title"+this.lineID));
      this.delIndex=null;
      this.delModal=false;
    },
    handleCancel(){
      this.scene.remove(this.scene.getObjectByName("line"+this.lineID));
      this.scene.remove(this.scene.getObjectByName("title"+this.lineID));
      this.pointInLine=[];
      this.modelVisible=false;
    },
    handleCancelDel(){
      this.delIndex=null;
      this.delModal=false;
    }
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
</style>