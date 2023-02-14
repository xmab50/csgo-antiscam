import Browser from 'webextension-polyfill'

import { axios } from '@/utils/axios'
import { store } from '@/store/index'
import { settings, tradeSettings } from '@/consts/settings.const'
import { config } from '@/config'
import { BrowserHooks } from '@/utils/browserHooks'

import {
  settingsValuesType,
  alarmHandlerParams,
  messageHandlerRequest,
  notificationsListType,
  detailsValue,
  tradeSettingsValuesType,
  sitesListResponseType,
  messageSender,
  webNavigationDetails,
} from '@/types'
import { ampClient } from '@/utils/amplitude'
import amplitude from 'amplitude-js'
import { localeList } from './i18n/messages'

async function installHandler (details: detailsValue): Promise<void> {
  if (details.reason === 'install') {
    const settingsValue: settingsValuesType | any = {}
    settings.forEach(settingName => {
      if (
        // settingName === 'liveAnalysis' ||
        settingName === 'scamTradeOffer'
      ) {
        settingsValue[settingName] = false
      } else {
        settingsValue[settingName] = true
      }
    })

    const tradeSettingsValue: tradeSettingsValuesType | any = {}
    tradeSettings.forEach(tradeSettingName => {
      tradeSettingsValue[tradeSettingName] = true
    })

    store.commit('setStorage', {
      name: 'settings',
      value: settingsValue,
    })

    store.commit('setStorage', {
      name: 'tradeSettings',
      value: tradeSettingsValue,
    })

    store.dispatch('sendAnalyticsEvent', {
      event: 'extension_installed',
      data: {
        action: 'installed',
      },
    })

    setDefaultLanguage()
  }

  store.dispatch('setStatusIcon')

  if (details.reason == 'update') {
		const currentVersion = store.getters.appVersion
		const previousVersion = details.previousVersion
		const isVersionUpdated = currentVersion !== previousVersion
		if (!isVersionUpdated) {
      return
		}

    const changeList = await store.dispatch('getChangeList', { isBackground: true })
    if (!changeList) {
      return
    }

    store.commit('setStorage', {
      name: 'changelogSettings',
      value: {
        isShow: true,
        changeList,
      },
    })
	}

  await store.dispatch('checkSteamSigned')
  await store.dispatch('checkExtensions')

  await getNotification()
}

function setDefaultLanguage () {
  const UILanguage = Browser.i18n.getUILanguage()

  localeList.map(locale => {
    if (UILanguage === locale || UILanguage.startsWith(locale)) {
      store.commit('setStorage', {
        name: 'locale',
        value: locale,
      })
    }
  })
}

function messageHandler ( request: messageHandlerRequest, sender: messageSender ): any {
  const { action, message } = request
  const tabId = sender.tab?.id

  if (action === 'setStatusIcon') {
    store.dispatch('setStatusIcon')
  }

  if (action === 'respondingLiveAnalysis') {
    message.tabId = tabId

    setLiveAnalysisResultToStorage(message)
  }

  if (action === 'getTabs') {
    return Browser.tabs.query(message)
  }

  if (action === 'request') {
    return axios.request(message)
      .then(response => JSON.parse(JSON.stringify(response)))
      .catch(error => JSON.parse(JSON.stringify(error.response || error)))
  }
}

async function webNavigationHandler (event: webNavigationDetails): Promise<void> {
  // TODO: check frameId
	if (event.frameId === 0) {
    await updateSettings(event.tabId)

    store.dispatch('setStatusIcon')
    store.dispatch('checkSteamSigned')

    store.dispatch('sendMessage', {
      tabId: event.tabId,
      action: 'liveAnalysisIsActiveRequest',
      message: {
        url: event.url
      },
      errorCallBack: () => store.dispatch(
        'sendMessage',
        {
          action: 'updateSiteStatus',
          message: {
            tabId: event.tabId,
            url: event.url
          }
        }
      )
    })

    await getNotification()
	}
}

