import ol from 'openlayers'
import { drawSymbol } from './mapUtils/OlMapUtils.js'
import {  getReaderList } from '@api/api'
import { deviceTypes } from '../def/device_type_def'

export default {
  namespaced: true,
  state: {
    readerSource: null,
    readerLayer: null,
    isReaderLayer: false,
    tool: null,
    alarmReaders: null,
    readers: null
  },
  mutations: {
    initLayers (state) {
      state.readerSource = new ol.source.Vector()
      state.readerLayer = new ol.layer.Vector({
        source: state.readerSource,
        style: new ol.style.Style({
          zIndex: 14
        })
      })
      state.readerLayer.setVisible(false)
      this.state.mapService.map.addLayer(state.readerLayer)
      state.isReaderLayer = false
    },
  },
  actions: {
    drawReaders ({state, commit, dispatch}, msg) {
      state.readerSource.clear()
      const { data, status } = msg
      let defalutMapID = window.defalutMapID
      if (data) {
        state.readers = status ? data : null;
        const openMsgReaders = this.state.alarmStore.distinguishByObjtype.get('6');
        const powerReaders = this.state.alarmStore.distinguishByObjtype.get('33');
        let alarmReaders = [];
        if (powerReaders && openMsgReaders) {
          alarmReaders = [...Array.from(powerReaders.values()), ...Array.from(openMsgReaders.values())];
        } else if (openMsgReaders) {
          alarmReaders = Array.from(openMsgReaders.values());
        } else if (powerReaders) {
          alarmReaders = Array.from(powerReaders.values());
        }
        for (let reader of data) {
          // let mapID = reader.areaId;
          let readerState = 0;
          let eventType = 0;
          let alarmReader = alarmReaders && alarmReaders.filter(item => item.ident === reader.code);
          if (alarmReader && alarmReader.length === 1) {
              const alarmType = alarmReader[0].type;
              if (alarmType === 6) {
                readerState = 1; // 分站状态 0正常，1异常
                eventType = alarmType; // 通信异常，与画分站状态做判断的值保持一致即可
              } else if (alarmType === 33) {
                readerState = 1;
                eventType = alarmType;
              }
          } else if (alarmReader && alarmReader.length > 1) {// 通信 供电告警同时存在，展示通信状态
            readerState = 1;
            eventType = 6;
          }
          reader['readerState'] = readerState
          reader['eventType'] = eventType
          dispatch('drawReader', {reader})
        }
      }
      state.readerLayer.setVisible(status)
      state.isReaderLayer = status
      // 测试增量
      // setTimeout(() => {
      //   this.dispatch('alarmStore/mcAddAlarm')
      // }, 5000);
    },
    drawReader ({state, dispatch}, msg) {
      const { reader } = msg
      let readerState = reader.readerState
      let eventType = reader.eventType
      let readerID = reader.code
      let types = deviceTypes
      let subType = types[reader.deviceType] && types[reader.deviceType].type
      subType = subType || 'reader'
      let attrs = {
        'data-id': readerID + '-' + reader.deviceType,
        'id': readerID,
        'data_subtype': subType,
        name: reader.name,
        briefName: reader.briefName,
        x: reader.pointX,
        y: reader.pointY,
        state: readerState,
        event_type: eventType
      }
      let feature = drawSymbol(attrs, state.readerSource, this.state.mapService.map)
      feature.getStyle().setZIndex(14)
    },
    removeFeature({state, commit, dispatch}, code) {
      let feature = state.readerSource.getFeatureById(code);
      feature && state.readerSource.removeFeature(feature);
    },
    updateFeatures({state, commit, dispatch}) {
      let status = state.readerLayer.getVisible()
      state.readerSource.clear()
      getReaderList({mapID: window.xdata.state.mapService.mapID}).then((res) => {
        if (res.code === 200) {
          dispatch('drawReaders', {data: res.result, status: status, name: 'reader'})
        }
      })
    },
    // updateStates({state, commit, dispatch}, msg) {
    //   // console.log(msg)
    //   let { data, rows } = msg
    //   let alarmReaders = []
    //   for (let i = 0; i < data.length; i++) {
    //     let alarmRow = data[i]
    //     let row = rows.find(item => item.code === alarmRow.ident) // 某一分站基础数据
    //     if (!row) continue
    //     let readerState = 0, eventType = 0
    //     if (alarmRow.status === 'off') {
    //       readerState = 1 // 分站状态 0正常，1异常
    //       eventType = alarmRow.type // 通信异常，与画分站状态做判断的值保持一致即可
    //     } else if (alarmRow.status === 'on') {
    //       readerState = 0
    //       eventType = 0
    //     } else if (alarmRow.status === 'low') {
    //       readerState = 1
    //       eventType = 33
    //     }
    //     row['readerState'] = readerState
    //     row['eventType'] = eventType
    //     alarmReaders.push(row)
    //     let feature = state.readerSource.getFeatureById(row.code + '-' + row.deviceType)
    //     if (feature) state.readerSource.removeFeature(feature)
    //     dispatch('drawReader', {reader: row})
    //   }
    //   state.alarmReaders = alarmReaders
    // },
    async startLocation({state,commit,dispatch},msg) {
      let status = state.readerLayer.getVisible()
      let features = state.readerSource.getFeatures();
      if (!status && features.length === 0) {
        await getReaderList({mapID: window.xdata.state.mapService.mapID}).then((res) => {
          if (res.code === 200) {
            dispatch('drawReaders', {data: res.result, status: status, name: 'reader'})
          }
        })
        state.readerLayer.setVisible(true);
        state.isReaderLayer = true;
      } else if (!status && features.length > 0) {
        state.readerLayer.setVisible(true);
        state.isReaderLayer = true;
      }
      
      this.dispatch('locateService/toggleLocating', msg);
    },
    changeReaderStatus({state, commit, dispatch}, msg) {
      if (!state.readers) return;
      let { row, type, status } = msg;
      // row 告警信息，type 告警类型，status true有异常状态 false 移出异常状态
      let reader = state.readers.find(item => item.code === row.ident);
      if (status) {
        console.log('type', type)
        reader['readerState'] = 1;
        reader['eventType'] = Number(type);
      } else {
        reader['readerState'] = 0;
        reader['eventType'] = 0;
      }
      let feature = state.readerSource.getFeatureById(reader.code + '-' + reader.deviceType)
      if (feature) state.readerSource.removeFeature(feature)
      dispatch('drawReader', {reader})
    },
  },
  
}
