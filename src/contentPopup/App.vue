<template>
  <div class="popup">
    <div
      v-if="signed"
      class="popup__container"
    >
      <Header />
      <Nav v-if="isSettingsPage" />

      <div class="popup__content">
        <router-view></router-view>
      </div>
    </div>

    <Footer />

    <Signin v-if="!signed" />
    <Changelog />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'

import Changelog from './pages/Changelog.vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import Signin from './pages/Signin.vue'
import Nav from './components/Nav.vue'

import { SETTINGS_PAGES } from './router/routes'

export default Vue.extend({
  name: 'App',

  data () {
    return {
      SETTINGS_PAGES,
      signed: true
    }
  },

  components: {
    Changelog,
    Header,
    Footer,
    Nav,
    Signin,
  },

  computed: {
    ...mapGetters(['getStorage']),

    isSettingsPage () {
      let result = false

      for (const key in SETTINGS_PAGES) {
        if (Object.prototype.hasOwnProperty.call(SETTINGS_PAGES, key)) {
          if (SETTINGS_PAGES[key] === this.$route.name) {
            result = true
          }
        }
      }

      return result
    }
  },

  methods: {
    ...mapActions(['sendAnalyticsEvent', 'checkSteamLogin']),
  },

  async created () {
    await this.checkSteamLogin()

    this.signed = await this.getStorage('signed')
  },
})
</script>

<style lang="scss">
html {
  height: 100%;
  min-height: 762px;
}

body {
  background-color: $color-bg;
  color: $color-text;
  margin: 0;
  height: 100%;
}

body, body * {
  font-family: $font-family;
}
</style>

<style lang="scss" scoped >
.popup {
  width: 100%;
  min-width: 390px;
  height: 100%;
  min-height: 400px;
  max-height: 762px;
}

.popup__container {
  width: 100%;
  height: 100%;
  padding: 12px 20px 92px;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
}

@media (max-height: 400px) {
  .popup {
    overflow-y: scroll;
  }
}
</style>
