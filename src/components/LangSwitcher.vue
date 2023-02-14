<template>
  <div class="lang-switcher">
    <Tabs
      :list="availableLocales"
      :activeValue="$i18n.locale"
      @change="onChangeLocale"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { mapMutations } from 'vuex'
import Tabs from './Tabs.vue'

import { tabParams } from '@/types';

export default Vue.extend({
  name: 'LangSwitcher',

  components: {
    Tabs,
  },

  computed: {
    availableLocales () {
      return this.$i18n.availableLocales.map(locale => ({
        label: locale,
        value: locale,
      }))
    },
  },

  methods: {
    ...mapMutations(['setStorage']),

    onChangeLocale (locale: tabParams) {
      this.$i18n.locale = locale.value

      this.setStorage({
        name: 'locale',
        value: locale.value,
      })
    },
  },
})
</script>

<style lang="scss" scoped>
.lang-switcher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-flow: row nowrap;
  padding: 6px 12px;
  background: $color-gray-base-500;
  border-radius: 5px;
}

.lang-switcher >>> li {
  text-transform: uppercase;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  margin: 0 4px;
}
</style>
