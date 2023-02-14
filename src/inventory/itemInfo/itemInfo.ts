import Browser from "webextension-polyfill"
import { store } from "@/store"
import { inventoryItemType, inventoryListType, itemSkinStatusType } from "@/types"
import { getItemInfo, getItemRank } from "../item"
import { dopplerPhases } from "@/consts/dopplerPhases.const"
import { showLoader } from "../loads"

const INVENTORY_ITEM_INFO_TAG_URL = Browser.runtime.getURL('./inventory/inventoryItemInfo.html')
const INVENTORY_LOADER_IMG_URL = Browser.runtime.getURL('./img/loading.gif')

let INVENTORY_ITEM_INFO_TAG = ''
let ITEM: inventoryItemType | null | undefined = null
let SKIN: itemSkinStatusType | null | undefined = null

export async function setItemInfo (item: inventoryItemType) {
  const { showItemSkinInfo } = await store.getters.getStorage('tradeSettings')
  if (!showItemSkinInfo) {
    clearItemInfo()

    return
  }

  showItemInfoLoader()

  const inventory: inventoryListType = await store.getters.getStorage('inventory')
  const currentInventoryItem = inventory.find(inventoryItem => inventoryItem?.assetId === item.assetId)

  ITEM = currentInventoryItem
  if (!ITEM?.floatvalue || !ITEM?.paintseed) {
    SKIN = await getItemInfo(item)
  }

  if (!INVENTORY_ITEM_INFO_TAG.length) {
    await loadItemInfoTag()
  }

  setItemInfoTag()

  showItemInfoLoader(false)
}

async function loadItemInfoTag () {
  INVENTORY_ITEM_INFO_TAG = await fetch(INVENTORY_ITEM_INFO_TAG_URL).then(response => response.text())
}

function setItemInfoTag() {
  const itemGameInfoTags = document.querySelectorAll('.item_desc_game_info')
  if (!itemGameInfoTags) {
    return
  }

  itemGameInfoTags.forEach(( itemGameInfoTag, index ) => {
    const itemDescTag = itemGameInfoTag?.parentNode
    const itemDescInfo = itemDescTag?.querySelector('div[class^="cs-money-item__info"]')
    let itemInfoDiv = itemDescInfo

    if (!itemInfoDiv) {
      itemInfoDiv = document.createElement('div')
      itemInfoDiv.id = `cs-money-item__info_${index}`
      itemInfoDiv.innerHTML = INVENTORY_ITEM_INFO_TAG
    }

    setItemInfoContent(itemInfoDiv)

    if (itemDescTag && itemGameInfoTag) {
      itemDescTag.insertBefore(itemInfoDiv, itemGameInfoTag.nextSibling);
    }
  })
}

function setItemInfoContent (element: HTMLElement | Element) {
  const loaderImg: HTMLImageElement | null = element.querySelector('.cs-money-item__info__loader')
  if (loaderImg?.src) {
    loaderImg.src = INVENTORY_LOADER_IMG_URL
  }

  const itemInfofloat: HTMLElement | null = element.querySelector('.cs-money-item__float')
  if (itemInfofloat) {
    itemInfofloat.innerText = getFloatText()
  }

  const itemInfoSeed: HTMLElement | null = element.querySelector('.cs-money-item__seed')
  if (itemInfoSeed) {
    itemInfoSeed.innerText = getSeedText()
  }
}

function getFloatText () {
  const float = ITEM?.floatvalue || SKIN?.floatvalue
  const rank = ITEM?.rank || ( SKIN ? getItemRank(SKIN) : null )

  if (rank) {
    return `Float: ${float} (Rank: #${rank})`
  }

  return `Float: ${float}`
}

function getSeedText () {
  const paintSeed = ITEM?.paintseed || SKIN?.paintseed
  const paintIndex = ITEM?.paintindex || SKIN?.paintindex
  const hasDopplerPhase = paintIndex ? paintIndex in dopplerPhases : null

  if (hasDopplerPhase && paintIndex) {
    const phase = dopplerPhases[paintIndex]

    return `Paint Seed: ${paintSeed} (${phase})`
  }

  return `Paint Seed: ${paintSeed}`
}

function showItemInfoLoader (show = true) {
  const itemInfoContentTags: NodeListOf<HTMLElement> = document.querySelectorAll('.cs-money-item__info__content')
  showLoader(show, '.cs-money-item__info__loader')

  if (show) {
    itemInfoContentTags.forEach(element => element.style.display = 'none')
  } else {
    itemInfoContentTags.forEach(element => element.style.display = 'block')
  }
}

export function clearItemInfo() {
  const floatTags: NodeListOf<HTMLElement> = document.querySelectorAll('.item_desc_content .cs-money-item__float')
  const seedTags: NodeListOf<HTMLElement> = document.querySelectorAll('.item_desc_content .cs-money-item__seed')

  floatTags.forEach(floatTags => floatTags.innerText = '')
  seedTags.forEach(seedTag => seedTag.innerText = '')
}