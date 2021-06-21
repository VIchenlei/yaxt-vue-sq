<template>
  <div class="monitorFooter">
    <span>
      <a-tooltip placement="right" :title="currentLeader">
        <a-icon  type="usergroup-delete"/>
      </a-tooltip>
    </span>
    <span class="foot-right">
      <a-tooltip placement="left" :title="status > 0 ? '实时服务器已连接' : '实时服务器未连接'">
        <a-icon  type="api" :theme="status > 0 ? 'filled' : 'outlined'"/>
        <span>{{currtTime}}</span>
      </a-tooltip>
    </span>
  </div>
</template>

<script>
  import moment from 'moment'
  import { getCurrentLeader } from '@/api/api';
  moment.locale('zh-cn')

  export default {
    props:['websock'],
    components: {

    },
    data () {
      return {
        status: 0,
        currentLeader: '',
        timer: null,
        currtTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    computed: {

    },
    created () {
      
    },
    mounted () {
      getCurrentLeader().then((res) => {
        if (res.code === 200 && res.result) {
          this.currentLeader = res.result.name
        }
      })
      this.timer = setInterval(() => {
        if (this.websock !== null && this.websock.readyState === 1) {
          this.status = 1
          // console.log('websocket connect!');
          this.currtTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        } else {
          // console.log('websocket close!');
          this.status = 0
        }
      }, 1000);

    },
    methods: {

    },
    beforeDestroy() {
      window.clearInterval(this.timer)
    },
  }
</script>

<style lang="less" scoped>
 .monitorFooter{
  height: 40px;
  background-color: rgba(0, 0, 0, 0.6);
  display: -ms-flexbox;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  margin-top: -40px;
 }
</style>
