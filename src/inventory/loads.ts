import { store } from "@/store"
import { setItemCard } from "./itemHolder/itemHolder"
import { getItemData } from "./item"
import { inventoryItemType, inventoryListType, loadPageRequestType } from "@/types"
import { ITEMS_PER_PAGE, TRADE_ITEMS_PER_PAGE } from "@/consts/inventory.const"
import { setItemInfoToDesc } from "./changes"
import { clearOverstock } from "./itemOverstock/ItemOverstock"
import { clearItemInfo } from "./itemInfo/itemInfo"
import { hideTradeBtn } from "./tradeButton"

let INVENTORY: inventoryListType = []
let PAGE_INVENTORY: inventoryListType = []

export async function loadPage ({ from, to, self = true, isTradePage = false }: loadPageRequestType) {
  showLoader()

  const whoseInventory = self ? 'inventory' : 'partnerInventory'
  INVENTORY = await store.getters.getStorage(whoseInventory)
  if (!INVENTORY) {
    showLoader(false)

    return false
  }

  const inventoryPageItems = await getPageItems({ from, to, self, isTradePage })
  if (!inventoryPageItems?.length) {
    showLoader(false)

    return false
  }

  const loadedItems = await loadItemsData(inventoryPageItems)

  markShowedItems(loadedItems, self)

  showLoader(false)

  checkAfterLoading()

  return true
}

async function getPageItems({ from, to, self = true, isTradePage = false }: loadPageRequestType) {
  const inventoryPageItemsAssetId = await getActiveInventoryPageItemsAssetId(self)
  const inventory = INVENTORY.filter(item => {
    if (!item?.assetId) {
      return
    }

    return inventoryPageItemsAssetId.includes(item.assetId)
  })

  if (!inventory?.length && from && to) {
    const currentPageTag: HTMLElement | null = document.querySelector('#pagecontrol_cur')
    const itemsPerPage = isTradePage ? TRADE_ITEMS_PER_PAGE : ITEMS_PER_PAGE

    if (currentPageTag) {
      const currentPageIndex = currentPageTag.innerText || 1
      to = +currentPageIndex * itemsPerPage
      from = to - itemsPerPage
    } else {
      to = itemsPerPage
      from = to - itemsPerPage
    }
  }

  const tradeable = (item: inventoryItemType) => isTradePage ? !item.tradeBlocked : true
  const currentInventoryItems = (
    inventory?.length ?
    inventory :
    INVENTORY.filter(item => item && tradeable(item)).slice(from, to)
  )
  const showedItems = currentInventoryItems.filter(item => {
    return item && item.loaded && tradeable(item)
  })
  const notLoadedItems = currentInventoryItems.filter(item => {
    return item && !item.loaded && !item.isLoading && tradeable(item)
  })

  if (showedItems?.length) {
    showedItems.forEach(showedItem => {
      if (showedItem) {
        setItemCard(showedItem)
      }
    })

    setItemInfoToDesc()
  }

  if (notLoadedItems?.length) {
    PAGE_INVENTORY = notLoadedItems
    const uniqueItems = getUniqueItems(notLoadedItems)

    return uniqueItems
  }
}

async function getActiveInventoryPageItemsAssetId (self = true) {
  const whoseSteamID = self ? 'inventoryOwnerSteamID' : 'inventoryPartnerSteamID'
  const steamID = await store.getters.getStorage(whoseSteamID)
  const pageId = `inventory_${steamID}_730_2`
  const inventoryPages: NodeListOf<HTMLElement> | undefined | undefined[] = document.querySelectorAll(`#${pageId} .inventory_page`) || []
  const activeInventoryPageItemsAssetId: Array<string | undefined> = []

  inventoryPages.forEach(inventoryPage => {
    if (inventoryPage && inventoryPage.style.display !== 'none') {
      const items = inventoryPage.querySelectorAll('.itemHolder .item')

      items.forEach(item => {
        const assetId = item.id.split('_').pop()

        if (assetId) {
          activeInventoryPageItemsAssetId.push(assetId)
        }
      })
    }
  })

  return activeInventoryPageItemsAssetId
}

function getUniqueItems (inventory: inventoryListType) {
  const uniqueMarketNames = [...new Set(inventory.map(item => item?.marketName))]
  const uniqueItems = uniqueMarketNames.map(uniqueMarketName => {
    return inventory.find(item => item?.marketName === uniqueMarketName)
  }).filter(item => item)

  return uniqueItems
}

