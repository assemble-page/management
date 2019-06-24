<template>
  <el-dialog title="新建页面" :visible.sync="dialogFormVisible" width="400px">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item label="标题" label-width="100" prop="title">
        <el-input v-model="form.title" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="名称" label-width="100" prop="pageName">
        <el-input v-model="form.pageName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="描述" label-width="100">
        <el-input v-model="form.desc" autocomplete="off"></el-input>
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
  data () {
    const checkName = (rule, value, callback) => {
      if (/^[a-zA-Z]+$/.test(value)) {
        callback()
      } else {
        callback(new Error(rule.message))
      }
    }
    return {
      dialogFormVisible: this.show,
      form: {
        title: '',
        pageName: '',
        desc: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        pageName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { validator: checkName, message: '只能是字母组成', trigger: 'blur' }
        ]
      }
    }
  },

  props: {
    show: Boolean
  },

  watch: {
    show (val) {
      this.dialogFormVisible = val
    },
    dialogFormVisible: {
      handler (val) {
        if (val === false) {
          this.$emit('update:show', false)
        }
      }
    }
  },

  methods: {
    confirm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('change', {
            ...this.form,
            id: Date.now()
          })
          this.dialogFormVisible = false
        } else {
          return false
        }
      })
    }
  }
}
</script>
