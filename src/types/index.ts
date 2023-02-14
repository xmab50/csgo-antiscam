export * from './router'
export * from './notion'
export * from './store/analysis'
export * from './store/common'

import { Runtime, WebNavigation } from 'webextension-polyfill'
import { TranslateResult, Values } from 'vue-i18n/types'
import { AxiosRequestConfig, AxiosResponseTransformer } from 'axios'
import { ActionContext } from 'vuex/types'

export type webNavigationDetails = WebNavigation.OnCompletedDetailsType
export type messageSender = Runtime.MessageSender
export type OnInstalledReason = 'install' | 'update' | 'browser_update'
export type whiteListedSitesArray = Array<whiteListedSiteValue>
export type scamSitesArray = string[]
export type actionsContext = ActionContext<null, null>
export type protectionStatusState = 'disabled' | 'failed' | 'signin' | 'danger' | 'safe'

export interface analyzedSite {
  domain: string,
  similarityScore: number,
  trustScore: number,
  isScam: boolean,
  comments?: any,
}

export interface analyzedDatabaseSite {
  "_id": string,
  "domain": string,
  "isScam": boolean,
  "comments": any,
  "trustScore": number,
  "similarityScore": number,
  "deleted": boolean,
  "createdDate": number
}

export interface sendMessageRequest {
  tabId?: number
  action: string
  message?: any
  successCallback?: Function
  errorCallback?: Function
}

export interface messageHandlerRequest {
  action: string
  message: any
}

export interface detailsValue {
  reason: OnInstalledReason
  previousVersion?: string | undefined
  id?: string | undefined
}

export interface axiosResponse extends AxiosResponseTransformer {
  status: number
  [ key: string ]: any
}

export interface reportResponse {
  data: {
    items: Array<whiteListedSiteValue>
  }
  [ key: string ]: any
}

export interface requestConfig extends AxiosRequestConfig {
  force?: boolean
  sortProperty?: string
  sortDirection?: string
  notionDatabaseID?: string
  isBackground?: boolean
  reportUrl?: string
  blockId?: string
  body?: any
}

export interface storageParams {
  name: string
  value: any
}

export interface analyticsIdentifyParams {
  name: string
  data: any
}

export interface updateIdentify {
  status?: string
  steamLogin?: string
}

export interface analyticsEventParams {
  event: string
  data: object
  force: boolean
}

export interface tabParams {
  label: TranslateResult
  value: string
}

export interface hintConfig {
  class: string
  text: string | Values
}

export interface settingsData {
  settings: string[]
  settingsEvents: settingsEventsTypes
  form: {
    [name: string]: boolean
  }
}

export interface tradeSettingsData {
  tradeSettings: string[]
  tradeSettingsEvents: tradeSettingsEventsType
  form: {
    [name: string]: boolean
  }
}

export type settingsType = [
  'liveAnalysis',
  'analyticEvents',
  'preventApiScam',
  'allowNotifications',
  'scamTradeOffer',
]

export type tradeSettingsType = [
  'showItemPrices',
  'showItemSkinInfo',
]

export interface settingsValuesType {
  'preventApiScam': boolean
  'liveAnalysis': boolean
  'analyticEvents': boolean
  'allowNotifications': boolean
  'scamTradeOffer': boolean
}

export interface tradeSettingsValuesType {
  'showItemPrices': boolean
  'showItemSkinInfo': boolean
}

export interface settingsEventsTypes {
  'preventApiScam': 'security_preventApiScam',
  'liveAnalysis': 'security_preventScamSites',
  'analyticEvents': 'analytics',
  'allowNotifications': 'allowNotifications'
  [ key: string ]: string
}

export interface tradeSettingsEventsType {
  [ key: string ]: string
}

export interface stepsLinks {
  [ linkKey: string ]: string
}

export interface configParams {
  [ configKey: string ]: string
}

export interface stepsData {
  currentStep: number
  STEPS: string[]
  LINKS: stepsLinks
  completedSteps: string[]
  showDoneBanner: boolean
  config: configParams
  messages: any
}

export interface useApiKeyData {
  acceptButtonDisabled: boolean
  acceptButtonDisabledSec: number
  acceptButtonText: TranslateResult
  settingsEvents: settingsEventsTypes
}

