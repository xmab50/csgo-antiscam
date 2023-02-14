import Browser from "webextension-polyfill"

function insertPopup (): void {
  const popupURL = Browser.runtime.getURL('./contentPopup.html')

  const iframe = document.createElement('iframe')
  iframe.id = 'csgo-antiscam-content-popup'
  iframe.className = 'disabled'
  iframe.src = `${popupURL}?domain=${window.location.href}`

  document.body.appendChild(iframe)
}

insertPopup()
