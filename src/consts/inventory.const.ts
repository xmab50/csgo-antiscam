import Browser from 'webextension-polyfill'

export const ITEMS_PER_PAGE = 25
export const TRADE_ITEMS_PER_PAGE = 16
export const DEPOSIT_PERCENTAGE = 7
export const MUTATIONOBSERVER_DEBOUNCE = 50
export const STEAM_MOBILE_WIDTH = 910
export const INVENTORY_ITEM_PRICE_URL = Browser.runtime.getURL('./inventoryItemPrice.html')
export const INVENTORY_ITEM_INFO_URL = Browser.runtime.getURL('./inventoryItemInfo.html')
export const INVENTORY_ITEM_OVERSTOCK_URL = Browser.runtime.getURL('./inventoryItemOverstock.html')
export const INVENTORY_LOADER_URL = Browser.runtime.getURL('./inventoryloader.html')
export const INVENTORY_LOADER_IMG_URL = Browser.runtime.getURL('./img/loading.gif')
export const QUALITY_TYPES = [
  'souvenir',
  'stattrak™',
  "★ statTrak™",
  "★"
]
export const WEAR_TYPES = [
  'factory new',
  'minimal wear',
  'field-tested',
  'well-worn',
  'battle-scarred',
]
export const WIKI_PAGE_PROPS = [
  'skin',
  'case',
  'graffiti',
  'patch',
  'agent',
  'pin',
  'sticker_family',
  'music_kit',
]