export interface alarmHandlerParams {
  name: string
  [ key: string ]: any
}

export interface protectionStatusesValues {
  autoReloadFailed: 'autoReloadFailed'
  needReloadPage: 'needReloadPage'
  notCheckable: 'notCheckable'
  canNotCheck: "canNotCheck"
  disabled: 'disabled'
  unknown: 'unknown'
  failed: 'failed'
  signin: 'signin'
  scam: 'scam'
  safe: 'safe'
}

export interface handlerParams {
	openHandler?: Function | undefined
	closeHandler?: Function | undefined
}

export interface whiteListedSiteValue {
  url: string
  [ key: string ]: any
}

export interface apiVoidCreditsValue {
  credits_remained: number
  elapsed_time: string
  estimated_queries: string
  success: boolean
}

export interface searchUserParams {
  query: string
}

export interface userReputationParams {
  steamid: string
}

export interface userReputationValue {
  steamrep: {
    flags: {
      status: string
    }
    reputation: {
      full: string
      summary: string
    }
    status: string
    summary: string
    steamID32: string
    steamID64: string
    steamrepurl: string
  }
}

export interface tradeOfferAnalysisData {
  logo: string | null
  tradingPartner: string | null
  mobileImage: string | null
  attentionImage: string | null
}

export interface siteTrustworthinessValue extends apiVoidCreditsValue  {
  data: {
    report: {
      security_checks: {
        is_domain_recent: 'no' | 'yes'
        is_website_popular: boolean
        is_email_spoofable: boolean
      }
      trust_score: {
        result: number
      }
    }
  }
}

export interface notificationResponsesDetailsType {
  locale: string
  value: notionDocumentType
}

export interface notionDocumentType {
  results: Array<versionsToggleValue>
  [ key: string ]: any
}

export interface versionsToggleValue {
  paragraph?: {
    text: NotionTextType
  }
  toggle?: {
    text: NotionTextType
  }
  [ key: string ]: any
}

type NotionTextType = [
  {
    plain_text: string | null
    [ key: string ]: any
  }
] | null

export type inventoryListType = Array<inventoryItemType | undefined>

export interface inventoryItemType {
  assetId?: string | null
  marketName?: string | null
  pathToWiki?: string | null
  wikiCategory?: string | null
  steamCategory?: string | null
  price?: number | null
  marketActionLink?: string | null
  phase?: string | null
  floatvalue?: number | null
  paintseed?: number
  paintindex?: number
  overstock?: number | null
  rank?: number
  tradeLock?: string | null
  tradeableDate?: Date | null
  tradeBlocked?: boolean
  blockDays?: number | null
  nameId?: number
  tradeableStatus?: number | null
  loaded?: boolean
  isLoading?: boolean
}

export interface CSMoneyItemInfoType {
  appId: number
  appearTime: string
  assetId: number
  casesCount: number
  defaultPrice: number
  discount: number
  float: string
  floatRange: Array<number>
  fullName: string
  hasHighDemand: false
  id: number
  inspect: string
  isPopular: false
  isStatTrak: true
  lockMarkup: number
  name: string
  nameId: number
  oldPrice: number
  overprice: number
  overstockDiff: number
  pattern: number
  price: number
  quality: string
  rarity: string
  steamId: string
  steamImg: string
  steamName: string
  tradeLock: number
  type: number
}

export interface itemSkinStatusType {
  a: string
  d:string
  defindex: number
  floatid: string
  floatvalue?: number
  full_item_name: string
  imageurl: string
  item_name: string
  killeatervalue: number
  m: string
  max: number
  min: number
  origin: number
  origin_name: string
  paintindex: number
  paintseed: number
  quality: number
  quality_name: string
  rarity: number
  rarity_name: string
  s: string
  stickers: Array<itemInfoStickerType>
  weapon_type: string
  wear_name: string
  low_rank?: number
  high_rank?: number
}

export interface itemInfoStickerType {
  codename: string
  material: string
  name: string
  slot: number
  stickerId: number
}

export interface itemSkinInfoType {
  img: string
  hasHighDemand: boolean
  demand: boolean
  limit?: number | null
  status: number | null
  overstockDiff: number | null
}

