import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import enhance from './modules/enhance'
import mapService from './modules/mapService'
import stateStore from './modules/StateStore'
import alarmStore from './modules/alarmStore'
import helpStore from './modules/helpServer'
import deviceStore from './modules/deviceStore'
import olMapWorkSpace from './map/OlMapWorkSpace'
import olMapMeasureLayer from './map/OlMapMeasureLayer'
import olMapLandmarkLayer from './map/OlMapLandmarkLayer'
import olMapReaderLayer from './map/OlMapReaderLayer'
import olMapReaderEdit from './map/OlMapReaderEdit'
import olMapFillAreaLayer from './map/OlMapFillAreaLayer'
import olMapAreaLayer from './map/OlMapAreaLayer'
import olMapQueryLayer from './map/OlMapQueryLayer'
import olMapAreaLayerEdit from './map/OlMapAreaLayerEdit'
import olMapLandmarkEdit from './map/OlMapLandmarkEdit'
import olMapCameraLayer from './map/OlMapCameraLayer'
import olMapReaderPathLayer from './map/OlMapReaderPathLayer'
import olMapAntennaLayer from './map/OlMapAntennaLayer'
import olMapRoutePlan from './map/OlMapRoutePlan'
import olMapLightLayer from './map/OlMapLightLayer'
import olMapCardLayer from './map/OlMapCardLayer.js'
import olMapFaultLayer from './map/OlMapFaultLayer'
import olMapTrackPlayer from './map/OlMapTrackPlayer'
import olMapAnimator from './map/OlMapAnimator.js'
import locateService from './modules/LocateService'
import trackService from './modules/TrackService'
import cardStore from './modules/cardStore.js'
import track from '../views/history/Ticker'
import getters from './getters'
import olMapTestPathLayer from './map/OlMapTestPathLayer'
import olMapLeaveLayer from './map/OlMapLeaveLayer'
import olMapHydraulic from './map/OlMapHydraulic'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    enhance,
    mapService,
    stateStore,
    alarmStore,
    helpStore,
    deviceStore,
    olMapWorkSpace,
    olMapMeasureLayer,
    olMapLandmarkLayer,
    olMapReaderLayer,
    olMapReaderEdit,
    olMapFillAreaLayer,
    olMapAreaLayer,
    olMapQueryLayer,
    olMapAreaLayerEdit,
    olMapLandmarkEdit,
    olMapCameraLayer,
    olMapReaderPathLayer,
    olMapAntennaLayer,
    olMapRoutePlan,
    olMapLightLayer,
    olMapCardLayer,
    olMapFaultLayer,
    olMapTrackPlayer,
    olMapAnimator,
    locateService,
    trackService,
    cardStore,
    track,
    olMapTestPathLayer,
    olMapLeaveLayer,
    olMapHydraulic,
  },
  state: {

  },
  mutations: {

  },
  actions: {

  },
  getters
})
