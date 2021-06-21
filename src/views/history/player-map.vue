<template>
  <div class="map-canvas">
    <div class="map-tool-bar">
      <span ref="tracktime" class='track-timestamp'>{{trackTime}}</span>
      <span class="print-button hint--bottom-left" aria-label="打印" ref="printTrack" @click="printTrack">
        <!-- <svg class="icon black-icon">
          <use xlink:href="/icons/icons.svg#icon-printer"></use>
        </svg> -->
      </span>
      <span class="back-button hint--bottom-left" aria-label="关闭" @click="backHistoryIndex">
        <svg class="icon">
          <use xlink:href="/icons/icons.svg#icon-close"></use>
        </svg>
      </span>
  </div>
    <div :id="MAP_CONTAINER_NAME" class="map"></div>
  </div>
</template>

<script>
import OlMapService from '../../store/modules/mapService'
import { dealMapDatas } from '../../store/map/mapUtils/OlMapUtils'
import { getMapByCode } from '@api/api'
import { clone } from '../../utils/mapUtils'

export default {
  data() {
    return {
      MAP_CONTAINER_NAME: 'trackmap',
      mapType: 'HISTORY',
      cardLayer: null,
      trackLayer: null,
      trackTime: null,
      mapID: null,
    };
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {
    reloadMap(mapID) {
      if (window.trackmap.childNodes[0]) {
        window.trackmap.removeChild(window.trackmap.childNodes[0])
      }
      this.loadMap(mapID)
    },
    async loadMap(mapID) {
      let row = null // 默认地图数据
      let data = null
      await getMapByCode({code: mapID}).then((res) => {
        if (res.code === 200) {
          data = dealMapDatas(res.result)
          row = res.result
        }
      })
      this.$store.commit('mapService/changeMapType',{mapType: this.mapType})
      if (window.trackmap && window.trackmap.childNodes[0]) {
        window.trackmap.removeChild(window.trackmap.childNodes[0])
      }
      if (!row) return
      let map = this.$store.dispatch('mapService/initMap', data)
      if (map) {
        this.mapID = mapID
      }
      this.$parent.waitMap()
      return map
    },
    printTrack() {
      console.log('print');
    },
    backHistoryIndex() {
      this.$store.dispatch('track/stopTimer');
      this.$parent.$refs.historyPlayer.classList.add('hide');
      this.$parent.$refs.historyQuery.classList.remove('hide');
    },
    initTrack(msg) {
      this.resetCardLayers();
      if (msg) {
        this.resetTrackLayers();
        msg['PatrolPath'] = 'PatrolPath'
        this.$store.dispatch('olMapTrackPlayer/drawWholeTrack', msg)
      }
    },
    resetCardLayers() {
      console.log('clear staff or vehicle layerSource');
    },
    resetTrackLayers() {
      console.log('clear trackLayer layerSource');
    },
    updateTrackTime(time) {
      this.getTrackAlarms(time);
    },
    getTrackAlarms(time) {

    },
    drawCardIcon(rec) {
      let type = this.$parent.cardType;
      let recClone = clone(rec)
      recClone['type'] = type;
      recClone['mapType'] = this.mapType;
      this.$store.dispatch('olMapCardLayer/drawCard', { cmd: 'DOWNMINE', card: recClone });
    },
    doTick(rec) {
      this.moveCard(rec)
    },
    moveCard(rec) {
      let type = this.$parent.cardType;
      let recClone = clone(rec)
      recClone['type'] = type;
      recClone['mapType'] = this.mapType;
      this.$store.dispatch('olMapCardLayer/drawCard', { cmd: 'DOWNMINE', card: recClone });
    },
  }
}
</script>

<style lang="less" scoped>
  .map-canvas {
    position: relative;
    height: 100%;
    width: auto;
    object-fit: contain;
    position: fixed !important;
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
    #trackmap{
      height: 100%;
      width: 100%;
      background: url('../../assets/img/bg.png') center center;
      background-size: cover;
      display: flex;
      flex: auto;
      .ol-viewport{
        height: 100%;
        width: 100%;
      }
      .ol-unselectable {
        display: inline-block !important;
      }
      .ol-overlaycontainer-stopevent {
        display: flex;
        display: none !important;
      }
    }
    .map-tool-bar {
      position: absolute;
      right: 250px;
      top: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 256px;
      height: 64px;
      z-index: 9;
      background: #f5f5f5;
      padding: 8px;
      border: 1px solid #e3e3e3;
      .icon {
        width: 17.6px;
        height: 17.6px;
        fill: #333;
        cursor: pointer;
         &:hover {
           fill: #09F
         }
      }
      .track-timestamp {
        text-shadow: 0 0 2px #FFF;
        border-radius: 5px;
        font-size: 16px;
        z-index: 9;
        min-width: 60px;
      }
    }
  }
  
</style>