import { protectionStatuses } from '@/consts/protectionStatuses.const'
import { store } from '@/store'
import Browser from 'webextension-polyfill'

const notifyElementURL = Browser.runtime.getURL('./notify/notify.html')
const unknownIconURL = Browser.runtime.getURL('./icons/extension-attention.png')
const defaultIconURL = Browser.runtime.getURL('./icons/extension-default.png')
const closeIconURL = Browser.runtime.getURL('./img/ui/close.svg')
let notifyElement = ''

export async function notify (
  message: {
    title: string,
    text: string,
    button?: string | null,
    buttonCallback?: Function
    closeCallback?: Function
    protectionStatus?: string
  }
): Promise<void> {
  const { allowNotifications } = await store.getters.getStorage('settings') || {}
  if (!allowNotifications) {
    return
  }

  await setNotify(message)
}

async function setNotify (
  { title, text, button, protectionStatus, buttonCallback, closeCallback }: {
    title: string,
    text: string,
    button?: string | null,
    buttonCallback?: Function
    closeCallback?: Function
    protectionStatus?: string
  }
): Promise<void> {
  const notify = await getNotify()

  const titleElement: HTMLElement | null = notify.querySelector('.cs-money-notify__title')
  if (titleElement && title) {
    titleElement.innerText = title
  }

  const textElement: HTMLElement | null = notify.querySelector('.cs-money-notify__text')
  if (textElement && text) {
    textElement.innerText = text
  }

  const buttonElement: HTMLElement | null = notify.querySelector('.cs-money-notify__button')
  if (buttonElement && button) {
    buttonElement.innerText = button
    buttonElement.classList.remove('disabled')
    buttonElement.addEventListener('click', () => {
      closeNotify(notify)

      if (buttonCallback) {
        buttonCallback()
      }
    })
  }  else if (buttonElement && !button) {
    buttonElement.classList.add('disabled')
  }

  const imageElement: HTMLImageElement | null = notify.querySelector('.cs-money-notify__icon')
  if (imageElement) {
    if (
      protectionStatus &&
      protectionStatus === protectionStatuses.unknown
    ) {
      imageElement.src = unknownIconURL
    } else {
      imageElement.src = defaultIconURL
    }
  }

  const closeIcon: HTMLImageElement | null = notify.querySelector('.cs-money-notify__close-icon')
  if (closeIcon) {
    closeIcon.src = closeIconURL
    closeIcon.addEventListener('click', () => {

      if (closeCallback) {
        closeCallback()
      }

      closeNotify(notify)
    })
  }

  let notificationContainer = document.querySelector('#cs-money-notify-container')

  if (notificationContainer) {
    notificationContainer.append(notify)
  } else {
    notificationContainer = document.createElement('div')
    notificationContainer.id = 'cs-money-notify-container'
    notificationContainer.append(notify)
    document.body.append(notificationContainer)
  }
}

async function getNotify (): Promise<HTMLDivElement> {
  const notify = document.createElement('div')
  notify.className = 'cs-money-notify-wrapper'
  notify.innerHTML = await getNotifyElement()

  return notify
}

async function getNotifyElement (): Promise<string> {
  if (!notifyElement.length) {
    notifyElement = await fetch(notifyElementURL).then(response => response.text())
  }

  return notifyElement
}

export function closeNotify(parentElement?: HTMLElement | null, closeAll?: boolean) {
  parentElement?.remove()

  if (!closeAll) {
    return
  }

  const notificationContainer = document.querySelector('#cs-money-notify-container')
  notificationContainer?.remove()
}
