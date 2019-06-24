import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './plugins/element.js'

Vue.config.productionTip = false

Vue.prototype.$http = axios.create({
  baseURL: 'http://localhost:7001'
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
