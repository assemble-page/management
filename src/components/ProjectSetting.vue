<template>
  <div class="project-setting">
    <el-form :model="form" label-width="90px" label-position="left">
      <el-form-item label="标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="文件夹名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.desc" type="textarea" />
      </el-form-item>
      <el-form-item label="请求baseUrl">
        <el-input v-model="form.http.baseUrl"/>
      </el-form-item>
      <el-form-item label="请求uri映射">
        <el-input v-model="form.http.urlMap" type="textarea" placeholder="{ list: '/purchase/order/list' }" />
      </el-form-item>
    </el-form>

    <el-button type="primary" @click="submit">保存</el-button>
  </div>
</template>

<script>
export default {
  name: 'ProjectSetting',

  data () {
    return {
      form: {
        title: '',
        name: '',
        desc: '',
        http: {
          baseUrl: '/',
          urlMap: ''
        }
      }
    }
  },

  props: {
    details: Object
  },

  watch: {
    details: {
      handler (val) {
        this.form.name = val.projectName
        this.form.title = val.title
        this.form.desc = val.desc
        this.form.http.baseUrl = val.http && val.http.baseUrl
        this.form.http.urlMap = val.http && val.http.urlMap
      },
      immediate: true
    }
  },

  methods: {
    submit () {
      this.$emit('change', this.form)
    }
  }
}
</script>

<style lang="stylus">

</style>
