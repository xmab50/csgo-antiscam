import { headKeywords, bodyKeywords, fakeLoginKeywords } from '@/consts/analysisKeywords'
import { config } from '@/config'

import {
  actionsContext,
  searchUserParams,
  apiVoidCreditsValue,
  userReputationValue,
  userReputationParams,
  siteTrustworthinessValue,
  requestConfig,
  sitesListResponseType,
  axiosResponse,
  scamSitesArray,
  whiteListedSitesArray,
  analyzedSite,
} from '@/types'
import { protectionStatuses } from '@/consts/protectionStatuses.const'

export default {
  actions: {
    async getSiteOnDB ({ dispatch }: actionsContext, domain: string) {
      const result = await dispatch('REQUEST', {
        url: `https://antiscam.zaebumba.com/siteslist?domain=${domain}`
      })

      return result?.data?.result
    },

    async setSiteToDB ({ dispatch }: actionsContext, site: analyzedSite) {
      const result = await dispatch('REQUEST', {
        url: `https://antiscam.zaebumba.com/siteslist`,
        method: 'POST',
        body: { site },
      })

      const success = result?.data?.result?.acknowledged
      if (!success) {
        return false
      }

      return true
    },

    async getApiVoidCredits ({ dispatch }: actionsContext): Promise<apiVoidCreditsValue> {
      const response = await dispatch('REQUEST', {
        url: config.API_VOID_URL,
        params: {
          key: config.API_VOID_KEY,
          stats: '',
        },
      })

      return response?.data
    },

    async isApiVoidAvailable ({ dispatch }: actionsContext) {
      const apiVoidCredits: apiVoidCreditsValue = await dispatch('getApiVoidCredits')
      const estimatedQueries = apiVoidCredits?.estimated_queries?.replace(/[,.]/g, '') || 0
      const isApiVoidAvailable: boolean = +estimatedQueries > 0

      return isApiVoidAvailable
    },

    async getSiteTrustworthiness ({ getters, dispatch }: actionsContext, domain?: string): Promise<siteTrustworthinessValue> {
      const response = await dispatch('REQUEST', {
        url: config.API_VOID_URL,
        params: {
          key: config.API_VOID_KEY,
          host: domain || getters.locationUrl,
        },
      })

      return response.data
    },

    async getTrustScore ({ dispatch }: actionsContext, domain?: string): Promise<number | undefined> {
      const siteTrustworthiness: siteTrustworthinessValue | undefined = await dispatch('getSiteTrustworthiness', domain)
      const trustScore = siteTrustworthiness?.data?.report?.trust_score?.result

      return trustScore
    },

    getSimilarityScore (): number {
      let similarityScore = 0

      headKeywords.forEach(( keyword: string ) => {
        if (document.head.innerHTML.toLowerCase().includes(keyword)) {
          similarityScore += 2
        }
      })

      bodyKeywords.forEach(( keyword: string ) => {
        if (document.body.innerHTML.toLowerCase().includes(keyword)) {
          similarityScore++
        }
      })

      const keywordsCount = headKeywords.length + bodyKeywords.length
      const similarityPercentage = similarityScore / keywordsCount

      console.log('similarityScore', similarityPercentage)
      return similarityPercentage
    },

    isSimilarLogin (): boolean {
      const iframe: HTMLIFrameElement | null = document.querySelector('iframe')
      if (!iframe) {
        return false
      }

      const iframeDoc = `${iframe}`

      let fakeLoginScore = 0

      fakeLoginKeywords.forEach((keyword) => {
        if (iframeDoc.toLowerCase().includes(keyword)) {
          fakeLoginScore += 2
        }
      })

      fakeLoginKeywords.forEach((keyword) => {
        if (iframeDoc.toLowerCase().includes(keyword)) {
          fakeLoginScore++
        }
      })

      const isHasSteamUrl = document.body.innerHTML.toLowerCase().includes('steamcommunity.com')
      if (isHasSteamUrl) {
        fakeLoginScore++
      }

      return isHasSteamUrl && (fakeLoginScore / fakeLoginKeywords.length >= 0.5)
    },

    async searchUser ({ dispatch }: actionsContext, { query }: searchUserParams): Promise<any> {
      const response = await dispatch('REQUEST', {
        url: '/platform/search',
        method: 'post',
        body: { query },
      })

      return response.data
    },

    async getUserReputation (
      { dispatch }: actionsContext,
      { steamid }: userReputationParams
    ): Promise<userReputationValue> {
      const url = `https://steamrep.com/api/beta4/reputation/${steamid}?json=1`
      const response = await dispatch('REQUEST', { url })

      return response.data
    },

    async getTradeOffers ({ dispatch }: actionsContext, {
      apiKey,
      getSentOffers = true,
      getReceivedOffers = true,
      getDescriptions = true,
      cursor = 0
    }: {
      apiKey: string,
      getSentOffers: boolean,
      getReceivedOffers: boolean,
      getDescriptions: boolean,
      cursor?: number
    }) {
      const url = `https://api.steampowered.com/IEconService/GetTradeOffers/v1?key=${apiKey}&get_sent_offers=${getSentOffers}&get_received_offers=${getReceivedOffers}&get_descriptions=${getDescriptions}&cursor=${cursor}&language=en`

      const response = await dispatch('REQUEST', { url })

      return response.data.response
    },

    async getTradeOffer ({ dispatch }: actionsContext, {
      apiKey,
      tradeOfferId,
      getDescriptions = true
    }: {
      apiKey: string,
      tradeOfferId: string,
      getDescriptions: boolean
    }) {
      const url = `https://api.steampowered.com/IEconService/GetTradeOffer/v1?key=${apiKey}&tradeofferid=${tradeOfferId}&get_descriptions=${getDescriptions}&language=en`

      const response = await dispatch('REQUEST', { url })

      return response.data.response
    },

    async getTradeOfferPage ({ dispatch }: actionsContext, tradeOfferId: string) {
      const url = `https://steamcommunity.com/tradeoffer/${tradeOfferId}/`

      const response = await dispatch('REQUEST', { url })

      return response.data
    },

    async getIsApiBlackListed ({ getters, dispatch }: actionsContext): Promise<string | undefined> {
      const apiScamSitesList: string[] | undefined = await getters.getStorage('apiScamSites')
      if (!apiScamSitesList) {
        return
      }

      const scamSite = await dispatch('checkSitesName', apiScamSitesList)

			return scamSite
    },

    async getIsApiWhiteListed ({ getters, dispatch }: actionsContext): Promise<string | undefined> {
      const apiWhiteSitesList: string[] | undefined = await getters.getStorage('apiWhiteListedSites')
      if (!apiWhiteSitesList) {
        return
      }

      const whiteSite = await dispatch('checkSitesName', apiWhiteSitesList)

			return whiteSite
    },

    async checkSitesName (_: actionsContext, sitesList: string[]): Promise<string | undefined> {
      const targetURL =
				new URL(location.href).hostname.split('.').length === 3
					? new URL(location.href).hostname.split('.').slice(-3).join('.')
					: new URL(location.href).hostname.split('.').slice(-2).join('.')

      const site = sitesList.find(site => {
				try {
          const checkedSite = targetURL.trim().replace('www.', '')
					let scamSite = site.trim().replace('www.', '')

					if (scamSite.startsWith('http://') || scamSite.startsWith('https://')) {
						scamSite =
						new URL(scamSite).hostname.split('.').length === 3
						? new URL(scamSite).hostname.split('.').slice(-3).join('.')
						: new URL(scamSite).hostname.split('.').slice(-2).join('.')
					} else {
						scamSite =
						new URL(`https://${scamSite}`).hostname.split('.').length === 3
						? new URL(`https://${scamSite}`).hostname.split('.').slice(-3).join('.')
						: new URL(`https://${scamSite}`).hostname.split('.').slice(-2).join('.')
					}

					return scamSite === checkedSite
				// eslint-disable-next-line no-empty
				} catch {}
			})

      return site
    },

    async getApiBlackList ({ dispatch }: actionsContext, data: requestConfig): Promise<string[] | undefined[] | undefined> {
      const url = '/api/ban/getAll'
      const response: axiosResponse = await dispatch('REQUEST', { url, ...data })
      if (!response) {
        return
      }

      const { items } = response.data.data
      const scamSitesList = items.map(( item: any ) => item.website)

      return scamSitesList
    },

    async getApiWhiteList ({ dispatch }: actionsContext, data: requestConfig): Promise<string[] | undefined[] | undefined> {
      const url = '/api/platform/whitelist'
      const response: axiosResponse = await dispatch('REQUEST', { url, ...data })
      if (!response) {
        return
      }

      const whiteSitesList = response.data.map(( item: any ) => item.url)

      return whiteSitesList
    },

    async checkUnknownPage (
      { dispatch }: actionsContext,
      params: {
        domain: string,
        similarityScore: number
      }
    ) {
      let protectionStatus: string = protectionStatuses.failed

      const isApiVoidAvailable: boolean = await dispatch('isApiVoidAvailable')
      if (!isApiVoidAvailable) {
        return {
          protectionStatus: protectionStatuses.canNotCheck,
          ...params,
        }
      }

      const trustScore: number = await dispatch('getTrustScore', params.domain)
      if (isNaN(trustScore as number)) {
        return {
          protectionStatus: protectionStatuses.failed,
          ...params,
        }
      }

      await dispatch('setSiteToDB', {
        ...params,
        trustScore,
        isScam: trustScore < 40
      })

      if (trustScore < 40) {
        protectionStatus = protectionStatuses.scam
      }

      if (trustScore > 40) {
        protectionStatus = protectionStatuses.safe
      }

      return  {
        protectionStatus,
        ...params,
        trustScore,
      }
    },

    async updateSitesList ({ commit, dispatch }: actionsContext) {
      const scamSites: sitesListResponseType = await dispatch('getBlackList')
      commit('setStorage', {
        name: 'scamSites',
        value: scamSites,
      })

      const whiteListedSites: sitesListResponseType = await dispatch('getWhiteList')
      commit('setStorage', {
        name: 'whiteListedSites',
        value: whiteListedSites,
      })

      const apiScamSites: scamSitesArray = await dispatch('getApiBlackList')
      commit('setStorage', {
        name: 'apiScamSites',
        value: apiScamSites,
      })

      const apiWhiteListedSites: whiteListedSitesArray = await dispatch('getApiWhiteList')
      commit('setStorage', {
        name: 'apiWhiteListedSites',
        value: apiWhiteListedSites,
      })
    }
  },
}
