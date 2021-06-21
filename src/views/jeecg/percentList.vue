<template>
  <div>
    <div class='title'>
      <h2>
      沙曲二矿“数字化”管理工作调度日报
      </h2>
      <a-date-picker @change="onChange" style='margin-right: 10px;' :default-value="moment(date)"/>
      <a-button type="primary" @click='query'>查询</a-button>
    </div>
    <div class='content'>
      <h3>开机率</h3>
      <a-table :columns="openColumns" :data-source="startUp" bordered :pagination=false :rowKey="(record,index)=>{return index}">
      </a-table>
      <h3>正规循环率</h3>
      <a-table :columns="cylceColumns" :data-source="cycle" bordered :pagination=false :rowKey="(record,index)=>{return index}">
      </a-table>
      <h3>工时利用率</h3>
      <a-table :columns="startColumns" :data-source="duty" bordered :pagination=false :rowKey="(record,index)=>{return index}">
      </a-table>
    </div>
  </div>
</template>
<script>
  let openColumns=[
    {
      title:"队组",
      dataIndex:"title"
    },
    {
      title:"当日累计开机时间（h）",
      dataIndex: "actualValue"
    },
    {
      title:"应开机时间（h）",
      dataIndex: "planValue"
    },
    {
      title:"开机率（%）",
      dataIndex: "value"
    }
  ]
  let cylceColumns=[
    {
      title:"队组",
      dataIndex:"title"
    },
    {
      title:"当日回采/掘进米数（m）",
      dataIndex: "actualValue"
    },
    {
      title:"应回采/掘进米数（m）",
      dataIndex: "planValue"
    },
    {
      title:"正规循环率（%）",
      dataIndex: "value"
    }
  ]
  let startColumns=[
    {
      title:"队组",
      dataIndex:"title"
    },
    {
      title:"工作区域时长（h）",
      dataIndex: "actualValue"
    },
    {
      title:"制度工作时长（h）",
      dataIndex: "planValue"
    },
    {
      title:"工时利用率（%）",
      dataIndex: "value"
    }
  ]
  import { getDaily } from '@api/api'
  import moment from 'moment';
  export default {
    name: 'photoList',
    data(){
      return {
        detailVisible:false,
        startUp:null,
        cycle:null,
        duty:null,
        date:null,
        openColumns,
        startColumns,
        cylceColumns,
      }
    },
    created() {
      let today=new Date();
      let initDate=today.getFullYear().toString()+"-"+(today.getMonth()+1<10?"0"+(today.getMonth()+1):today.getMonth()+1).toString()+"-"+today.getDate().toString();
      this.date=initDate;
      getDaily(initDate).then((response)=>{
        this.startUp=response.result.startUp;
        this.cycle=response.result.cycle;
        this.duty=response.result.duty;
      })
    },
    methods:{
      moment,
      showDetail(detail){
        this.detailVisible=true;
        this.staffDetail=detail;
        console.log(this.staffDetail)
      },
      onChange(date, dateString) {
        this.date=dateString;
      },
      query(){
        getDaily(this.date).then((response)=>{
          this.startUp=response.result.startUp;
          this.cycle=response.result.cycle;
          this.duty=response.result.duty;
        })
      }
    }
  }
</script>

<style scoped>
  *{
    -moz-user-select: none; /*火狐*/
    -webkit-user-select: none; /*webkit浏览器*/
    -ms-user-select: none; /*IE10*/
    user-select: none;
  }
  .title{
    padding: 20px 0;
    border-bottom: 1px solid #ddd;
  }
  h2{
    text-align: center;
    margin-bottom: 20px;
  }
  h3{
    text-align: center;
    margin: 20px 0;
    font-weight: bold;
  }
  /deep/ .ant-table{
    margin: 10px auto;
  }
  /deep/ .ant-table-title{
    font-size: 1rem;
    background:#fff;
  }
  /deep/ .ant-table-body{
    background:#fff
  }

</style>