export interface steamInventoryType {
  rgInventory: {
    [ key: string ]: steamInventoryAssetsType
  }
  rgDescriptions: {
    [ key: string ]: steamInventoryDescType
  }
  [ key: string ]: any
}

export interface steamInventoryTagType {
  localized_tag_name: string
  [ key: string ]: string
}

export interface steamInventoryAssetsType {
  id: string
  classid: string
  instanceid: string
  amount: string
  hide_in_china: number
  pos: number
}

export interface steamInventoryDescType {
  classid: string
  instanceid: string
  market_hash_name: string
  market_name: string
  name: string
  tags: Array<steamInventoryDescTagType>
  cache_expiration: string
  [ key: string ]: any
}

export interface steamInventoryDescTagType {
  internal_name: string
  name: string
  category: string
  category_name: string
  [ key: string ]: any
}

export interface getSteamInventoryRequestType {
  steamID: number | string
  inventoryCount: number | string
}

export interface getSteamInventoryResponseType {
  data: steamInventoryType | {
    error?: string
  }
  [ key: string ]: any
}

export interface getPricesOnCSMWikiResponseType {
  price_trader_log: CSMoneyPriceListType
}

export type CSMoneyPriceListType = Array<CSMoneyPriceListItemType>

export interface CSMoneyPriceListItemType{
  values: Array<CSMoneyPriceListItemValueType>
  name_id: string
}

export interface CSMoneyPriceListItemValueType {
  price_trader_new: number
  time: number
}

export interface dopplerPhasesType {
  [ key: number ]: string
}

export interface loadPageRequestType {
  from?: number
  to?: number
  self?: boolean
  isTradePage?: boolean
}

export interface inventoryMutationRequestType {
  callback?: Function
  mutationElement: string
  mutationParams: MutationObserverInit
}

export interface CSMoneyItemSkinInfoType {
  '3d'?: string
  addPrice?: number
  appId: number
  appearTime: string
  assetId: number
  case?: {
    name: string
    img: string
  }
  collection?: {
    name: string
    img: string
  }
  defaultPrice: number
  fullName: string
  float?: string
  floatRange?: Array<number>
  hasHighDemand: boolean
  id: number
  img?: string
  inspect: string
  isPopular: boolean
  lockMarkup: number
  name: string
  nameId: number
  overpay?: {
    stickers: number
  }
  overprice?: number
  overstockDiff: number
  pattern?: number
  preview: string
  price: number
  quality?: string
  rarity: string
  steamId: string
  steamImg: string
  steamName: string
  stickers?: Array<{
    collection: string
    img: string
    name: string
    overprice?: number
    price?: number
    wear?: number
    wikiLink: string
  }>
  tradeLock: number
  type: number
}

export interface portTabsConstsType {
  [ key: string ]: {
    name: string
    matches: string[]
  }
}

export interface sendMessagesToTabsPortTypeParamsType {
  tabId?: number
  portName: string
  tabName: string
  urls: string[]
  data: any
  allowAllTabs: boolean
}

export type extensionListConstsType = Array<extensionListItemConstsType>

export interface extensionListItemConstsType {
  names: string[]
  shortNames: string[]
  action: string
}

export interface steamTradeOffersResponse {
  descriptions: Array<steamInventoryDescType> | []
  next_cursor: number
  trade_offers_received: Array<steamTradeOfferType> | []
  trade_offers_sent: Array<steamTradeOfferType> | []
}

export interface steamTradeOfferType {
  accountid_other: number
  confirmation_method: number
  escrow_end_date: number
  expiration_time: number
  from_real_time_trade: boolean
  is_our_offer: boolean
  items_to_give: steamItemType[]
  message: string
  time_created: number
  time_updated: number
  trade_offer_state: number
  tradeofferid: string
  tradePartnerInfo?: tradePartnerInfo
}

export interface tradePartnerInfo {
  [ index: string ]: string | number | null
  level: string | number | null
  date: string | null
  limitedAccount: string | null
}

export interface steamItemType {
  amount: string
  appid: number
  assetid: string
  classid: string
  contextid: string
  est_usd: string
  instanceid: string
  missing: boolean
}

export interface p2pAnalysisData {
  tradeOffersInfo: any
  logo: string | null
}
