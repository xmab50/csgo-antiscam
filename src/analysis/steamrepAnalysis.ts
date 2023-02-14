import { store } from '@/store'
import { i18n } from '@/i18n'
import '@/assets/scss/steamrep.scss'
import { messages } from '@/i18n/messages';

type elementType = Element | null

class SteamrepAnalysis {
	name: elementType
	badge: elementType
	header: elementType
	spacer: elementType
	private: elementType
	buttons: elementType
	summary: elementType
	status?: elementType
	addButton: elementType
	background: elementType
	privateInfo: elementType
	profileFooter: elementType
	statusDescription?: elementType
	messages: any

	constructor() {
		this.header = document.querySelector('.profile_header_summary')
		this.status
		this.statusDescription
		this.badge = document.querySelector('.header_real_name')
		this.private = document.querySelector('.profile_private_info')
		this.spacer = document.querySelector('.header_real_name_spacer')
		this.background = document.querySelector('.profile_header_bg_texture')
		this.buttons = document.querySelector('.profile_header_actions')
		this.summary = document.querySelector('.profile_summary')
		this.name = document.querySelector('.actual_persona_name')
		this.privateInfo = document.querySelector('.profile_private_info')
		this.addButton = document.querySelector('#btn_add_friend')
		this.profileFooter = document.querySelector('.profile_summary_footer')
		this.messages = messages
	}

	async start() {
		this.status = document.createElement('div')
		this.statusDescription = document.createElement('div')

		this.status.classList.add('steamrep__badge')

		this.header?.appendChild(this.status)
		this.header?.appendChild(this.statusDescription)

    const isPathHasUserId = location.pathname.includes('id')
		if (isPathHasUserId) {
			let query = location.pathname.replace('/id/', '')

			if (query.endsWith('/')) query = query.replace('/', '')

      const user = await store.dispatch('searchUser', { query })

      if (user?.steamid) {
        this.generateWarning(user.steamid)
      }
		} else {
			let steamid = location.pathname.replace('/profiles/', '')

			if (steamid.endsWith('/')) steamid = steamid.replace('/', '')

			this.generateWarning(steamid)
		}
	}

	async generateWarning(steamid: string) {
    const response = await store.dispatch('getUserReputation', { steamid })
    const { summary } = response.steamrep.reputation

    if (summary !== 'SCAMMER') {
      return
    }

    if (this.badge) this.badge.remove()
    if (this.spacer) this.spacer.remove()
    if (this.private) this.private.remove()
    if (this.summary) this.summary.remove()
    if (this.addButton) this.addButton.remove()
    if (this.profileFooter) this.profileFooter.remove()

		if (this.status) {
			this.status.textContent = this.messages[i18n.locale].steamrep.button
			this.status.classList.add('ban')
		}

		if (this.name) {
			this.name.textContent = this.messages[i18n.locale].steamrep.title
		}

		if (this.background) this.background.classList.add('steamrep__background')
		if (this.statusDescription) this.statusDescription.textContent = this.messages[i18n.locale].steamrep.description
		if (this.statusDescription) this.statusDescription.classList.add('steamrep__summary')
	}
}

const steamrepAnalysis = new SteamrepAnalysis()
steamrepAnalysis.start()
