<template>
  <div>
    <div ref="historyQuery">
      <div class="title">
        <h2>
          当前井下人员照片显示屏
        </h2>
        <div class="totalContainer">
          共
          <span>{{ staffLength }}</span>
          人
        </div>
        <a-select default-value="0" style="width: 80px;margin-right: 10px" @change="typeChange">
          <a-select-option value="0" :key="0">
            领导
          </a-select-option>
          <a-select-option value="1" :key="1">
            员工
          </a-select-option>
        </a-select>
        <a-select
          :data="maplist"
          placeholder="请选择地图"
          style="width: 200px;margin-right: 10px"
          @change="selectChange"
        >
          <a-select-option v-for="map in maplist" :key="map.code">
            {{ map.name }}
          </a-select-option>
        </a-select>
        <a-button type="primary" @click="query">查询</a-button>
      </div>
      <div class="content">
        <ul>
          <li v-for="(item, key) in listData" :key="key">
            <span class="imgKey">{{ key }}</span>
            <span v-for="image in item" class="imgContent" :key="image.id" @click="showDetail(image)">
              <img v-if="image.pic" :src="photoUrl + image.pic" alt="" style="width: 100%" />
              <b>{{ image.name }}</b>
            </span>
          </li>
        </ul>
      </div>
      <a-modal v-model="detailVisible" title="详情" @ok="detailVisible = false">
      <p>
        <span>卡号：{{ staffDetail ? staffDetail.ident : '' }}</span>
      </p>
      <p>
        <span>姓名：{{ staffDetail ? staffDetail.name : '' }}</span>
      </p>
      <p>
        <span>职务：{{ staffDetail ? staffDetail.post : '' }}</span>
      </p>
      <p>
        <span>工号：{{ staffDetail ? staffDetail.code : '' }}</span>
      </p>
      <p>
        <span>当前位置：{{ staffDetail ? staffDetail.areaName : '' }}</span>
      </p>
      <p>
        <span>到达时间：{{ staffDetail ? staffDetail.enterAreaTime : '' }}</span>
      </p>
      <p>
        <span>下井时间：{{ staffDetail ? staffDetail.attStartTime : '' }}</span>
      </p>
      <p>
        <span>下井停留：{{ staffDetail ? staffDetail.workTime : '' }}</span>
      </p>
      <template slot="footer">
        <a-button key="back" @click="detailVisible = false">
          取消
        </a-button>
        <a-button key="submit" type="primary" @click="handleTrack">
          查看轨迹
        </a-button>
      </template>
    </a-modal>
    </div>
    
    <track-list class="hide" :track-list="trackList" :call-back="processTrackDataCheckout"></track-list>
    <div class="hide" ref="historyPlayer">
      <player-map ref="playerMap"></player-map>
      <player-ctrl ref="playerCtrl"></player-ctrl>
      <player-list ref="playerList" :list="trackList"></player-list>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import { getStaffPhotoList, getStaffTotal, getMapList, getTrackList } from '@api/api'
