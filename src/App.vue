<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view/>
      <meta-dialog></meta-dialog>
      <reader-modal></reader-modal>
      <busi-landmark-modal></busi-landmark-modal>
      <area-modal></area-modal>
    </div>
  </a-config-provider>
</template>
<script>
  import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
  import enquireScreen from '@/utils/device'
  import metaDialog from './components/metaDialog/meta-dialog'
  import ReaderModal from './views/modules/reader/ReaderModal.vue'
  import BusiLandmarkModal from './views/modules/landmark/BusiLandmarkModal.vue'
  import AreaModal from './views/modules/area/areaModal'
  import * as THREE from 'three'
  window.THREE = THREE
  export default {
    data () {
      return {
        locale: zhCN,
      }
    },
    created () {
      let that = this
      enquireScreen(deviceType => {
        // tablet
        if (deviceType === 0) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        }
        // mobile
        else if (deviceType === 1) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        }
        else {
          that.$store.commit('TOGGLE_DEVICE', 'desktop')
          that.$store.dispatch('setSidebar', true)
        }

      })
    },
    components: {
      metaDialog,
      ReaderModal,
      BusiLandmarkModal,
      AreaModal,
    }
  }
</script>
<style>
  #app {
    height: 100%;
  }
  .ant-modal-content .ant-form-item .ant-form-item-label{
    white-space:pre-wrap;
    white-space:-moz-pre-wrap;
    white-space:-o-pre-wrap;
    padding-right: 5px;
    line-height: 1.2rem;
    text-align: right;
    position: relative;
    top:9px
  }
</style>