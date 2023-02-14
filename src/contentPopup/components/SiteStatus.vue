<template>
  <div class="site-status">
    <div class="site-status__container">
      <header class="site-status__header">
        <h4 class="site-status__header__title">
          {{ $t('siteStatus.title') }}
        </h4>
        <div
          class="site-status__refresh"
          :class="protectionStatus"
          @click="onRefresh"
        >
          <img src="@/assets/images/ui/refresh.svg" alt="refresh">
        </div>
      </header>

      <ProtectionStatus :protectionStatus="protectionStatus" :comments="comments" />

      <div class="site-status__info__container">
        <div class="site-status__link__wrapper">
          <header class="site-status__link__header">
            <h5 class="site-status__link__title">
              {{ $t('siteStatus.link.title') }}
              <img
                class="site-status__link__copy-img"
                src="@/assets/images/ui/copy.svg"
                alt="copy icon"
                @click="copyURL"
              >
            </h5>
          </header>
          <div class="site-status__link">
            {{ url }}
          </div>
        </div>
        <div class="site-status__trust-score__wrapper">
          <header class="site-status__trust-score__header">
            <h5 class="site-status__trust-score__title">
              {{ $t('siteStatus.trustScore.title') }}
            </h5>
          </header>
          <div class="site-status__trust-score">
            <span>
              {{ isNaN(trustScore) ? '- ' : trustScore }}
              <span class="site-status__trust-score__max-value"> / 100</span>
            </span>
          </div>
        </div>
      </div>

      <TodoButton :state="protectionStatus" @click="onClickedTodoButton" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Browser from 'webextension-polyfill'

import { mapActions, mapGetters } from 'vuex'

import ProtectionStatus from './ProtectionStatus.vue'
import TodoButton from '@/components/TodoButton.vue'

import { messageHandlerRequest, settingsValuesType, siteStatusType } from '@/types'
import { protectionStatuses } from '@/consts/protectionStatuses.const'

