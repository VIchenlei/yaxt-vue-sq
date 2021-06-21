<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @cancel="handleCancel"
    :footer="null">
    <div class="power-body">
      <div class="power-warp" v-for="(item, index) in rows" :key="index">
        <span>{{item.powerLevelsId}}路</span>
        <div class="conetent">
          <div class="rs-text-field">
            <fieldset class="text-field" v-for="(powerValue, powerKey) in item" :key="powerKey" :class="setClass(powerKey, 'power')">
              <legend>{{power[powerKey]}}</legend>
              <span class="text-field-input">
                <span>{{getValue(powerKey, powerValue)}}</span>
              </span>
            </fieldset>
          </div>
        </div>
        <div class="conetent" v-if="item.busiPowerMonitoring">
          <span>实时信息</span>
          <div class="rs-text-field">
            <fieldset class="text-field" v-for="(realPowerValue, realPowerKey) in item.busiPowerMonitoring" :key="realPowerKey" :class="setClass(realPowerKey, 'realPower')">
              <legend>{{realPower[realPowerKey]}}</legend>
              <span class="text-field-input">
                <span>{{getValue(realPowerKey, realPowerValue)}}</span>
                <input class="color" type="color" :value="setColor(realPowerKey, realPowerValue)" :disabled="true" :class="showColorBtn(realPowerKey)"/>
              </span>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import {filterDictTextByCache} from '@/components/dict/JDictSelectUtil'
  import { power, realPower } from './power_def'


  export default {
    name: "readerDeviceModal",
    components: { 
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"实时信息",
        width: 900,
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        rows: null,
        power: power,
        realPower: realPower
      }
    },
    created () {
    },
    methods: {
      close () {
        this.$emit('close');
        this.$store.commit('stateStore/changeRealPowerModal', {
          type: false,
          rows: null
        })
      },
      handleCancel () {
        this.close();
      },
      setClass(key, type) {
        let className = 'hide';
        if (type === 'power') {
          className = this.power[key] ? '' : 'hide';
          if (key === 'id') className = 'hide';
        } else {
          className = this.realPower[key] ? '' : 'hide';
        }
        return className;
      },
      getValue(key, value) {
        if (key === 'alternatingCurrent') value = value === 1 ? '有' : '无';
        if (key === 'forcedDischarge') value = value === 1 ? '是' : '否';
        if (key === 'batteryType') {
          value = filterDictTextByCache('battery_type', value);
        }
        return value
      },
      showColorBtn(key) {
        if (['batteryCapacity', 'alternatingCurrent'].includes(key)) return '';
        return 'hide'
      },
      setColor(key, value) {
        let color = ''
        if (['batteryCapacity', 'alternatingCurrent'].includes(key)) {
          if (value > 80) color = '#27CA41';
          if (value <= 80 && value >= 40) color = '#FFCC32';
          if (value < 40) color = '#FD5F56';   
        }
        return color;
      }
    },
    watch: {
      '$store.state.stateStore.realPowerModal': {
        handler (result) {
          this.visible = result.isVisible;
          console.log('电源实时信息', result);
          if (this.visible) {
            this.rows = result.rows;
          }
        },
        deep: true
      }
    }
  }
</script>

<style lang="less" scoped>
.hide {
  display: none;
}
.power-body {
  max-height: 512px;
  overflow: auto;
}
.power-warp {
  padding: 3px;
  border-bottom: 1px solid rgba(179,179,179,.5);
}
fieldset {
  display: inline-block;
  width: 200px;
  height: 48px;
  border: 1px solid rgba(179,179,179,.5);
  border-radius: 5px;
  margin: 2px;
  legend {
    width: auto;
    font-size: 14px;
    color: #666666;
    margin-left: 8px;
    white-space: nowrap;
    padding: 0 2px;
    margin: 0 0 0 8px;
    .text-field-tips {
      color: #ff6057;
    }
  }
    
  .text-field-input {
    width: 200px;
    padding: 5px 9px;
    border: none;
    outline: none;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .color {
      width: 36px;
      height: 20px;
      padding: 0;
    }
  }    
}
  
    
</style>