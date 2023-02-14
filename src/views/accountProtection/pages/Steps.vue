<template>
  <div class="steps">
    <div v-if="showDoneBanner" class="steps__container">
      <header class="steps__header">
        <p class="steps__subtitle">
          {{ $t('accountProtection.steps.stepsDone.subtitle') }}
        </p>
        <h1 class="steps__title steps__success-title app-title">
          {{ $t(`accountProtection.steps.stepsDone.title`) }}
        </h1>
      </header>
      <div class="steps__content">
        <section class="steps__section app-paragraph">
          <p class="steps__text app-paragraph__text">
            {{ $t('accountProtection.steps.stepsDone.description') }}
          </p>
        </section>
        <a
          class="steps__button app-button secondary link"
          target="_blank"
          :href="config.DISCORD_URL"
        >
          {{ $t('accountProtection.steps.stepsDone.button') }}
        </a>
      </div>
    </div>

    <div v-else class="steps__container">
      <header class="steps__header">
        <p class="steps__subtitle">
          {{
            $t("accountProtection.steps.subtitle", {
              currentStep: currentStep,
              maxSteps: STEPS.length,
            })
          }}
        </p>
        <h1 class="steps__title app-title">
          {{ $t(`${currentStepLocale}.title`) }}
        </h1>
      </header>
      <div class="steps__content">
        <section
          v-for="(paragraph, index) in stepParagraphs"
          :key="index"
          class="steps__section app-paragraph"
        >
          <i18n
            class="steps__text app-paragraph__text"
            :path="`${currentStepLocale}.paragraphs.${paragraph}.text`"
            tag="p"
          >
            <template #accent>
              <span class="steps__text_accent app-paragraph__accent">
                {{ $t(`${currentStepLocale}.paragraphs.${paragraph}.accent`) }}
              </span>
            </template>
          </i18n>
        </section>
        <button
          v-if="isStepsCompleted && currentStepName === 'change_trade_link'"
          class="steps__button app-button primary"
          @click="showStepsAlert"
        >
          {{ $t('accountProtection.steps.done') }}
        </button>
        <a
          v-else
          class="steps__button app-button secondary"
          target="_blank"
          :href="LINKS[currentStepName]"
          @click="buttonHandler"
        >
          {{ $t(`${currentStepLocale}.button`) }}
        </a>
      </div>
    </div>
    <Pagination
      :steps="STEPS.length"
      @change="toggleCurrentStep"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

import { messages } from '@/i18n/messages';
import { config } from '@/config'

import { stepsLinks, stepsData } from '@/types'

import Pagination from "../components/Pagination.vue"

const STEPS: Array<string> = [
  'change_password',
  'unauthorize_devices',
  'revoke_apikey',
  'change_trade_link',
]

const LINKS: stepsLinks = {
  change_password: 'https://help.steampowered.com/wizard/HelpChangePassword?redir=store/account/',
  unauthorize_devices: 'https://store.steampowered.com/twofactor/manage',
  revoke_apikey: 'https://steamcommunity.com/dev/apikey',
  change_trade_link: 'https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url',
}

export default Vue.extend({
  name: 'Steps',

  components: {
    Pagination,
  },

  data (): stepsData {
    return {
      currentStep: 1,
      STEPS,
      LINKS,
      completedSteps: [],
      showDoneBanner: false,
      config,
      messages
    }
  },

  computed: {
    isStepsCompleted (): boolean {
      return this.completedSteps.includes('change_trade_link')
    },

    currentStepName (): string {
      return this.STEPS[this.currentStep - 1]
    },

    currentStepLocale (): string {
      return `accountProtection.steps.${this.currentStepName}`
    },

    stepParagraphs(): Array<string> {
      const stepsLocale = this.messages.en.accountProtection.steps
      const currentStepParagraphs = stepsLocale[this.currentStepName].paragraphs
      return Object.keys(currentStepParagraphs)
    },
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent']),

    buttonHandler (): void {
      this.sendAnalyticsEvent({
        event: 'extension_alert_apikey_generated',
        data: {
          action: this.currentStepName,
        },
      })

      const isCompleted = this.completedSteps.includes(this.currentStepName)
      if (!isCompleted) {
        this.completedSteps.push(this.currentStepName)
      }
    },

    showStepsAlert (): void {
      this.showDoneBanner = true

      let skipedSteps = ''
      const notCompletedSteps = this.STEPS.filter(step => {
        return !this.completedSteps.includes(step)
      })

      notCompletedSteps.forEach(step => {
        const index = this.STEPS.indexOf(step)
        const message = this.$t(`accountProtection.steps.${step}.title`)
        skipedSteps += `\n${index + 1}: ${message}`
      })

      if (!skipedSteps) {
        return
      }

      const message = this.$t('accountProtection.steps.stepsSkipAlert')

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          alert(`${message}\n${skipedSteps}`)
        })
      })
    },

    toggleCurrentStep (step: number): void {
      if (step < this.currentStep) {
        this.sendAnalyticsEvent({
          event: 'extension_alert_apikey_generated',
          data: {
            action: 'prev',
          },
        })
      } else {
        this.sendAnalyticsEvent({
          event: 'extension_alert_apikey_generated',
          data: {
            action: 'next',
          },
        })
      }

      this.showDoneBanner = false
      this.currentStep = step
    },
  },
})
</script>

<style lang="scss" scoped>
.steps__header {
  text-align: center;
  margin-bottom: 32px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}

.steps__subtitle {
  margin: 0 0 12px;
}

.steps__title {
  font-size: 24px;
  margin: 0;
}

.steps__success-title {
  color: $color-success;
}

.steps__content {
  display: flex;
  flex-flow: column;
  align-items: center;
  margin-bottom: 40px;
}

.steps__section {
  width: 100%;
}

.steps__button {
  margin: 16px 0 0;
}
</style>
