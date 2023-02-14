import Vue, { VNode } from 'vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter
    $t: VueI18n
    VALIDATION_LOCALIZE_PATH: ''
    getFieldErrorMessage: Function
  }
}

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}
