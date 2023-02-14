import browser from 'webextension-polyfill'

import { handlerParams } from '@/types';

export class BrowserHooks {
  tabsNumber: number = 0
	openHandler: Function | undefined
	closeHandler: Function | undefined

	constructor ({ openHandler, closeHandler }: handlerParams) {
    this.openHandler = openHandler
    this.closeHandler = closeHandler

		browser.tabs.query({})
			.then((foundTabs) => {
				this.tabsNumber = foundTabs.length;
			})

    this.tabCreatedHandler()
    this.tabRemovedHandler()
	}

	tabCreatedHandler () {
		browser.tabs.onCreated.addListener(() => {
			if (this.tabsNumber === 0 && this.openHandler) {
				this.openHandler()
			}

			this.tabsNumber++
		})
	}

	tabRemovedHandler () {
    browser.tabs.onRemoved.addListener(() => {
      this.tabsNumber--

			if (this.tabsNumber === 0 && this.closeHandler) {
        this.closeHandler()
			}
		})
	}
}
