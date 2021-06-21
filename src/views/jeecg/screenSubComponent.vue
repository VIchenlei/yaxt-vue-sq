<template>
  <dv-border-box-12  id="personCarCount" :backgroundColor="'rgba(0,0,0,0.2)'">
    <h3>
      <span class="themeColor">
        人员和车辆总数
      </span>
    </h3>
    <a-row type="flex" justify="space-around" align="middle">
      <a-col :span="8"  @click="showDialog">
        <dv-border-box-2 class="person_car" name='staff'>
          {{staffCount}}
          <span style="font-size: 14px">
            人
          </span>
        </dv-border-box-2>
      </a-col>
      <a-col :span="8" @click="showDialog">
        <dv-border-box-2 class="person_car" name='vehicle'>
          {{ carCount }}
          <span style="font-size: 14px">
            辆
          </span>
        </dv-border-box-2>
      </a-col>
    </a-row>
  </dv-border-box-12>
</template>

<script>
import { getStaffMineCard, getVehicleMineCard, getPositionCard } from '@/api/api'
export default {
  name: 'screenSubComponent',
  props: {
    carCount:Number,
    staffCount:Number,
  },
  data () {
    return {

    }
  },
  methods: {
    showDialog(evt) {
      const target = evt.target
      const cardType = target.parentElement.getAttribute('name') || target.parentElement.parentElement.getAttribute('name')
      console.log('展示人车详细列表', cardType)
      let mapID = window.xdata.state.mapService.mapID
      getPositionCard({mapID, type: cardType}).then((res) => {
        if (res.code === 200) {
          this.$store.commit('stateStore/changeDetailDialog', {
            type: true,
            cardType: cardType,
            data: res.result
          })
        }
      })
    }
  }
}
</script>

<style scoped>
  h3{
    text-align: center;
  }
  #personCarCount{
    height:200px;
    color:#71FcF4;
  }
  .person_car{
    height:80px;
    margin-top: 30px;
    line-height: 80px;
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
  }
  .themeColor{
    color:#71FcF4
  }
</style>