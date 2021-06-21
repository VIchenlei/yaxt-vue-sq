export default {
  namespaced: true,
  state: {
    onAlarming: new Map(),
    distinguishByObjtype: new Map(), // 按照告警对象区分告警
    alarmLevel: 5, // 告警级别，默认是5，显示全部
    alarmRows: null,
    alarmCount: 0,
  },
  mutations: {
    
  },
  actions: {
    updateAlarm({state, commit, dispatch}, data) {
      dispatch('storeAlarm', data)
    },
    storeAlarm({state, commit, dispatch}, data) {
      let datas = data.result
      state.alarmRows = datas
      dispatch('doAlarm', datas)
    },
    doAlarm({state, commit, dispatch}, datas) {
      for (const key in datas) {
        let data = datas[key]
        for (const objKey in data) {
          const rows = data[objKey]
          let ret = state.distinguishByObjtype.get(objKey)
          if (!ret) {
            ret = new Map()
          }
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            ret.set(row.id, row)
            if (objKey === 6 || objKey === 33) dispatch('changeReaderStateOnMap', {row, type: objKey, status: true})
          }
          state.distinguishByObjtype.set(objKey, ret)
        }
      }
      // console.log('alarm', state.distinguishByObjtype)
      this.commit('stateStore/changeAlarm', {
        type: this.state.stateStore.alarmList.isVisible,
        rows: state.distinguishByObjtype
      })
      dispatch('getAlarmCount');
    },
    addAlarm ({state, commit, dispatch}, data) {
      let rows = data.result
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        let type = `${row.type}`
        let ret = state.distinguishByObjtype.get(type)
        if (!ret) {
          ret = new Map()
          ret.set(row.id, row)
          state.distinguishByObjtype.set(type, ret)
        } else {
          ret.set(row.id, row)
        }
        if (Number(type) === 6 || Number(type) === 33) dispatch('changeReaderStateOnMap', {row, type, status: true})
      }
      state.distinguishByObjtype = new Map(state.distinguishByObjtype)
      // console.log('alarm', state.distinguishByObjtype)
      this.commit('stateStore/changeAlarm', {
        type: this.state.stateStore.alarmList.isVisible,
        rows: state.distinguishByObjtype
      })
      let count = 0
      // for (const key in state.distinguishByObjtype) {
      //   console.log('size', state.distinguishByObjtype[key].size)
      // }
      dispatch('getAlarmCount');
    },
    removeAlarm({state, commit, dispatch}, data){
      let rows = data.result
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const { type, id } = row
        let ret = state.distinguishByObjtype.get(`${type}`)
        if (Number(type) === 6 || Number(type) === 33) {
          dispatch('changeReaderStateOnMap', {row: ret.get(id), type, status: false});
        }
        ret && ret.delete(id)
        if (ret && ret.size === 0) state.distinguishByObjtype.delete(`${type}`)
      }
      state.distinguishByObjtype = new Map(state.distinguishByObjtype);
      this.commit('stateStore/changeAlarm', {
        type: this.state.stateStore.alarmList.isVisible,
        rows: state.distinguishByObjtype
      })
      dispatch('getAlarmCount');
    },
    changeReaderStateOnMap({state, commit, dispatch}, msg) {
      this.dispatch('olMapReaderLayer/changeReaderStatus', msg);
    },
    getAlarmCount({state, commit, dispatch}) {
      let alarms = Array.from(state.distinguishByObjtype.values());
      let count = 0;
      if (alarms.length > 0) {
        for (const alarm of alarms) {
          count += alarm.size;
        }
      }
      state.alarmCount = count;
    },
    mcAddAlarm({state, commit, dispatch}) {
      const data = {
        result: [{
          areaId: "1384033488121892866",
          areaName: "4304工作面",
          curValue: 0,
          id: "1384047362120355843",
          ident: 13,
          limitValue: 0,
          mapCode: 1,
          mapId: "1340928220318736385",
          mapName: "沙曲地图",
          name: "13",
          startTime: "2021-04-19 15:33:00",
          type: 6,
          typeGroup: "设备报警",
          typeName: "分站通信异常报警",
        }]
      }
      setTimeout(() => {
        dispatch('addAlarm', data)
        // console.log('模拟定位数据', data)
      }, 20000);
    }
  }
}