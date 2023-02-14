<template>
  <div class="popup">
    <h4 class="popup__title app-title">{{ $t(`popup.${this.tabStatus}.title`) }}</h4>
    <p class="popup__description">{{ $t(`popup.${this.tabStatus}.description`) }}</p>
    <TodoButton state="action" :text="$t(`popup.button.${this.tabStatus}`)" @click="buttonClickHandler" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Browser from 'webextension-polyfill'

import { mapActions, mapGetters } from 'vuex'

import TodoButton from '@/components/TodoButton.vue'

export default Vue.extend({
  name: 'Popup',

  components: {
    TodoButton,
  },

  data(): any {
    return {
      tabStatus: 'error',
      tab: null,
    }
  },

  computed: {
    ...mapGetters(['getStorage'])
  },

  methods: {
    ...mapActions(['checkSteamSigned', 'checkSteamLogin']),

    buttonClickHandler() {
      if (this.tabStatus === 'signin') {
        window.open('https://steamcommunity.com/login', '_blank')

        return
      }

      if (this.tabStatus === 'error') {
        Browser.tabs.reload(this.tab.id)

        window.close()

        return
      }

      if (this.tabStatus === 'systemPage') {
        window.close()

        return
      }
    }
  },

  async created() {
    this.checkSteamSigned().then(async () => {
      const signed = await this.getStorage('signed')
      if (!signed) {
        this.tabStatus = 'signin'

        return
      }

      this.checkSteamLogin()
    })

    const signed = await this.getStorage('signed')
    if (!signed) {
      this.tabStatus = 'signin'

      return
    }

    const tabs = await Browser.tabs.query({ active: true, currentWindow: true })
    const url = tabs[0]?.url
    if (!url) {
      this.tabStatus = 'error'

      return
    }
    this.tab = tabs[0]

    const isHTTP = url.startsWith('http')
    if (!isHTTP) {
      this.tabStatus = 'systemPage'
    } else {
      this.tabStatus = 'error'
    }
  }
})
</script>

<style lang="scss">
body {
  background-color: $color-bg;
  color: $color-text;
  margin: 0;
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
  min-height: 220px;
  max-height: 600px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
}

.popup__title {
  font-size: 18px;
  text-align: center;
  margin: 0;
}

.popup__description {
  font-size: 14px;
  line-height: 16px;
  margin: 10px 0;
  text-align: center;
}

.popup .todo-button {
  width: fit-content;
}
</style>
