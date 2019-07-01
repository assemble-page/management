<template>
  <div class="home">
    <div class="home-top">
      <el-button type="primary" @click="newProject">新建项目</el-button>
    </div>
    <el-table
      :data="lists"
      border
      style="width: 100%">
    <el-table-column
      prop="projectName"
      label="项目名称"
      width="120">
    </el-table-column>
    <el-table-column
      prop="title"
      label="项目标题"
      width="120">
    </el-table-column>
    <el-table-column
      prop="templateVersion"
      label="模版版本"
      width="100">
    </el-table-column>
    <el-table-column
      prop="createdAt"
      label="创建时间">
    </el-table-column>
    <el-table-column
      prop="url"
      label="地址">
    </el-table-column>
    <el-table-column
      fixed="right"
      label="操作"
      width="100">
      <template slot-scope="scope">
        <el-button type="text" size="small" @click="delProject(scope)">删除</el-button>
        <el-button type="text" size="small" @click="edit(scope)">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>
  </div>
</template>

<script>
export default {
  name: 'home',
  components: {
  },

  data () {
    return {
      lists: []
    }
  },

  async created () {
    this.$loading2.open('处理中')
    const { data } = await this.$http.get('/assemble/getProjects')
    this.lists = data
    this.$loading2.close()
  },

  methods: {
    newProject () {
      this.$prompt('请输入项目名，英文字母', '新建项目').then(async ({ value }) => {
        // const loading = this.$loading()
        this.$loading2.open('下载模版中，请稍等...')
        await this.$http.get('/assemble/initProject', { params: { name: value.trim() } })
        this.$router.push(`/create/${value.trim()}`)
        this.$loading2.close()
      })
    },

    async delProject (item) {
      await this.$confirm('确定要删除吗？')
      this.$loading2.open('删除中，请稍等...')
      await this.$http.get('/assemble/delProject', { params: {
        name: item.row.projectName,
        objectId: item.row.objectId
      } })
      this.$loading2.close()
      this.lists.splice(item.$index, 1)
    },

    edit (item) {
      this.$router.push(`/create/${item.row.projectName}`)
    }
  }
}
</script>

<style lang="stylus">
.home
  height 100%
  &-top
    padding 10px
    border-bottom 1px #eeeeee solid
</style>
