import { store } from '@/store'
import { render } from '@/analysis/fakeLogin/main'
import { config } from '@/config'

import { settingsValuesType } from '@/types'

async function start (): Promise<void> {
  const isSteam: boolean = location.href.startsWith(config.STEAM_URL)
  if (isSteam) {
    return
  }

  const settings: settingsValuesType = await store.getters.getStorage('settings')
  if (!settings.liveAnalysis) {
    return
  }

  const isApiWhiteListed: string | undefined = await store.dispatch('getIsApiWhiteListed')
  if (isApiWhiteListed) {
    return
  }

  const isWhiteListed: string | undefined = await store.dispatch('getIsWhiteListed')
  if (isWhiteListed) {
    return
  }

  const checkFakeLogin = async (): Promise<void> => {
    const isSimilarLogin: boolean = await store.dispatch('isSimilarLogin')
    if (isSimilarLogin) {
      await store.dispatch('checkSteamLogin')

      render()

      return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    checkFakeLogin()
  }

  checkFakeLogin()
}
start()
