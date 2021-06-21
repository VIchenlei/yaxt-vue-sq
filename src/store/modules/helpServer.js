export default {
  namespaced: true,
  state: {
    helpList: {
      isVisible: false,
      rows: new Map(), // 按照唯一性标识key值存储
    }
  },
  mutations: {
    changeHelp(state, msg) {
      state.helpList.isVisible = msg && msg.type
      state.helpList.rows = msg && msg.rows
    }
  },
  actions: {
    updateHelp({state, commit, dispatch}, data) {
      if (data && data.length === 0) return
      for (const obj of data) {
        let objKey = obj.id;
        let ret = state.helpList.rows.get(objKey);
        if (!ret) state.helpList.rows.set(objKey, obj);
      }
      state.helpList.rows = new Map(state.helpList.rows);
      commit('changeHelp', {
        type: state.helpList.isVisible,
        rows: state.helpList.rows
      })
    },
    removeHelp({state, commit, dispatch}, data) {
      let ret = state.helpList.rows.get(data);
      if (!ret) return
      state.helpList.rows.delete(data);
      state.helpList.rows = new Map(state.helpList.rows);
      commit('changeHelp', {
        type: state.helpList.isVisible,
        rows: state.helpList.rows
      })
    }
  }
}