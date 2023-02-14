import Browser from 'webextension-polyfill'
import { inventoryItemType } from '@/types'
import { store } from '@/store'

const INVENTORY_ITEM_HOLDER_URL = Browser.runtime.getURL('./inventory/inventoryItemHolder.html')
const INVENTORY_ITEM_HOLDER_IMG_URL = Browser.runtime.getURL('./img/cs-money-logo.svg')
const LOCK_IMG_URL = Browser.runtime.getURL('./img/lock.svg')
let INVENTORY_ITEM_HOLDER_TAG = ''

export async function setItemCard (item: inventoryItemType) {
  if (!INVENTORY_ITEM_HOLDER_TAG.length) {
    await getItemCardTag()
  }

  const itemCardId = `730_2_${item.assetId?.trim()}`
  const itemTag = document.getElementById(itemCardId) || document.getElementById(`item${itemCardId}`)
  if (!itemTag) {
    return
  }

  const csmItemCardId = `cs-money-item__${itemCardId}`
  const csmItemCard = itemTag.querySelector(`#${csmItemCardId}`)

  if (csmItemCard) {
    setItemCardContent(item, csmItemCard, itemTag)
  } else {
    const div = document.createElement('div')
    div.id = csmItemCardId
    div.innerHTML = INVENTORY_ITEM_HOLDER_TAG

    setItemCardContent(item, div, itemTag)

    itemTag.append(div)
  }
}

async function getItemCardTag () {
  INVENTORY_ITEM_HOLDER_TAG = await fetch(INVENTORY_ITEM_HOLDER_URL).then(response => response.text())
}

async function setItemCardContent (
  item: inventoryItemType,
  element: HTMLElement | Element,
  parentElement?: HTMLElement | Element
) {
  const { showItemPrices, showItemSkinInfo } = await store.getters.getStorage('tradeSettings')

  setPrice(item, element, showItemPrices)
  setFloat(item, element, showItemSkinInfo)
  setImages(item, element, showItemPrices)
  setBlockDays(item, element, parentElement, showItemPrices)
}

function setPrice (item: inventoryItemType, parentElement: HTMLElement | Element, isShow = true) {
  const priceWrapper: HTMLElement | null = parentElement.querySelector('.cs-money-item__holder__wrapper-bottom')
  const itemCardPrice: HTMLElement | null = parentElement.querySelector('.cs-money-item__price')
  if ( !priceWrapper || !itemCardPrice ) {
    return
  }

  if ( isShow && item?.price ) {
    priceWrapper.style.display = 'flex'
    itemCardPrice.innerText = `${item.price}`
  } else {
    priceWrapper.style.display = 'none'
    itemCardPrice.innerText = ''
  }
}

function setFloat (item: inventoryItemType, element: HTMLElement | Element, isShow = true) {
  const itemCardFloat: HTMLElement | null = element.querySelector('.cs-money-item__float')
  if (!itemCardFloat) {
    return
  }

  if (isShow && item?.floatvalue) {
    itemCardFloat.innerText = `${item.floatvalue.toFixed(4)}`
  } else {
    itemCardFloat.innerText = ''
  }
}

function setImages (item: inventoryItemType, element: HTMLElement | Element, isShow = true) {
  const lockImgs: NodeListOf<HTMLImageElement> = element.querySelectorAll('.cs-money-item__blockDays-img')
  const logoImg: HTMLImageElement | null = element.querySelector('.cs-money-item__logo')

  if (item?.blockDays && isShow) {
    lockImgs.forEach(lockImg => lockImg.src = LOCK_IMG_URL)
  } else {
    lockImgs.forEach(lockImg => lockImg.src = '')
  }

  if (logoImg?.src) {
    logoImg.src = INVENTORY_ITEM_HOLDER_IMG_URL
  }
}

function setBlockDays (
  item: inventoryItemType,
  element: HTMLElement | Element,
  parentElement?: HTMLElement | Element,
  isShow = true
) {
  const itemCardBlockDays: HTMLElement | null = element.querySelector('.cs-money-item__blockDays')
  const fraudWarning: HTMLElement | null | undefined = parentElement?.querySelector('.slot_app_fraudwarning')
  if (!itemCardBlockDays) {
    return
  }

  if (
    !item?.blockDays ||
    !isShow
  ) {
    itemCardBlockDays.innerHTML = ''
  } else if (
    item?.blockDays &&
    isShow
  ) {
    itemCardBlockDays.innerHTML = `${item.blockDays}`
  }

  if (
    item?.blockDays &&
    fraudWarning
  ) {
    const itemCardBlockDaysWrapper = element.querySelector('.cs-money-item__blockDays-wrapper') || ''
    fraudWarning.append(itemCardBlockDaysWrapper)
  }
}
