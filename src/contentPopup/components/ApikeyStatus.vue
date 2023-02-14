<template>
  <div class="apikey-status">
    <div class="apikey-status__container">
      <header class="apikey-status__header">
        <h4 class="apikey-status__title">
          {{ $t('apikeyStatus.title') }}
        </h4>
      </header>
      <div class="apikey-status__apikey-state__container">
        <div class="apikey-status__apikey-state__wrapper">
          <div
            class="apikey-status__apikey-state__indicator apikey__indicator"
            :class="hasApikeyStatuses"
          />
          <div class="apikey-status__apikey-state__label">
            {{ $t(`apikeyStatus.status.${hasApikeyStatuses}`) }}
          </div>
          <div class="apikey-status__apikey-state__info">
            <Tooltip :content="$t('apikeyStatus.tooltip.notRegistered')" />
          </div>
        </div>
        <a
          class="apikey-status__apikey-state__hint"
          @click="openAboutAccountProtectionPage"
        >
          {{ $t('apikeyStatus.hint') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { settingsValuesType } from '@/types'
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import Browser from 'webextension-polyfill'
import Tooltip from '@/components/Tooltip.vue'
import { hasApikeyStatuses } from '@/consts/protectionStatuses.const'

export default Vue.extend({
  components: { Tooltip },
  name: 'ApikeyStatus',

  data() {
    return {
      hasApikeyStatuses: 'loading'
    }
  },

  computed: {
    ...mapGetters(['getStorage']),
  },

  methods: {
    ...mapActions(['checkSteamApiKey', 'sendAnalyticsEvent']),

    async openAboutAccountProtectionPage () {
      const aboutAccountProtectionPageURL = await Browser.runtime.getURL('./accountProtection.html')

      this.sendAnalyticsEvent({
        event: 'extension_alert_apikey_generated',
        data: {
          action: 'opened'
        }
      })

      window.open(aboutAccountProtectionPageURL, '_blank')
    }
  },

  async created () {
    const settings: settingsValuesType = await this.getStorage('settings')
    if (!settings.preventApiScam) {
      this.hasApikeyStatuses = hasApikeyStatuses.disabled

      return
    }

    this.hasApikeyStatuses = await this.checkSteamApiKey()
  }
})
</script>

<style lang="scss" scoped>
.apikey-status {
  background-color: $color-gray-base-600;
  border-radius: 4px;
  margin-bottom: 32px;
}

.apikey-status__container {
  padding: 12px 16px 18px;
  box-sizing: border-box;
}

.apikey-status__header {
  margin-bottom: 24px;
}

.apikey-status__title {
  font-size: 20px;
  font-weight: 700;
  line-height: 26px;
  color: $color-gray-base-100;
}

.apikey-status__apikey-state__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.apikey-status__apikey-state__wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.apikey-status__apikey-state__indicator {
  border: none;
  border-radius: 100%;
  width: 12px;
  height: 12px;
}

.apikey-status__apikey-state__label {
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  margin: 0 4px;
}

.apikey-status__apikey-state__info {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.apikey-status__apikey-state__hint {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: $color-purple-500;
  text-decoration: none;
  cursor: pointer;
}

.apikey-status__apikey-state__hint:hover {
  color: $color-purple-100;
}

.apikey__indicator.notRegistered {
  background-color: $color-green-accent-100;
}

.apikey__indicator.registered {
  background-color: $color-yellow-accent-100;
}

.apikey__indicator.failed {
  background-color: $color-red-accent-200;
}

.apikey__indicator.disabled,
.apikey__indicator.loading {
  background-color: $color-gray-base-500;
}
</style>
