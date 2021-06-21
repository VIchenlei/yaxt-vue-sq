<template>
  <div class="meta-dialog" v-show="isShow">
    <a-modal
      v-model="isVisible"
      :title="title"
      centered
      @ok="makesure"
      @cancel="handleCancle"
      width="60%"
    >
      <a-form-model
        v-for="(row, index) in rows"
        :key="index"
        ref="ruleForm"
        :model="models"
        :rules="rules"
        layout="inline"
        v-bind="{labelCol: { span: 7 }, wrapperCol: { span: 17 }}"
      >
        <a-form-model-item :ref="row.field_name" :label="row.field_label" :prop="row.field_name">
          <a-input
            v-model="row.field_value"
            @blur="onBlur"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'metaDialog',
  data() {
    return {
      isShow: false,
      isVisible: false,
      title: null,
      labelCol: { span: 7 },
      wrapperCol: { span: 18 },
      rows: null,
      rules: {},
      models: {}
    }
  },
  watch: {
    '$store.state.stateStore.metaDialogEdit': {
      handler (result) {
        console.log('监听状态', result)
        this.isShow = result.isVisible
        this.isVisible = result.isVisible
        this.title = result.title || this.title
        this.rows = result.rows || this.rows
        this.rules = this.getRules(this.rows)
      },
      deep: true
    }
  },
  computed: {},
  created() {},
  mounted() {
    // console.log('打印', this.toolbar)
  },
  methods: {
    getRules (rows) {
      let rules = {}
      let models = {}
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const { field_name, field_type, field_enableNull, field_value } = row
        const type = ['STRING', 'NUMBER'].includes(field_type) ? 'blur' : 'change'
        rules[field_name] = [{ required: !field_enableNull, message: '输入不能为空或包含特殊字符', trigger: type}]
        models[field_name] = field_value
      }
      this.models = models
      return rules
    },
    onBlur (evt) {
      // this.$refs.field_name.onFieldBlur()
    },
    handleCancle () {
      console.log('关闭对话框')
      this.$store.commit('stateStore/changeDialogEdit',{type: false})
    },
    makesure () {
      this.$store.commit('stateStore/changeDialogEdit',{type: false})
    },
  },
}
</script>

<style lang="less" scoped>
  .ant-modal {
    width: 80% !important;
    .ant-form-inline {
      display: inline-flex;
      height: 44px;
      .ant-form-item {
        width: 382px;
        margin-bottom: 0;
      }
    }
  }
</style>
