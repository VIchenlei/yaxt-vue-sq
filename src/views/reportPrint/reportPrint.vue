<template>
  <a-card class='printContainer'>
    <a-button type="default" v-print="'#printContent'" class='printBtn'>打印</a-button>
    <div id='printContent'>
      <h1 class='title'>安全检查项目清单</h1>
      <ul>
        <li>nihao </li>
        <li>shijie</li>
      </ul>
    </div>

  </a-card>
</template>

<script>
export default {
  name: 'reportPoint'
}
</script>

<style scoped>
  .printContainer{
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 1%;
    border:0 solid black;
    min-width: 800px;
    color:#000000!important;
  }
  .printBtn{
    float: right;
    margin-right: 30px;
    border: 1px solid #1890ff;
  }
  .title{
    text-align: center;
    font-weight: bold;
    font-size: 2rem;
  }
</style>