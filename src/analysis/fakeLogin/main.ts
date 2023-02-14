import Vue from 'vue'
import App from './App.vue'
import { store } from '@/store'
import { i18n } from '@/i18n'

export function render () {
  const targetDom = document.createElement('div')
  targetDom.id = 'fake-login-app'
  document.head.innerHTML = '<title>Fake Login Alert</title>'
  document.body.innerHTML = '';
  document.body.appendChild(targetDom)

  new Vue({
    el: '#fake-login-app',
    store,
    i18n,
    render: h => h(App),
  })
}
