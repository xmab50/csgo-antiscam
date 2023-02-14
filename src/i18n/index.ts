import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { store } from '@/store'
import { Locales, messages } from './messages'

Vue.use(VueI18n)

const [systemLocale] = navigator.language.split('-')

export const i18n = new VueI18n({
  locale: systemLocale,
  fallbackLocale: Locales.EN,
  silentFallbackWarn: true,
  messages: messages,
})

store.getters.getStorage('locale')
.then(( response: Locales ) => {
  if (response) {
    i18n.locale = response
  }
  store.commit('setStorage', {
    name: 'locale',
    value: i18n.locale
  })
})
