<template>
  <div class="use-api-key">
    <div class="use-api-key__container">
      <header class="use-api-key__header">
        <p class="use-api-key__subtitle">
          {{ $t('accountProtection.useApiKey.subtitle') }}
        </p>
      </header>
      <div class="use-api-key__content">
        <section class="use-api-key__section">
          <p class="use-api-key__text app-paragraph__text">
            {{ $t('accountProtection.useApiKey.description') }}
          </p>
        </section>

        <section class="use-api-key__section app-paragraph use-api-key__buttons">
          <button
            class="use-api-key__button app-button primary"
            :class="{ 'use-api-key__button-disabled': acceptButtonDisabled }"
            @click="onAllowUseApiKey"
          >
            {{ acceptButtonText }}
          </button>
          <button
            class="use-api-key__button app-button secondary"
            @click="$emit('onDisableApiScamCancel')"
          >
            {{ $t('accountProtection.useApiKey.button.cancel') }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { mapGetters, mapActions, mapMutations } from 'vuex'
import { settingsEvents } from '@/consts/settings.const'
import { useApiKeyData } from '@/types'

const ACCEPT_BUTTON_TIMER = 3

export default Vue.extend({
  name: 'UseApiKey',

  data: (): useApiKeyData => {
    return {
      acceptButtonDisabled: true,
      acceptButtonDisabledSec: ACCEPT_BUTTON_TIMER,
      acceptButtonText: '',
      settingsEvents
    }
  },

  computed: {
    ...mapGetters(['getStorage']),
  },

  methods: {
    ...mapMutations(['setStorage']),
    ...mapActions(['sendAnalyticsEvent']),

    async onAllowUseApiKey (): Promise<void> {
      if (this.acceptButtonDisabled) {
        return
      }

      const settings = await this.getStorage('settings')

      this.setStorage({
        name: 'settings',
        value: {
          ...settings,
          preventApiScam: false,
        },
      })

      this.sendAnalyticsEvent({
        event: this.settingsEvents.preventApiScam,
        data: {
          enabled: false,
        }
      })

      this.sendAnalyticsEvent({
        event: 'extension_alert_apikey_generated',
        data: {
          action: 'need',
        },
      })

      this.sendAnalyticsEvent({
        event: 'extension_alert_apikey_generated',
        data: {
          action: 'closed',
        },
      })

      window.close()
    },

    acceptButtonTimer (): void {
      if (this.acceptButtonDisabledSec <= 0) {
        this.acceptButtonDisabled = false
        this.acceptButtonText = this.$t('accountProtection.useApiKey.button.ok')
      } else {
        this.acceptButtonText = this.$t(
          'accountProtection.useApiKey.button.sec',
          { sec: this.acceptButtonDisabledSec }
        )
        this.acceptButtonDisabledSec--

        setTimeout(() => {
          this.acceptButtonTimer()
        }, 1000)
      }
    }
  },

  mounted () {
    this.acceptButtonTimer()
  }
})
</script>

<style lang="scss" scoped>
.use-api-key__header {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.use-api-key__subtitle {
  margin: 0 0 12px;
  color: $color-error;
}

.use-api-key__content {
  display: flex;
  flex-flow: column;
  align-items: center;
}

.use-api-key__section {
  width: 100%;
}

.use-api-key__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 28px 0 0;
}

.use-api-key__buttons .use-api-key__button:first-child {
  margin-right: 10px;
}

.use-api-key__button.use-api-key__button-disabled {
  opacity: .7;
}
</style>