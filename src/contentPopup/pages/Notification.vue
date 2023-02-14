<template>
  <div class="notification">
    <div class="notification__header">
      <h3 class="notification__title">
        {{ $t('notification.title') }}
      </h3>
      <button
        class="notification__clear-button"
        @click="clearAllNotifications"
      >
        {{ $t('notification.button.clear') }}
      </button>
    </div>
    <div class="notification__content">
      <template v-for="notification in notifications">
        <div
          v-if="!notification.isRead"
          class="notification__item hidden"
          :ref="`notification__item__${notification._id}`"
          :key="notification._id"
        >
          <div class="notification__item__header">
            <div class="notification__item__header__content">
              <div class="notification__item__title">
                {{ notification.title[$i18n.locale] }}
              </div>
              <p class="notification__item__date">
                {{ notification.date }}
              </p>
            </div>
            <button
              class="notification__item__button-hide notification__item__button disabled"
              @click="() => notificationShowToggle(notification._id, false)"
              :ref="`notification__item__${notification._id}__button`"
            >
              {{ $t('notification.button.hide') }}
            </button>
            <button
              class="notification__item__button-show notification__item__button"
              @click="() => notificationShowToggle(notification._id, true)"
              :ref="`notification__item__${notification._id}__button`"
            >
              {{ $t('notification.button.show') }}
            </button>
          </div>
          <p class="notification__item__content">
            {{ notification.content[$i18n.locale] }}
          </p>
        </div>
      </template>
      <div class="notification__content__bottom_overflow" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { mapActions, mapGetters, mapMutations } from 'vuex'
import { notificationsListType } from '@/types'
import Browser from 'webextension-polyfill'

export default Vue.extend({
  name: 'Notification',

  data (): {
    notifications: notificationsListType,
    usedNotificationIds: (string | undefined)[],
  } {
    return {
      notifications: [],
      usedNotificationIds: [],
    }
  },

  computed: {
    ...mapGetters(['getStorage']),

    notificationsNumber (): number {
      return this.notifications.length || 0
    },
  },

  methods: {
    ...mapMutations(['setStorage']),
    ...mapActions(['setStatusIcon', 'sendAnalyticsEvent', 'setUsedNotifications']),

    async clearAllNotifications () {
      const pageIds: (string | undefined)[] = []
      this.notifications = (
        this.notifications.map(notification => {
          if (notification) {
            notification.isRead = true

            pageIds.push(notification._id)

            return notification
          }
        })
      )

     await this.markUsedNotifications(pageIds)

      this.setStorage({
        name: 'notifications',
        value: this.notifications,
      })

      this.sendAnalyticsEvent({
        event: 'extension_notification_action',
        data: {
          action: 'clear',
        }
      })

      this.setStatusIcon()
    },

    notificationShowToggle (_id: string, show: boolean): void {
      const notifications = this.$refs[`notification__item__${_id}`] as Element[] | undefined
      const buttons = this.$refs[`notification__item__${_id}__button`] as Element[] | undefined

      notifications?.forEach(notification => {
        if (show) {
          this.markUsedNotifications([ _id ])

          this.sendAnalyticsEvent({
            event: 'extension_notification_action',
            data: {
              action: 'show',
            }
          })

          notification.classList.remove('hidden')
        } else {
          notification.classList.add('hidden')
        }
      })

      buttons?.forEach(button => {
        if (show && button.classList.contains('notification__item__button-hide')) {
          button.classList.remove('disabled')
        } else if (!show && button.classList.contains('notification__item__button-show')) {
          button.classList.remove('disabled')
        } else {
          button.classList.add('disabled')
        }
      })
    },

    async markUsedNotifications (pageIds: (string | undefined)[]) {
      const usedNotificationIds: (string | undefined)[] = await this.getStorage('usedNotificationIds')

      pageIds.forEach(_id => {
        const isNotDuplicate = !usedNotificationIds.find(usedNotificationId => usedNotificationId === _id)

        if (_id && isNotDuplicate) {
          usedNotificationIds.push(_id)
        }
      })

      this.setStorage({
        name: 'usedNotificationIds',
        value: usedNotificationIds,
      })

      Browser.runtime.sendMessage({
        action: 'notificationsBellUpdate'
      }).catch()
    },
  },

  async created () {
    const notifications: notificationsListType = await this.getStorage('notifications')
    const usedNotificationIds: (string | undefined)[] = await this.getStorage('usedNotificationIds')

    this.usedNotificationIds = usedNotificationIds
    this.notifications = notifications

    this.sendAnalyticsEvent({
      event: 'extension_notifications_center',
      data: {
        action: 'opened',
      }
    })
  },

  beforeDestroy() {
    this.sendAnalyticsEvent({
      event: 'extension_notifications_center',
      data: {
        action: 'close',
      }
    })
  },
})
</script>

<style lang="scss" scoped>
.notification {
  opacity: 0;
  animation: fadeIn 0.5s 0.2s forwards;
}

.notification__content {
  height: 375px;
  overflow-y: scroll;
  padding: 0 5px 0 0;
  box-sizing: border-box;
  position: relative;
}

.notification__content__bottom_overflow {
  position: fixed;
  bottom: 0px;
  left: 0;
  width: calc(100% - 7px);
  height: 20px;
  background: linear-gradient(0, $color-bg, transparent);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: $color-gray-base-600;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: $color-purple-500;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: $color-purple-100;
  border-radius: 4px;
}

.notification__title {
  font-size: 20px;
  line-height: 32px;
  color: rgba(188, 188, 194, 1);
  font-weight: 700;
  max-width: 320px;
  word-break: break-all;
}

.notification__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.notification__item {
  padding: 12px 16px;
  box-sizing: border-box;
  background-color: $color-gray-base-500;
  border-radius: 4px;
  margin-bottom: 16px;
  transition: height 0.4s;
  -webkit-transition: height 0.4s;
}

.notification__item.hidden .notification__item__content {
  height: 0;
  overflow: hidden;
  transition: height 0.4s;
  -webkit-transition: height 0.4s;
}

.notification__item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.notification__item__title {
  font-size: 16px;
  line-height: 22px;
  color: white;
  margin: 0;
}

.notification__item__date {
  font-size: 12px;
  line-height: 14px;
  margin: 8px 0 0;
  color: $color-gray-base-100;
}

.notification__item__content {
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  margin: 8px 0 0;
  white-space: pre-line;
}

.notification__clear-button {
  border: none;
  background-color: transparent;
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: $color-gray-base-200;
  cursor: pointer;
}

.notification__clear-button:hover {
  color: $color-text;
}

.notification__clear-button:active {
  color: $color-gray-base-200;
}

.notification__item__button {
  border: none;
  background-color: transparent;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
  text-align: center;
  cursor: pointer;
}

.notification__item__button-show {
  color: $color-purple-500;
}

.notification__item__button-show:hover {
  color: $color-purple-100;
}

.notification__item__button-show:active {
  color: $color-sub-text;
}

.notification__item__button-hide {
  color: $color-gray-base-100;
}

.notification__item__button-hide:hover {
  color: $color-text;
}

.notification__item__button-hide:active {
  color: $color-sub-text;
}

.notification__item__button.disabled {
  display: none;
}
</style>