async function setSettings (
  settingsStoreName: 'settings' | 'tradeSettings'
): Promise<tradeSettingsValuesType | settingsValuesType> {
  const settingsValue: tradeSettingsValuesType | settingsValuesType | any = {}
  let settingNames: string[] = settings

  if (settingsStoreName === 'tradeSettings') {
    settingNames = tradeSettings
  }

  settingNames.forEach(settingName => {
    settingsValue[settingName] = true
  })

  store.commit('setStorage', {
    name: settingsStoreName,
    value: settingsValue,
  })

  return settingsValue
}

async function updateSettings (tabId: number) {
  Browser.tabs.get(tabId).then(async () => {
    let settings: settingsValuesType = await store.getters.getStorage('settings')
    let tradeSettings: tradeSettingsValuesType = await store.getters.getStorage('tradeSettings')

    if (!settings) {
      settings = await setSettings('settings') as settingsValuesType
    }
    store.dispatch('sendAnalyticsIdentify', {
      name: 'preventApiScam',
      data: settings.preventApiScam,
    })
    store.dispatch('sendAnalyticsIdentify', {
      name: 'liveAnalysis',
      data: true,
    })
    store.dispatch('sendAnalyticsIdentify', {
      name: 'analyticEvents',
      data: settings.analyticEvents,
    })
    store.dispatch('sendAnalyticsIdentify', {
      name: 'allowNotifications',
      data: settings.allowNotifications,
    })
    store.dispatch('sendAnalyticsIdentify', {
      name: 'scamTradeOffer',
      data: settings.scamTradeOffer,
    })

    if (!tradeSettings) {
      tradeSettings = await setSettings('tradeSettings') as tradeSettingsValuesType
    }
    store.dispatch('sendAnalyticsIdentify', {
      name: 'showItemPrices',
      data: tradeSettings.showItemPrices,
    })
    store.dispatch('sendAnalyticsIdentify', {
      name: 'showItemSkinInfo',
      data: tradeSettings.showItemSkinInfo,
    })
  })
}

async function alarmHandler (alarm: alarmHandlerParams): Promise<void> {
  if (alarm.name === 'updateSitesList') {
    const scamSites: sitesListResponseType = await store.dispatch('getBlackList', { isBackground: true })
    store.commit('setStorage', {
      name: 'scamSites',
      value: scamSites,
    })

    const whiteListedSites: sitesListResponseType = await store.dispatch('getWhiteList', { isBackground: true })
    store.commit('setStorage', {
      name: 'whiteListedSites',
      value: whiteListedSites,
    })
  }

  if (alarm.name === 'checkSteamLogin') {
    store.dispatch('checkSteamLogin', { isBackground: true })
  }
}

function storageChangedHandler (changes: any): void {
	if (
    changes.settings ||
    changes.notifications ||
    changes.usedNotificationIds
  ) {
    store.dispatch('setStatusIcon')
	}
}

function updateAvailableHandler (): void {
  store.dispatch('sendAnalyticsEvent', {
    event: 'extension_installed',
    data: {
      action: 'updated',
    },
  })
}

async function getNotification() {
  const usedNotificationIds = await store.getters.getStorage('usedNotificationIds')
  if (!usedNotificationIds) {
    store.commit('setStorage', {
      name: 'usedNotificationIds',
      value: [],
    })
  }

  const notifications: notificationsListType = await store.dispatch('getNotification', {
    isBackground: true,
  })

  if (!notifications?.length) {
    console.log('notifications is empty.');

    return
  }

  console.log('notifications settings.');

  store.commit('setStorage', {
    name: 'notifications',
    value: notifications,
  })

  store.dispatch('setStatusIcon')
}

