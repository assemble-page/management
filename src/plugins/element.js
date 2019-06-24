import Vue from 'vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Element, { size: 'mini' })

Vue.prototype.$loading2 = (function () {
  let ins = null

  return {
    open (text, background = 'rgba(0, 0, 0, 0.5)') {
      this.close()
      ins = Vue.prototype.$loading({ text, background })
    },

    close () {
      ins && ins.close()
    }
  }
})()
