import { store } from "@/store"
import { render } from '@/analysis/p2pAnalysis/main'
import { settingsValuesType, steamTradeOffersResponse, steamTradeOfferType, tradePartnerInfo } from "@/types"
import { clearTradeOfferWarnings, setTradeOfferWarning } from "@/analysis/p2pAnalysis/tradeOfferCardWarning/tradeOfferCardWarning"
import Browser from "webextension-polyfill"

const restartDebounceValue = 5000

Browser.storage.onChanged.addListener(changes => {
  console.log('changes: ', changes.settings?.newValue.scamTradeOffer)
  if (changes.settings?.newValue.scamTradeOffer) {
    start()
  }

  if (changes.settings && changes.settings.newValue.scamTradeOffer === false) {
    clearTradeOfferWarnings()
  }
})

async function start() {
  const settings: settingsValuesType = await store.getters.getStorage('settings')
  if (!settings.scamTradeOffer) {
    return
  }

  const apiKey = await getApiKey()
  if (!apiKey) {
    let restartDebounce = setTimeout(() => {})
    clearTimeout(restartDebounce)
    restartDebounce = setTimeout(() => start(), restartDebounceValue)

    return
  }

  if (window.location.pathname.includes('tradeoffers')) {
    await checkTradeOfferCards(apiKey)

    return
  }

  const tradeOfferId: string | number = window.location.pathname.replace(/[^0-9]/g, '')
  if (isNaN(+tradeOfferId)) {
    return
  }

  await checkTradeOffer(apiKey, tradeOfferId)
}

start()

async function checkTradeOfferCards (apiKey: string) {
  const suspiciousTradeOffers = await getSuspiciousTradeOffers(apiKey)
  if (!suspiciousTradeOffers?.length) {
    return
  }

  setTradeOfferCardsWarnings(suspiciousTradeOffers)
}

async function getApiKey(): Promise<string | undefined> {
  const steamApiKeyPage = await store.dispatch('getSteamApiKeyPage')
  const apiKeyTag = steamApiKeyPage.querySelector('#bodyContents_ex p')
  const apiKey = apiKeyTag.innerText.split(' ')[1]

  return apiKey
}

function findItemOnTradeOffer (item: any, tradeOfferItems: any) {
  return tradeOfferItems?.find((tradeOfferItem: any): any => {
    return tradeOfferItem.assetid === item.assetid
  })
}

async function checkTradeOfferWithList (
  currentTradeOffer: steamTradeOfferType,
  receivedTradeOffersList: Array<steamTradeOfferType>
) {
  const currentTradeOfferCheckingInfo: any = {
    currentTradeOffer,
    comparedList: [],
    warning: false
  }

  receivedTradeOffersList.forEach(receivedOffer => {
    if (!receivedOffer) {
      return
    }

    const isNotOurOffers = !receivedOffer.is_our_offer && !currentTradeOffer.is_our_offer
    const accountNotMatched = receivedOffer.accountid_other !== currentTradeOffer.accountid_other
    const receivedOfferItemsToGive = receivedOffer.items_to_give
    const currentOfferItemsToGive = currentTradeOffer.items_to_give
    const receivedOfferItemsToReceive = receivedOffer.items_to_give
    const currentTradeOfferItemsToReceive = currentTradeOffer.items_to_give
    if (
      !accountNotMatched ||
      !isNotOurOffers ||
      !receivedOfferItemsToGive ||
      !currentOfferItemsToGive
    ) {
      return
    }

    const receivedOfferCreateTime = receivedOffer.time_created
    const currentTradeOfferCreateTime = currentTradeOffer.time_created
    const createdTimeDifference = Math.abs(
      new Date(receivedOfferCreateTime).getTime() -
      new Date(currentTradeOfferCreateTime).getTime()
    )
    const creationDifferenceAboutAnHour = (createdTimeDifference / 3600) <= 1
    console.log('creationDifferenceAboutAnHour: ', creationDifferenceAboutAnHour)
    if (!creationDifferenceAboutAnHour) {
      return
    }

    const matchedItemsToGive = receivedOfferItemsToGive.filter((item: any) => {
      return findItemOnTradeOffer(item, currentOfferItemsToGive)
    })
    if (!matchedItemsToGive?.length) {
      return
    }

    const matchedItemsToReceive = receivedOfferItemsToReceive.filter((item: any) => {
      return findItemOnTradeOffer(item, currentTradeOfferItemsToReceive)
    })

    const receivedOfferInactive = (
      receivedOffer.trade_offer_state === 6 ||
      receivedOffer.trade_offer_state === 7 ||
      receivedOffer.trade_offer_state === 10 ||
      receivedOffer.trade_offer_state === 11
    )
    const itemsToGiveMatchedPercentage = (
      matchedItemsToGive.length * 100
    ) / currentOfferItemsToGive.length
    const itemsToReceiveMatchedPercentage = (
      matchedItemsToReceive.length * 100
    ) / currentTradeOfferItemsToReceive.length

    let scamTradeOfferDegree = 0

    if (receivedOfferInactive) {
      if (itemsToGiveMatchedPercentage >= 80) {
        scamTradeOfferDegree++
      }

      if (itemsToReceiveMatchedPercentage >= 80) {
        scamTradeOfferDegree++
      }

      if (creationDifferenceAboutAnHour) {
        scamTradeOfferDegree++
      }

      const tradePartnerLevel = currentTradeOffer?.tradePartnerInfo?.level
      if (tradePartnerLevel && +tradePartnerLevel < 5) {
        scamTradeOfferDegree++
      }

      if (currentTradeOffer?.tradePartnerInfo?.limitedAccount) {
        scamTradeOfferDegree++
      } else {
        const tradePartnerDate = currentTradeOffer?.tradePartnerInfo?.date
        const date = tradePartnerDate && tradePartnerDate.length > 0 ? new Date(tradePartnerDate) : null
        const dateDiff = date ? Math.abs(new Date(date).getTime() - Date.now()) : null
        const months = dateDiff && !isNaN(dateDiff) ? dateDiff / (1000 * 3600 * 24) : null

        if (months && months <= 30) {
          scamTradeOfferDegree++
        }
      }
    }

    const scamSimilarity = scamTradeOfferDegree * 100 / 5
    if (scamSimilarity > 50) {
      currentTradeOfferCheckingInfo.warning = true
    }

    currentTradeOfferCheckingInfo.comparedList.push({
      scamSimilarity,
      tradeOffer: receivedOffer,
      createdTimeDifference,
      creationDifferenceAboutAnHour,
      matchedItems: {
        toGiveItemsCount: receivedOfferItemsToGive.length,
        toGiveItemsMatchedCount: matchedItemsToGive.length,
        itemsToGiveMatchedPercentage,
        toReceiveItemsCount: receivedOfferItemsToReceive.length,
        toReceiveItemsMatchedCount: matchedItemsToReceive.length,
        itemsToReceiveMatchedPercentage,
        toGiveItems: matchedItemsToGive,
        toReceiveItems: matchedItemsToReceive
      },
    })
  })

  return currentTradeOfferCheckingInfo
}

