<template>
  <div
    class="notification-bell"
    @click="onClick"
  >
    <img
      class="notification-bell__img"
      src="@/assets/images/ui/bell.svg"
      alt="notification icon"
    />
    <div
      v-if="notificationsNumber > 0"
      class="notification-bell__numbers"
    >
      {{ notificationsNumber > 99 ? '+99' : notificationsNumber }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Browser from 'webextension-polyfill'

import { mapActions, mapGetters } from 'vuex'
import { MAIN_PAGES } from '../router/routes'

export default Vue.extend({
  name: "notificationBell",

  data () {
    return {
      notificationsNumber: 0
    }
  },

  computed: {
    ...mapGetters(['getStorage'])
  },

  methods: {
    ...mapActions(['getNotificationsNumber']),

    onClick () {
      if (this.$route.name === MAIN_PAGES.notification) {
        return
      }

      this.$router.push({ name: MAIN_PAGES.notification })
    },

    async updateNotificationNumber () {
      this.notificationsNumber = await this.getNotificationsNumber()
    }
  },

  async created () {
    this.updateNotificationNumber()

    Browser.storage.onChanged.addListener(changes => {
      if (
        changes.notifications ||
        changes.usedNotificationIds
      ) {
        this.updateNotificationNumber()
      }
    })
  }
})
</script>

<style lang="scss">
.notification-bell {
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.notification-bell__img {
  width: 100%;
  height: 100%;
}

.notification-bell__numbers {
  transform: translateX(-13px);
  height: fit-content;
  width: fit-content;
  padding: 1px 3px;
  border-radius: 4px;
  background-color: $color-pink-100;
  color: $color-text;
  font-size: 12px;
  line-height: 14px;
  font-weight: 400;
}
</style>
