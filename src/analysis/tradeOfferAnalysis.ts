import { store } from '@/store'
import { render } from '@/analysis/tradeOfferAnalysis/main'
import { hasApikeyStatuses } from '@/consts/protectionStatuses.const'

async function start () {
  const hasApikeyStatus = await store.dispatch('checkSteamApiKey')
  const mainContent = document.querySelector('#mainContent')

  if (
    hasApikeyStatus !== hasApikeyStatuses.registered ||
    !mainContent
  ) {
    return
  }

  const name: HTMLElement | null = document.querySelector('.trade_partner_steam_level_desc a')
  const nickname: HTMLElement | null = document.querySelector('.trade_partner_steam_level_desc nickname')
  const date: HTMLElement | null = document.querySelector('.trade_partner_member_since')
  const level: HTMLElement | null = document.querySelector('.friendPlayerLevelNum')

  store.commit('setStorage', {
    name: 'tradingPartner',
    value: {
      name: name?.innerText,
      nickname: nickname?.innerText,
      date: date?.innerText,
      level: level?.innerText,
    },
  })

  render()
}
start()
