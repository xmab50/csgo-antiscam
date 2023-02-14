import amplitudeInstance from 'amplitude-js'
import { config } from '@/config'

export const ampClient = amplitudeInstance.getInstance()
ampClient.init(config.AMPLITUDE_KEY)
ampClient.setVersionName(config.AMPLITUDE_VERSION)

export const amplitude = amplitudeInstance
