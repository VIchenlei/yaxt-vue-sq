<template>
  <div class="player-warp" :style="`width: ${recWidth}`">
    <div class="player-controlbar">
      <span class="process-container">
        <span ref="wholeprocess" class="whole-process" @click="gotoHere">
          <span ref="activeprocess" class="active-process">
            <span class="process-indicator"></span>
          </span>
        </span>
      </span>
      <span class="play-pause">
        <span @click="togglePlay" id="playButton" class="player-button">
          <svg class="icon" v-if="isPlaying"><use xlink:href="/icons/icons.svg#icon-pause"></use></svg>
          <svg class="icon" v-else><use xlink:href="/icons/icons.svg#icon-play_arrow"></use></svg>
        </span>
        <span @click="stopPlay" class="player-button">
          <svg class="icon"><use xlink:href="/icons/icons.svg#icon-stop2"></use></svg>
        </span>
        <span class="time-bar">
          <span ref="elapsedtime">00:00:00</span>
          <span>/</span>
          <span ref="totaltime">00:00:00</span>
        </span>
      </span>
      <span class="speed-controler">
        <span ref="s60" class="select-tag active" data-value="60" @click="setSpeed">60X</span>
        <span ref="s70" class="select-tag" data-value="70" @click="setSpeed">一分钟播放</span>
      </span>
    </div>
  </div>
</template>

<script>
import { formatElapsedTime } from '../../utils/mapUtils'

export default {
  data() {
    return {
      recWidth: '100%',
      isPlaying: false,
      pbLength: 0,
      activeprocess: this.$refs.activeprocess,
      elapsedtime: this.$refs.elapsedtime,
      totaltime: this.$refs.totaltime,
      wholeprocess: this.$refs.wholeprocess,
      activeSpeedNode: this.$refs.s60,
      s60: this.$refs.s60,
      s70: this.$refs.s70,
    }
  },
  computed: {},
  created() {},
  mounted() {
    this.init();
    this.initProcessBar();
    this.monitorResize();
  },
  methods: {
    init() {
      this.activeprocess = this.$refs.activeprocess;
      this.elapsedtime = this.$refs.elapsedtime;
      this.activeSpeedNode = this.$refs.s60;
      this.totaltime = this.$refs.totaltime;
      this.wholeprocess = this.$refs.wholeprocess;
      this.s60 = this.$refs.s60;
      this.s70 = this.$refs.s70;
    },
    initTrack(msg) {
      this.recWidth = '100%';
      this.$el.style.width = '100%';
      let recDom = this.$el.getBoundingClientRect();
      let width = recDom.width-recDom.left;
      this.$el.style.width = `${width}px`;
      this.activeprocess.setAttribute('style', `transform:translateX(-99%)`);
      this.updateDurationNode(this.elapsedtime, 0);
      if (msg) {
        let totalMs = ((new Date(msg.endTime)).getTime() - (new Date(msg.startTime)).getTime()) || 0
        this.updateDurationNode(this.totaltime, totalMs);
      }
      this.pbLength = this.wholeprocess.offsetWidth;
      this.resetBtn();
    },
    togglePlay() {
      if (this.totaltime.innerText === '00:00:00' && !this.isPlaying) {
        return
      }
      this.isPlaying = !this.isPlaying;
      this.$store.dispatch('track/togglePlay');
    },
    stopPlay() {
      console.log('stop');
      this.isPlaying = false;
      this.$store.dispatch('track/stopTimer');
      // this.$store.commit('track/reset');
      this.$parent.waitMap();
      this.reset();
    },
    setSpeed (evt) {
      let node = evt.target
      let speed = parseInt(node.getAttribute('data-value'), 10)
      if (node !== this.activeSpeedNode) {
        this.activeSpeedNode.classList.remove('active')
        this.activeSpeedNode = node
        this.activeSpeedNode.classList.add('active')
        this.$store.dispatch('track/setSpeed', speed);
      }
    },
    initProcessBar() {
      this.isPlaying = false;
      this.activeprocess.setAttribute('style', `transform:translateX(-99%)`);
      this.updateDurationNode(this.elapsedtime, 0);
      this.updateDurationNode(this.totaltime, 0);
      this.pbLength = this.wholeprocess.offsetWidth;
    },
    monitorResize(){
      let self = this
      window.addEventListener('resize', function handle () {
        self.pbLength = self.wholeprocess.offsetWidth;
      })
    },
    updateDurationNode(node, time) {
      let stime = formatElapsedTime(time)
      node && (node.innerText = stime)
    },
    doTick(tick) {
      this.updateActiveBar(tick)
      this.updateDurationNode(this.elapsedtime, tick * 1000)
    },
    updateActiveBar(tick, type) {
      let percent = tick / this.$store.state.track.totalTick
      let s = '-' + (1 - percent) * 99 + '%'
      let style = `transform:translateX(${s});`
      if (type !== 'jump') style = style + 'transition: transform 980ms linear'
      this.activeprocess.setAttribute('style', style)
    },
    reset () {
      this.isPlaying = false;
      this.activeprocess.setAttribute('style', `transform:translateX(-99%)`);
      this.updateDurationNode(this.elapsedtime, 0);
      this.pbLength = this.wholeprocess.offsetWidth;
    },
    resetBtn () {
      if (this.s60 && !this.s60.classList.contains('active')) {
        this.s70 && this.s70.classList.remove('active');
        this.s60 && this.s60.classList.add('active');
      }
    },
    gotoHere (evt) {
      if (this.totaltime.innerText === '00:00:00' && !this.isPlaying) return
      let x = evt.layerX
      let percent = x / this.pbLength
      // if (percent < 0.01) {
      //   this.isPlaying = false
      //   return this.ticker.stopPlay()
      // }
      this.$store.dispatch('track/gotoHere', {percent, type: 'jump'});
      // this.$store.state.track.gotoHere(percent, 'jump')
      this.isPlaying = false
    },
    jumpTo (tick) {
      console.log('tick', tick)
      this.updateActiveBar(tick, 'jump')
      this.updateDurationNode(this.elapsedtime, tick * 1000)
    }
  },
}
</script>

