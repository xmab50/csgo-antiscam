import Vue from 'vue'
import AccountProtection from './AccountProtection.vue'
import { store } from '@/store'
import { i18n } from '@/i18n'

new Vue({
  el: '#app',
  store,
  i18n,
  render: h => h(AccountProtection),
})
