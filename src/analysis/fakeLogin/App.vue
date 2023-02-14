<template>
  <div class="live__wrapper">
    <div class="live__container">
      <div class="live__head">
        <div class="live__subtitle">
          {{ $t('fakeLogin.subdesc') }}
        </div>
        <div class="live__title">
          {{ $t('fakeLogin.title') }}
        </div>
      </div>

      <div class="live__text">
        {{ $t('fakeLogin.description') }}
      </div>

      <div class="live__buttons">
        <div
          id="fakelogin_report_button"
          class="live__button"
          @click="report"
        >
          {{ $t('fakeLogin.report') }}
        </div>
      </div>

      <span
        v-if="isHintShown"
        class="live__hint"
        :class="isReportFailed ? 'live__hint--error' : 'live__hint--success'"
      >
        {{ isReportFailed ? $t('error') : $t('fakeLogin.reportSuccess') }}
      </span>
    </div>

    <div class="live__obj">
      {{ $t('fakeLogin.hint') }}
    </div>

    <span
      class="live__link"
      @click="openDiscord"
    >
      {{ $t('fakeLogin.discord') }}
    </span>

    <img
      :src="logo"
      class='live__logo'
      alt="logo"
    />
  </div>
</template>

<script lang="ts">
import browser from 'webextension-polyfill'
import Vue from 'vue'

import { mapGetters, mapActions } from "vuex";
import { config } from '@/config'

export default Vue.extend({
  name: "App",

  data () {
    return {
      isHintShown: false,
      isReportFailed: false,
      logo: '',
      config,
    }
  },

  computed: {
    ...mapGetters(['locationUrl']),
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent', 'sendReport']),

    async report () {
      this.sendAnalyticsEvent({
        event: 'extension_alert_liveanalysis_fake_login_report',
        data: {
          url: this.locationUrl,
          successful: true,
        }
      })

      const response = await this.sendReport({ reportUrl: this.locationUrl })
      const { items } = response.data

      this.isHintShown = true
      if (items) {
        this.isReportFailed = false
      } else {
        this.isReportFailed = true

        this.sendAnalyticsEvent({
          event: 'extension_alert_liveanalysis_fake_login_report',
          data: {
            url: this.locationUrl,
            successful: false,
          }
        })
      }
    },

    openDiscord (): void {
      window.open(config.DISCORD_URL, '_blank')
    }
  },

  created() {
    this.logo = browser.runtime.getURL('/img/cs-money-antiscam-logo.svg')

    this.sendAnalyticsEvent({
      event: "extension_alert_liveanalysis_fake_login",
      data: {
        url: this.locationUrl,
      },
    })

    this.sendAnalyticsEvent({
      event: 'extension_alert_liveanalysis_fake_login_report',
      data: {
        url: this.locationUrl,
        successful: true,
      },
    })
  },
})
</script>

<style lang="scss" scoped src="@/assets/scss/liveAnalysis.scss" />
