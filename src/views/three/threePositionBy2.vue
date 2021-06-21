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
    <a-modal v-model="pointVisible" title="路径点" @ok="handleOkPoint"  @cancel="handleCancelPoint">
      <a-select
        :data="pointList"
        placeholder="请选择路径点"
        style='width: 100%;'
        v-model='wayPoint'
        show-search
        :filter-option="filterOption"
      >
        <a-select-option v-for="point in pointList"  :key='point.value' >
          {{ point.name }}
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
      pointVisible:false,
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
      wayPoint:null,
      pointList:[],
      pointArr:{},
      delModal:false,
      delIndex:null,
      stationList:[],
      start:[],
      end:[],
      lineName:null,
      subZ:null,
      pointZ:null,
      modalType:1,
      targetSubstation:null,
      initList:null,
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
        this.buildings.position.set(0,0,0)
        this.buildings.rotateY(Math.PI/3.438067)
        this.scene.add(this.buildings);
      });
    });

    /*let staffMtlUrl = '../../../model/staff.mtl',
      staffObjUrl = '../../../model/staff.obj';
    mtlLoader.load(staffMtlUrl, (material) => {
      let cardLoader = new OBJLoader();
      cardLoader.setMaterials(material);
      cardLoader.load(staffObjUrl, (card3D) => {
        that.staffModel = card3D.children[0];
      });
    });*/
    this.initList=getReaderList({mapID:1}).then((response)=>{
      if(response.success===true){
        that.stationList=response.result;
        that.substation=that.stationList[0].id;
        for(let k=0;k<that.stationList.length;k++){
          const geometry = new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3((that.stationList[k].pointX*2-759.452),that.stationList[k].pointZ*2+100,(-that.stationList[k].pointY*2+ 861.07)),
              new THREE.Vector3((that.stationList[k].pointX*2-759.452),that.stationList[k].pointZ*2-500,(-that.stationList[k].pointY*2+ 861.07))]
          );
          const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
          const splineObject = new THREE.Line(geometry, material);
          // that.scene.add(splineObject)

          let spriteOrigin = makeTextSprite( that.stationList[k].name,
            {
              fontsize: 30,
              borderColor: {r:255, g:0, b:0, a:0.4},/* 边框黑色 */
              backgroundColor: {r:255, g:255, b:255, a:0.9}/* 背景颜色 */
            } );
          spriteOrigin.name=that.stationList[k].name;
          spriteOrigin.position.set((that.stationList[k].pointX*2.-759.452),that.stationList[k].pointZ*2,(-that.stationList[k].pointY*2+ 861.07));
          // that.scene.add(spriteOrigin);
          if(that.stationList[k].readerRouteList.length) {
            for (let i = 0; i < that.stationList[k].readerRouteList.length; i++) {

                const startPoint = new THREE.BufferGeometry().setFromPoints(
                  [new THREE.Vector3(that.stationList[k].readerRouteList[i].beginX * 2 - 759.452, that.stationList[k].readerRouteList[i].beginZ*2+10, -that.stationList[k].readerRouteList[i].beginY * 2 + 861.07),
                    new THREE.Vector3(that.stationList[k].readerRouteList[i].beginX * 2 - 759.452, that.stationList[k].readerRouteList[i].beginZ - 500, -that.stationList[k].readerRouteList[i].beginY * 2 + 861.07)]
                );
                const materialPoint = new THREE.LineBasicMaterial({ color: 0x0000ff });
                const splineStart = new THREE.Line(startPoint, materialPoint);
                that.scene.add(splineStart);

                const endPoint = new THREE.BufferGeometry().setFromPoints(
                  [new THREE.Vector3(that.stationList[k].readerRouteList[i].endX * 2 - 759.452, that.stationList[k].readerRouteList[i].endZ*2+10, -that.stationList[k].readerRouteList[i].endY * 2 + 861.07),
                    new THREE.Vector3(that.stationList[k].readerRouteList[i].endX * 2 - 759.452, that.stationList[k].readerRouteList[i].endZ*2 - 500, -that.stationList[k].readerRouteList[i].endY * 2 + 861.07)]
                );
                const splineEnd = new THREE.Line(endPoint, materialPoint);
                that.scene.add(splineEnd);

                const routePoint = new THREE.BufferGeometry().setFromPoints(
                  [new THREE.Vector3(that.stationList[k].readerRouteList[i].beginX * 2 - 759.452, that.stationList[k].readerRouteList[i].beginZ*2, -that.stationList[k].readerRouteList[i].beginY * 2 + 861.07),
                    new THREE.Vector3(that.stationList[k].readerRouteList[i].endX * 2 - 759.452, that.stationList[k].readerRouteList[i].endZ*2, -that.stationList[k].readerRouteList[i].endY * 2 + 861.07)]
                );
                const materialLine = new THREE.LineBasicMaterial({ color: 0xff0000 });
                const splineObject = new THREE.Line(routePoint, materialLine);
                splineObject.name = that.stationList[k].name+"-"+i;
                that.scene.add(splineObject);

                that.pointArr[that.stationList[k].name] = that.stationList[k];
                that.pointList.push({
                  id: that.stationList[k].code + "-" + i + "-" + 0,
                  name: that.stationList[k].name + "-" + i + "-" + 0,
                  value: that.stationList[k].name + "-" + i + "-" + 0
                }, {
                  id: that.stationList[k].code + "-" + i + "-" + 1,
                  name: that.stationList[k].name + "-" + i + "-" + 1,
                  value: that.stationList[k].name + "-" + i + "-" + 1
                });
                let spriteStart = makeTextSprite(that.stationList[k].name + "-" + i + "-" + 0,
                  {
                    fontsize: 30,
                    borderColor: { r: 0, g: 255, b: 0, a: 0.4 },/* 边框黑色 */
                    backgroundColor: { r: 255, g: 255, b: 255, a: 0.9 }/* 背景颜色 */
                  });
                spriteStart.name = that.stationList[k].name + "-" + i + "-" + 0;
                spriteStart.position.x = that.stationList[k].readerRouteList[i].beginX * 2 - 759.452;
                spriteStart.position.y = that.stationList[k].readerRouteList[i].beginZ*2;
                spriteStart.position.z = -that.stationList[k].readerRouteList[i].beginY * 2 + 861.07;
                that.scene.add(spriteStart);

                let spriteEnd = makeTextSprite(that.stationList[k].name + "-" + i + "-" + 1,
                  {
                    fontsize: 30,
                    borderColor: { r: 0, g: 255, b: 0, a: 0.4 },/* 边框黑色 */
                    backgroundColor: { r: 255, g: 255, b: 255, a: 0.9 }/* 背景颜色 */
                  });
                spriteEnd.name = that.stationList[k].name + "-" + i + "-" + 1;
                spriteEnd.position.x = that.stationList[k].readerRouteList[i].endX * 2 - 759.452;
                spriteEnd.position.y = that.stationList[k].readerRouteList[i].endZ*2;
                spriteEnd.position.z = -that.stationList[k].readerRouteList[i].endY * 2 + 861.07;
                that.scene.add(spriteEnd);


                // let index=sprite.name.substr(4);
                // if(index>=that.lineID){
                //   that.lineID=parseInt(index)+1;
                // }

            }
          }
        }
      }
    })
    this.initList;
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
            that.pointVisible=true;
            that.pointZ=selected.point.y;
            console.log(selected.point)
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
      // let textWidth = message.length*fontsize;
      /* 背景颜色 */
      context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
      /* 边框的颜色 */
      context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";
      context.lineWidth = borderThickness;
      /* 绘制圆角矩形 */
      roundRect(context, borderThickness/2, borderThickness/2, parseInt(textWidth)* 2 + borderThickness, fontsize * 1.4 + borderThickness, 0);
      /* 字体颜色 */
      context.fillStyle = "rgba(0, 0, 0, 1.0)";
      context.fillText( message, borderThickness, fontsize + borderThickness,parseInt(textWidth)* 2 + borderThickness);
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
      let sub=this.stationList.filter(item=>{
        if(item.id===this.substation){
          return item
        }
      });
      sub[0].pointZ=(this.subZ/2).toFixed(2);
      // let params={id:this.substation,pointZ:this.subZ/2,name:sub[0].name,code:sub[0].code};

      editSubstation(sub[0]).then((response)=>{
        if(response.success===true){
          this.modelVisible = false;
          let target=this.scene.getObjectByName(sub[0].name);
          this.scene.getObjectByName(sub[0].name).position.set(target.position.x,this.subZ,target.position.z)
          this.$message.success(response.message)
        }else{
          this.$message.error(response.message)
        }
      })
    },
    handleOkDel(){
      this.scene.remove(this.scene.getObjectByName("title"+this.lineID));
      this.delIndex=null;
      this.delModal=false;
    },
    handleOkPoint(){
      let pointZ=(this.pointZ/2).toFixed(2);
      let arr=this.wayPoint.split("-");
      let readerRoute=this.pointArr[arr[0]].readerRouteList[arr[1]];
      let listArr=this.pointArr[arr[0]].readerRouteList;
      listArr[parseInt(arr[1])]= {
        id: readerRoute.id,
        code: readerRoute.code,
        readerCode: readerRoute.readerCode,
        beginX: readerRoute.beginX,
        beginY: readerRoute.beginY,
        beginZ: arr[2]=="0"?pointZ:readerRoute.beginZ,
        endX: readerRoute.endX,
        endY: readerRoute.endY,
        sort:readerRoute.sort,
        endZ: arr[2]=="1"?pointZ:readerRoute.endZ,
      }
      // for(let i=0;i<this.pointArr[arr[0]].readerRouteList.length;i++){
      //   if(i===parseInt(arr[1])){
      //     listArr.push(this.pointArr[arr[0]].readerRouteList[i]);
      //   }else{
      //
      //   }
      // }
      // listArr.push(
      //   {
      //     id: readerRoute.id,
      //     code: readerRoute.code,
      //     readerCode: readerRoute.readerCode,
      //     beginX: readerRoute.beginX,
      //     beginY: readerRoute.beginY,
      //     beginZ: arr[2]=="0"?pointZ:readerRoute.beginZ,
      //     endX: readerRoute.endX,
      //     endY: readerRoute.endY,
      //     sort:readerRoute.sort,
      //     endZ: arr[2]=="1"?pointZ:readerRoute.endZ,
      //   }
      // )
      // let params={
      //   id:this.pointArr[arr[0]].id,
      //   code:this.pointArr[arr[0]].code,
      //   name:this.pointArr[arr[0]].name,
      //   readerRouteList: listArr
      // }
      let params=this.pointArr[arr[0]];
      params.readerRouteList=listArr;
      editSubstation(params).then((response)=>{
        if(response.success===true){
          if(arr[2]=="0"){
            this.pointArr[arr[0]].readerRouteList[arr[1]].beginZ=pointZ;
          }else{
            this.pointArr[arr[0]].readerRouteList[arr[1]].endZ=pointZ;
          }
          this.scene.getObjectByName(this.wayPoint).position.setY(pointZ*2);
          this.scene.remove(this.scene.getObjectByName(arr[0]+"-"+arr[1]));
          const newLine = new THREE.BufferGeometry().setFromPoints(
            [new THREE.Vector3(readerRoute.beginX * 2 - 759.452, listArr[arr[1]].beginZ*2, -readerRoute.beginY * 2 + 861.07),
              new THREE.Vector3(readerRoute.endX * 2 - 759.452, listArr[arr[1]].endZ*2, -readerRoute.endY * 2 + 861.07)]
          );
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
          const LineRoute = new THREE.Line(newLine, lineMaterial);
          LineRoute.name=arr[0]+"-"+arr[1]
          this.scene.add(LineRoute);
          this.$message.success(response.message)
          this.pointVisible=false;
        }else{
          this.$message.error(response.message);
          this.pointVisible=false

        }
      })

      // this.pointVisible=false;
    },
    handleCancelPoint(){
      this.pointVisible=false;
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
