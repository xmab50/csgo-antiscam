import { settingsEventsTypes, settingsType, tradeSettingsEventsType, tradeSettingsType } from '@/types'

export const settings: settingsType = [
  'liveAnalysis',
  'analyticEvents',
  'preventApiScam',
  'allowNotifications',
  'scamTradeOffer',
]

export const tradeSettings: tradeSettingsType = [
  'showItemPrices',
  'showItemSkinInfo',
]

export const settingsEvents: settingsEventsTypes = {
  preventApiScam: 'security_preventApiScam',
  liveAnalysis: 'security_preventScamSites',
  analyticEvents: 'analytics',
  allowNotifications: 'allowNotifications',
  scamTradeOffer: 'scam_trade_offer'
}

export const tradeSettingsEvents: tradeSettingsEventsType = {
  showItemSkinInfo: 'trade_skininfo',
  showItemPrices: 'trade_prices',
}
