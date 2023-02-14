import Browser from "webextension-polyfill"
import { store } from "@/store"

import { clearItemInfo, setItemInfo } from "./itemInfo/itemInfo"
import { setItemOverstock } from "./itemOverstock/ItemOverstock"
import { setTradeButtonsToDesc } from "./tradeButton"
import { loadPage, hideItemsInfo } from "./loads"

import { ITEMS_PER_PAGE, STEAM_MOBILE_WIDTH } from "@/consts/inventory.const"
import { inventoryItemType, inventoryListType, inventoryMutationRequestType } from "@/types"
import { setTotalInventoryValue } from "./totalPrices/totalPrices"

const MUTATIONOBSERVER_DEBOUNCE = 50
let IS_TRADE_PAGE = false

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    if (port.name === "settingsChangesPort") {
      settingsChanged(message)
    }
  })
})

function settingsChanged (reload = true) {
  if (reload && IS_TRADE_PAGE) {
    loadPage({
      self: true,
      isTradePage: true
    })
    loadPage({
      self: false,
      isTradePage: true
    })

    return
  }

  if (!reload && IS_TRADE_PAGE) {
    hideItemsInfo()
    hideItemsInfo(false)

    return
  }

  if (reload && !IS_TRADE_PAGE) {
    loadPage({})
    setTotalInventoryValue()

    return
  }

  if (!reload && !IS_TRADE_PAGE) {
    loadPage({})
    hideItemsInfo()
    setTotalInventoryValue()

    return
  }

  return
}

export function setTradePageStatus (isTradePage = true) {
  IS_TRADE_PAGE = isTradePage
}

export function inventoryPageChanges(isTradePage = IS_TRADE_PAGE) {
  const pageNextBtn = document.querySelector('#pagebtn_next')
  const pagePrevBtn = document.querySelector('#pagebtn_previous')
  const csPopupLink = document.querySelector('#inventory_link_730')

  csPopupLink?.addEventListener('click', () => loadPage({}))

  if (isTradePage) {
    pageNextBtn?.addEventListener('click', () => inventoryTradePageChanged())
    pagePrevBtn?.addEventListener('click', () => inventoryTradePageChanged())

    return
  }

  pageNextBtn?.addEventListener('click', () => showDesktopInventoryItems(1))
  pagePrevBtn?.addEventListener('click', () => showDesktopInventoryItems(-1))

  inventoryMobileChanges()
}

function inventoryTradePageChanged() {
  const yourInventoryPopup = document.querySelector(`#inventory_select_your_inventory`)
  const isActiveYourPopup = yourInventoryPopup?.classList.contains('active')
  const self = isActiveYourPopup

  loadPage({ self, isTradePage: true })
}

function showDesktopInventoryItems (direction = 0) {
  const currentPageTag: HTMLElement | null = document.querySelector('#pagecontrol_cur')

  if (currentPageTag) {
    const currentPageIndex = currentPageTag.innerText || 1
    const to = ( +currentPageIndex + direction ) * ITEMS_PER_PAGE
    const from = to - ITEMS_PER_PAGE

    loadPage({ from, to })
  }
}

function inventoryMobileChanges() {
  setMutation({
    mutationElement: '#inventories .inventory_page',
    mutationParams: { attributes: true, childList: true },
    callback: (mutations: MutationRecord[]) => {
      inventoryPageMutation(
        mutations,
        'class',
        'itemHolder',
        (mutations: MutationRecord[]) => showMobileInventoryItems(mutations.length)
      )
    },
  })
}

async function showMobileInventoryItems(addedElement: number) {
  if (window.innerWidth > STEAM_MOBILE_WIDTH) {
    return
  }

  const pageItemslength = document.querySelector('#inventories .inventory_page')?.children.length || 0
  if (!pageItemslength) {
    return
  }

  const to = pageItemslength - addedElement
  const from = to / ITEMS_PER_PAGE
  if (!from || !to) {
    return
  }

  loadPage({ from, to })
}

export function itemsInfoChanges(inventory: inventoryListType, isTradePage = IS_TRADE_PAGE) {
  const inventories = document.getElementById('inventories')

  inventories?.addEventListener('click', (event) => itemInfoChanged(event.target as HTMLLinkElement, inventory))

  if (isTradePage) {
    setMutation({
      mutationElement: '#hover_item_name',
      mutationParams: { childList: true },
      callback: () => tradeHoverDescChanged(inventory),
    })
  }
}

