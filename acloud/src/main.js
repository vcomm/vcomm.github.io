import Vue from 'vue'
import App from './App.vue'
import Chat from 'vue-beautiful-chat'

Vue.use(Chat)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
