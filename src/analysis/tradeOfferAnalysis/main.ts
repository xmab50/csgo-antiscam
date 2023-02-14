import Vue from 'vue'
import App from './App.vue'
import { store } from '@/store'
import { i18n } from '@/i18n'

export function render () {
  const targetDom = document.createElement('div')
  const mainContent = document.querySelector('#mainContent')
  
  targetDom.id = 'trade-offer-analysis-app'
  mainContent?.prepend(targetDom)

  new Vue({
    el: '#trade-offer-analysis-app',
    store,
    i18n,
    render: h => h(App),
  })
}
