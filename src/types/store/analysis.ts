import { protectionStatusesValues } from "../index"

export type sitesListResponseType = sitesListType[] | undefined

export interface siteStatusType extends sitesListType {
  protectionStatus: protectionStatusesValues
  isBlackListed?: boolean
  isWhiteListed?: boolean
  currentPageUrl: string
  tabId?: number
  from: string
}

export interface sitesListType {
  url: string | null | undefined
  trustScore: number | null | undefined
  similarityScore: number | null | undefined
  domain: string
  pageId: string
  comments: {
    [ locale: string ]: string | undefined
  },
}

export interface createSiteListRequestType {
  notionDatabaseID: string
  similarityScore: number
  currentPageUrl: string
  trustScore: number
  checkDate: string
  domain: string
}