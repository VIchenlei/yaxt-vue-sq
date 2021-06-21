export default {
  namespaced: true,
  state: {
    alarmReaders: new Map(),
  },
  mutations: {
    
  },
  actions: {
    storeAlarmReaders({state,commit,dispatch}, data) {
      // let ret = state.alarmReaders.get(type)
      let rows = data.result
      for (let i = 0; i < rows.length; i++) {
       
      }
    }
  }
}