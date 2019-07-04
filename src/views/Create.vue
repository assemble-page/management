<template>
  <div class="create" v-if="details">
    <div class="home-top">
      <el-button @click="$router.replace('/')">返回</el-button>
      <!--<el-button type="danger" @click="build()">打包发布</el-button>-->
      <!--<el-button type="primary" @click="checkTemplateVersion">检查模版更新</el-button>-->
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
        <template v-else>
          <el-tabs v-model="leftTab" type="card">
            <el-tab-pane label="项目" name="project">
              <p>基本设置</p>
              <project-form
                v-if="details"
                :details="details"
                @change="saveProjectSetting"
              />
            </el-tab-pane>
            <el-tab-pane label="页面" name="page">
              <div class="pages">
                <template v-if="details && details.state">
                  <div
                    v-for="item in Object.keys(details.state)"
                    :key="item.id"
                    class="pages-item"
                    :class="{ 'pages-item__active': currentEditPage && details.state[item].id === currentEditPage.id }"
                    @click="checkoutPage(details.state[item])"
                  >
                    <span>{{ details.state[item].title || `页面 - ${details.state[item].pageName}` }}</span>
                    <div class="pages-item__opt">
                      <span class="pages-item__del" @click.stop="isEditPage = true;showAddPage = true">
                        <i class="el-icon-edit" /> 编辑
                      </span>
                      <span class="pages-item__del" @click.stop="delCurrentPage">
                        <i class="el-icon-delete" /> 删除
                      </span>
                    </div>
                  </div>
                </template>
                <div class="pages-item" @click="isEditPage = false;showAddPage = true">添加页面</div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>
      <div class="create-body__preview">
        <div class="create-body__mobile">
          <template v-if="currentEditPage">
            <div class="create-body__mobile--title">{{ currentEditPage.title }}</div>
            <iframe
              ref="preview"
              width="100%"
              @load="previewLoad"
              :src="previewUrl"
              frameborder="0"
            />
          </template>
          <div v-else class="create-body__mobile--empty">
            <i class="el-icon-folder-opened" />
            <p>点击左侧选中页面</p>
          </div>
          <div class="create-body__options">
            <ul>
              <li
                v-if="currentEditPage"
                @click="reloadIframe"
                class="create-body__options--item"
              >
                <i class="el-icon-refresh" /> 刷新
              </li>
              <li
                v-if="currentEditComponent"
                @click="delCurrentComponent"
                class="create-body__options--item"
              >
                <i class="el-icon-delete" /> 删除
              </li>
              <li
                @click="beforeUpdateProject()"
                class="create-body__options--item"
              >
                <i class="el-icon-upload" /> 保存更改
              </li>
              <li
                @click="checkTemplateVersion()"
                class="create-body__options--item"
              >
                <i class="el-icon-refresh-right" /> 检查模版更新
              </li>
              <li
                @click="build()"
                class="create-body__options--item"
              >
                <i class="el-icon-box" /> 打包发布
              </li>
              <li
                @click="downloadProject()"
                class="create-body__options--item"
              >
                <i class="el-icon-box" /> 下载项目
              </li>
            </ul>
          </div>
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
                >
                  <div
                    v-if="item.needUpdate"
                    @click.stop="updateComponent(item)"
                    class="components-item__img--notice"
                  >可更新</div>
                </div>
                <span>{{ item.componentName }}</span>
              </div>
              <div class="components-item" @click="isEditWebComponent = false;showAddWebComponent = true">
                <div class="components-item__img"></div>
                <span>添加web components</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="组件配置" name="second">
            <form-config
              v-if="currentEditComponent && currentEditComponent.type === 1"
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
      :edit-data="currentEditPage"
      :is-edit="isEditPage"
      @change="addPage"
    />

    <add-web-component
      :show.sync="showAddWebComponent"
      :edit-data="currentEditComponent && currentEditComponent.type === 2 ? currentEditComponent : null"
      :is-edit="isEditWebComponent"
      @change="addComponent"
      @remove="delCurrentComponent"
    />
  </div>
</template>

<script>
import AddPage from '../components/DialogAddPage'
import AddWebComponent from '../components/DialogWebComponent'
import FormConfig from '../components/form'
import ProjectForm from '../components/ProjectSetting'

