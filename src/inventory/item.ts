import { CSMoneyWikiCategories } from "@/consts/CSMoneyWikiCategories.const"
import { dopplerPhases } from "@/consts/dopplerPhases.const"
import { DEPOSIT_PERCENTAGE, QUALITY_TYPES, WEAR_TYPES, WIKI_PAGE_PROPS } from "@/consts/inventory.const"
import { store } from "@/store"
import { CSMoneyItemSkinInfoType, inventoryItemType, itemSkinStatusType, itemSkinInfoType } from "@/types"

const categoriesWithFloat = [ 'weapons', 'gloves' ]

export async function getSkinStatus (item: inventoryItemType) {
  const { marketActionLink, assetId, marketName, wikiCategory } = item
  if (!marketActionLink || !assetId || !marketName) {
    return
  }

  if (wikiCategory && !categoriesWithFloat.includes(wikiCategory) ) {
    return
  }

  const iteminfo = await getItemInfo(item)
  if (!iteminfo) {
    return
  }
  const rank = getItemRank(iteminfo)
  const phase = getDopplerPhase(iteminfo)
  const { paintindex, paintseed, floatvalue } = iteminfo

  return {
    rank,
    phase,
    paintseed,
    paintindex,
    floatvalue
  }
}

export async function getItemSkinInfo (marketName: string): Promise<itemSkinInfoType | undefined> {
  const overstockData = await store.dispatch('getItemSkinInfo', marketName)

  return overstockData
}

export async function getItemInfo (item: inventoryItemType): Promise<itemSkinStatusType | undefined> {
  const { marketActionLink, assetId } = item
  if (!marketActionLink || !assetId) {
    return
  }

  const steamID = await store.getters.getStorage('inventoryOwnerSteamID')
  const actionUrl = marketActionLink
    ?.replaceAll('M%listingid%', `S${steamID}`)
    ?.replaceAll('%assetid%', assetId)

  const response = await store.dispatch('getSkinStatus', actionUrl)
  if (!response) {
    return
  }

  return response?.iteminfo
}

export function getItemRank (itemInfo: itemSkinStatusType) {
  const rank = (itemInfo.low_rank || 1001) < (itemInfo.high_rank || 1001) ?
    itemInfo.low_rank : itemInfo.high_rank

  if (rank && rank < 1000) {
    return rank
  }
}

export function getDopplerPhase (itemInfo: itemSkinStatusType) {
  if (!itemInfo?.paintindex) {
    return
  }

  const phase: string | undefined = dopplerPhases[itemInfo.paintindex]

  return phase
}

