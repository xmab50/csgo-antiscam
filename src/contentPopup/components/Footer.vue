<template>
  <footer class="footer">
    <NotificationBell />
    <div
      class="footer__faq"
      @click="openFaq"
    >
      <span class="footer__faq-text">FAQ</span>
      <img
        class="footer__faq-img"
        src="@/assets/images/ui/faq.svg"
        alt="faq icon"
      />
    </div>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
import Browser from 'webextension-polyfill'
import NotificationBell from './NotificationBell.vue'

export default Vue.extend({
  name: 'Footer',

  components: {
    NotificationBell
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent']),

    async openFaq () {
      const faqPageURL = await Browser.runtime.getURL('./faq.html')

      this.sendAnalyticsEvent({
        event: 'extension_redirected_to_external',
        data: {
          destination: 'faq'
        }
      })

      window.open(faqPageURL, '_blank')
    }
  }
})
</script>

<style lang="scss" scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 62px;
  min-height: 62px;
  display: flex;
  flex-flow: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  box-sizing: border-box;
  background-color: $color-dark-bg;
  opacity: 0;
  will-change: transform, opacity;
  animation: fromBottom 0.5s 0.3s forwards;
}

.footer__logo {
  height: 24px;
}

.footer__faq {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.footer__faq:hover .footer__faq-text {
  color: $color-text;
}

.footer__faq:active .footer__faq-text {
  color: $color-purple-100;
}

.footer__faq-text {
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  text-transform: unset;
  color: $color-gray-base-100;
  margin-right: 8px;
}

.footer__faq-img {
  width: 36px;
  height: 36px;
}
</style>
