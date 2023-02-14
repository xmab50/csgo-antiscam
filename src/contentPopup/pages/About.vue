<template>
  <div class="about">
    <div class="about__desc-content">
      <div class="about__app">
        <img src="@/assets/images/app_logo_gray.svg" class="about__logo">

        <div class="about__info">
          <div class="about__slogan">{{ $t('about.slogan') }}</div>
          <div class="about__poweredBy">{{ $t('about.poweredBy') }}</div>
        </div>
      </div>

      <i18n
        class="about__desc"
        :path="`about.content.${paragraph}.text`"
        v-for="(paragraph, index) in paragraphs"
        :key="index"
        tag="p"
      >
        <template #accent>
          <span class="about__accent-text">
            {{ $t(`about.content.${paragraph}.accent`) }}
          </span>
        </template>
        <template #accent1>
          <span class="about__accent-text">
            {{ $t(`about.content.${paragraph}.accent1`) }}
          </span>
        </template>
      </i18n>

      <div class="about__separator">
        <div class="about__separator__item" />
        <div class="about__separator__item" />
        <div class="about__separator__item" />
      </div>

      <p class="about__text">
        {{ $t('about.questions') }}
      </p>
      <i18n
        class="about__text"
        :path="`about.emailUs`"
        tag="p"
      >
        <template #email>
          <span class="about__accent-text">
            {{ $t(`about.email`) }}
          </span>
        </template>
      </i18n>
    </div>

    <button
      class="about__feedback"
      @click="leaveUsFeedback"
    >
      {{ $t('about.feedback') }}
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapActions } from 'vuex'
import { config } from '@/config'
import { messages } from '@/i18n/messages';

export default Vue.extend({
  data () {
    return {
      config,
      messages,
    }
  },

  computed: {
    ...mapGetters(['appVersion']),

    paragraphs (): Array<string> {
      const paragraphs = this.messages.en.about.content
      const paragraphsKeys = Object.keys(paragraphs)

      return paragraphsKeys
    }
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent']),

    leaveUsFeedback () {
      this.sendAnalyticsEvent({
        event: 'extension_redirected_to_external',
        data: {
          destination : 'review'
        },
      })

      window.open('https://chrome.google.com/webstore/detail/csmoney-antiscam/bocdepodnagbohblgjmooobalmcojkpg', '_blank')
    }
  },

  created () {
    this.sendAnalyticsEvent({
      event: 'extension_settings_tabs',
      data: {
        name: 'about',
        action: 'opened'
      },
    })
  },
})
</script>

<style lang="scss" scoped>
.about {
  opacity: 0;
  animation: fadeIn 0.5s 0.2s forwards;
  margin: 0;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  height: 100%;
}

.about__app {
  display: flex;
  align-items: center;
}

.about__logo {
  width: 60px;
  height: 60px;
  margin-bottom: 32px;
}

.about__info {
  display: flex;
  flex-direction: column;
}

.about__slogan {
  font-size: 18px;
  line-height: 26px;
  font-weight: 400;
  color: $color-text;
}

.about__poweredBy {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: rgba($color-text, .3);
}

.about__desc {
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  color: $color-sub-text;
}

.about__desc-content .about__desc:last-child {
  margin: 0;
}

.about__accent-text {
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  color: $color-text;
}

.about__separator {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32px 0;
}

.about__separator__item {
  width: 4px;
  height: 4px;
  background-color: $color-gray-base-400;
  margin: 0 5px;
}

.about__text {
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  color: $color-sub-text;
}

.about__feedback {
  width: 100%;
  border-radius: 4px;
  padding: 9px 12px;
  background-color: $color-gray-base-500;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-align: center;
  color: $color-text;
  line-height: 20px;
  border: none;
  cursor: pointer;
  margin: 20px 0 0;
}

.about__feedback:hover {
  background-color: $color-purple-500;
}
</style>