async function setLiveAnalysisResultToStorage(data: any) {
  const liveAnalysisResults = await store.getters.getStorage('liveAnalysisResults')
  const analyzedTabs = liveAnalysisResults || []
  const newAnalyzedTabs: any[] = []

  analyzedTabs.push(data)

  if (analyzedTabs.length === 0) {
    newAnalyzedTabs.push(data)
  } else {
    analyzedTabs.forEach(( analyzedTab: any ) => {
      if (!analyzedTab || !data) {
        return
      }

      const duplicate = newAnalyzedTabs.find(newAnalyzedTab => newAnalyzedTab.domain === analyzedTab.domain)
      if (duplicate) {
        return
      }

      if (analyzedTab.domain === data.domain) {
        analyzedTab = data
      }

      newAnalyzedTabs.push(analyzedTab)
    })
  }

  console.log('Analyzed tabs: ', newAnalyzedTabs)

  store.commit('setStorage', {
    name: 'liveAnalysisResults',
    value: newAnalyzedTabs
  })

  store.dispatch('setStatusIcon')

  store.dispatch('sendMessage', {
    action: 'updateSiteStatus',
    message: {
      tabId: data.tabId,
      url: data.currentPageUrl
    }
  })
}

async function extensionStateHandler () {
  await store.dispatch('checkExtensions')
}

async function browserOpenedHandler () {
  await store.dispatch('checkSteamSigned')
  await store.dispatch('checkExtensions')

  await getNotification()
}

async function browserActionHandler (tab: Browser.Tabs.Tab) {
  const settingPopup = await setPopup(tab)
  if (settingPopup) {
    return
  }

  await store.dispatch('sendMessage', {
    tabId: tab.id,
    action: 'openContentPopup',
    errorCallback: (error: any) => {
      if (`${error}`.toLocaleLowerCase().includes('could not establish connection')) {
        if (tab.status === 'complete') {
          setPopup(tab, true)
        }
      }
    }
  })
}

async function tabsUpdatingHandler(
  tabId: number,
  changeInfo: Browser.Tabs.OnUpdatedChangeInfoType,
  tab: Browser.Tabs.Tab
) {
  if (!tab) {
    return
  }

  await setPopup(tab)
}

async function setPopup(tab: Browser.Tabs.Tab, errorPopup = false) {
  if (!errorPopup) {
    const isHTTP = !!tab.url?.startsWith('http')
    if (isHTTP) {
      return false
    }
  }

  const popupURL = Browser.runtime.getURL('./popup.html')

  await Browser.browserAction.setPopup({
    tabId: tab.id,
    popup: popupURL
  })

  return true
}

function browserClosedHandler (): void {
  store.commit('setStorage', {
    name: 'sessionWhiteListedSites',
    value: [],
  })

  store.commit('setStorage', {
    name: 'tradeItem',
    value: null,
  })

  store.commit('setStorage', {
    name: 'liveAnalysisResults',
    value: [],
  })
}

// start of background implementation

Browser.cookies.set({
	url: config.STEAM_URL,
	name: 'SameSite',
	value: 'None',
})
Browser.cookies.set({
	url: config.HOSTNAME,
	name: 'SameSite',
	value: 'None',
})

Browser.alarms.create('updateSitesList', {
	when: Date.now(),
	periodInMinutes: 60 * 12,
})
Browser.alarms.create('checkSteamLogin', {
  when: Date.now(),
	periodInMinutes: 60 * 24,
})

new BrowserHooks({
  openHandler: browserOpenedHandler,
  closeHandler: browserClosedHandler,
})

Browser.runtime.setUninstallURL(config.UNINSTALL_URL)

Browser.runtime.onInstalled.addListener(installHandler)

Browser.runtime.onMessage.addListener(messageHandler)

Browser.runtime.onUpdateAvailable.addListener(updateAvailableHandler)

Browser.webNavigation.onCompleted.addListener(webNavigationHandler)

Browser.alarms.onAlarm.addListener(alarmHandler)

Browser.storage.onChanged.addListener(storageChangedHandler)

Browser.management.onEnabled.addListener(extensionStateHandler)

Browser.management.onDisabled.addListener(extensionStateHandler)

Browser.tabs.onUpdated.addListener(tabsUpdatingHandler)

Browser.browserAction.onClicked.addListener(browserActionHandler)