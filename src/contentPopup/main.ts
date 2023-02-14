import Vue from 'vue'
import App from './App.vue'
import { store } from '@/store'
import { router } from '@/contentPopup/router'
import { i18n } from '@/i18n'

new Vue({
  el: '#app',
  store,
  router,
  i18n,
  render: h => h(App),
})
