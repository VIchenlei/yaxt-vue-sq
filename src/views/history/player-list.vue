<template>
  <div class="process-list">
    <track-list :track-list="list" :operate="callBack"></track-list>
  </div>
</template>

<script>
import trackList from './track-list.vue';
export default {
  components: { trackList },
  props: {
    list: {
      type: Array,
      default: [],
    }
  },
  data() {
    return {
      callBack: null
    };
  },
  computed: {},
  created() {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.callBack = this.$parent.handleOperate
    },
    initTrack(msg) {
      console.log("ctrlTrack")
    }
  }
}
</script>

<style lang="less" scoped>
  .process-list {
    position: relative;
    left: 10px;
    top: 10px;
    flex: auto;
    display: flex;
    width: 520px;
    max-width: 520px;
    z-index: 999;
    background: #fff;
    max-height: 500px;
    overflow-y: auto;
  }
</style>