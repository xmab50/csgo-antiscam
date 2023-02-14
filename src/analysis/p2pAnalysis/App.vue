<template>
  <div class="trade-offer">
    <div class="live__container">
      <div class="live__head">
        <div class="live__subtitle">
          {{ $t('tradeOffer.subdesc') }}
        </div>
        <div class="live__title">
          Scam trade offer
        </div>
        <div class="trade-offer__description">
          an offer was noticed with the same offer from another account. Check your trade history and check partner account name, date and level before accept trade.
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
import { p2pAnalysisData } from '@/types'
import Vue from 'vue'

import { mapGetters, mapMutations } from 'vuex'
import Browser from 'webextension-polyfill'

export default Vue.extend({
  name: 'App',

  data (): p2pAnalysisData {
    return {
      tradeOffersInfo: null,
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
    this.logo = Browser.runtime.getURL('/img/cs-money-antiscam-logo.svg')
    this.tradeOffersInfo = await this.getStorage('tradeOffersInfo')
  },

  beforeDestroy() {
    this.setStorage({
      name: 'tradeOfferInfo',
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

.trade-offer .live__button {
  margin-right: 10px;
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
  max-width: 320px;
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
