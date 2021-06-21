<template>
  <div class="monitormapContainer">
    <router-link :to="{ name: '/jeecg/InsideBigScreen' }">
      go
    </router-link>
    <route-view></route-view>
  </div>
</template>

<script>
import RouteView from "@/components/layouts/RouteView"
export default {
  name: 'monitorMap',
  props: {
   
  },
  components: {
    RouteView
  },
  data () {
    return {
     
    }
  },
  computed: {
    
  },
  created () {
    
  },
  mounted () {
   
  },
  methods: {
   
  
  },
  destroyed() {

  }
}
</script>

<style lang="less">
  .monitormapContainer {
    position: relative;
    height: 100%;
    width: auto;
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
        right: 17px;
        bottom: 7px;
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
