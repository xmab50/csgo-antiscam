import Vue from 'vue'
import Vuex from 'vuex'

import common from './modules/common'
import analysis from './modules/analysis'
import inventory from './modules/inventory'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    common,
    analysis,
    inventory,
  },
})
