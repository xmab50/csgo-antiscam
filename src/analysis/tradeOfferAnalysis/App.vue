<template>
  <div class="trade-offer">
    <div class="live__container">
      <div class="live__head">
        <div class="live__subtitle">
          {{ $t('tradeOffer.subdesc') }}
        </div>
        <div class="live__title">
          {{ $t('tradeOffer.title') }}
        </div>
      </div>

      <i18n
        class="trade-offer__description"
        path="tradeOffer.description"
        tag="div"
      >
        <template #level>
          <span class="trade-offer__description-accent">
            {{ $t('tradeOffer.checkBotLevel') }}
          </span>
        </template>
        <template #date>
          <span class="trade-offer__description-accent">
            {{ $t('tradeOffer.checkBotDate') }}
          </span>
        </template>
      </i18n>

      <div class="trade-offer__bot-wrapper">
        <div class="trade-offer__mobile-wrapper">
          <img
            class="trade-offer__mobile-img"
            :src="mobileImage"
            alt="mobile-screen"
          />
        </div>

        <div
          v-if="tradingPartner"
          class="trade-offer__bot-screen">
          <h3 class="trade-offer__bot-screen__title">{{ $t('tradeOffer.confirmations') }}</h3>
          <div class="trade-offer__bot-screen__content">
            <i18n
              path="tradeOffer.tradeWith"
              class="trade-offer__bot-screen__name"
              tag="div"
            >
              <template #name>
                <span class="trade-offer__bot-name">
                  {{ tradingPartner.name }}
                </span>
              </template>
            </i18n>
            <div class="trade-offer__bot-screen__row">
              <img
                class="trade-offer__bot-screen__row__img"
                :src="attentionImage"
                alt="attention"
              >
              <div class="trade-offer__bot-screen__row__text error">
                {{ $t('tradeOffer.notFriend') }}
              </div>
            </div>
            <div class="trade-offer__bot-screen__row">
              <div class="trade-offer__bot-level">
                <span class="trade-offer__bot-level__num">{{ tradingPartner.level }}</span>
              </div>
              <i18n
                path="tradeOffer.botLevel"
                class="trade-offer__bot-screen__row__text"
                tag="div"
              >
                <template #name>
                  <span class="trade-offer__bot-name">
                    {{ tradingPartner.name }}
                  </span>
                </template>
                <template #level>
                    {{ tradingPartner.level }}
                </template>
              </i18n>
            </div>
            <div class="trade-offer__bot-screen__row">
              <i18n
                path="tradeOffer.botRegistDate"
                class="trade-offer__bot-screen__row__text"
                tag="div"
              >
                <template #name>
                  <span class="trade-offer__bot-name">
                    {{ tradingPartner.name }}
                  </span>
                </template>
                <template #date>
                    {{ tradingPartner.date }}
                </template>
              </i18n>
            </div>
          </div>
        </div>
      </div>
    </div>

    <img
      :src="logo"
      class='trade-offer__logo'
      alt="logo"
    />
  </div>
</template>

<script lang="ts">
import browser from 'webextension-polyfill'
import Vue from 'vue'

import { mapGetters, mapMutations } from 'vuex'

import { tradeOfferAnalysisData } from '@/types'

export default Vue.extend({
  name: 'App',

  data (): tradeOfferAnalysisData {
    return {
      tradingPartner: null,
      mobileImage: null,
      attentionImage: null,
      logo: null,
    }
  },

  computed: {
    ...mapGetters(['getStorage']),
  },

  methods: {
    ...mapMutations(['setStorage']),
  },

  async created () {
    this.mobileImage = browser.runtime.getURL('/img/mobile_with_bot_screen.png')
    this.logo = browser.runtime.getURL('/img/cs-money-antiscam-logo.svg')
    this.attentionImage = browser.runtime.getURL('/img/attention.png')
    this.tradingPartner = await this.getStorage('tradingPartner')
  },

  beforeDestroy() {
    this.setStorage({
      name: 'tradingPartner',
      value: null,
    })
  }
})
</script>

<style lang="scss" scoped>
.trade-offer {
	font-family: $font-family;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
  margin-bottom: 50px;
}

.trade-offer .live__container {
  padding: 20px 60px;
}

.trade-offer .live__text {
  text-align: center;
}

.trade-offer__bot-wrapper {
  width: 280px;
  height: 205px;
  margin: 15px auto 0;
  position: relative;
}

.trade-offer__mobile-wrapper,
.trade-offer__mobile-img {
  width: 100%;
  height: 100%;
  max-width: 280px;
  max-height: 207px;
}

.trade-offer__bot-screen {
  position: absolute;
  top: 34px;
  left: 17px;
  width: 246px;
  height: 166px;
  overflow: hidden;
}

.trade-offer__bot-screen__content {
  background-color: $color-blue-dark;
  padding: 10px 8px;
}

.trade-offer__bot-screen__title {
  margin-left: 54px;
  font-size: 12px;
  font-weight: 400;
  color: rgb(249, 255, 255);
  padding: 5px 0px 5px 20px;
  background: rgb(0, 15, 23);
}

.trade-offer__bot-screen__name {
  color: $color-blue-dim;
  font-size: 13px;
}

.trade-offer__bot-name {
  color: $color-sub-text-dim;
}

.trade-offer__bot-screen__row {
  min-height: 22px;
  background: $color-default-bg-dark;
  padding: 3px;
  margin-top: 6px;
  font-size: 9px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.trade-offer__bot-screen__row__text {
  width: 100%;
  color: $color-blue-dim;
  margin-left: 3px;
}

.trade-offer__bot-screen__row__text.error {
  color: $color-error-bright;
}

.trade-offer__bot-level {
  border: 1px solid $color-error-bright;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.trade-offer__bot-level__num {
  font-size: 12px;
  line-height: 2;
} 

.trade-offer__bot-screen__row__img {
  width: 16px;
  height: 16px;
}

.trade-offer__logo {
  width: 100%;
  height: 35px;
  margin-top: 20px;
}

.trade-offer__description {
  width: 100%;
  font-size: 14px;
  line-height: 1.4;
  color: $color-sub-text-dim;
  text-align: center;
  margin-bottom: 5px;
}

.trade-offer__description-accent {
  color: $color-blue;
}

.trade-offer .live__buttons {
  margin-top: 15px;
}

.trade-offer .live__button:not(:last-child) {
  margin-right: 10px;
}

.trade-offer .primary {
  margin-right: 0;
}
</style>
<style lang="scss" scoped src="@/assets/scss/liveAnalysis.scss" />
