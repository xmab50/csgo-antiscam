import Vue from 'vue'
import Faq from './Faq.vue'
import { i18n } from '@/i18n'

new Vue({
  el: '#app',
  i18n,
  render: h => h(Faq),
})
