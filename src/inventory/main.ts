import { store } from '@/store'

import { ITEMS_PER_PAGE, STEAM_MOBILE_WIDTH } from '@/consts/inventory.const'
import { setTotalInventoryValue } from './totalPrices/totalPrices'
import { inventoryPageChanges, itemsInfoChanges } from './changes'
import { formatInventory, getSteamInventory } from './inventory'
import { setInventoryLoader } from './loader/inventoryLoader'
import { loadPage, showLoader } from './loads'

import {
  inventoryListType,
  steamInventoryType
} from '@/types'

async function start() {
  await setInventoryLoader()

  showLoader()

  await setInventory()
  await setTotalInventoryValue()

  showLoader(false)

  inventoryPageChanges()
}

async function setInventory () {
  const steamProfile = await getSteamID()
  if (!steamProfile?.steamProfileLink) {
    return
  }

  const steamInventory: steamInventoryType = await getSteamInventory(steamProfile.steamProfileLink)
  const inventory: inventoryListType = formatInventory(steamInventory)
  if (!inventory?.length) {
    return
  }

  store.commit('setStorage', {
    name: 'inventory',
    value: inventory
  })

  itemsInfoChanges(inventory)

  if (window.innerWidth <= STEAM_MOBILE_WIDTH) {
    await loadPage({
      to: 0,
      from: ITEMS_PER_PAGE * 3
    })
  } else {
    const currentPageIndex = document.querySelector('#pagecontrol_cur')?.innerHTML || 0
    const to = !isNaN(+currentPageIndex) ? +currentPageIndex * ITEMS_PER_PAGE : ITEMS_PER_PAGE
    const from = to - ITEMS_PER_PAGE

    loadPage({ from, to })
  }
}

async function getSteamID (): Promise<any> {
  const linkToProfile: HTMLLinkElement | null = document.querySelector('a.whiteLink.persona_name_text_content')
  const steamProfileLink = linkToProfile?.href
  let steamID: number | undefined | string = steamProfileLink?.split('/').pop()

  if (steamID && isNaN(+steamID)) {
    steamID = await store.dispatch('getSteamIDfromProfilePage', linkToProfile?.href)
  }

  if (!steamID) {
    return
  }

  store.commit('setStorage', {
    name: 'inventoryOwnerSteamID',
    value: steamID
  })

  return {
    steamID,
    steamProfileLink
  }
}

start()