function markShowedItems(showedItems: inventoryListType, self = true) {
  if (!INVENTORY) {
    return
  }

  const showedInventoryItems = INVENTORY.map(inventoryItem => {
    if (!inventoryItem) {
      return
    }

    const inventoryItemShowed = showedItems.find(showedItem => {
      return inventoryItem?.marketName === showedItem?.marketName
    })

    if (!inventoryItemShowed) {
      return inventoryItem
    }

    return {
      ...inventoryItemShowed,
      loaded: !!inventoryItemShowed,
      assetId: inventoryItem.assetId
    }
  })

  const whoseInventory = self ? 'inventory' : 'partnerInventory'

  store.commit('setStorage', {
    name: whoseInventory,
    value: showedInventoryItems
  })
}

async function loadItemsData (inventory: inventoryListType) {
  const inventoryPromises = inventory.map(async (item) => {
    if (!item) {
      return
    }

    item.isLoading = true
    item.loaded = false

    const newItem = await getItemData(item, (item: inventoryItemType) => {
      item.loaded = true

      setCells(item)
    })

    if (!newItem) {
      item.loaded = false
      item.isLoading = false

      return
    }

    item.loaded = true
    item = newItem
    item.isLoading = false

    setCells(item)

    return item
  })

  const inventoryResult = await Promise.all(inventoryPromises)
  if (inventoryResult.length) {
    setItemInfoToDesc()
  }

  return inventoryResult
}

function setCells (item: inventoryItemType) {
  if (!PAGE_INVENTORY?.length) {
    return
  }

  PAGE_INVENTORY.forEach(pageItem => {
    if (pageItem && pageItem?.marketName === item?.marketName) {
      const currentItem = {
        ...item,
        assetId: pageItem.assetId
      }

      setItemCard(currentItem)
    }
  })
}

export function showLoader (show = true, target?: string) {
  target = target || '.cs-money__inventory__loader'

  const loaders: NodeListOf<HTMLElement> = document.querySelectorAll(target)
  if (!loaders) {
    return
  }

  if (show) {
    loaders.forEach(loader => loader.style.display = 'block')
  } else {
    loaders.forEach(loader => loader.style.display = 'none')
  }
}

export function getItemsWithoutCard () {
  const itemHolders = document.querySelectorAll('.itemHolder')
  const itemIds: Array<string | undefined> = []

  itemHolders.forEach(itemHolder => {
    if (!itemHolder) {
      return
    }

    const hasCSMoneyItemHolder = itemHolder.querySelector('[id^="cs-money-item"')
    if (hasCSMoneyItemHolder) {
      return
    }

    const itemHolderLink: HTMLLinkElement | null = itemHolder.querySelector('.inventory_item_link')
    if (!itemHolderLink) {
      return
    }
    const itemHolderId = itemHolderLink.href.split('_').pop()
    if (!itemHolderId) {
      return
    }

    itemIds.push(itemHolderId)
  })

  if (!itemIds?.length) {
    return
  }

  const assetIds: Array<string | undefined> = itemIds.filter(itemId => itemId)

  if (!assetIds?.length) {
    return
  }

  const itemsToReload = assetIds.map(assetId => {
    return INVENTORY.find(item => item?.assetId === assetId)
  })

  return itemsToReload
}

function checkAfterLoading () {
  const itemsToReload = getItemsWithoutCard()
  if (!itemsToReload?.length) {
    return
  }

  reloadItems(itemsToReload)
}

async function reloadItems (itemsToReload: inventoryListType) {
  if (!itemsToReload?.length) {
    return
  }

  showLoader()

  const showedItems = itemsToReload.filter(item => item?.floatvalue || item?.price)

  if (itemsToReload?.length) {
    showedItems.forEach(showedItem => {
      if (showedItem) {
        setItemCard(showedItem)
      }
    })
  }

  showLoader(false)
}

export async function hideItemsInfo (self = true) {
  showLoader()

  const { showItemSkinInfo } = await store.getters.getStorage('tradeSettings')
  if (showItemSkinInfo) {
    showLoader(false)

    return
  }

  const whoseInventory = self ? 'inventory' : 'partnerInventory'
  INVENTORY = await store.getters.getStorage(whoseInventory)
  if (!INVENTORY) {
    showLoader(false)

    return false
  }

  INVENTORY.forEach(item => {
    if (item) {
      setItemCard(item)
      clearOverstock()
      clearItemInfo()
      hideTradeBtn()
    }
  })

  showLoader(false)
}