async function getTradePartnerInfo (
  tradeOfferId?: string,
  getTradePartnerInfoOnDocument = false
): Promise<tradePartnerInfo | undefined> {
  let tradePageTag: Document | HTMLDivElement = document

  if (tradeOfferId && !getTradePartnerInfoOnDocument) {
    const tradePage = await store.dispatch('getTradeOfferPage', tradeOfferId)
    if (!tradePage) {
      return
    }

    tradePageTag = document.createElement('div')
    tradePageTag.innerHTML = tradePage
  }

  const name: HTMLElement | null = tradePageTag.querySelector('.trade_partner_steam_level_desc a')
  const date: HTMLElement | null = tradePageTag.querySelector('.trade_partner_member_since')
  const limitedAccount: HTMLElement | null = tradePageTag.querySelector('.trade_partner_limited')
  const level: HTMLElement | null = tradePageTag.querySelector('.trade_partner_steam_level span')

  return {
    name: name?.innerText || null,
    level: level?.innerText || null,
    date: date?.innerText || null,
    limitedAccount: limitedAccount?.innerText || null
  }
}

async function getSuspiciousTradeOffers (
  apiKey: string,
  checkTradeOfferId?: string,
  getTradePartnerInfoOnDocument = false
) {
  const tradeOffers: steamTradeOffersResponse | undefined | null = await store.dispatch('getTradeOffers', { apiKey })
  if (!tradeOffers?.trade_offers_received) {
    return
  }

  const receivedTradeOffersList = tradeOffers.trade_offers_received
  const suspiciousTradeOffersPromises = receivedTradeOffersList
  .filter(receivedOffer => {
    return (
      receivedOffer.trade_offer_state === 2 &&
      (
        checkTradeOfferId ?
        receivedOffer.tradeofferid === checkTradeOfferId :
        true
      )
    )
  })
  .map(async receivedOffer => {
    if (!receivedOffer) {
      return
    }

    const tradePartnerInfo = await getTradePartnerInfo(receivedOffer.tradeofferid, getTradePartnerInfoOnDocument)
    receivedOffer.tradePartnerInfo = tradePartnerInfo

    const currentTradeOfferCheckingInfo = await checkTradeOfferWithList(receivedOffer, receivedTradeOffersList)
    return currentTradeOfferCheckingInfo
  })
  const suspiciousTradeOffers = await Promise.all(suspiciousTradeOffersPromises)

  console.log('tradeOffers: ', tradeOffers)
  console.log('suspiciousTradeOffers: ', suspiciousTradeOffers)

  return suspiciousTradeOffers
}

async function setTradeOfferCardsWarnings (suspiciousTradeOffers: any[]) {
  suspiciousTradeOffers.forEach(suspiciousTradeOffer => {
    if (!suspiciousTradeOffer.warning) {
      return
    }

    const tradeOffer = suspiciousTradeOffer.currentTradeOffer

    setTradeOfferWarning(tradeOffer)
  })
}

async function checkTradeOffer(apiKey: string, tradeOfferId: string) {
  const tradeOffersInfo = await getSuspiciousTradeOffers(apiKey, tradeOfferId, true)
  if (
    !tradeOffersInfo?.length ||
    !tradeOffersInfo?.[0]?.comparedList?.length
  ) {
    return
  }

  const isHasWarning = tradeOffersInfo.find(tradeOfferInfo => tradeOfferInfo.warning)
  if (!isHasWarning) {
    return
  }

  store.commit('setStorage', {
    name: 'tradeOffersInfo',
    value: tradeOffersInfo
  })

  render()
}
