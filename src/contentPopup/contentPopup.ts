import { store } from "@/store"
import Browser from "webextension-polyfill"

Browser.runtime.onMessage.addListener((request): any => {
  const { action } = request

  if (action === 'openContentPopup') {
    togglePopup()

    return true
  }
})

function togglePopup () {
  const iframe = document.querySelector('#csgo-antiscam-content-popup')
  if (!iframe) {
    return
  }

  const isDisabled = iframe.classList.contains('disabled')
  changePopupVisibility(isDisabled)
}

function changePopupVisibility (show: boolean) {
  const iframe = document.querySelector('#csgo-antiscam-content-popup')
  if (!iframe) {
    return
  }

  if (show) {
    store.dispatch('sendAnalyticsEvent', {
      event: 'extension_session_start',
    })
  }

  const removeClass = show ? 'disabled' : 'active'
  const addClass = show ? 'active' : 'disabled'

  iframe.classList.remove(removeClass)
  iframe.classList.add(addClass)
}

document.addEventListener('click', () => {
  changePopupVisibility(false)
})