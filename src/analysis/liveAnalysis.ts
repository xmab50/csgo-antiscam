import Browser from 'webextension-polyfill'
import { store } from '@/store'
import { i18n } from '@/i18n/index'

import { notify, closeNotify } from '@/analysis/notify/notify'
import { hasApikeyStatuses, protectionStatuses } from '@/consts/protectionStatuses.const'

import {
  analyzedDatabaseSite,
  settingsValuesType,
} from '@/types'

const messages = i18n.messages
const siteInfo: any = {
  currentPageUrl: window.location.href,
  domain: window.location.hostname,
  from: 'liveAnalysis',
}
let liveAnalysisResult: any = null

Browser.runtime.onMessage.addListener(( request ) => {
  const { action, message } = request
  const href = window.location.href
  const domain = window.location.hostname
  const isCurrentPage = (
    message.url === href ||
    message.url.includes(domain)
  )

  if (!isCurrentPage) {
    return
  }

  if (action === 'liveAnalysisIsActiveRequest') {
    sendMessage('liveAnalysisIsActiveResponse', siteInfo)
  }

  if (action === 'getLiveAnalysisResult') {
    sendMessage('respondingLiveAnalysis', liveAnalysisResult)
  }

  if (action === 'reloadLiveAnalysis') {
    closeNotify(null, true)
    startAnalysis()
  }

  if (action === 'checkUnknownPage') {
    closeNotify(null, true)
    checkUnknownPage()
  }
})

async function startAnalysis () {
  const settings: settingsValuesType = await store.getters.getStorage('settings')
  if (!settings.liveAnalysis) {
    sendLiveAnalysis({
      protectionStatus: protectionStatuses.disabled
    })

    return
  }

  await store.dispatch('updateSitesList')

  const notCheckableSite = window.location.href.includes('chrome.google.com/webstore/')
  if (notCheckableSite) {
    console.log('not checkable site: ', notCheckableSite)

    sendLiveAnalysis({
      protectionStatus: protectionStatuses.notCheckable,
    })

    return
  }

  const isApiBlackListed: string | undefined = await store.dispatch('getIsApiBlackListed')
  if (isApiBlackListed) {
    console.log('isBlackListed: ', isApiBlackListed)

    sendLiveAnalysis({
      protectionStatus: protectionStatuses.scam,
      isBlackListed: true,
    })

    return
  }

  const isApiWhiteListed: string | undefined = await store.dispatch('getIsApiWhiteListed')
  if (isApiWhiteListed) {
    console.log('isWhiteListed: ', isApiWhiteListed)

    sendLiveAnalysis({
      protectionStatus: protectionStatuses.safe,
      isWhiteListed: true,
    })

    return
  }

  const result: Array<analyzedDatabaseSite | undefined> | null = await store.dispatch('getSiteOnDB', siteInfo.domain)
  if (result && result?.length > 0 && result[0]) {
    const site = result[0]
    console.log(`${site.isScam ? 'isBlackListed' : 'isWhiteListed'}: `, site)

    sendLiveAnalysis({
      protectionStatus: site.isScam ? protectionStatuses.scam : protectionStatuses.safe,
      isBlackListed: site.isScam,
      isWhiteListed: !site.isScam,
      ...site,
    })

    return
  }

  const similarityScore: number = await store.dispatch('getSimilarityScore')
  if (similarityScore > 0.05 && !liveAnalysisResult?.checkedSiteTrustworthiness) {
    sendLiveAnalysis({
      protectionStatus: protectionStatuses.unknown,
      similarityScore,
    })

    return
  } else if (liveAnalysisResult?.checkedSiteTrustworthiness) {
    sendLiveAnalysis(
      {
        ...liveAnalysisResult,
        protectionStatus: protectionStatuses.canNotCheck,
        similarityScore,
      },
      true
    )

    return
  }

  sendLiveAnalysis({
    protectionStatus: protectionStatuses.canNotCheck,
    similarityScore,
  })
}

startAnalysis()

