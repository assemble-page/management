<template>
  <el-dialog :title="isEdit ? `编辑页面` : `新建页面`" :visible.sync="dialogFormVisible" width="600px">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.desc" autocomplete="off" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="mixins">
        <el-input v-model="form.mixins" :autosize="{ minRows: 4 }" type="textarea"></el-input>
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
    // const checkName = (rule, value, callback) => {
    //   if (/^[a-zA-Z]+$/.test(value)) {
    //     callback()
    //   } else {
    //     callback(new Error(rule.message))
    //   }
    // }
    return {
      dialogFormVisible: this.show,
      form: {
        title: '',
        // pageName: '',
        desc: '',
        mixins: '',
        backgroundColor: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
        // pageName: [
        //   { required: true, message: '请输入名称', trigger: 'blur' },
        //   { validator: checkName, message: '只能是字母组成', trigger: 'blur' }
        // ]
      }
    }
  },

  props: {
    show: Boolean,
    isEdit: Boolean,
    editData: Object
  },

  watch: {
    show (val) {
      this.dialogFormVisible = val
      if (val) {
        if (this.isEdit) {
          this.fill(this.editData)
        } else {
          this.form = {
            title: '',
            desc: '',
            mixins: '{\n  data () {\n    return {\n\n    } \n  },\n  created () {\n\n  },\n  mounted () {\n\n  },\n  methods: {\n\n  }\n}',
            backgroundColor: ''
          }
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
        if (val) {
          this.fill(val)
        }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    fill (val) {
      this.form.title = val.title
      this.form.desc = val.desc
      this.form.mixins = val.mixins
      this.form.backgroundColor = val.backgroundColor
    },

    confirm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('change', {
            ...this.form,
            id: this.isEdit ? this.editData.id : Date.now()
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
