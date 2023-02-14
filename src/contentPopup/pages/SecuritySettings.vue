<template>
  <div class="security-settings">
    <div
      v-for="setting in settings"
      :key="setting"
      class="security-settings__checkbox"
    >
      <div class="security-settings__checkbox-info">
        <p class="security-settings__checkbox-title app-title"> {{ $t(`settings.${setting}.title`) }} </p>
        <p class="security-settings__checkbox-description"> {{ $t(`settings.${setting}.description`) }}</p>
      </div>

      <Checkbox
        v-model="form[setting]"
        @input="onChangeSetting(setting)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapMutations, mapActions } from 'vuex'

import Checkbox from '@/components/Checkbox.vue'
import { settings, settingsEvents } from '@/consts/settings.const'

import { settingsData } from '@/types'

export default Vue.extend({
  name: 'SecuritySettings',

  components: {
    Checkbox,
  },

  data: (): settingsData  => {
    return {
      settings,
      settingsEvents,
      form: {},
    }
  },

  computed: {
    ...mapGetters(['getStorage']),
  },

  methods: {
    ...mapMutations(['setStorage']),
    ...mapActions(['updateIdentify', 'sendAnalyticsEvent']),

    async onChangeSetting (setting: string): Promise<void> {
      this.setStorage({
        name: 'settings',
        value: { ...this.form },
      })

      this.updateIdentify(this.form)

      this.sendAnalyticsEvent({
        event: this.settingsEvents[setting],
        data: {
          enabled: this.form[setting],
        },
        force: true,
      })
    },
  },

  async created () {
    this.form = await this.getStorage('settings')

    this.sendAnalyticsEvent({
      event: 'extension_settings_tabs',
      data: {
        name: 'security',
        action: 'opened'
      },
    })
  },
})
</script>

<style lang="scss" scoped>
.security-settings {
  opacity: 0;
  animation: fadeIn 0.5s 0.2s forwards;
  margin: 10px 0;
}

.security-settings__checkbox {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.security-settings__checkbox-title {
  font-weight: 400;
  font-size: 15px;
  margin: 0;
}

.security-settings__checkbox-description {
  font-size: 13px;
  color: $color-sub-text;
  max-width: 205px;
  margin: 3px 0 0 0;
}
</style>