function tradeHoverDescChanged (inventory: inventoryListType) {
  const itemLink: HTMLLinkElement | null = document.querySelector('.item.hover .inventory_item_link')
  if (!itemLink) {
    return
  }

  let debounce = setTimeout(() => {})

  clearTimeout(debounce)
  debounce = setTimeout(() => {
    itemInfoChanged(itemLink, inventory)
  }, MUTATIONOBSERVER_DEBOUNCE)
}

async function itemInfoChanged (itemLink: HTMLLinkElement, inventory: inventoryListType) {
  const itemCellAssetId = itemLink?.href?.split('_')?.pop()
  if (!itemCellAssetId || ( itemCellAssetId && isNaN(+itemCellAssetId) )) {
    return
  }

  const inventoryItem: inventoryItemType | undefined = inventory.find(item => item?.assetId === itemCellAssetId)
  if (!inventoryItem) {
    clearItemInfo()

    return
  }

  await setItemOverstock(inventoryItem)
  await setTradeButtonsToDesc(inventoryItem)
  const hasFloat = categoryHasFloat(inventoryItem)

  if (hasFloat) {
    setItemInfo(inventoryItem)

    return
  }

  clearItemInfo()
}

export async function setItemInfoToDesc () {
  const inventory: inventoryListType | undefined | null = await store.getters.getStorage('inventory')
  if (!inventory) {
    return
  }

  const hoverItemNameTag: HTMLLinkElement | null = document.querySelector('.inventory_iteminfo .btn_small.btn_grey_white_innerfade')
  const assetId = hoverItemNameTag?.href.split('csgo_econ_action_preview').pop()?.split('A').pop()?.split('D')[0]

  const currentItem = inventory.find(item => item?.assetId && item.assetId === assetId) || inventory[0]
  if (!currentItem) {
    return
  }

  await setItemOverstock(currentItem)
  await setTradeButtonsToDesc(currentItem)

  const itemHasFloat = categoryHasFloat(currentItem)
  if (itemHasFloat) {
    setItemInfo(currentItem)
  }
}

function categoryHasFloat (item: inventoryItemType) {
  const categoriesWithFloat = [ 'weapons', 'gloves' ]

  return item?.wikiCategory && categoriesWithFloat.includes(item.wikiCategory)
}

export function tradeInventoryPopupsChanges () {
  const yourInventoryTab = document.querySelector('#inventory_select_your_inventory')
  const theirInventoryTab = document.querySelector('#inventory_select_their_inventory')

  yourInventoryTab?.addEventListener('click', () => tradeInventoryPopupChanges(true))
  theirInventoryTab?.addEventListener('click', () => tradeInventoryPopupChanges(false))
}

async function tradeInventoryPopupChanges (self = true) {
  const whoseSteamID = self ? 'inventoryOwnerSteamID' : 'inventoryPartnerSteamID'
  const steamID = await store.getters.getStorage(whoseSteamID)
  const inventoryId = `inventory_${steamID}_730_2`
  const inventoriesWrapper = document.querySelector(`#${inventoryId}`)

  if (!inventoriesWrapper) {
    setMutation({
      mutationElement: '#inventories',
      mutationParams: { attributes: true, childList: true },
      callback: (mutations: MutationRecord[]) => {
        inventoryPageMutation(
          mutations,
          'id',
          inventoryId,
          () => loadPage({
            self,
            isTradePage: true
          })
        )
      },
    })

    return
  }

  loadPage({
    self,
    isTradePage: true
  })
}

function inventoryPageMutation (
  mutations: MutationRecord[],
  checkAttr: string,
  mutationAddedName: string,
  callback: Function
) {
  if (!mutations?.length || !checkAttr || !mutationAddedName) {
    return
  }

  let debounce = setTimeout(() => {})

  const isItemHolders = mutations.every(mutation => {
    const element = mutation.addedNodes[0] as unknown as Element
    if (!element) {
      return
    }

    return element.getAttribute(checkAttr) === mutationAddedName
  })

  if (isItemHolders) {
    clearTimeout(debounce)
    debounce = setTimeout(() => {
      callback(mutations)
    }, MUTATIONOBSERVER_DEBOUNCE)
  }
}

function setMutation(
  {
    mutationElement,
    mutationParams,
    callback,
  }: inventoryMutationRequestType
) {
  const mutationElementTag = document.querySelector(`${mutationElement}`)

  const observer = new MutationObserver((mutations) => {
    if (callback) {
      callback(mutations)
    }
  })

  if (mutationElementTag) {
    observer.observe(mutationElementTag, mutationParams)
  }
}
