import OlMapCardLayer from './OlMapCardLayer'

export default {
  namespaced: true,
  state: {
    map: null,
    mapID: null,
    mapType: null,
    cardLayer: null,
    readerLayer: null,
    trackLayer: null,
    animator: null
  },
  mutations: {
    handle (state) {
      let self = this
      this.state.mapService.map.addEventListener('click', (evt) => {
        const feature = this.state.mapService.map.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
        if (!feature) return
        const properties = feature.getProperties()
        const {data_subtype} = properties
        const dataType = properties['data-type']
        switch (true) {
          case data_subtype === 'countStaffVehicle':
            this.commit('olMapQueryLayer/handleSubtype', {feature, evt})
            break
          case data_subtype === 'traffic-lights':
            this.commit('olMapLightLayer/handleSubtype', {feature, evt})
            break
          case data_subtype === 'landmark':
            this.commit('olMapLandmarkEdit/handleSubtype', {feature, evt})
            break
          case data_subtype === 'goaf':
            this.commit('olMapFillAreaLayer/handleSubtype', {feature, evt})
            break
          case data_subtype === 'area':
            this.commit('olMapAreaLayer/handleSubtype', {feature, evt})
            break
          case data_subtype === 'intersection_point':
            this.commit('olMapReaderPathLayer/handleSubtype', {feature, evt})
            break
          case ['card', 'label', 'staffArea', 'camera'].includes(dataType):
            this.commit('olMapCardLayer/handleSubtype', {feature, evt, dataType})
            break
          case ['reader', 'virtual_reader', 'reader-v', 'reader_o', 'reader_s', 'reader_b'].includes(data_subtype):
            this.commit('olMapReaderEdit/handleSubtype', {feature, evt})
            break
          case data_subtype === 'reader_path':
            this.commit('olMapReaderPathLayer/handleSubtype', {feature, evt, type: data_subtype})
            break
        }
      })
    }
  },
  actions: {
    init ({state, commit, dispatch}, mapType) {
      console.log(mapType)
      state.mapType = mapType;
      switch (state.mapType) {
        case 'HISTORY':
          console.log('HISTORY')
          this.cardLayer = OlMapCardLayer;
          // this.trackLayer = new OlMapTrackPlayer()
          this.commit('olMapCardLayer/initLayers');
          this.commit('olMapTrackPlayer/initLayers');
          break
        default:
          this.commit('olMapWorkSpace/handle')
          this.commit('olMapCardLayer/initLayers')
          this.commit('olMapMeasureLayer/initLayers')
          this.commit('olMapLandmarkLayer/initLayers')
          this.commit('olMapReaderLayer/initLayers')
          this.commit('olMapReaderEdit/initLayers')
          this.commit('olMapFillAreaLayer/initLayers')
          this.commit('olMapAreaLayer/initLayers')
          this.commit('olMapQueryLayer/initLayers')
          this.commit('olMapAreaLayerEdit/initLayers')
          this.commit('olMapLandmarkEdit/initLayers')
          this.commit('olMapCameraLayer/initLayers')
          this.commit('olMapReaderPathLayer/initLayers')
          // this.commit('olMapAntennaLayer/initLayers')
          // this.commit('olMapLightLayer/initLayers')
          this.commit('olMapRoutePlan/initLayers')
          this.commit('olMapTestPathLayer/initLayers')
          this.commit('olMapTestPathLayer/initLayers')
          this.commit('olMapHydraulic/initLayers')
          break
      } 
    }
  }
}