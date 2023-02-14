import {
  actionsContext,
  CSMoneyItemSkinInfoType,
  getSteamInventoryResponseType,
  getPricesOnCSMWikiResponseType,
} from '@/types'
export default {
  actions: {
    async getSteamInventory (
      { dispatch }: actionsContext, steamProfilelink: string
    ): Promise<getSteamInventoryResponseType> {
      const url = `${steamProfilelink}/inventory/json/730/2?l=english`

      const response = await dispatch('REQUEST', { url })

      return response
    },

    async getCSMWikiPage ({ dispatch }: actionsContext, path: string): Promise<any> {
      const url = `https://wiki.cs.money/${path}`

      const csWikipage = await dispatch('REQUEST', { url })

      return csWikipage.data
    },

    async getPricesOnCSMWiki ({ dispatch }: actionsContext, items: any): Promise<getPricesOnCSMWikiResponseType> {
      const url = 'https://wiki.cs.money/graphql'
      const query = 'query price_trader_log($name_ids: [Int!]!) {\n  price_trader_log(input: {name_ids: $name_ids}) {\n    name_id\n    values {\n      price_trader_new\n      time\n    }\n  }\n}\n'
      const variables = {
        name_ids: [
          ...items,
        ]
      }
      const operationName = 'price_trader_log'

      const response = await dispatch('REQUEST', { url, method: 'POST', body: { query, variables, operationName } })

      return response.data
    },

    async getSteamIDfromProfilePage ({ dispatch }: actionsContext, url: string): Promise<string | void> {
      const response = await dispatch('REQUEST', { url })
      if (!response?.data) {
        return
      }

      const div = document.createElement('div')
      div.innerHTML = response.data
      const webUiConfigTag = div.querySelector('#responsive_page_template_content')

      const text = webUiConfigTag?.textContent

      const profileDataText = text?.substring(text?.indexOf('g_rgProfileData') + 18, text?.indexOf('$J')).replaceAll(';', '').trim()
      if (!profileDataText) {
        return
      }

      const profileData = JSON.parse(profileDataText)
      if (!profileData?.steamid) {
        return
      }

      return profileData.steamid
    },

    async getSkinStatus ({ dispatch }: actionsContext, itemActionUrl: string) {
      const url = `https://api.csgofloat.com/?url=${itemActionUrl}`

      const response = await dispatch('REQUEST', { url })

      return response.data
    },

    async getItemSkinInfo ({ dispatch }: actionsContext, marketName: string) {
      const url = `https://cs.money/check_skin_status?appId=730&name=${marketName}`

      const response = await dispatch('REQUEST', { url })

      return response.data
    },

    async getPopularSkinNames ({ dispatch }: actionsContext) {
      const url = 'https://script.google.com/macros/s/AKfycbwADlVJdL8QvQpkCLpExyTB77DfzGmntZY5SfJePTner2DW8PwLWsnUeS_2cwNw9Iil/exec'

      const response = await dispatch('REQUEST', { url })

      return response.data
    },

    async setTradeItem ({ dispatch }: actionsContext, item: CSMoneyItemSkinInfoType) {
      const url = 'https://cs.money/add_cart'
      const tradeInfo = {
        item,
        type: 1
      }

      const response = await dispatch('REQUEST', { url, method: 'POST', body: tradeInfo, isBackground: true })

      return response.data
    },

    async getCSMoneyItem (
      { dispatch }: actionsContext,
      { assetId, isBotItem = false }: { assetId: string, isBotItem: boolean }
    ): Promise<CSMoneyItemSkinInfoType | undefined> {
      const url = `https://cs.money/skin_info?appId=730&id=${assetId}&isBot=${isBotItem}&botInventory=${isBotItem}`

      const response = await dispatch('REQUEST', { url })

      return response.data
    },

    async getUserCSMoneyInventory ({ dispatch }: actionsContext) {
      const url = 'https://cs.money/3.0/load_user_inventory/730?limit=1'

      const response = await dispatch('REQUEST', { url })

      return response.data
    },
  },
}
