import Browser from 'webextension-polyfill'

import { axios } from '@/utils/axios'
import { config } from '@/config'

import {
  actionsContext,
  axiosResponse,
  storageParams,
  analyticsIdentifyParams,
  requestConfig,
  analyticsEventParams,
  updateIdentify,
  settingsValuesType,
  notionDocumentType,
  reportResponse,
  versionsToggleValue,
  sendMessagesToTabsPortTypeParamsType,
  tradeSettingsValuesType,
  notionDocumentNotificationType,
  notificationNotionDatabaseDocumentResult,
  notificationsListType,
  notificationListRowType,
  sendMessageRequest
} from '@/types'
import { portTabs } from '@/consts/portTabs.const'
import { extensionList } from '@/consts/extensionList.const'
import { tradeSettings, tradeSettingsEvents } from '@/consts/settings.const'
import { protectionStatuses, hasApikeyStatuses } from '@/consts/protectionStatuses.const'
import { localeList } from '@/i18n/messages'
import { ampClient, amplitude } from '@/utils/amplitude'

export default {
  getters: {
    locationUrl (): string {
      return new URL(location.href).hostname
    },

    appVersion (): string {
      return Browser.runtime.getManifest().version
    },

    getStorage (): Function {
      return ( name: string ) => {
        return Browser.storage.local
          .get(name)
          .then(response => response[name] )
      }
    },
  },

  mutations: {
    setStorage ( _: actionsContext, { name, value }: storageParams ): void {
      Browser.storage.local.set({
        [name]: value,
      })
    },
  },

  actions: {
    REQUEST (
      { dispatch }: actionsContext,
      {
        isBackground = false,
        url,
        method,
        params,
        body,
        headers
      }: requestConfig
    ): Promise<axiosResponse> {
      const config: requestConfig = {
        url,
        method: method || 'get',
        params,
        data: body,
        headers,
      }

      if (isBackground) {
        return axios.request(config).catch(error => error.response)
      }

      const messageConfig = {
        action: 'request',
        message: config,
      }

      return dispatch('sendMessage', messageConfig)
    },

    async sendAnalyticsEvent (
      { getters }: actionsContext,
      { event, data, force = false }: analyticsEventParams
    ): Promise<void> {
      console.log('sendAnalyticsEvent', event, data, force)

      const settings: settingsValuesType = await getters.getStorage('settings')
      if (!settings.analyticEvents && !force) {
        return
      }

      ampClient.logEvent(event, data && data)
    },

    sendAnalyticsIdentify (_: actionsContext, { name, data }: analyticsIdentifyParams): void {
      console.log('sendAnalyticsIdentify', name, data)
      ampClient.identify(new amplitude.Identify().set(name, data))
    },

    async updateIdentify ({ getters, dispatch }: actionsContext, data: updateIdentify): Promise<void> {
      console.log('updateIdentify', data)

      const settings: settingsValuesType = await getters.getStorage('settings')
      if (!settings.analyticEvents) {
        return
      }

      if (data.status) {
        ampClient.identify(new amplitude.Identify().set('status', data.status))
      }

      if (data.steamLogin) {
        ampClient.setUserId(data.steamLogin)
        ampClient.identify(new amplitude.Identify().set('setUserId', data.steamLogin))
      }
    },

    async getSteamApiKeyPage ({ dispatch }: actionsContext, data: requestConfig): Promise<HTMLElement | null> {
      const url = 'https://steamcommunity.com/dev/apikey'
      const response: axiosResponse = await dispatch('REQUEST', { url, ...data })

      if (response && response.status === 429) {
        return null
      }

      const steamApikeyPage = document.createElement('div')
      steamApikeyPage.innerHTML = response.data

      return steamApikeyPage
    },

    async checkSteamApiKey ({ dispatch, commit }: actionsContext, data: requestConfig) {
      let hasApikeyStatus = hasApikeyStatuses.notRegistered
      let updateIdentifyStatus = 'not_found_registered_api_key'

      const steamApikeyPage: HTMLElement | null = await dispatch('getSteamApiKeyPage', data)
      if (!steamApikeyPage) {
        updateIdentifyStatus = 'too_many_requests'
        hasApikeyStatus = hasApikeyStatuses.failed
      } else {
        const input: HTMLInputElement | null = steamApikeyPage.querySelector('#editForm input')
        const hasApikey = input && input.type === 'submit'
        if (hasApikey) {
          updateIdentifyStatus = 'warning_found_registered_api_key'
          hasApikeyStatus = hasApikeyStatuses.registered
        }
      }

      dispatch('updateIdentify', {
        status: updateIdentifyStatus,
      })

      commit('setStorage', {
        name: 'hasApikeyStatus',
        value: hasApikeyStatus
      })

      return hasApikeyStatus
    },

    async getSteamID ({ dispatch }: actionsContext, data: requestConfig) {
      const url = 'https://steamcommunity.com/'
      const response: axiosResponse = await dispatch('REQUEST', { url, ...data })
      if (!response?.data) {
        return
      }

      const steamPage = document.createElement('div')
      steamPage.innerHTML = response.data
      const text = steamPage.textContent
      const steamID64 = text?.substring(
        text?.indexOf('g_steamID') + 13,
        text?.indexOf('g_strLanguage') - 4
      )

      return steamID64
    },

    async checkSteamLogin ({ dispatch }: actionsContext, data: requestConfig): Promise<void> {
      const isSigned = await dispatch('checkSteamSigned')
      if (!isSigned) {
        return
      }

      const steamID64 = await dispatch('getSteamID', data)
      if (steamID64) {
        dispatch('updateIdentify', {
          steamLogin: steamID64,
        })
      }
    },

    async checkSteamSigned ({ dispatch, commit }: actionsContext, data: requestConfig): Promise<boolean> {
      let isSigned = false

      const url = 'https://steamcommunity.com/'
      const response: axiosResponse | undefined = await dispatch('REQUEST', { url, ...data })

      const steamPage = document.createElement('div')
      steamPage.innerHTML = response?.data

      const signinButtons = steamPage.querySelector('.community_activity_signin_buttons')
      if (!signinButtons) {
        isSigned = true
      }

      commit('setStorage', {
        name: 'signed',
        value: isSigned
      })

      if (isSigned) {
        dispatch('sendMessage', {
          action: 'setStatusIcon'
        })
      }

      return isSigned
    },

    async sendReport ({ dispatch }: actionsContext, data: requestConfig): Promise<reportResponse> {
      const response: axiosResponse = await dispatch('REQUEST', {
        url: 'https://antiscam.zaebumba.com/reports',
        method: 'post',
        body: { domain: data.reportUrl },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        ...data,
      })

      return response.data
    },

    async getChangeList (
      { getters, dispatch }: actionsContext,
      data: requestConfig
    ): Promise<Array<string | null> | boolean> {
      const versionsList = await dispatch('getNotionDocument', {
        blockId: config.NOTION_CHANGELOG_DATABASE_ID,
        ...data,
      })

      const currentVersionBlock = versionsList.results.find((block: versionsToggleValue): boolean => {
        return !!block.toggle?.text?.[0]?.plain_text?.includes(getters.appVersion)
      })

      if (!currentVersionBlock) {
        return false
      }

      const changeListResponse = await dispatch('getNotionDocument', {
        blockId: currentVersionBlock.id,
        ...data,
      })

      const changeList: Array<null | string> = []
      changeListResponse.results.forEach((block: versionsToggleValue) => {
        if (block?.paragraph?.text?.[0]?.plain_text) {
          changeList.push(block.paragraph.text[0].plain_text)
        }
      })

      return changeList
    },

    async getNotionDocument ({ dispatch }: actionsContext, data: requestConfig): Promise<notionDocumentType> {
      const url = data.url || `https://api.notion.com/v1/blocks/${data.blockId}/children`
      const headers = {
        'Authorization': `Bearer ${config.NOTION_KEY}`,
        'Notion-Version': config.NOTION_VERSION,
      }

      const response: axiosResponse = await dispatch('REQUEST', { url, headers, ...data })
      return response.data
    },

    async setStatusIcon ({ getters, dispatch }: actionsContext): Promise<void> {
      let path = 'icons/extension-default'

      const signed = await getters.getStorage('signed')
      if (!signed) {
        Browser.browserAction.setIcon({ path: 'icons/extension-signin.png' })

        return
      }

      const notificationsNumber = await dispatch('getNotificationsNumber')
      const isHasUnreadNotifications = notificationsNumber > 0

      const settings: settingsValuesType = await getters.getStorage('settings')
      if (!settings.liveAnalysis) {
        path = isHasUnreadNotifications ? path + '-notification.png' : path + '.png'

        Browser.browserAction.setIcon({ path })

        return
      }

      const tabs = await Browser.tabs.query({ currentWindow: true, active: true })
      const url = tabs[0]?.url
      const liveAnalysisResults = await getters.getStorage('liveAnalysisResults')
      if (url && liveAnalysisResults) {
        const liveAnalysisResult = liveAnalysisResults.find(( liveAnalysisResult: any ) => {
          return (
            liveAnalysisResult.currentPageUrl === url ||
            url.includes(liveAnalysisResult.domain)
          )
        })
        if (liveAnalysisResult) {
          const hasApikeyStatus = await getters.getStorage('hasApikeyStatus')
          const { protectionStatus } = liveAnalysisResult

          if (
            protectionStatus === protectionStatuses.scam ||
            protectionStatus === protectionStatuses.needReloadPage
          ) {
            path = 'icons/extension-alert'
          }

          if (
            protectionStatus === protectionStatuses.safe && (
              hasApikeyStatus !== hasApikeyStatuses.registered &&
              settings.preventApiScam
            )
          ) {
            path = 'icons/extension-safe'
          }

          if (
            (
              protectionStatus === protectionStatuses.unknown ||
              protectionStatus === protectionStatuses.canNotCheck
            ) || (
              protectionStatus === protectionStatuses.safe &&
              hasApikeyStatus === hasApikeyStatuses.registered &&
              settings.preventApiScam
            )
          ) {
            path = 'icons/extension-attention'
          }

          if (
            protectionStatus === protectionStatuses.disabled ||
            protectionStatus === protectionStatuses.notCheckable ||
            protectionStatus === protectionStatuses.failed
          ) {
            path = 'icons/extension-default'
          }
        }
      }

      path = isHasUnreadNotifications ? path + '-notification.png' : path + '.png'

      Browser.browserAction.setIcon({ path })
    },

    async sendMessagesToTabsPort (
      _: actionsContext,
      { portName, tabName, urls, allowAllTabs = false, tabId, data }: sendMessagesToTabsPortTypeParamsType
    ) {
      if (tabId) {
        const port = Browser.tabs.connect(tabId, {
          name: portName,
        })

        port.postMessage(data)

        return
      }


      const tabs = await Browser.tabs.query({})
      const matchedTabs = tabs.filter(tab => {
        if (allowAllTabs) {
          return true
        }

        const stringsToMatch = tabName ? portTabs[tabName].matches : [...urls]
        const isMatched = stringsToMatch.some(stringToMatch => tab.url?.includes(stringToMatch))

        return isMatched
      })
      if (!matchedTabs?.length) {
        return
      }

      matchedTabs.forEach(matchedTab => {
        if (!matchedTab?.id) {
          return
        }

        const port = Browser.tabs.connect(matchedTab.id, {
          name: portName,
        })

        port.postMessage(data)
      })
    },

    async checkExtensions ({ dispatch }: actionsContext) {
      const extensionInfoList = await Browser.management.getAll()
      if (!extensionInfoList?.length) {
        return false
      }

      const matchedExtensionItems = extensionInfoList.map(extensionInfoItem => {
        const extensionListItem = extensionList.find(extensionListItem => {
          const matchedName = extensionListItem.names.includes(extensionInfoItem.name)
          const matchedShortName = (
            extensionInfoItem.shortName ?
            extensionList[0].shortNames.includes(extensionInfoItem.shortName) :
            false
          )

          return matchedName && matchedShortName
        })

        return {
          ...extensionInfoItem,
          action: extensionListItem?.action
        }
      })

      if (!matchedExtensionItems?.length) {
        return false
      }

      const disableAllTradeSettings = !!matchedExtensionItems.find(item => {
        return (
          item.action === 'disableAllTradeSettings' &&
          item.enabled
        )
      })

      if (disableAllTradeSettings) {
        await dispatch('toggleAllTradeSettings', false)
      } else {
        await dispatch('toggleAllTradeSettings', true)
      }

      return disableAllTradeSettings
    },

    async checkExtension ({ dispatch }: actionsContext, extensionInfo: any) {
      const result = extensionList.find(async extensionListItem => {
        const action = extensionListItem.action
        const isEnabled = extensionInfo.enabled
        const matchedName = extensionListItem.names.includes(extensionInfo.name)
        const matchedShortName = (
          extensionInfo.shortName ?
          extensionList[0].shortNames.includes(extensionInfo.shortName) :
          false
        )
        if ( !matchedName && !matchedShortName ) {
          return false
        }

        if (action === 'disableAllTradeSettings' && isEnabled) {
          await dispatch('toggleAllTradeSettings', false)
        } else if (action === 'disableAllTradeSettings' && !isEnabled) {
          await dispatch('toggleAllTradeSettings', true)
        }

        return !isEnabled
      })

      return result
    },

    async toggleAllTradeSettings ({ getters, dispatch, commit }: actionsContext, state: boolean) {
      const tradeSettingsValues: tradeSettingsValuesType = await getters.getStorage('tradeSettings')
      const isToggled = tradeSettings.every(tradeSettingName => tradeSettingsValues[tradeSettingName] === state)
      if (isToggled) {
        return
      }

      tradeSettings.forEach(tradeSettingName => {
        tradeSettingsValues[tradeSettingName] = state
      })

      commit('setStorage', {
        name: 'tradeSettings',
        value: tradeSettingsValues,
      })

      dispatch('updateIdentify', tradeSettingsValues)

      tradeSettings.forEach(tradeSetting => {
        dispatch('sendAnalyticsEvent', {
          event: tradeSettingsEvents[tradeSetting],
          data: {
            enabled: tradeSettingsValues[tradeSetting],
          },
          force: true,
        })
      })

      dispatch('sendMessagesToTabsPort', {
        portName: 'settingsChangesPort',
        tabName: portTabs.steamPage.name,
        data: tradeSettingsValues['showItemPrices']
      })
    },

    async getNotificationsNumber ({ getters }: actionsContext) {
      const notifications: notificationsListType | undefined = await getters.getStorage('notifications')
      const usedNotificationIds: (string | undefined)[] = await getters.getStorage('usedNotificationIds')
      const notShowedNotifications = notifications?.filter(notification => {
        return !usedNotificationIds.find(id => id === notification?._id)
      })

      return notShowedNotifications?.length || 0
    },

    async getNotification (
      { dispatch }: actionsContext,
      data: requestConfig
    ): Promise<notificationsListType | undefined> {
      const response = await dispatch('REQUEST', { ...data, url: 'http://antiscam.zaebumba.com/notifications'})

      return response?.data?.result;
    },

    async sendMessage (
      _: actionsContext,
      {
        tabId,
        action,
        message,
        successCallback,
        errorCallback,
      }: sendMessageRequest
    ): Promise<any> {
      let messageSender = null

      if (tabId) {
        try {
          messageSender = Browser.tabs.sendMessage(tabId, {
            action,
            message,
          })
        } catch {
          if (errorCallback) {
            errorCallback('could not establish connection')
          }

          return null
        }
      } else {
        try {
          messageSender = Browser.runtime.sendMessage({
            action,
            message
          })
        } catch {
          if (errorCallback) {
            errorCallback('could not establish connection')
          }

          return null
        }
      }

      const result = await messageSender.then(response => {
        if (successCallback) {
          successCallback(response)
        }

        return response
      }).catch(error => {
        if (errorCallback) {
          errorCallback(error)
        }

        return null
      })

      return result
    }
  },
}
