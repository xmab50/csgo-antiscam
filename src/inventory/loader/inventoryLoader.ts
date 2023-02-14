import Browser from 'webextension-polyfill'

const INVENTORY_LOADER_URL = Browser.runtime.getURL('./inventory/inventoryLoader.html')
const INVENTORY_LOADER_IMG_URL = Browser.runtime.getURL('./img/loading.gif')
const INVENTORY_LOADER_TAG = document.createElement('div')

export async function setInventoryLoader (isTradePage = false) {
  const container = document.querySelector(isTradePage ? '.trade_box_contents' : '.inventory_page_left')
  const neighbor = document.getElementById('inventories')
  const page = await fetch(INVENTORY_LOADER_URL)
    .then(response => response.text())

  INVENTORY_LOADER_TAG.className = 'cs-money__inventory__loader'
  INVENTORY_LOADER_TAG.innerHTML = page

  const loaderImg: HTMLImageElement | null = INVENTORY_LOADER_TAG.querySelector('.cs-money__loader-img')
  if (loaderImg) {
    loaderImg.src = INVENTORY_LOADER_IMG_URL
  }

  if (container && neighbor) {
    container.insertBefore(INVENTORY_LOADER_TAG, neighbor.nextSibling);
  }
}