export default Vue.extend({
  name: 'SiteStatus',

  data (): any {
    return {
      liveAnalysisResult: null,
      comments: [],
      protectionStatus: 'loading',
      trustScore: 0,
      url: null,
      tabId: null,
    }
  },

  components: {
    ProtectionStatus,
    TodoButton,
  },

  computed: {
    ...mapGetters(['getStorage']),
  },

  methods: {
    ...mapActions(['sendMessage']),

    async updateSiteStatus () {
      if (!this.url) {
        this.url = window.location.search.split('?domain=').pop()
      }

      if (!this.tabId) {
        const tabs: Browser.Tabs.Tab[] = await this.sendMessage({
          action: 'getTabs',
          message: {},
          errorCallback: (error: any) => this.sendMessageErrorHandler(error)
        })

        const tab = tabs.find(tabItem => tabItem.url?.includes(this.url))
        if (tab) {
          this.tabId = tab.id
        }
      }

      if (!this.tabId || !this.url) {
        this.protectionStatus = protectionStatuses.failed

        return
      }

      const checkingAvailable = await this.checkingAvailable()
      if (!checkingAvailable) {
        return
      }

      const liveAnalysis = await this.getLiveAnalysisResult()
      if (!liveAnalysis) {
        return
      }

      const { protectionStatus, trustScore, comments } = liveAnalysis

      this.comments = comments
      this.trustScore = trustScore
      this.protectionStatus = protectionStatus
    },

    setSiteStatusParams (data: siteStatusType) {
      const {
        comments,
        trustScore,
        protectionStatus
      } = data

      this.protectionStatus = protectionStatus
      this.comments = comments
      this.trustScore = trustScore
    },

    copyURL () {
      navigator.clipboard.writeText(this.url)
    },

    async onRefresh () {
      if (
        !this.tabId ||
        this.protectionStatus === protectionStatuses.disabled ||
        this.protectionStatus === protectionStatuses.notCheckable ||
        this.protectionStatus === protectionStatuses.needReloadPage ||
        this.protectionStatus === 'loading'
      ) {
        return
      }

      this.protectionStatus = 'loading'

      this.sendMessage({
        tabId: this.tabId,
        action: 'reloadLiveAnalysis',
        message: { url: this.url },
        errorCallback: (error: any) => this.sendMessageErrorHandler(error)
      })
    },

    async onClickedTodoButton () {
      if (
        this.protectionStatus !== protectionStatuses.unknown ||
        this.liveAnalysisResult.checkedSiteTrustworthiness
      ) {
        return
      }

      this.protectionStatus = 'loading'

      this.sendMessage({
        tabId: this.tabId,
        action: 'checkUnknownPage',
        message: { url: this.url },
        errorCallback: (error: any) => this.sendMessageErrorHandler(error)
      })
    },

    async checkingAvailable (url?: string) {
      const settings: settingsValuesType = await this.getStorage('settings')
      if (!settings.liveAnalysis) {
        this.protectionStatus = protectionStatuses.disabled

        return false
      }

      const activeTabURL = url || this.url
      const notCheckableSite = activeTabURL.includes('chrome.google.com/webstore/')
      const isStartsWithHTTP = activeTabURL?.startsWith('http')
      if (!isStartsWithHTTP || notCheckableSite) {
        this.protectionStatus = protectionStatuses.notCheckable

        return false
      }

      return true
    },

    async getLiveAnalysisResult (): Promise<siteStatusType | undefined> {
      const liveAnalysisResults = await this.getStorage('liveAnalysisResults')
      if (!liveAnalysisResults) {
        this.protectionStatus = 'loading'

        this.sendMessage({
          tabId: this.tabId,
          action: 'getLiveAnalysisResult',
          message: { url: this.url },
          errorCallback: (error: any) => this.sendMessageErrorHandler(error)
        })

        return
      }

      const liveAnalysisResult: siteStatusType | undefined = (
        liveAnalysisResults.find(( liveAnalysisResultsItem: any ) => (
          this.url.includes(liveAnalysisResultsItem.domain) &&
          this.tabId === liveAnalysisResultsItem.tabId
        ))
      )

      if (
        !liveAnalysisResult ||
        !liveAnalysisResult.domain
      ) {
        this.protectionStatus = 'loading'

        this.sendMessage({
          tabId: this.tabId,
          action: 'getLiveAnalysisResult',
          message: { url: this.url },
          errorCallback: (error: any) => this.sendMessageErrorHandler(error)
        })

        return
      }

      this.liveAnalysisResult = liveAnalysisResult

      return liveAnalysisResult
    },

    sendMessageErrorHandler (error: any): void {
      const errorText = `${error}`.toLocaleLowerCase();

      if (
        errorText.includes('could not establish connection') ||
        errorText.includes('extension context invalidated')
      ) {
        this.protectionStatus = protectionStatuses.needReloadPage
      }
    }
  },

  async created () {
    Browser.runtime.onMessage.addListener((request: messageHandlerRequest) => {
      const { action, message } = request

      if (
        action === 'updateSiteStatus' &&
        ( message.url.includes(this.url) || this.url.includes(message.url) )
      ) {
        this.updateSiteStatus()
      }
    })

    this.updateSiteStatus()
  }
})
</script>

<style lang="scss" scoped>
.site-status {
  width: 100%;
  background-color: $color-gray-base-600;
  border-radius: 4px;
  margin-bottom: 16px;
}

.site-status__container {
  width: 100%;
  padding: 12px 16px 18px;
  box-sizing: border-box;
}

.site-status__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.site-status__header__title {
  font-weight: 700;
  font-size: 20px;
  line-height: 26px;
  color: $color-gray-base-100;
  margin: 0;
}

.site-status__header__title h4,
.site-status__header__title h5 {
  margin: 0;
}

.site-status__refresh {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.site-status__refresh.disabled,
.site-status__refresh.notCheckable,
.site-status__refresh.needReloadPage {
  opacity: .4;
  cursor: not-allowed;
}

.site-status__refresh.loading {
  opacity: .4;
  cursor: not-allowed;
  animation: rotating 1s 0s ease infinite forwards;
}

.site-status__info__container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 32px 0 24px;
}

.site-status__link__title,
.site-status__trust-score__title {
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: $color-gray-base-200;
}

.site-status__link__header,
.site-status__trust-score__header {
  margin-bottom: 4px;
}

.site-status__link__title {
  display: flex;
}

.site-status__link__wrapper {
  width: 100%;
  padding-right: 5px;
  border-right: 1px solid $color-gray-base-400;
}

.site-status__trust-score__wrapper {
  width: 100%;
  max-width: 140px;
  text-align: right;
  padding-left: 5px;
}

.site-status__trust-score {
  font-size: 16px;
  line-height: 22px;
  font-weight: 400;
  color: $color-text
}

.site-status__trust-score__max-value {
  color: $color-gray-base-100;
}

.site-status__link {
  font-size: 16px;
  line-height: 22px;
  color: $color-gray-base-200;
  max-width: 212px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.site-status__link__copy-img {
  margin-left: 8px;
  cursor: pointer;
}
</style>