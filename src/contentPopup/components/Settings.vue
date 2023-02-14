<template>
  <div class="settings">
    <div
      v-for="setting in settings"
      :key="setting"
      class="settings__checkbox"
    >
      <div
        class="settings__checkbox-info"
      >
        <p class="settings__checkbox-title app-title"> {{ $t(`settings.${setting}.title`) }} </p>
        <p class="settings__checkbox-description"> {{ $t(`settings.${setting}.description`) }}</p>
      </div>

      <Checkbox
        v-model="form[setting]"
        @input="onChangeSetting(setting)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Checkbox from '@/components/Checkbox.vue'

export default Vue.extend({
  name: 'Settings',

  props: {
    settings: {
      default: () => [],
      type: Object,
      required: true
    },

    form: {
      default: () => {},
      type: Object,
      required: true
    }
  },

  components: {
    Checkbox
  }
})
</script>

<style lang="scss" scoped>
.security-settings__checkbox {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.security-settings__checkbox-title {
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  color: $color-text;
  margin: 0;
}

.security-settings__checkbox-description {
  font-size: 14px;
  line-height: 20px;
  color: $color-gray-base-200;
  max-width: 320px;
}
</style>