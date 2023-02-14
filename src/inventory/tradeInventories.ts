import { TRADE_ITEMS_PER_PAGE, STEAM_MOBILE_WIDTH } from "@/consts/inventory.const"
import { store } from "@/store"
import { inventoryListType, steamInventoryType } from "@/types"
import { inventoryPageChanges, itemsInfoChanges, setTradePageStatus, tradeInventoryPopupsChanges } from "./changes"
import { formatInventory, getSteamInventory } from "./inventory"
import { setInventoryLoader } from "./loader/inventoryLoader"
import { loadPage } from "./loads"

async function start () {
  setTradePageStatus()

  await setInventoryLoader(true)
  await setInventory()
  await setInventory(false)

  inventoryPageChanges()
  tradeInventoryPopupsChanges()
}

async function setInventory (self = true) {
  const yourSteamProfile = await getSteamProfileInTradePage(self)
  if (!yourSteamProfile?.steamProfileLink) {
    return
  }

  const steamInventory: steamInventoryType = await getSteamInventory(yourSteamProfile.steamProfileLink)
  const inventory: inventoryListType = formatInventory(steamInventory)
  if (!inventory?.length) {
    return
  }

  if (self) {
    store.commit('setStorage', {
      name: 'inventory',
      value: inventory
    })
  } else {
    store.commit('setStorage', {
      name: 'partnerInventory',
      value: inventory
    })
  }

  itemsInfoChanges(inventory)

  const inventoryPopup = document.querySelector(`#inventory_select_${ self ? 'your' : 'their' }_inventory`)
  const isActivePopup = inventoryPopup?.classList.contains('active')
  if (!isActivePopup) {
    return
  }

  if (window.innerWidth <= STEAM_MOBILE_WIDTH) {
    loadPage({
      to: 0,
      from: TRADE_ITEMS_PER_PAGE * 3,
      self,
      isTradePage: true
    })
  } else {
    const currentPageIndex = document.querySelector('#pagecontrol_cur')?.innerHTML || 0
    const to = !isNaN(+currentPageIndex) ? +currentPageIndex * TRADE_ITEMS_PER_PAGE : TRADE_ITEMS_PER_PAGE
    const from = to - TRADE_ITEMS_PER_PAGE

    loadPage({
      from,
      to,
      self,
      isTradePage: true
    })
  }
}

function getSteamProfileInTradePage (self = true) {
  const whose = self ? 'UserYou' : 'UserThem'
  const stopWord = self ? 'g_strYourPersonaName' : 'g_strTradePartnerPersonaName '

  const page = document.body
  const text = page?.textContent

  const splitTextFrom = text?.indexOf(`${whose}.SetSteamId`) || 0
  const splitTextTo = text?.indexOf(stopWord) || 0
  const splitedText = text?.substring(splitTextFrom, splitTextTo)
  const steamID = splitedText?.replace(/[^0-9]/g, '').trim()
  if (!steamID || isNaN(+steamID)) {
    return
  }

  const splitText2From = ( text?.indexOf(`${whose}.SetProfileURL`) || 0 ) + 22
  const splitText2To = text?.indexOf(`${whose}.SetSteamId`) || 0
  const splitedText2 = text?.substring(splitText2From, splitText2To)
  const steamProfileLink: string | null | undefined = splitedText2
    ?.replace(/[^A-z0-9/.:]/g, '')
    .replaceAll("\\", '')
    .trim()
  if (!steamProfileLink) {
    return
  }

  if (self) {
    store.commit('setStorage', {
      name: 'inventoryOwnerSteamID',
      value: steamID
    })
  } else {
    store.commit('setStorage', {
      name: 'inventoryPartnerSteamID',
      value: steamID
    })
  }

  return {
    steamID,
    steamProfileLink
  }
}

start()
