<template>
  <ul class="tabs">
    <li
      v-for="item in list"
      :key="item.value"
      class="tabs__item"
      :class="{ 'tabs__item--active': activeValue === item.value }"
      @click="change(item)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'

import { tabParams } from '@/types';

export default Vue.extend({
  name: 'Tabs',

  props: {
    list: {
      type: Array,
      required: true,
    },

    activeValue: {
      type: [String, Number],
    },
  },

  methods: {
    change (item: tabParams): void {
      this.$emit('change', item)
    },
  },
})
</script>

<style lang="scss" scoped>
.tabs {
  width: 100%;
  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tabs__item {
  text-align: center;
  color: $color-sub-text;
  cursor: pointer;
	transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
	border-bottom: 2px solid transparent;
  padding: 0 0 4px;
}

.tabs__item:hover {
  color: $color-text;
}

.tabs__item::after {
  content: "";
  width: 100%;
	transform: scaleX(0);
	height: 2px;
  position: absolute;
  bottom: -2px;
  left: 0;
  background-color: $color-purple-500;
  display: inline-block;
	transform-origin: bottom right;
  transition: transform .2s ease-out;
}

.tabs__item:hover::after {
	transform: scaleX(1);
	transform-origin: bottom left;
}

.tabs__item--active.tabs__item {
	color: var(--color-text);
	border-color: $color-purple-500;
}
</style>
