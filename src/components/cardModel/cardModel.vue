<template>
  <div id="components-modal-demo-position" v-if="isVisible">
    <a-modal
      v-model="isVisible"
      :title="title"
      :footer="false"
      :mask='false'
      :confirm-loading="confirmLoading"
      @cancel="handleCancel"
      centered
      :getContainer="() => mapElement"
      :width="500"
      class="card-dialog"
    >
    <div class="card-tips-body">
      <div class="card-tips-title">
        <span>基本信息</span>
      </div>
      <div class="card-tips-content">
        <div class="content-block">
          <div>
            <p v-for="(item,index) in firstFields.names" :key="index" class="content-block-label">
              <span class="lable">{{ firstFields.labels[index] }}：</span>
              <span class="value" :title="getInfoValue(item, index, 1)">{{ getInfoValue(item, index, 1) }}</span>
            </p>
          </div>
          <div class="img-warp">
            <img :src="getPic(cardData.pic)">
          </div>
        </div>
      </div>
      <div class="card-tips-title">
        <span>当前状态</span>
      </div>
      <div class="card-tips-content status">
        <p v-for="(item,index) in twoFields.names" :key="index" class="content-block-label">
          <span class="lable">{{ twoFields.labels[index] }}：</span>
          <span class="value" :title="getInfoValue(item, index, 2)">{{ getInfoValue(item, index, 2) }}</span>
        </p>
      </div> 
    </div>
    </a-modal>
  </div>
</template>

<script>
  import { sendCallReq, stopCallReq } from '@/api/api';
  import { setPointCenter } from '../../store/map/mapUtils/OlMapUtils'
  const cardDefs = {
    'staff': {
      firstFields:{
        names: ['ident', 'code', 'name', 'sex', 'deptName', 'workTypeName', 'post'],
        labels: ['卡号', '工号', '姓名', '性别', '部门', '工种', '职务']
      },
      twoFields: {
        names: ['startTime', 'workTime', 'pwrPercent', 'speed', 'stayFlag', 'updateTime', 'position', 'x', 'y'],
        labels: ['下井时间', '时长（h）', '电量', '速度（m/s）', '状态', '时间', '位置', '东经', '北纬']
      }
    },
    'vehicle':{
      firstFields:{
        names: ['ident', 'name', 'type', 'deptName'],
        labels: ['卡号', '车牌', '类型', '部门']
      },
      twoFields: {
        names: ['startTime', 'workTime', 'driverName', 'speed', 'pwrPercent', 'stayFlag', 'updateTime', 'position', 'x', 'y'],
        labels: ['出车', '时长（h）', '司机', '速度（m/s）', '电量', '状态', '时间', '位置', '东经', '北纬']
      }
    }
  }

  export default {
    data() {
      return {
        title: '',
        isVisible: false,
        confirmLoading:false,
        ajaxName: '',
        subType: 'staff',
        firstFields: cardDefs['staff'].firstFields,
        twoFields: cardDefs['staff'].twoFields,
        mapElement: this.$store.state.stateStore.mapContainer
      }
    },
    computed:{
    },
    mounted () {
      
    },
    methods: {
      handleCancel(e) {
        this.$store.commit('stateStore/changeCardModal',{
          type: false,
          data: null,
          subType: ''
        })
      },
      getInfoValue(item, index, type) {
        let value = ''
        if (type === 1) {
          value = this.cardData[item]
        } else {
          value = this.cardData.currentStatusDto[item]
          const subTypeName = this.subType === 'staff' ? 'scards' : 'vcards'
          let cards = this.$store.state.cardStore[subTypeName]
          let cardId = this.cardData.ident
          let cardData = cards.get(cardId)
          value = cardData[item] ? cardData[item] : value
        }
        return value
      },
      getPic(pic) {
        var src=""
        if (pic === "/") {
          src = this.subType === 'staff' ? require(`../../assets/img/kuanggong_default.png`) : require(`../../assets/img/car_default.png`)
        } else {
          src = `${window._CONFIG['picURL']}${pic}`
        }
        return src
      },
    },
    watch: {
      '$store.state.stateStore.cardModal': {
        handler (result) {
          console.log('result', result)
          this.mapElement = this.$store.state.stateStore.mapContainer
          this.isVisible = result.isVisible
          this.cardData = result.data
          this.subType = result.subType
          this.firstFields = this.subType && cardDefs[this.subType].firstFields
          this.twoFields = this.subType && cardDefs[this.subType].twoFields
          this.title = this.subType === 'staff' ? '人员信息' : '车辆信息'
          if (this.isVisible) {
            this.$nextTick(() => {
              let dragTarget = this.$root.$el.querySelector('.card-dialog')
              let dragHandle = this.$root.$el.querySelector('.ant-modal-header')

              window.setDialogDraggable(dragTarget, dragHandle)
              setTimeout(() => {
                setPointCenter(dragTarget) // 设置对话框默认居中
              }, 10);
            })
          }
        },
        deep: true
      }
    }
  }
</script>

<style lang="less" scoped>
.card-tips-body{
  .card-tips-title{
    padding: 5px 0;
    font-weight: bold;
    border-bottom: 1px solid rgba(179, 179, 179, 0.5);
  }
  .content-block {
    padding: 5px 0;
    display: flex;
    align-items: inherit;
    justify-content: space-between;
    .content-block-label{
      line-height: 25px;
    }
    .img-warp {
      display: flex;
      flex-direction: column;
      justify-content: center;
      img{
        width: 100px;
        height: 125px;
      }
    }
    
  }    
  .status{
    padding: 5px 0;
    .content-block-label{
      width: 215px;
      line-height: 25px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    } 
  }   
  
}
      
</style>
<style>
  .card-dialog  .ant-modal-header {
    background: #09f;
    cursor: move;
  }
  .card-dialog  .ant-modal-title {
    color: #fff;
  }
</style>