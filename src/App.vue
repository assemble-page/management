<template>
  <div id="app">
    <div class="header"></div>
    <div class="body">
      <div class="body-wrap">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  components: {
  }
}
</script>

<style lang="stylus">
html
  box-sizing border-box
body
  margin 0
  padding 0
div
  box-sizing inherit
ul
  list-style none
  margin 0
  padding 0
.header
  height 60px
  background-color #409EFF
.body
  height calc(100vh - 60px)
  overflow auto
  &-wrap
    // width 1100px
    // margin 0 auto
    height 100%
    // border 1px #eee solid
</style>
