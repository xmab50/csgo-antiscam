import { store } from "@/store"

import { steamErrors } from "@/consts/steamErrors.const"
import { getItemTradeStatus, getWikiCategory } from "./item"

import { inventoryListType, steamInventoryType } from "@/types"

export async function getSteamInventory (
  steamProfileLink: string
): Promise<steamInventoryType> {
  const response = await store.dispatch('getSteamInventory', steamProfileLink)

  if (response.data.error === steamErrors.duplicateRequest) {
    await new Promise(resolve => setTimeout(resolve, 1000))

    return getSteamInventory(steamProfileLink)
  }

  return response.data
}

export function formatInventory (steamInventory: steamInventoryType): inventoryListType {
  const { rgInventory, rgDescriptions } = steamInventory
  const inventory = []

  for (const key in rgInventory) {
    if (Object.prototype.hasOwnProperty.call(rgInventory, key)) {
      const { id, classid, instanceid } = rgInventory[key]
      const {
        tags,
        market_hash_name,
        market_name,
        market_actions,
        cache_expiration
      } = rgDescriptions[`${classid}_${instanceid}`]

      const assetId = id
      const currentItemDescTypeTag = tags.find(descTag => descTag.category_name === 'Type')
      const steamCategory = currentItemDescTypeTag?.name
      const wikiCategory = steamCategory ? getWikiCategory(steamCategory) : null
      const marketName = market_hash_name || market_name
      const marketActionLink = market_actions?.[0]?.link
      const tradeableDate = cache_expiration
      const tradeLockInfo = tradeableDate ? getItemTradeStatus(tradeableDate) : null
      const inventoryItem = {
        assetId,
        marketName,
        marketActionLink,
        steamCategory,
        wikiCategory,
        showed: false,
        ...tradeLockInfo
      }

      inventory.push(inventoryItem)
    }
  }

  return inventory
}

export function isOwnInventory (): boolean {
  const page = document.body
  const text = page?.textContent

  const splitTextFrom = text?.indexOf('g_bViewingOwnProfile') || 0
  const splitTextTo = text?.indexOf('var g_bMarketAllowed') || 0
  if (!splitTextFrom || !splitTextTo) {
    return false
  }

  const splitedText = text?.substring(splitTextFrom + 23, splitTextTo)
  const formatedText = splitedText?.toLowerCase()?.replace(/[^(true|false)]/g, '')?.trim()
  if (!formatedText) {
    return false
  }

  const isOwnInventory = /true/.test(formatedText)

  return isOwnInventory
}
