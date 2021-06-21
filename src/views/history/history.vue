<template>
  <div>
    <a-spin :spinning="loading">
      <div class="history-query" ref="historyQuery">
        <a-tabs default-active-key="145" @change="changeTab">
          <a-tab-pane key="145" tab="人员查询">
            <history-search :type="145" :do-search="doSearch"></history-search>
          </a-tab-pane>
          <a-tab-pane key="146" tab="车辆查询" force-render>
            <history-search :type="146" :do-search="doSearch"></history-search>
          </a-tab-pane>
        </a-tabs>
        <track-list :track-list="trackList" :operate="handleOperate"></track-list>
      </div>
    </a-spin>
    <div class="history-player hide" ref="historyPlayer">
      <player-map ref="playerMap"></player-map>
      <player-ctrl ref="playerCtrl"></player-ctrl>
      <player-list ref="playerList" :list="trackList"></player-list>
    </div>
    <track-modal></track-modal>
  </div>
</template>

<script>
import moment from 'moment'
import OlMapService from '../../store/modules/mapService'
import { dealMapDatas } from '../../store/map/mapUtils/OlMapUtils'
import { searchCard, getTrackList } from '@api/api'
import playerCtrl from './player-ctrl.vue'
import PlayerMap from './player-map.vue'
import TrackList from './track-list.vue'
import PlayerList from './player-list.vue'
import historySearch from './history-search.vue'
import trackModal from './track-modal.vue'


const times = {
  0: 0,
  1: 1,
  2: 6,
  3: 24,
}

const self = this
export default {
  components: { playerCtrl, PlayerMap, TrackList, PlayerList, historySearch, trackModal },
  name: 'history',
  data() {
    return {
      loading: false,
      checked: false,
      selectTimes: ['自定义', '一小时', '六小时', '一天'],
      selectTime: 0,
      dateTime: [
        `${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`,
        `${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
      ],
      cardType: 'staff',
      searchList: [],
      defaultTime: [
        moment(`${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`, 'YYYY-MM-DD HH:mm:ss'),
        moment(`${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`, 'YYYY-MM-DD HH:mm:ss'),
      ],
      selectDateValue: null,
      row: null,
      trackList: null,
      nameValue: null,
      mapType: 'HISTORY',
      trackMsg: null,
      inputValue: null,
      hasData: false,
      placeHoder: '请输入人员名称、卡号',
      type: 145
    }
  },
  computed: {},
  created() {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let msg = {
        map: this.$refs.playerMap,
        ctrl: this.$refs.playerCtrl,
      }
      this.$store.commit('track/init', msg)
    },
    inputChange(evt) {
      let value = evt.target.value;
      this.inputValue = value
      this.searchList = [];
      this.hasData = false;
      if (value) {
        searchCard(value, this.cardType, 1).then((res) => {
          if (res.code === 200) {
            this.searchList = res.result;
            if (this.searchList.length === 0) this.hasData = true;
          }
        })
      } else {
        this.searchList = [];
        this.row = null;
      }
    },
    handleLocate(list) {
      this.row = list;
      this.nameValue = list.name;
    },
    processTrackDataCheckout(record) {
      console.log('record', record);
      let rows = record.list;
      this.$refs.playerCtrl.isPlaying = false;
      if (rows && rows[0]) {
        let smapID = rows[0]['mapCode'];
        let mapID = smapID ? parseInt(smapID, 10) : -1;
        if (mapID > 0) {
          if (this.selectMapID !== null && this.selectMapID !== mapID && window.trackmap.childNodes[0]) {
            this.$refs.playerMap.reloadMap(mapID);
          }
          let cardID = record['ident'];
          let count = rows.length;
          let rowStartTime = rows[0].locationTime.split('T');
          let rowLastTime = rows[rows.length - 1].locationTime.split('T');
          let startTime = `${rowStartTime[0]} ${rowStartTime[1]}`;
          let endTime = `${rowLastTime[0]} ${rowLastTime[1]}`;
          this.loadMap(mapID);
          let msg = {
            cardID: cardID,
            mapID: mapID,
            rows: rows,
            startTime: new Date(startTime).getTime(),  // ms
            endTime: new Date(endTime).getTime(),  // ms
            name: record.name,
          }
          this.$refs.historyPlayer.classList.remove('hide');
          this.$refs.historyQuery.classList.add('hide');
          this.$refs.playerMap.trackTime = record.startTime;
          this.trackMsg = msg;
        } else {
          console.warn('NO map data for mapID : ', mapID);
        }
      }
    },
    waitMap() {
      this.trackMsg && this.initTrack(this.trackMsg)
    },
    loadMap(mapID) {
      this.selectMapID = mapID;
      this.$refs.playerMap.loadMap(mapID);
    },
    initTrack(msg) {
      this.$refs.playerMap.initTrack(msg);
      // this.ticker.initTrack(msg);
      this.$store.commit('track/initTrack', msg)
      this.$refs.playerCtrl.initTrack(msg);
    },
    // 切换标签
    changeTab(e) {
      this.type = Number(e);
      this.trackList = null;
    },
    doSearch(params) {
      console.log('params', params);
      this.loading = true;
      getTrackList(params).then((res) => {
        if (res.code === 200) {
          let result = res.result.myself;
          if (result.length === 0) this.$message.warning('系统中没有满足条件的轨迹');
          this.trackList = result;
        }
        this.loading = false;
      })
    },
    handleOperate(record, name) {
      if (name === 'trail') {
        this.processTrackDataCheckout(record);
      } else if (name === 'view') {
        console.log('view dialog');
        this.$store.commit('stateStore/changeTrackModal', {
          type: true,
          rows: record
        });
      }
    }
  },
  watch: {},
}
</script>

<style lang="less" scoped>
.history-query {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 10;
  padding: 5% 10% 2% 10%;
  background: #fff;
  display: flex;
  flex-direction: column;
  .his-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0.31;
    img {
      width: 226px;
      height: 166px;
    }
    h4 {
      font-size: 40px;
    }
  }
  .search-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0.1;
    position: relative;
    .identify-staff {
      height: 50px;
      line-height: 50px;
      text-align: center;
      color: #333;
      flex: auto;
      input {
        height: 100%;
        border-radius: 0%;
        outline: none;
      }
    }
    .search-change {
      display: flex;
      justify-content: center;
      flex: 0 1 200px;
      border: 1px solid #cccccc;
      border-right: none;
      justify-content: space-evenly;
      span {
        color: #b3b3b3;
        height: 41px;
        line-height: 41px;
        font-size: 20px;
      }
      .icon {
        width: 30px;
        height: 48px;
        fill: #b6b6b6;
        cursor: pointer;
        &:nth-child(1) {
          transform: rotate(90deg);
        }
        &.active {
          fill: #0099ff;
        }
      }
    }
    .search-img {
      flex: 0 1 80px;
      background: #0099ff;
      cursor: pointer;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        height: 15px;
        width: 15px;
      }
    }
  }
  .checkout-work {
    margin: 10px 0 10px;
  }
  .history-search {
    margin-bottom: 10px;
  }
}
.history-player {

}
.hide {
  display: none;
}
.ident-list {
  max-height: 265px;
  overflow-y: auto;
}
</style>