import PlayerMap from '../history/player-map.vue'
import playerCtrl from '../history/player-ctrl.vue'
import PlayerList from '../history/player-list.vue'
import TrackList from '../history/track-list.vue'
export default {
  components: { playerCtrl, PlayerMap, PlayerList, TrackList },
  name: 'photoList',
  data() {
    return {
      listData: {},
      staffLength: 0,
      staffDetail: null,
      detailVisible: false,
      photoUrl: window._CONFIG['picURL'],
      maplist: null,
      mapCode: null,
      workerType: 0,
      trackList: null,
      mapType: 'HISTORY',
      trackMsg: null
    }
  },
  beforeCreate() {
    getMapList().then(response => {
      if (response.success === true) {
        this.maplist = response.result
        if (this.maplist.length > 0) {
          this.mapCode = this.maplist[0].code
          getStaffPhotoList({ type: 'staff', mapId: this.mapCode, workerFlag: 0 }).then(response => {
            if (response.success === true) {
              this.listData = response.result.data
              this.staffLength = response.result.total
            } else {
              this.$message.error(response.message)
            }
          })
          // getStaffTotal({mapID:this.maplist[0].code}).then((response)=>{
          //   this.staffLength = response[0].value
          // })
        }
      }
    })
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let msg = {
        map: this.$refs.playerMap,
        ctrl: this.$refs.playerCtrl
      }
      this.$store.commit('track/init', msg)
    },
    showDetail(detail) {
      this.detailVisible = true
      this.staffDetail = detail
    },
    query() {
      getStaffPhotoList({ type: 'staff', mapId: this.mapCode, workerFlag: this.workerType }).then(response => {
        if (response.success === true) {
          this.listData = response.result.data
          this.staffLength = response.result.total
          this.$message.success(response.message)
        } else {
          this.$message.error(response.message)
        }
      })
      // getStaffTotal({mapID:this.mapCode}).then((response)=>{
      //   this.staffLength = response[0].value
      // })
    },
    selectChange(value) {
      this.mapCode = value
    },
    typeChange(value) {
      this.workerType = value
    },
    //查看轨迹
    handleTrack() {
      console.log('this.staffDetail', this.staffDetail)
      let params = {
        startTime: `${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`,
        endTime: `${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`,
        ident: this.staffDetail.ident,
        type: '145',
        flag: '0'
      }
      getTrackList(params).then(res => {
        if (res.code === 200) {
          let result = res.result.myself
          if (result.length === 0) this.$message.warning('系统中没有满足条件的轨迹')
          this.trackList = result
          this.processTrackDataCheckout()
        }
      })
    },
    processTrackDataCheckout() {
      console.log('record', this.trackList[0])
      let rows = this.trackList[0].list
      console.log('rowsrowsrows', rows)
      this.$refs.playerCtrl.isPlaying = false
      if (rows && rows[0]) {
        let smapID = rows[0]['mapCode']
        let mapID = smapID ? parseInt(smapID, 10) : -1
        if (mapID > 0) {
          if (this.selectMapID !== null && this.selectMapID !== mapID && window.trackmap.childNodes[0]) {
            this.$refs.playerMap.reloadMap(mapID)
          }
          let cardID = this.trackList[0]['ident']
          let count = rows.length
          let rowStartTime = rows[0].locationTime.split('T')
          let rowLastTime = rows[rows.length - 1].locationTime.split('T')
          let startTime = `${rowStartTime[0]} ${rowStartTime[1]}`
          let endTime = `${rowLastTime[0]} ${rowLastTime[1]}`
          this.loadMap(mapID)
          let msg = {
            cardID: cardID,
            mapID: mapID,
            rows: rows,
            startTime: new Date(startTime).getTime(), // ms
            endTime: new Date(endTime).getTime(), // ms
            name: this.trackList[0].name
          }
          this.detailVisible = false
          this.$refs.historyPlayer.classList.remove('hide')
          this.$refs.historyQuery.classList.add('hide')
          this.$refs.playerMap.trackTime = this.trackList[0].time
          this.trackMsg = msg
        } else {
          console.warn('NO map data for mapID : ', mapID)
        }
      }
    },
    waitMap() {
      this.trackMsg && this.initTrack(this.trackMsg)
    },
    loadMap(mapID) {
      this.selectMapID = mapID
      this.$refs.playerMap.loadMap(mapID)
    },
    initTrack(msg) {
      this.$refs.playerMap.initTrack(msg)
      // this.ticker.initTrack(msg);
      this.$store.commit('track/initTrack', msg)
      this.$refs.playerCtrl.initTrack(msg)
    }
  }
}
</script>

<style scoped>
* {
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  user-select: none;
}
.title {
  border-bottom: 1px solid #ddd;
  padding-bottom: 20px;
}
h2 {
  text-align: center;
  margin: 15px;
  /*color:rgb(0, 194, 255);*/
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
ul > li {
  padding-left: 10%;
  position: relative;
  border-bottom: 1px solid #ddd;
}
.imgKey {
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: -0.5rem;
  padding: 0;
  text-align: center;
  font-weight: bold;
}
ul > li span {
  display: inline-block;
  width: 10%;
  box-sizing: border-box;
  padding: 20px;
}
span b {
  display: inline-block;
  width: 100%;
  text-align: center;
  padding-top: 5px;
}
.imgContent:hover b {
  cursor: pointer;
  color: rgb(0, 194, 255);
}
.imgContent img {
  border-radius: 5px;
  box-shadow: 3px 3px 10px 1px #aaa;
}
.imgContent:hover img {
  box-shadow: 1px 1px 6px 3px #aaa;
}
.dv-decoration-10 {
  width: 100%;
  height: 5px;
  margin: 10px auto;
}
.totalContainer {
  text-align: center;
  color: rgb(0, 194, 255);
}
.totalContainer span {
  font-size: 2rem;
  font-weight: bold;
}
.hide {
  display: none;
}
</style>
