<template>
  <div class="trade-settings">
    <div
      v-for="tradeSetting in tradeSettings"
      :key="tradeSetting"
      class="trade-settings__checkbox"
    >
      <div class="trade-settings__checkbox-info">
        <p class="trade-settings__checkbox-title app-title"> {{ $t(`tradeSettings.${tradeSetting}.title`) }} </p>
        <p class="trade-settings__checkbox-description"> {{ $t(`tradeSettings.${tradeSetting}.description`) }}</p>
      </div>

      <Checkbox
        v-model="form[tradeSetting]"
        @input="onChangeSetting(tradeSetting)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { mapGetters, mapMutations, mapActions } from 'vuex'

import Checkbox from '@/components/Checkbox.vue'

import { tradeSettings, tradeSettingsEvents } from '@/consts/settings.const'
import { portTabs } from '@/consts/portTabs.const'

import { tradeSettingsData } from '@/types'

export default Vue.extend({
  name: 'TradeSettings',

  components: {
    Checkbox,
  },

  data: (): tradeSettingsData  => {
    return {
      tradeSettings,
      tradeSettingsEvents,
      form: {}
    }
  },

  computed: {
    ...mapGetters(['getStorage']),
  },

  methods: {
    ...mapMutations(['setStorage']),
    ...mapActions(['updateIdentify', 'sendAnalyticsEvent', 'sendMessagesToTabsPort']),

    async onChangeSetting (tradeSetting: string): Promise<void> {
      this.setStorage({
        name: 'tradeSettings',
        value: { ...this.form },
      })

      this.updateIdentify(this.form)

      this.sendMessagesToTabsPort({
        portName: 'settingsChangesPort',
        tabName: portTabs.steamPage.name,
        data: this.form[tradeSetting]
      })

      this.sendAnalyticsEvent({
        event: this.tradeSettingsEvents[tradeSetting],
        data: {
          enabled: this.form[tradeSetting],
        },
        force: true,
      })
    },
  },

  async created () {
    this.form = await this.getStorage('tradeSettings')

    this.sendAnalyticsEvent({
      event: 'extension_settings_tabs',
      data: {
        name: 'tradeSettings',
        action: 'opened'
      },
    })
  },
})
</script>

<style lang="scss" scoped>
.trade-settings {
  opacity: 0;
  animation: fadeIn 0.5s 0.2s forwards;
  margin: 10px 0;
}

.trade-settings__checkbox {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.trade-settings__checkbox-title {
  font-weight: 400;
  font-size: 15px;
  margin: 0;
}

.trade-settings__checkbox-description {
  font-size: 13px;
  color: $color-sub-text;
  max-width: 205px;
  margin: 3px 0 0 0;
}
</style>
