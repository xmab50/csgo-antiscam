<template>
  <div class="header">
    <img
      class="header__logo"
      src="@/assets/images/cs-money-antiscam-logo.svg"
      alt="cs-money-antiscam-logo"
    />
    <div class="header__nav">
      <div
        class="header__nav__to-settings header__nav__wrapper"
        v-if="showNavToSettings"
      >
        <button
          class="header__nav__to-settings__button"
          @click="() => navigate(MAIN_PAGES.tradeSettings)"
        >
          <img
            class="header__nav__to-settings__icon"
            src="@/assets/images/ui/settings.svg"
            alt="settings icon">
          <span>{{ $t('nav.settings')}}</span>
        </button>
      </div>
      <div
        class="header__nav_to_main header__nav__wrapper disabled"
        v-if="!showNavToSettings"
      >
        <LangSwitcher v-if="showLangSwitcher" />
        <button
          class="header__nav__to-main__button"
          @click="() => navigate(MAIN_PAGES.home)"
        >
          <img
            class="header__nav__to-main__icon"
            src="@/assets/images/ui/cancel.svg"
            alt="cancel icon"
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import { MAIN_PAGES } from '../router/routes'
import { mapActions } from 'vuex'

export default Vue.extend({
  name: "Header",

  data () {
    return {
      MAIN_PAGES,
    }
  },

  components: {
    LangSwitcher
  },

  computed: {
    showLangSwitcher () {
      return this.$route.name !== MAIN_PAGES.notification
    },

    showNavToSettings () {
      return this.$route.name === MAIN_PAGES.home
    },
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent']),

    navigate ( pageName: string ) {
      this.$router.push({ name: pageName })

      if (pageName === MAIN_PAGES.tradeSettings) {
        this.sendAnalyticsEvent({
          event: 'extension_settings',
          data: {
            action: 'opened'
          },
        })
      }
    },
  },
})
</script>


<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 44px;
}

.header__logo {
  width: 110px;
  height: 40px;
}

.header__nav__to-settings__icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.header__nav_to_main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__nav__to-main__button {
  padding: 8px 12px;
  box-sizing: border-box;
  margin-left: 16px;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-gray-base-500;
  cursor: pointer;
}

.header__nav__to-main__icon {
  width: 20px;
  height: 22px;
}

.header__nav__wrapper {
  opacity: 0;
  animation: fadeIn 0.5s 0.2s forwards;
}

.header__nav__to-settings__button {
  padding: 8px 12px;
  box-sizing: border-box;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: uppercase;
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.05em;
  color: $color-text;
  background-color: $color-gray-base-500;
  cursor: pointer;
}
</style>