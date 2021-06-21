<template>
  <div class="monitorBody">
    <monitorBodyLeft></monitorBodyLeft>
    <monitorBodyRight></monitorBodyRight>
  </div>
</template>

<script>
import monitorBodyLeft from './monitorBodyLeft'
import monitorBodyRight from './monitorBodyRight'
export default {
  props: {
   
  },
  components: {
    monitorBodyLeft,
    monitorBodyRight
  },
  data () {
    return {

    }
  },
  computed: {
    
  },
  created () {
    
  },
  mounted () {

  },
  methods: {
   
  }
}
</script>

<style lang="less" scoped>
  .monitorBody {
    position: absolute;
    top: 10%;
    width: 100%;
    .monitorBodyTop {

    }
  }
  
  
</style>
