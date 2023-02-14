<template>
  <div class="account-protection">
    <div class="account-protection__container">
      <div class="account-protection__content">
        <component
          :is="currentPage"
          @onProtectAccount="onProtectAccount"
          @onDisableApiScam="onDisableApiScam"
          @onDisableApiScamCancel="onDisableApiScamCancel"
        />
      </div>
      <footer class="account-protection__footer">
        <p class="account-protection__footer__hint">
          {{ $t("accountProtection.footer.hint") }}
        </p>

        <div class="account-protection__footer__discord_link">
          <a
            class="app-link"
            :href="config.DISCORD_URL"
            target="_blank"
          >
            {{ $t("accountProtection.footer.discord") }}
          </a>
        </div>
      </footer>
    </div>
    <div class="account-protection__icon-wrapper">
      <img
        class="account-protection__icon"
        src="@/assets/images/csm_logo.svg"
        alt="logo"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapActions } from "vuex";
import { config } from "@/config";

import Home from "./pages/Home.vue";
import Steps from "./pages/Steps.vue";
import UseApiKey from "./pages/UseApiKey.vue";

export default Vue.extend({
  name: 'AccountProtection',

  components: {
    Home,
    Steps,
    UseApiKey
  },

  data() {
    return {
      config,
      currentPage: 'Home',
    };
  },

  computed: {
    ...mapGetters(['appVersion']),
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent']),

    onProtectAccount (): void {
      this.currentPage = 'Steps';

      this.sendAnalyticsEvent({
        event: 'extension_alert_apikey_generated',
        data: {
          action: 'protect_me',
        },
      })
    },

    onDisableApiScam (): void {
      this.currentPage = 'UseApiKey';

      this.sendAnalyticsEvent({
        event: 'extension_alert_apikey_generated',
        data: {
          action: 'personal_usage',
        },
      })
    },

    onDisableApiScamCancel (): void {
      this.currentPage = 'Home';
    }
  },

  beforeDestroy () {
    this.sendAnalyticsEvent({
      event: 'extension_alert_apikey_generated',
      data: {
        action: 'closed',
      },
    })
  }
})
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

body, body * {
  font-family: $font-family;
}
</style>
<style lang="scss" scoped>
.account-protection {
  background: $color-darker-bg;
  color: $color-sub-text-bright;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
}

.account-protection__content {
  background: $color-dark;
  max-width: 500px;
  border-radius: 6px;
  padding: 60px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.account-protection__icon-wrapper {
  position: fixed;
  bottom: 40px;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-protection__icon {
  height: 35px;
}

.account-protection__footer {
  color: $color-sub-text-dark;
  width: 100%;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-flow: column;
}

.account-protection__footer__hint {
  max-width: 400px;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  font-style: italic;
  margin: 0 0 12px;
}
</style>