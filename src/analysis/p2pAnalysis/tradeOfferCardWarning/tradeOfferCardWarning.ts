import { steamTradeOfferType } from "@/types"
import Browser from "webextension-polyfill"

const TRADE_OFFER_WARNING_TAG_URL = Browser.runtime.getURL('./p2pAnalysis/tradeOfferCardWarning.html')
let TRADE_OFFER_WARNING_TAG = ''

export async function setTradeOfferWarning (tradeOffer: steamTradeOfferType) {
  if (!TRADE_OFFER_WARNING_TAG?.length) {
    await setTradeOfferWarningTag()
  }

  const tradeOfferId = tradeOffer.tradeofferid
  const currentTradeOfferTag = document.querySelector(`#tradeofferid_${tradeOfferId} .tradeoffer_items_ctn`)
  const warningTag = document.createElement('div')

  warningTag.className = 'trade-offer-card-warning'
  warningTag.id = `trade-offer-card-warning__${tradeOfferId}`
  warningTag.innerHTML = TRADE_OFFER_WARNING_TAG

  setTradeOfferWarningContent(warningTag, tradeOffer)

  currentTradeOfferTag?.append(warningTag)
}

async function setTradeOfferWarningContent (element: HTMLDivElement, tradeOffer: steamTradeOfferType) {
  const tradePartnerInfo = tradeOffer.tradePartnerInfo
  if (!tradePartnerInfo) {
    return
  }

  for (const key in tradePartnerInfo) {
    if (Object.prototype.hasOwnProperty.call(tradePartnerInfo, key)) {
      setTradeOfferWarningContentText({
        element,
        text: tradePartnerInfo[key],
        type: key
      })
    }
  }
}

function setTradeOfferWarningContentText ({
  element,
  text,
  type
}: {
  element: HTMLDivElement,
  text: string | number | null,
  type: string
}) {
  const contentText: HTMLElement | null = element.querySelector(`.trade-offer-card-warning__${type}`)
  const contentTextWrapper: HTMLElement | null = element.querySelector(`.trade-offer-card-warning__${type}-wrapper`)
  if (text && contentText) {
    contentTextWrapper?.classList.remove('disabled')
    contentText.innerText = `${text}`
  }
}

async function setTradeOfferWarningTag () {
  TRADE_OFFER_WARNING_TAG = await fetch(TRADE_OFFER_WARNING_TAG_URL).then(response => response.text())
}

export function clearTradeOfferWarnings () {
  const warnings = document.querySelectorAll('.trade-offer-card-warning')

  warnings?.forEach(warning => {
    warning?.remove()
  })
}