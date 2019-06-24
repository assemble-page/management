<template>
  <div class="create" v-if="details">
      <div class="home-top">
        <el-button @click="$router.replace('/')">返回</el-button>
        <el-button type="danger" @click="build()">打包发布</el-button>
        <el-button type="primary" @click="updatePage(undefined, undefined, '同步成功')">同步到数据库</el-button>
      </div>

      <div class="create-body">
        <div class="create-body__page">
          <template v-if="!details.url">
            <el-alert
              title="该项目还未初始化依赖及初次打包"
              type="warning">
            </el-alert>
            <div class="create-body__page--nopack">
              <el-button
                type="primary"
                @click="install"
              >
                安装依赖并打包
              </el-button>
            </div>
          </template>
          <template v-if="details.url">
            <p>项目页面</p>
            <!-- <el-button type="primary" @click="showAddPage = true">添加页面</el-button> -->
            <div class="pages">
              <template v-if="details && details.state">
                <div
                  v-for="item in Object.keys(details.state)"
                  :key="item.id"
                  class="pages-item"
                  :class="{ 'pages-item__active': details.state[item].id === currentEditPage.id }"
                  @click="checkoutPage(details.state[item])"
                >{{ item.title || `页面 - ${details.state[item].pageName}` }}</div>
              </template>
              <div class="pages-item" @click="showAddPage = true">添加页面</div>
            </div>
          </template>
        </div>
        <div class="create-body__preview">
          <div v-if="currentEditPage" class="create-body__mobile">
            <iframe
              ref="preview"
              width="100%"
              height="100%"
              @load="previewLoad"
              :src="`http://localhost:85/${details.projectName}/build/dist/index.html#/?id=${currentEditPage.id}`" frameborder="0"
            />
          </div>
        </div>
        <div class="create-body__component">
          <el-tabs v-model="rightFormTab" type="card">
            <el-tab-pane label="组件库" name="first">
              <div class="components">
                <div
                  v-for="item in components"
                  :key="item.pkgName"
                  class="components-item"
                  @click="addComponent(item)">
                  <div
                    class="components-item__img"
                    :style="{ backgroundImage: `url(${item.imgUrl})` }"
                  />
                  <p>{{ item.componentName }}</p>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="组件配置" name="second">
              <form-config
                v-if="currentEditComponent"
                :schema="currentEditComponent.props"
                :updateProps="updateProps"
              />
              <p v-else style="color:#999;text-align:center;padding-top:30px;">请选中组件</p>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <add-page
        :show.sync="showAddPage"
        @change="updatePageSyncMessage"
      />
  </div>
</template>

<script>
import AddPage from '../components/DialogAddPage'
import FormConfig from '../components/form'

export default {
  data () {
    return {
      details: null,
      components: [],
      showAddPage: false,
      showEditProject: false,
      currentEditPage: null,
      currentEditComponent: null,
      rightFormTab: 'first'
    }
  },

  components: {
    AddPage,
    FormConfig
  },

  async created () {
    const res = await this.$http.get('/assemble/getComponents')
    this.components = res.data
  },

  async mounted () {
    const { data } = await this.$http.get('/assemble/getProjectsByName', { params: { name: this.$route.params.name } })
    this.details = data
    this.currentEditPage = data.state && data.state[Object.keys(data.state)[0]]

    window.addEventListener('message', e => {
      if (e.data.isFocus) {
        this.checkoutComponent(e.data.data)
      } else if (e.data.isState) {
        console.log(e.data)
      }
    })
  },

  methods: {
    async install () {
      const getParams = type => ({ params: { name: this.$route.params.name, type } })
      this.$loading2.open('安装依赖中...')
      await this.$http.get('/assemble/execProject', getParams('install'))
      this.$loading2.open('打包中...')
      const { data } = await this.$http.get('/assemble/execProject', getParams('build'))
      this.$loading2.open('更新url...')
      const url = data.substr(data.indexOf('destination') + 'destination'.length)
      // await this.$http.post('/assemble/updateProject', { objectId: this.details.objectId, data: { url } })
      await this.updateProject({ url })
      this.$set(this.details, 'url', url)
      this.$loading2.close()
    },

    postMessage (state = {}) {
      this.$nextTick(() => {
        this.$refs.preview.contentWindow.postMessage({
          isState: true,
          state: {
            ...this.details.state,
            ...state
          }
        }, '*')
      })
    },

    async updatePage (pageObj = {}, syncDb = true, message) {
      const state = {
        ...this.details.state,
        ...pageObj
      }
      if (syncDb) {
        // update 数据库
        // await this.$http.post('/assemble/updateProject', { objectId: this.details.objectId, data: { state } })
        await this.updateProject({ state })
        message && this.$message.success(message)
      }
      this.details.state = state
      this.currentEditPage = state[this.currentEditPage ? this.currentEditPage.id : Object.keys(pageObj)[0]]
    },

    async updatePageSyncMessage (data, syncDb) {
      await this.updatePage({ [data.id]: data }, syncDb)
      // postMessage 实时更新页面
      this.postMessage()
    },

    async updateProject (obj) {
      await this.$http.post('/assemble/updateProject', { objectId: this.details.objectId, data: obj })
    },

    checkoutPage (page) {
      this.currentEditPage = page
      this.currentEditComponent = null
    },

    checkoutComponent (data) {
      // 根据 props 渲染表单编辑
      // console.log(data)
      this.currentEditComponent = data
      this.rightFormTab = 'second'
    },

    addComponent (item) {
      if (!this.currentEditPage) {
        this.$message.info('请先添加页面')
        return
      }
      if (!this.currentEditPage.useComponents) {
        this.currentEditPage.useComponents = []
      }
      this.currentEditPage.useComponents.push({ ...item, id: Date.now() })
      this.updatePageSyncMessage(this.currentEditPage)
    },

    updateProps (field, value) {
      this.currentEditComponent.props[field] = value
      // this.postMessage()
      const index = this.currentEditPage.useComponents.findIndex(x => x.id === this.currentEditComponent.id)
      this.currentEditPage.useComponents.splice(index, 1, this.currentEditComponent)
      this.updatePageSyncMessage(this.currentEditPage, false)
    },

    previewLoad () {
      console.log('previewLoad')
      this.currentEditPage && this.postMessage()
    },

    async build () {
      // await this.updatePage()
      this.$loading2.open('打包中...')
      await this.$http.post('assemble/buildProject', this.details)
      this.$loading2.close()
      this.$message.success('打包成功')
    }
  }
}
</script>

<style lang="stylus">
.create
  height 100%
  &-body
    display flex
    justify-content center
    height calc(100% - 50px)
    & > div
      width 33.333%
      height 100%
      overflow auto
    &__preview
      display flex
      align-items center
    &__mobile
      width 100%
      height 80%!important
      border 1px #eee solid
      // margin-top
    &__component
      padding 0 10px
    &__page
      &--nopack
        display flex
        justify-content center
        padding-top 30px

  .pages
    &-item
      display flex
      justify-content center
      align-items center
      // width 100%
      height 50px
      // background-color #f2f2f2
      border 1px #cecece solid
      margin-top 10px
      margin-right 10px
      cursor pointer
      border-radius 4px
      &:hover
      &__active
        background-color #ecf5ff
        border-color #b3d8ff
        color #409eff

  .components-item
    width 100px
    border 1px #eee solid
    margin 10px 10px 0 0
    &__img
      background-size 100% auto
      background-position center top
      height 100px
      border-bottom 1px #eee solid
</style>
