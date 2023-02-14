import { routersNamesType, routersType } from "@/types"

export const routes: routersType = {
  home: { name: 'Home' },
  about: { name: 'About' },
  notification: { name: 'Notification' },
  tradeSettings: { name: 'TradeSettings' },
  securitySettings: { name: 'SecuritySettings' },
}

export const SETTINGS_PAGES: routersNamesType = {
  tradeSettings: 'TradeSettings',
  securitySettings: 'SecuritySettings',
  about: 'About'
}

export const MAIN_PAGES: routersNamesType = {
  tradeSettings: 'TradeSettings',
  notification: 'Notification',
  home: "Home"
}