import SceneData from './SceneData';
import moment from 'moment'
import { clone } from '../../utils/mapUtils'
const INIT_SPEED = 60
const TICK_LENGTH = 1000 
let card = ['', 2, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0]
export default {
  namespaced: true,
  state: {
    map: null,
    mapID: null,
    player: null,
    ctrl: null,
    timer: -1,
    data: null,
    previewCursor: null,
    trackTime: null,
    SceneData: null,
    speed: INIT_SPEED,
    startTime: -1,
    endTime: -1,
    tick: -1,
    totalTick: 0,
    realDuration: 0,
    isPlaying: false,
    cardID: null,
    downTime: null,
    workTime: null,
    name: null,
  },
  mutations: {
    init(state, player) {
      state.player = player;
      state.map = player.map;
      state.ctrl = player.ctrl;
    },
    // reset(state) {
    //   state.startTime = -1;
    //   state.endTime = -1;
    //   state.tick = -1;
    //   state.totalTick = 0;
    //   state.realDuration = 0;
    // },
    async initTrack(state, opts) {
      state.SceneData = new SceneData(state);
      state.cardID = opts.cardID;
      state.name = opts.name || ''
      state.mapID = opts.mapID || 5;
      state.mapType = opts.type || 'HISTORY';
      state.playCmd = opts.cmd === 'HistoryScene' ? 'scene' : 'track';
      state.data = opts.rows || null;
      state.startTime = opts.startTime || 0 ;
      state.endTime = opts.endTime || 0 ;
      let duration = await this.dispatch('track/getRealDuration', state.data);
      state.realDuration = duration / 1000 || 0 ;
      state.totalTick = ((new Date(opts.endTime)).getTime() - (new Date(opts.startTime)).getTime()) / 1000 || 0;
      this.dispatch('track/gotoStartPoint');
      this.dispatch('track/drawCardIcon');
    }
  },
  actions: {
    getRealDuration({state, commit, dispatch}, data) {
      let duration = -1
      if (data && data.length > 0) {
        let start = data[0].locationTime
        let end = data[data.length - 1].locationTime
        duration = new Date(end) - new Date(start)  // ms
      }
      return duration
    },
    async gotoStartPoint({state, commit, dispatch}) {
      state.speed = state.speed ? state.speed : INIT_SPEED;
      dispatch('updateTick', 0);
      state.previewCursor = await dispatch('getFirstCursor');
    },
    getFirstCursor({state, commit, dispatch}) {
      let cursor = null
      if (state.data && state.data.length > 0) {
        cursor = { index: 0, isMoved: true }
      }
      return cursor
    },  
    /*
    * 更新player-map组件中的trackTime
    */
    updateTick({state, commit, dispatch}, tick) {
      state.tick = tick;
      state.trackTime = new Date(state.startTime).getTime() + state.tick * 1000;
      state.map.updateTrackTime(state.trackTime);
    },
    async drawCardIcon({state, commit, dispatch}) {
      if (state.data && state.data.length > 0) {
        let msg = {
          row: state.data[0],
          lastRow: state.data[state.data.length - 1],
          stateType: 'FIRST',
        }
        let msgClone = clone(msg)
        msgClone.row['ident'] = state.cardID;
        msgClone.row['name'] = state.name;
        let rec = await dispatch('buildCardMoveRec', msgClone);
        state.map.drawCardIcon(rec)
      }
    },
    async reLoadMap({state, commit, dispatch}, msg) {
      let {mapID, row} = msg;
      if (mapID === 0) {
        dispatch('stopTimer');
        return
      }
      state.map.reloadMap(mapID);
      await this.dispatch('olMapTrackPlayer/drawWholeTrack', {
        cardID: state.cardID,
        rows: state.data,
        PatrolPath: 'PatrolPath',
      })
      let rec = await dispatch('buildCardMoveRec', {row});
      state.map.drawCardIcon(rec);
    },
    buildCardMoveRec({state, commit, dispatch}, msg) {
      let { row, lastRow, stateType } = msg;
      if (!row) return;
      let rec = clone(row);
      let mapID = row.mapCode;
      if (mapID !== state.map.mapID) {
        dispatch('reLoadMap', {mapID, row});
        return
      }
      rec['speed'] = row['speed'];
      rec['locationTime'] = new Date(row['locationTime']).getTime();
      if (stateType) {
        state.downTime = new Date(row['locationTime']).getTime();
      }
      rec['down_time'] = state.downTime;
      if (lastRow) {
        let lastTime = new Date(lastRow['locationTime']).getTime();
        let duration = lastTime - rec['down_time'];
        state.workTime = duration;
      }
      rec['work_time'] = state.workTime;
      return rec;
    },
    /*
     * 播放/暂停
    */
    togglePlay({state, commit, dispatch}) {
      state.isPlaying = !state.isPlaying;
      state.isPlaying ? dispatch('startPlay') : dispatch('pausePlay');
    },
    /*
     * 开始播放
    */
    startPlay({state, commit, dispatch}) {
      dispatch('startTimer');
    },
    pausePlay({state, commit, dispatch}) {
      dispatch('stopTimer');
    },
    startTimer({state, commit, dispatch}) {
      if (state.timer >= 0) {
        dispatch('stopTimer');
      }
      let self = this;
      state.timer = window.setInterval(() => {
        let tickSpeed = state.tick + state.speed;
        console.log('tickSpeed', state.tick, state.speed, tickSpeed)
        dispatch('updateTick', tickSpeed);
        if (state.tick >= state.totalTick) {
          state.tick = state.totalTick
          state.ctrl.stopPlay();
          dispatch('stopTimer');
        }
        dispatch('tickMap');
        // self.preLoadSceneData()
        state.ctrl.doTick(state.tick)
      }, TICK_LENGTH)
    },
    preLoadSceneData({state, commit, dispatch}) {

    },
    stopTimer({state, commit, dispatch}) {
      if (state.timer >= 0) {
        window.clearInterval(state.timer);
        state.timer = -1;
        state.isPlaying = false;
      }
    },
    async tickMap({state, commit, dispatch}) {
      if (state.playCmd === 'scene') {

      } else {
        let msg = {
          rows: state.data,
          previewCursor: state.previewCursor,
          trackTime: state.trackTime,
        }
        let cursor = await dispatch('getCursor', msg);
        if (cursor && cursor.isMoved) {
          state.previewCursor = cursor;
          let row = state.data[cursor.index];
          let recMsg = {
            row: row,
          }
          let msgClone = clone(recMsg);
          msgClone.row['ident'] = state.cardID;
          msgClone.row['name'] = state.name;
          let rec = await dispatch('buildCardMoveRec', msgClone);
          state.map.doTick(rec)
        }
      }
    },
    getCursor({state, commit, dispatch}, msg) {
      let { rows, previewCursor, trackTime } = msg;
      if (!rows) {
        return null
      }
      let firstTime = new Date(rows[0].locationTime).getTime();
      let count = rows.length
      let i = previewCursor.index + 1
      let turnKey = false
      for (; i < count; i++) {
        let row = rows[i]
        // let nodeTime = (new Date(row.locationTime).getTime() - firstTime)/1000;
        let nodeTime = new Date(row.locationTime).getTime();
        if (nodeTime > trackTime) {
          break
        }
      }
      let index = i === count ? count - 1 : i - 1 
      let isMoved = true
      if (index === previewCursor.index) isMoved = false
      return {
        index: index,
        isMoved: isMoved
      }
    },
    setSpeed({state, commit, dispatch}, speed) {
      if(speed === 70){
        state.speed = state.totalTick/60
      }else{
        state.speed = speed
      }
    },
    async gotoHere({state,commit,dispatch}, msg) {
      state.playCmd = msg.type
      let percent = msg.percent
      dispatch('stopTimer');
      let tick = Math.ceil(state.totalTick * percent)
      dispatch('updateTick', tick);
      state.ctrl.jumpTo(tick)
      if (state.playCmd === 'scene') {
        // this.getSceneDataByTick()
        // if (this.data.length === 0) { 
        //   this.map.cardLayer.vehicleLayerSource.clear()
        //   this.map.cardLayer.staffLayerSource.clear()
        // }
      } else {
        let curMsg = {
          rows: state.data,
          previewCursor: state.previewCursor,
          trackTime: state.trackTime,
        }
        let cursor = await dispatch('getCursor', curMsg);
        if (cursor && cursor.isMoved) {
          state.previewCursor = cursor
          let row = state.data[cursor.index]
          let recMsg = {
            row: row,
          }
          let msgClone = clone(recMsg);
          msgClone.row['ident'] = state.cardID;
          msgClone.row['name'] = state.name;
          let rec = await dispatch('buildCardMoveRec', msgClone);
          state.map.doTick(rec)
        }
      }
    }
  }
}