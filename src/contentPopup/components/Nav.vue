<template>
  <nav class="nav">
    <Tabs
      :list="pages"
      :activeValue="$route.name"
      @change="onChangePage"
    />
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'

import { SETTINGS_PAGES } from '../router/routes'
import Tabs from '@/components/Tabs.vue'

import { tabParams } from '@/types';

export default Vue.extend({
  name: 'Nav',

  components: {
    Tabs,
  },

  computed: {
    pages () {
      return Object.entries(SETTINGS_PAGES).map(([routeKey, route]) => ({
        label: this.$t(`nav.${routeKey}`),
        value: route,
      }))
    },
  },

  methods: {
    onChangePage (page: tabParams) {
      this.$router.push({ name: page.value })
    },
  }
})
</script>

<style lang="scss" scoped>
.nav {
  width: 100%;
  margin-bottom: 30px;
  opacity: 0;
  animation: fadeIn 0.5s 0.2s forwards;
}

.nav .tabs {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-around;
}

.nav::v-deep li.tabs__item {
  text-transform: uppercase;
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  color: $color-gray-base-100;
  padding: 0 0 8px;
	border-bottom: 3px solid transparent;
}

.nav::v-deep li.tabs__item::after {
  height: 3px;
  bottom: -3px;
}

.nav::v-deep li.tabs__item--active.tabs__item {
  color: $color-text;
	border-color: $color-purple-500;
}
</style>
