<template>
  <el-dialog
    :title="isEdit ? `编辑 ${editData.file}` : `添加web component`"
    :visible.sync="dialogFormVisible"
    width="600px"
  >
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item label="测试baseUrl" prop="devBaseUrl">
        <el-select v-model="form.devBaseUrl">
          <el-option
            v-for="(it, i) in baseUrls"
            :key="i"
            :label="it"
            :value="it"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="线上baseUrl" prop="proBaseUrl">
        <el-select v-model="form.proBaseUrl">
          <el-option
            v-for="(it, i) in baseUrls"
            :key="i"
            :label="it"
            :value="it"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="校验线上的正则表达式 new RegExp().test(location.href)" prop="onlineReg">
        <el-input v-model="form.onlineReg" />
      </el-form-item>
      <el-form-item label="文件名，与baseUrl拼合" prop="file">
        <el-input v-model="form.file" />
      </el-form-item>
      <el-form-item label="代码" prop="code">
        <el-input v-model="form.code" type="textarea" autosize />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'DialogWebComponent',

  data () {
    return {
      dialogFormVisible: this.show,
      isEdit: false,
      baseUrls: [
        'https://iming.work/demo/generate-web-components/service/public/',
        'http://aikanvod.miguvideo.net/ifs/img/migu_',
        'https://aikanvod.miguvideo.com/ifs/img/migu_',
        '/ifs/img/migu_'
      ],
      form: {
        devBaseUrl: '',
        proBaseUrl: '',
        onlineReg: '.com',
        file: '',
        code: '',
        type: 2
      },
      rules: {
        devBaseUrl: [
          { required: true, message: '请选择', trigger: 'blur' }
        ],
        proBaseUrl: [
          { required: true, message: '请选择', trigger: 'blur' }
        ],
        onlineReg: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        file: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入', trigger: 'blur' }
        ]
      }
    }
  },

  props: {
    show: Boolean,
    editData: Object
  },

  watch: {
    show (val) {
      this.dialogFormVisible = val
      if (val) {
        // 重置form
        this.form = {
          devBaseUrl: '',
          proBaseUrl: '',
          onlineReg: '.com',
          file: '',
          code: '',
          type: 2
        }
      }
    },
    dialogFormVisible: {
      handler (val) {
        if (val === false) {
          this.$emit('update:show', false)
        }
      }
    },
    editData: {
      handler (val) {
        this.isEdit = !!val
        if (val) {
          this.form = {
            ...val
          }
        }
      },
      immediate: true
    }
  },

  methods: {
    confirm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const finalData = this.form.id ? { ...this.form, isEdit: true } : {
            ...this.form,
            id: Date.now()
          }
          this.$emit('change', finalData)
          this.dialogFormVisible = false
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="stylus">

</style>
