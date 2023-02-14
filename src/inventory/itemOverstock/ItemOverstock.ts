import Browser from "webextension-polyfill"
import { inventoryItemType, inventoryListType, itemSkinInfoType } from "@/types"
import { showLoader } from "../loads"
import { store } from "@/store"
import { getItemSkinInfo } from "../item"

const INVENTORY_ITEM_OVERSTOCK_URL = Browser.runtime.getURL('./inventory/inventoryItemOverstock.html')
const INVENTORY_LOADER_IMG_URL = Browser.runtime.getURL('./img/loading.gif')
let INVENTORY_ITEM_OVERSTOCK_TAG = ''
let ITEM: inventoryItemType | null | undefined = null
let ITEM_SKIN_INFO: itemSkinInfoType | undefined | null = null

export async function setItemOverstock (item: inventoryItemType) {
  const { showItemSkinInfo } = await store.getters.getStorage('tradeSettings')
  if (!showItemSkinInfo) {
    clearOverstock()

    return
  }

  showItemOverstockLoader()

  const inventory: inventoryListType = await store.getters.getStorage('inventory')
  const currentinventoryItem = inventory.find(inventoryItem => inventoryItem?.assetId === item.assetId)

  const isTradeable = checkTradeable(currentinventoryItem)
  if (!isTradeable) {
    showItemOverstockLoader(false)
  }

  if (!INVENTORY_ITEM_OVERSTOCK_TAG.length) {
    await loadItemOverstockTag()
  }

  setItemOverstockTag()

  showItemOverstockLoader(false)
}

async function loadItemOverstockTag () {
  INVENTORY_ITEM_OVERSTOCK_TAG = await fetch(INVENTORY_ITEM_OVERSTOCK_URL).then(response => response.text())
}

async function checkTradeable (item: inventoryItemType | undefined | null) {
  ITEM = item

  if (
    !ITEM?.overstock &&
    ITEM?.marketName
  ) {
    ITEM_SKIN_INFO = await getItemSkinInfo(ITEM.marketName)
  }

  if (
    !ITEM?.overstock &&
    !ITEM_SKIN_INFO?.overstockDiff ||
    ( ITEM_SKIN_INFO?.overstockDiff && ITEM_SKIN_INFO?.overstockDiff <= 0 )
  ) {
    return false
  }

  return true
}

function setItemOverstockTag () {
  const itemGameInfoTags = document.querySelectorAll('.item_desc_content [id$="_item_descriptors"]')
  if (!itemGameInfoTags) {
    return
  }

  itemGameInfoTags.forEach(( itemGameInfoTag, index ) => {
    const itemDescTag = itemGameInfoTag?.firstChild
    const itemDescInfo = itemGameInfoTag?.querySelector('div[class^="cs-money-item__overstock"]')
    let itemOverstockDiv = itemDescInfo

    if (!itemOverstockDiv) {
      itemOverstockDiv = document.createElement('div')
      itemOverstockDiv.id = `cs-money-item__overstock_${index}`
      itemOverstockDiv.innerHTML = INVENTORY_ITEM_OVERSTOCK_TAG
    }

    setItemOverstockContent(itemOverstockDiv)

    if (itemGameInfoTag && itemDescTag) {
      itemGameInfoTag.insertBefore(itemOverstockDiv, itemDescTag.nextSibling)
    }
  })
}

function setItemOverstockContent (element: HTMLElement | Element) {
  const loaderImg: HTMLImageElement | null = element.querySelector('.cs-money-item__overstock__loader')
  if (loaderImg?.src) {
    loaderImg.src = INVENTORY_LOADER_IMG_URL
  }

  const itemOverstock: HTMLElement | null = element.querySelector('.cs-money-item__overstock')
  if (itemOverstock) {
    const tradeableStatus = ( ITEM?.tradeableStatus || ITEM_SKIN_INFO?.status ) || 0
    if (tradeableStatus <= 1 ) {
      itemOverstock.innerText = 'Overstock: Not tradable'

      return
    }

    const overstock = ITEM?.overstock || ITEM_SKIN_INFO?.overstockDiff
    itemOverstock.innerText = `Overstock: ${overstock}`
  }
}

function showItemOverstockLoader (show = true) {
  const itemOverstockContentTags: NodeListOf<HTMLElement> = document.querySelectorAll('.cs-money-item__overstock__content')
  showLoader(show, '.cs-money-item__overstock__loader')

  if (show) {
    itemOverstockContentTags.forEach(element => element.style.display = 'none')
  } else {
    itemOverstockContentTags.forEach(element => element.style.display = 'block')
  }
}

export function clearOverstock () {
  const itemsOverstock: NodeListOf<HTMLElement> = document.querySelectorAll('.cs-money-item__overstock')

  itemsOverstock.forEach(itemOverstock => {
    itemOverstock.innerText = ''
  })
}