async function sendLiveAnalysis (message: any, checkedSiteTrustworthiness?: boolean) {
  const action = 'respondingLiveAnalysis'

  message = { ...siteInfo, ...message }
  liveAnalysisResult = message

  sendMessage(action, message)
  checkApiKeyStatus()

  if (checkedSiteTrustworthiness) {
    return
  }

  setWebsiteCheckResultPopup(message.protectionStatus)
}

function setWebsiteCheckResultPopup (protectionStatus: string) {
  if (
    protectionStatus === protectionStatuses.unknown ||
    protectionStatus === protectionStatuses.scam
  ) {
    // @ts-ignore
    const notifyMessages = messages[i18n.locale].siteStatus.notify[protectionStatus]

    notify({
      title: notifyMessages.title,
      text: notifyMessages.text,
      button: notifyMessages?.button,
      buttonCallback: () => {
        sendLiveAnalysis({
          protectionStatus: 'loading'
        })

        checkUnknownPage()
      },
      closeCallback: () => {
        store.dispatch('sendAnalyticsEvent', {
          event: 'extension_alert_website_popup',
          data: {
            action: 'close'
          },
        })

        store.commit('setStorage', {
          name: 'apiKeyNotificationIsShowed',
          value: true
        })
      },
      protectionStatus,
    })
  }
}

function sendMessage (action: string, message?: any) {
  store.dispatch('sendMessage', {
    action,
    message,
  })
}

async function checkUnknownPage () {
  if (liveAnalysisResult.checkedSiteTrustworthiness) {
    sendLiveAnalysis(
      {
        ...liveAnalysisResult,
        protectionStatus: protectionStatuses.canNotCheck,
      },
      true
    )

    return
  }

  sendLiveAnalysis({
    ...liveAnalysisResult,
    protectionStatus: 'loading',
    checkedSiteTrustworthiness: true
  }, true)

  const similarityScore: number = await store.dispatch('getSimilarityScore')
  const domain = window.location.hostname
  const currentPageUrl = window.location.href

  const siteStatus = await store.dispatch('checkUnknownPage', {
    domain,
    currentPageUrl,
    similarityScore,
  })

  siteStatus.checkedSiteTrustworthiness = true

  const isSuccessful = (
    siteStatus.protectionStatus === protectionStatuses.safe ||
    siteStatus.protectionStatus === protectionStatuses.scam
  )

  store.dispatch('sendAnalyticsEvent', {
    event: 'extension_website_check_request',
    data: {
      url: siteInfo.currentPageUrl,
      successful: isSuccessful
    }
  })

  sendLiveAnalysis(siteStatus)
}

// checkApiKeyStatus()

async function checkApiKeyStatus () {
  const { preventApiScam } = await store.getters.getStorage('settings')
  const apiKeyNotificationIsShowed: boolean | undefined = await store.getters.getStorage('apiKeyNotificationIsShowed')
  const hasApiKeyStatus: string = await store.dispatch('checkSteamApiKey')

  if (!preventApiScam) {
    return
  }

  if (
    hasApiKeyStatus === hasApikeyStatuses.notRegistered &&
    apiKeyNotificationIsShowed
  ) {
    store.commit('setStorage', {
      name: 'apiKeyNotificationIsShowed',
      value: false
    })
  }

  if (
    hasApiKeyStatus === hasApikeyStatuses.registered &&
    !apiKeyNotificationIsShowed
  ) {
    store.commit('setStorage', {
      name: 'apiKeyNotificationIsShowed',
      value: true
    })
    sendMessage('setStatusIcon')

    // @ts-ignore
    const notifyMessages = messages[i18n.locale].apikeyStatus.notify.registered

    notify({
      title: notifyMessages.title,
      text: notifyMessages.text,
      button: notifyMessages.button,
      closeCallback: () => {
        store.dispatch('sendAnalyticsEvent', {
          event: 'extension_alert_apikey_popup',
          data: {
            action: 'close'
          }
        })

        store.commit('setStorage', {
          name: 'apiKeyNotificationIsShowed',
          value: true
        })
      },
      buttonCallback: () => {
        window.open('https://steamcommunity.com/dev/apikey', '_blank')
      }
    })
  }
}