<template>
  <div>
    <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    @cancel="handleCancel"
    :footer="null">
      <div class="dlg-header">
        <p class="dlg-header-text" v-for="(name, index) in names" :key="index" :class="name">
          <span>{{ labels[index] }}：</span>
          <span>{{ getValue(name) }}</span>
        </p>
        <p class="dlg-header-text time-interval">
          <span>时间间隔：</span>
          <span>
            <a-select :default-value="defaultTimeValue" style="width: 120px" @change="changeSelectTime" v-model="selectTime">
              <a-select-option v-for="(timeOption, index) in timeOptions" :key="index" :value="timeOption.value">
                {{ timeOption.label }}
              </a-select-option>
            </a-select>
          </span>
        </p>
      </div>
      <div class="askfile">
        <a-button type="primary" @click="askFile">
          导出
        </a-button>
      </div>
      <div class="dlg-body">
        <a-table :columns="columns" :data-source="lists" rowKey="id">
        </a-table>
      </div>
    </j-modal>
  </div>
</template>
<script>
import { staffDef, timeOptions, tableColumns } from './track_def'
import { getTrailExport } from '@api/api'

export default {
  name: 'trackModal',
  data () {
    return {
      title: '轨迹详细数据',
      visible: false,
      record: null,
      names: staffDef.names,
      labels: staffDef.labels,
      timeOptions: timeOptions,
      defaultTimeValue: 0,
      selectTime: 0,
      columns: tableColumns,
      lists: null
    }
  },
  mounted() {
    console.log('dialog')
  },
  methods: {
    close () {
      this.selectTime = 0;
      this.$store.commit('stateStore/changeTrackModal', {
        type: false,
        rows: null
      })
    },
    handleCancel () {
      this.close();
    },
    getValue(name) {
      if (!this.record) return null;
      return this.record[name];
    },
    changeSelectTime(value) {
      this.selectTime = value;
      if (value === 0) {
        this.lists = this.record.list;
        return
      }
      const selectTimeM = value*60000;
      if (!this.record.list || (this.record.list && this.record.list.length === 0)) return 
      if (this.record.list && this.record.list.length === 1) return
      let firstTime = new Date(this.record.list[0].locationTime).getTime();
      let lastTime = new Date(this.record.list[this.record.list.length - 1].locationTime).getTime();
      const diffTime =  lastTime-firstTime; //轨迹第一个记录时间与最后记录时间差值
      let countGap = diffTime/selectTimeM; // 间隔，用来循环获取间隔内首个数据，countGap > 1执行循环事件
      countGap = countGap.toString().includes('.') ? Number(countGap.toString().split('.')[0]) + 1 : countGap
      if (countGap <= 1) {
        this.lists = [this.record.list[0]];
      } else {
        let lists = [];
        for (let i = 0; i < countGap; i++) {
          // if (i === countGap -1) continue;
          const oneTime = firstTime + selectTimeM * i;
          const twoTime = firstTime + selectTimeM * (i + 1);
          const list = this.getFisrtData(oneTime, twoTime);
          if (list.length > 0) lists.push(list[0]);
        }
        this.lists = lists;
      }
    },
    // 按时间间隔筛选数据
    getFisrtData(oneTime, twoTime) {
      let list = this.record.list.filter(item => oneTime <= new Date(item.locationTime).getTime() && new Date(item.locationTime).getTime() <= twoTime);
      return list
    },
    askFile() {
      // let record = this.record;
      // let url = `ident=${record.ident}&startTime=${record.startTime}&endTime=${record.endTime}&attDate="2021-06-16"&deptId`;
      // getTrailExport().then((res) => {
      //   console.log(res);
      // })
      return
      let fileName = '轨迹详细数据';
      let data = this.lists;
      //定义表头
      let str = `x坐标,y坐标,z坐标,记录时间,分站\n`;
      //增加\t为了不让表格显示科学计数法或者其他格式
      for(let i = 0 ; i < data.length ; i++ ){
          for(let item in data[i]){
              if (['id', 'bearing', 'mapCode', 'speed'].includes(item)) continue
              str+=`${data[i][item] + '\t'},`;     
          }
          str+='\n';
      }
      //encodeURIComponent解决中文乱码
      let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
      if (!data) {
        this.$message.warning("文件下载失败")
        return
      }
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        window.navigator.msSaveBlob(new Blob([data]), fileName+'.csv')
      }else{
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = uri
        link.setAttribute('download', fileName+'.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link); //下载完成移除元素
        window.URL.revokeObjectURL(uri); //释放掉blob对象
      }
    }
  },
  watch: {
    '$store.state.stateStore.trackModal': {
      handler (result) {
        console.log(result)
        this.visible = result.isVisible;
        this.record = result.rows;
        if (this.record) {
          this.lists = this.record.list;
        } else {
          this.lists = null;
        }
      },
      deep: true
    }
  }
}
</script>
<style lang="less" scoped>
  .dlg-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: #333;
    .dlg-header-text {
      width: 150px;
    }
    .startTime, .endTime {
      width: 240px;
    }
    .time-interval {
      width: 240px ;
    }
  }
  .askfile {
    padding: 10px 0;
  }
</style>