export default {
  data () {
    return {
      details: null,
      components: [],
      showAddPage: false,
      showEditProject: false,
      showAddWebComponent: false,
      isEditPage: false,
      isEditWebComponent: false,
      currentEditPage: null,
      currentEditComponent: null,
      rightFormTab: 'first',
      leftTab: 'page'
    }
  },

  components: {
    AddPage,
    FormConfig,
    AddWebComponent,
    ProjectForm
  },

  computed: {
    previewUrl () {
      return this.currentEditPage
        ? `${process.env.VUE_APP_PREVIEW_URL}/${this.details.projectName}/build/dist/index.html#/?id=${this.currentEditPage.id}`
        : ''
    }
  },

  created () {
  },

  async mounted () {
    this.$loading2.open('获取项目详情')
    const { data } = await this.$http.get('/assemble/getProjectsByName', { params: { name: this.$route.params.name } })
    this.details = data
    this.message({
      isGlobal: true,
      globalData: data
    })
    this.currentEditPage = data.state && data.state[Object.keys(data.state)[0]]
    this.getComponents()
    this.$loading2.close()

    window.addEventListener('message', e => {
      if (e.data.isFocus) {
        const { data } = e.data
        if (data.type === 1) {
          this.checkoutComponent(data)
        } else if (data.type === 2) {
          this.isEditWebComponent = true
          this.currentEditComponent = data
          this.showAddWebComponent = true
        }
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
      await this.updateProject({ url: data })
      this.$set(this.details, 'url', data)
      this.$loading2.close()
    },

    postMessage (state = {}) {
      this.message({
        isState: true,
        state: {
          ...this.details.state,
          ...state
        }
      })
    },

    message (data) {
      this.$nextTick(() => {
        this.$refs.preview && this.$refs.preview.contentWindow.postMessage(data, '*')
      })
    },

    async addPage (data) {
      const state = {
        ...this.details.state,
        [data.id]: this.isEditPage ? { ...this.details.state[data.id], ...data } : data
      }
      this.details.state = state
      this.currentEditPage = data
      this.postMessage()
    },

    async updateProject (obj) {
      await this.$http.post('/assemble/updateProject', { objectId: this.details.objectId, data: obj })
    },

    async beforeUpdateProject (message = '保存成功') {
      this.$loading2.open('保存中...')
      this.updateProjectDependencies()
      await this.updateProject(this.getProjectDetails())
      this.$loading2.close()
      if (message) {
        this.$message.success(message)
      }
    },

    checkoutPage (page) {
      if (!this.currentEditPage || this.currentEditPage.id !== page.id) {
        this.currentEditPage = page
        this.currentEditComponent = null
      }
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
      if (item.type === 2) {
        if (this.isEditWebComponent) {
          const i = this.currentEditPage.useComponents.findIndex(x => x.id === item.id)
          this.currentEditPage.useComponents.splice(i, 1, item)
        } else {
          this.currentEditPage.useComponents.push(item)
        }
      } else {
        this.currentEditPage.useComponents.push({
          ...item,
          type: 1,
          id: Date.now()
        })
        this.details.dependencies[item.pkgName] = item.version
      }
      this.postMessage()
    },

    updateProps (field, value) {
      this.currentEditComponent.props[field] = value
      // this.postMessage()
      const index = this.currentEditPage.useComponents.findIndex(x => x.id === this.currentEditComponent.id)
      this.currentEditPage.useComponents.splice(index, 1, this.currentEditComponent)
      this.postMessage()
    },

    previewLoad () {
      console.log('previewLoad')
      this.currentEditPage && this.postMessage()
    },

    async build () {
      await this.beforeUpdateProject(false)
      this.$loading2.open('打包中...')
      await this.$http.post('assemble/buildProject', this.details)
      this.$loading2.close()
      this.$message.success('打包成功')
    },

    async getComponents () {
      const { data } = await this.$http.get('/assemble/getComponents')
      // 校验组件更新
      if (this.details.dependencies) {
        Object.keys(this.details.dependencies).forEach(name => {
          const item = data.find(x => x.pkgName === name)
          if (item.version !== this.details.dependencies[name]) {
            item.needUpdate = true
          }
        })
      }
      this.components = data
    },

    async delCurrentComponent () {
      await this.$confirm('确定删除吗？')
      const i = this.currentEditPage.useComponents.findIndex(x => x.id === this.currentEditComponent.id)
      this.currentEditPage.useComponents.splice(i, 1)
      const name = this.currentEditComponent.file
      this.currentEditComponent = null
      this.postMessage()
      this.message({
        isRemoveNode: true,
        selector: `#${name}`
      })
    },

    async delCurrentPage () {
      await this.$confirm('确定删除吗？')
      delete this.details.state[this.currentEditPage.id]
      this.currentEditComponent = null
      const id = Object.keys(this.details.state)[0]
      this.currentEditPage = id ? this.details.state[id] : null
      this.postMessage()
    },

    /**
     * 更新页面组件依赖字段
     */
    updateProjectDependencies () {
      const pageId = Object.keys(this.details.state)
      const dependencies = {}
      pageId.forEach(id => {
        const { useComponents } = this.details.state[id]
        useComponents && useComponents.forEach(item => {
          dependencies[item.pkgName] = item.version
        })
      })
      this.details.dependencies = dependencies
      // return this.updateProject({ dependencies: this.details.dependencies })
    },

    getProjectDetails () {
      return {
        ...this.details,
        objectId: undefined,
        createdAt: undefined,
        updatedAt: undefined
      }
    },

    /**
     * 更新模版使用的组件依赖
     */
    async updateComponent (item) {
      this.details.dependencies[item.pkgName] = item.version
      // 更新模版依赖
      // 更新数据库依赖
      this.$loading2.open('更新组件会比较慢，重新安装依赖再 build 项目')
      await this.$http.post('/assemble/updateProjectComponent', {
        objectId: this.details.objectId,
        component: item,
        projectDetails: this.getProjectDetails()
      })
      this.$loading2.close()
      item.needUpdate = false
    },

    /**
     * 校验模版是否需要更新
     */
    async checkTemplateVersion () {
      this.$loading2.open('校验中...')
      const { data: { version, has } } = await this.$http.get('/assemble/checkTemplate', { params: { version: this.details.templateVersion } })
      this.$loading2.close()
      this.details.templateVersion = version
      if (has) {
        await this.$confirm('模版仓库有新版可用，是否下载更新?')
        this.$loading2.open('更新模版中，请稍后...')
        await this.$http.post('/assemble/updateTemplate', {
          name: this.$route.params.name,
          details: this.details,
          version
        })
        this.$loading2.close()
        this.$message.success('更新成功')
      } else {
        this.$message.info('模版无更新')
      }
    },

    async saveProjectSetting (data) {
      this.$loading2.open('保存中...')
      this.details = {
        ...this.details,
        ...(data || {})
      }
      await this.updateProject(this.getProjectDetails())
      this.message({
        isGlobal: true,
        globalData: this.details
      })
      this.$loading2.close()
      this.$message.success('保存成功')
    },

    reloadIframe () {
      this.$refs.preview.contentWindow.location.reload()
      this.$message.success('刷新成功')
    },

    downloadProject () {

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
      height 100%
      overflow auto
    &__preview
      display flex
      align-items center
      justify-content center
      flex-grow 1
      background-color #f2f2f2
    &__mobile
      position relative
      width 375px
      height 80%!important
      border 1px #eee solid
      background-color #fff
      &--empty
        padding-top 100px
        text-align center
        color #999
        i
          font-size 60px
      &--title
        height 50px
        display flex
        justify-content center
        align-items center
        background #4a4c55
        color: #fff
        font-size: 14px
      iframe
        overflow auto
        height calc(100% - 50px)
    &__options
      position absolute
      right -140px
      top 50%
      width 110px
      transform translateY(-50%)
      ul
        font-size 14px
        color #999
      &--item
        cursor pointer
        line-height 30px
        transition all .5s
        &:hover
          color #333
    &__component
      width 400px
      padding 0 10px
    &__page
      width 300px
      padding 0 10px
      &--nopack
        display flex
        justify-content center
        padding-top 30px

  .pages
    &-item
      position relative
      display flex
      justify-content center
      align-items center
      height 40px
      border 1px #cecece solid
      margin-top 10px
      margin-right 10px
      cursor pointer
      border-radius 4px
      overflow hidden
      &:hover
      &__active
        background-color #ecf5ff
        border-color #b3d8ff
        color #409eff
      &__opt
        position absolute
        right -50px
        transition all .3s
        opacity 0
      &:hover .pages-item__opt
        right 10px
        opacity 1
  .components
    display flex
    &-item
      width 100px
      border 1px #eee solid
      margin 10px 10px 0 0
      cursor pointer
      text-align center
      &__img
        position relative
        background-size 100% auto
        background-position center top
        height 100px
        border-bottom 1px #eee solid
        &--notice
          position absolute
          width 100%
          bottom 0
          background-color rgb(240, 249, 235)
          text-align center
          padding 3px 0
          font-size 12px
          cursor pointer
</style>