export function getItemWikiPath ({ marketName, wikiCategory, phase }: any) {
  let itemMarketName = marketName.toLowerCase()
  const isWeapon = wikiCategory === 'weapons'
  const itemPhase = phase ? phase.toLowerCase().trim().replace(/[\s+]/g, '-') : null

  let wikiPath: null | string = null

  const wearType = WEAR_TYPES.find(type => itemMarketName.includes(type))
  if (wearType) {
    itemMarketName = itemMarketName.replace(wearType, '')
  }

  const qualityType = QUALITY_TYPES.find(type => itemMarketName.includes(type))
  if (qualityType) {
    itemMarketName = itemMarketName.replaceAll(qualityType, '')
  }

  if (isWeapon) {
    if (!itemMarketName.split('|')[0]) {
      return
    }

    const itemName = itemMarketName
      .split('|')[0]
      .replace(/'+/g, '')
      .replace(/[^A-z,0-9 ]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-')
      .replace(/-+/g, '-')

    if (!itemMarketName.split('|')[1]) {
      return
    }

    const itemSkin = itemMarketName
      .split('|')[1]
      .replace(/'+/g, '')
      .replace(/[^A-z,0-9. ]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-')
      .replace(/-+/g, '-')

    wikiPath = `${wikiCategory}/${itemName}/${itemSkin}`
  }

  if (!isWeapon) {
    let itemName = itemMarketName
      .replace(/'+/g, '')
      .replace(/[^A-z-0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-')
      .replace(/-+/g, '-')

    if (wikiCategory === 'graffiti') {
      itemName = itemName.includes('sealed') ? itemName : `sealed-${itemName}`
    }

    wikiPath = `${wikiCategory}/${itemName}`
  }

  if (wikiPath && itemPhase) {
    wikiPath = `${wikiPath}-${itemPhase}`
  }

  return wikiPath
}

export function getWikiCategory (steamCategory: string): null | string {
  let category = null

  CSMoneyWikiCategories.forEach(categoryItem => {
    const isHasOnCSMoneyWiki = categoryItem.steamCategories.includes(steamCategory)

    if (isHasOnCSMoneyWiki) {

      category = categoryItem.category
    }
  })

  return category
}

export async function getWikiItemNameId (item: inventoryItemType) {
  if (!item?.pathToWiki) {
    return
  }

  const wikiPageData = await getWikiPageData(item.pathToWiki)
  if (!wikiPageData) {
    return
  }

  const nameId = getItemNameId(wikiPageData, item)
  if (!nameId) {
    return
  }

  return nameId
}

export function getItemNameId (wikiPageData: any, item: inventoryItemType): number | undefined | null {
  let itemNameId = null

  for (const key in wikiPageData) {
    if (Object.prototype.hasOwnProperty.call(wikiPageData, key)) {
      const element = wikiPageData[key]
      const propType = WIKI_PAGE_PROPS.find(propsType => key.includes(propsType))

      if (propType) {
        if (propType === 'sticker_family') {
          const ids = element.items.find((nameId: any) => nameId.hash_name == item.marketName)

          itemNameId = ids.name_id
        } else if (element.name_ids) {
          const ids = element.name_ids.find((nameId: any) => {
            if (item?.phase) {
              return nameId.name.includes(item?.phase)
            }

            return nameId.name == item.marketName
          })

          itemNameId = ids.name_id
        } else if (element.name_id) {
          itemNameId = element.name_id
        }
      }
    }
  }

  return itemNameId
}

export async function getWikiPageData (pathToWiki: string) {
  const wikiPage = await store.dispatch('getCSMWikiPage', pathToWiki)

  const div = document.createElement('div')
  div.innerHTML = wikiPage

  const pageDataText = div.querySelector('#__NEXT_DATA__')?.innerHTML
  if (!pageDataText ) {
    return
  }
  const pageData = JSON.parse(pageDataText)

  const ROOT_QUERY = pageData?.props?.pageProps?.apolloState?.ROOT_QUERY

  return ROOT_QUERY
}

export async function getItemPrice (nameId: number) {
  const priceTradeLog = await store.dispatch('getPricesOnCSMWiki', [ nameId ])
  if (!priceTradeLog.data) {
    return
  }

  const wikiPrice = priceTradeLog.data.price_trader_log[0]?.values.pop().price_trader_new || 0
  if (!wikiPrice) {
    return
  }

  return wikiPrice
}

export function getItemTradeStatus (tradeLockTime: number | string) {
  const tradeableDate = new Date(tradeLockTime)
  const tradeBlocked = new Date() < tradeableDate
  const timeDiff = Math.abs(new Date(tradeLockTime).getTime() - Date.now())
  const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24))

  return {
    tradeableDate,
    tradeBlocked,
    blockDays: tradeBlocked ? diffDays : null
  }
}

export async function getItemData (
  item: inventoryItemType,
  callback: Function = () => {}
) {
  const { showItemPrices } = await store.getters.getStorage('tradeSettings')

  const itemSkinStatus = await getSkinStatus(item)
  if (itemSkinStatus) {
    item = { ...item, ...itemSkinStatus}
  }

  if (!showItemPrices) {
    callback(item)

    return
  }

  const csmItem: CSMoneyItemSkinInfoType | undefined = await store.dispatch(
    'getCSMoneyItem',
    { assetId: item.assetId, isBotItem: true }
  )
  const { nameId } = csmItem || {}

  if (item.marketName) {
    const response = await getItemSkinInfo(item.marketName)
    const { status, overstockDiff } = response || {}

    item.tradeableStatus = status
    item.overstock = overstockDiff
  }

  if (nameId) {
    const price = await getItemPrice(nameId)

    item.price = price
    item.nameId = nameId
  } else {
    const itemWikiPath = await getItemWikiPath(item)
    if (!itemWikiPath) {
      callback(item)

      return
    }

    item.pathToWiki = itemWikiPath


    const itemNameId = await getWikiItemNameId(item)
    if (!itemNameId) {
      callback(item)

      return
    }

    const price = await getItemPrice(itemNameId)
    if (!price) {
      callback(item)

      return
    }

    item.price = price
    item.nameId = itemNameId
  }

  return item
}