<style lang="less" scoped>
.player-warp {
  position: fixed;
  width: 100%;
  height: 60px;
  z-index: 999;
  background: #fff;
  bottom: 0;
  padding: 5px 0 0 5px;
  overflow: hidden;
  .player-controlbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 48px;
    order: 0;
    flex-flow: row nowrap;
    background: #f5f5f5;
    font-size: 8px;
    position: relative;
    z-index: 999;
    height: 48px;
    .process-container {
      position: absolute;
      left: 0;
      top: 0;
      flex: auto;
      display: flex;
      width: 100%;
      .whole-process {
        flex: auto;
        height: 4px;
        position: relative;
        cursor: pointer;
        background: #d5d0d0;
        .active-process {
          height: 4px;
          width: 100%;
          background: #09f;
          border-radius: 0.04rem;
          position: absolute;
          .process-indicator {
            position: absolute;
            right: 0;
            top: -4.8px;
            width: 16px;
            height: 16px;
            background: #fff;
            border: 0.048rem solid #09f;
            border-radius: 50%;
            cursor: pointer;
          }
        }
      }
    }
    .play-pause {
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      fill: #000;
      padding-left: 8px;
      .player-button {
        display: flex;
        justify-content: center;
        align-items: center ;
        width: 25.6px;
        height: 25.6px;
        cursor: pointer;
        margin-right: 10px;
        &:first-child {
          border: 1px solid #666;
          border-radius: 50%;
          &:hover {
            border: 1px solid #666;
            .icon {
              fill: #09F;
            }
          }
        }
        &:last-child {
          transform: scale(.8);
        }
        .icon {
          width: 16px;
          height: 16px;
          fill: #666 ;
        }
        .time-bar {
          display: flex;
          color: #666;
        }              
      }
    }
    .speed-controler {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 16px;
      .select-tag {
        width: 48px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center ;
        border: 1px solid #e3e3e3;
        cursor: pointer;
         &:nth-child(2) {
           width: 80px;
           height: 32px;
         }
         &.active {
          background: #09F ;
          border: none;
          color: #FFF;
         }          
      }
    }
  }
}
</style>