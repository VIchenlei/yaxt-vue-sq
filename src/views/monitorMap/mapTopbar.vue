<template>
  <div class="mapTopbar">
    <a-dropdown v-for="(item, index) in toolbar" :key="index" :trigger="['click','visibleChange']" :id="item.icon" :visible="isShowTooldown(item)" placement="bottomCenter" :getPopupContainer="() => mapElement">
      <a-tooltip placement="leftTop">
        <template slot="title">
          <span>{{ item.name }}</span>
        </template>
        <a class="ant-dropdown-link" @click="switchItem">
          <i class="icon" :class="[item.icon, item.class]"></i>
          <a-icon type="down" :class="isShowIcon(item)" />
        </a>
      </a-tooltip>
      <a-menu slot="overlay" v-show="tooldowns.length > 0">
        <a-menu-item v-for="(list, i) in tooldowns" :key="i" @click="dohandleItem" :id="list.icon">
          <a :class="[`menu-${list.icon}`, isActive(list.icon), `${list.icon.includes('pos_') ? 'menu-map' : ''}`]">
            <i class="icon" :icon="list.icon" :class="[list.icon, isShowMenuIcon(item)]"></i>
            <span>{{ list.name }}</span>
          </a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import { tools } from './map_topbar_def'
import { drawLayers } from './draw_layers_def'
import { metadata } from './meta_definition'
import { getMapList, getMapByCode } from '@/api/api';
import { dealMapDatas } from '../../store/map/mapUtils/OlMapUtils'
export default {
  name: 'mapTopbar',
  props: ['defalutMapType'],
  data() {
    return {
      toolbar: tools.toolbarItems,
      tooldowns: [],
      isVisible: null, // 是否显示下拉列表
      magnifierDef: tools.magnifierDef,
      statusNames: tools.statusNames,
      mapType: this.defalutMapType,
      mapElement: null,
      activeArray: new Map(),
    }
  },
  computed: {},
  created() {},
  mounted() {
    this.activeArray.set('areaStaff', true)
    this.activeArray.set(`pos_${window.xdata.state.mapService.mapID}`, true)
    this.activeArray.set('hydraulicShow', true)
    this.activeArray.set('fade_goaf', true)
  },
  methods: {
    // 是否显示三角ICON
    isShowIcon(data) {
      const { icon } = data
      if (['staff', 'vehicle', 'edit_map'].includes(icon)) return 'hide'
      return ''
    },
    // 是否显示下拉列表
    isShowTooldown(data) {
      const { icon } = data
      if (['staff', 'vehicle', 'edit_map'].includes(icon)) return false
      if (this.isVisible === icon) return true
      return false
    },
    // 是否显示dropdwon结果面板ICON
    isShowMenuIcon(data) {
      const { icon } = data
      if (icon === 'switch_map') return 'hide'
      return ''
    },
    switchItem(evt) {
      this.mapElement = this.$store.state.stateStore.mapContainer
      evt.preventDefault()
      let target = evt.target
      let tagName = target.tagName
      if (!['I', 'svg'].includes(tagName)) return
      let opName = target.parentElement.id || target.parentElement.parentElement.id
      this.isVisible = this.isVisible === opName ? null : opName
      switch (opName) {
        case 'vehicle':
        case 'staff':
          target.classList.toggle('active')
          let status = target.classList.contains('active')
          this.tooldowns = []
          this.$store.dispatch('olMapCardLayer/mapShowCard', {symbolType: opName, isVisible: status})
          break
        case 'visual':
        case 'magnifier':
        case 'measure':
        case 'visualarea':
          this.tooldowns = tools[opName]
          break
        case 'switch_map':
          getMapList().then((res) => {
            if(res.code === 200){
              let resData = res.result
              this.tooldowns = resData.map(item => {
                item.icon = 'pos_' + item.code
                return item
              })
            }
          })
          break
        case 'edit_map':
          target.classList.toggle('active')
          this.$store.commit('mapService/changeMouse', {flag: this.isVisible})
          break
      }
    },
    dohandleItem(evt) {
      const target = evt.domEvent.target
      const tagName = target.tagName
      if (!['I', 'SPAN', 'A'].includes(tagName)) return
      this.isVisible = null
      const iconname = target.parentElement.id || target.parentElement.parentElement.id
      const parentTarget = tagName === 'A' ? target : target.parentElement
      if (this.statusNames.includes(iconname)) parentTarget.classList.toggle('active')
      let status = parentTarget.classList.contains('active')
      if (status) {
        this.activeArray.set(iconname, true)
      } else {
        this.activeArray.delete(iconname)
      }
      let mapID = window.xdata.state.mapService.mapID
      switch (true) {
        case ['reader', 'light', 'camera', 'landmark', 'fault', 'underground', 'readerPath', 'antenna'].includes(iconname):
          drawLayers[iconname].method({mapID}).then((res) => {
            console.log('打印res',res)
            if (res.success) {
              let result = res.result
              this.$store.dispatch(drawLayers[iconname].address, {data: result, status: status, name: iconname})
            }
          })
          break
        case iconname.includes('area_'):
          drawLayers['area'].method({mapID}).then((res) => {
            if (res.success) {
              let result = res.result
              this.$store.dispatch(drawLayers['area'].address, {
                data: result,
                status: status,
                visiblearea: iconname,
                mapType: this.mapType
              })
            }
          })
          break
        case iconname.includes('pos_'):
          let mapCode = Number(iconname.split('pos_')[1])
          if (mapCode != xdata.state.mapService.mapID) {
            if (window.monitormap.childNodes[0]) {
              window.monitormap.removeChild(window.monitormap.childNodes[0])
              getMapByCode({code: mapCode}).then((res) => {
                if (res.code === 200) {
                  let data = dealMapDatas(res.result)
                  this.$store.dispatch('mapService/initMap', data)
                }
              })
            }
          }
          break
        case iconname === 'reset':
          this.$store.dispatch('mapService/resetView')
          break
        case iconname === 'measure_length': 
          this.$store.dispatch('olMapMeasureLayer/mapMeasure',{geometry: 1})
          break
        case iconname === 'measure_area':
          this.$store.dispatch('olMapMeasureLayer/mapMeasure',{geometry: 2})
          break
        case Object.keys(this.magnifierDef).includes(iconname):
          let {type, shape} = this.magnifierDef[iconname]
          const msg = {
            tool: target,
            mapType: this.mapType,
            status: status,
            type: type,
            geotype: shape
          }
          this.$store.dispatch('olMapQueryLayer/mapQuery', msg)
          break
        case iconname === 'areaStaff':
          this.$store.dispatch('olMapCardLayer/mapShowCard', {symbolType: iconname, isVisible: status})
          break
        case iconname === 'edit_goaf':
          this.$store.dispatch('olMapFillAreaLayer/addGoaf', {
            name: iconname
          })
          break
        case iconname === 'edit_area':
        case iconname === 'edit_forbid_area':
          this.$store.dispatch('olMapAreaLayerEdit/addArea', {
            name: iconname
          })
          break
        case iconname === 'edit_landmark':
          this.$store.dispatch('olMapLandmarkEdit/addLandMark', {
            name: iconname
          })
          break
        case iconname === 'edit_forbid_bstation':
          this.$store.dispatch('olMapReaderEdit/addReader', {
            name: iconname
          })
          break
        case iconname === 'edit_route_plan':
          this.$store.dispatch('olMapRoutePlan/setRoutePlan', {
            name: iconname
          })
          break
        // case iconname === 'edit_goaf':
        //   console.log(iconname)
          // break
        case iconname === 'edit_point':
        case iconname === 'delete_point':
          break
        case iconname === 'fade_area':
          break
        case iconname === 'test_path':
          this.$store.dispatch('olMapTestPathLayer/testPath', {
            name: iconname
          })
        case iconname === 'hydraulicShow':
          this.$store.dispatch('olMapHydraulic/showHidden', {
            name: iconname,
            status: status
          })
          break
        case iconname === 'fade_goaf':
          this.$store.dispatch('olMapFillAreaLayer/showHidden', {
            name: iconname,
            status: status
          })
          break
      }
    },
    isActive(name) {
      let active = false
      if (this.activeArray.get(name)) {
        active = true
      } else if (name === 'reader') {
        if (Array.from(this.$store.state.locateService.localReader.keys()).length > 0 || this.$store.state.olMapReaderLayer.isReaderLayer) {
          active = true
        }
      }
      return active ? 'active' : ''
    }
  },
  watch: {
    '$store.state.mapService.mapID': {
      handler (result) {
        this.$forceUpdate()
        this.activeArray.clear()
        this.activeArray.set('areaStaff', true)
        this.activeArray.set(`pos_${result}`, true)
        this.activeArray.set('hydraulicShow', true)
        this.activeArray.set('fade_goaf', true)
      },
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
  @import "../../style/mapTopbar.less";
</style>
