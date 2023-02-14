import { store } from "@/store"
import { inventoryItemType } from "@/types"
import { isOwnInventory } from "./inventory"
import { getItemSkinInfo } from "./item"

export async function setTradeButtonsToDesc (item: inventoryItemType) {
  const itemGameInfoTags = document.querySelectorAll('.item_desc_content [id$="_item_descriptors"]')
  if (!itemGameInfoTags) {
    return
  }

  itemGameInfoTags.forEach(( itemGameInfoTag ) => {
    const overstockTag = itemGameInfoTag?.querySelector('[id^="cs-money-item__overstock_"]')

    if (itemGameInfoTag) {
      setTradeButton(item, itemGameInfoTag, overstockTag)
    }
  })
}

export async function setTradeButton (
  item: inventoryItemType,
  parentElement: Element,
  setAfterElement?: Element | null
) {
  hideTradeBtn()

  const { showItemPrices, showItemSkinInfo } = await store.getters.getStorage('tradeSettings')
  const isOwn = await isOwnInventory()
  if ((!showItemPrices && !showItemSkinInfo) || !isOwn) {
    return
  }

  const tradeableStatusData = await getTradeableStatus(item)
  const { tradeableStatus, overstock } = tradeableStatusData || {}
  if (
    !tradeableStatus ||
    tradeableStatus <= 1 ||
    !overstock ||
    overstock <= 0
  ) {
    return
  }

  const tradeBtn: HTMLButtonElement | null = parentElement.querySelector(`.cs-money__trade-btn_${item.assetId}`)
  const button: HTMLButtonElement = tradeBtn || getButton(item)
  button.addEventListener('click', async () => {
    button.disabled = true

    store.dispatch('sendAnalyticsEvent', {
      event: 'extension_btn_click_tradecsm'
    })

    await tradeItemOnCSMoney(item)

    button.disabled = false
  })

  if (tradeBtn) {
    tradeBtn.style.display = 'inline-block'

    return
  }

  const beforeElement = setAfterElement?.nextSibling
  if (beforeElement) {
    parentElement.insertBefore(button, beforeElement)
  } else {
    parentElement.prepend(button)
  }
}

function getButton (item: inventoryItemType) {
  const button = document.createElement('button')
  button.className = `cs-money__trade-btn cs-money__trade-btn_${item.assetId}`
  button.innerText = 'Trade on CS.Money'

  return button
}

export function hideTradeBtn () {
  const tradeButtons: NodeListOf<HTMLElement> = document.querySelectorAll('[class^="cs-money__trade-btn"]')

  tradeButtons.forEach(tradeButton => tradeButton.style.display = 'none')
}

async function tradeItemOnCSMoney(item: inventoryItemType) {
  window.open(`https://cs.money/csgo/trade/?partner_ids=${item.assetId}`, '_blank')
}

async function getTradeableStatus (item: inventoryItemType) {
  if (
    item.tradeableStatus &&
    item.overstock
  ) {
    const { tradeableStatus, overstock } = item

    return {
      tradeableStatus,
      overstock
    }
  }

  if (!item.marketName) {
    return
  }

  const response = await getItemSkinInfo(item.marketName)
  const { status, overstockDiff } = response || {}

  return {
    tradeableStatus: status,
    overstock: overstockDiff
  }
}
