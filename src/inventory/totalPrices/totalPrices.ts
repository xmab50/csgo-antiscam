import Browser from "webextension-polyfill"
import { store } from "@/store"

const TOTAL_INVENTORY_VALUE_URL = Browser.runtime.getURL('./inventory/inventoryTotalPrices.html')
let TOTAL_INVENTORY_VALUE_TAG = ''

export async function setTotalInventoryValue () {
  const { showItemPrices } = await store.getters.getStorage('tradeSettings')
  if (!showItemPrices) {
    hideTotalValue()

    return
  }

  const hasTotalValues: HTMLElement | null = document.querySelector('.cs-money__total-inventory-value')
  if (hasTotalValues) {
    hasTotalValues.style.display = 'block'

    setTotalValue()
  } else {
    await setTotalInventoryValueTag()
  }
}

export async function setTotalInventoryValueTag () {
  const wrapper = document.querySelector('#inventory_logos')

  const hasTotalValues = wrapper?.querySelector('.cs-money__total-inventory-value')
  if (hasTotalValues || !wrapper) {
    return
  }

  const totalValueTag = await getTotalInventoryValueTag()
  const priceTag: HTMLElement | null = totalValueTag.querySelector('.cs-money__total-inventory-value__price')
  if (!priceTag) {
    return
  }
  priceTag.innerHTML = await getTotalPrice()

  wrapper.append(totalValueTag)
}

async function getTotalInventoryValueTag () {
  if (!TOTAL_INVENTORY_VALUE_TAG?.length) {
    TOTAL_INVENTORY_VALUE_TAG = await fetch(TOTAL_INVENTORY_VALUE_URL).then(response => response.text())
  }

  const totalValueTag = document.createElement('div')
  totalValueTag.className = 'cs-money__total-inventory-value'
  totalValueTag.innerHTML = TOTAL_INVENTORY_VALUE_TAG

  return totalValueTag
}

async function getTotalPrice () {
  const userCSMoneyInventory = await store.dispatch('getUserCSMoneyInventory')

  return `${userCSMoneyInventory?.cost || ''}`
}

async function hideTotalValue () {
  const totalValueTags: NodeListOf<HTMLElement> = document.querySelectorAll('.cs-money__total-inventory-value')

  totalValueTags.forEach(totalValueTag => totalValueTag.style.display = 'none')
}

async function setTotalValue () {
  const priceTag: HTMLElement | null = document.querySelector('.cs-money__total-inventory-value__price')
  if (!priceTag) {
    return
  }

  priceTag.innerHTML = await getTotalPrice()
}
