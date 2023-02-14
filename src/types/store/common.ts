export type notificationsListType = Array<notificationListRowType | undefined>
export interface notificationListRowType {
  _id: string,
  createdDate: string | undefined,
  title: {
    [ locale: string ]: string | undefined
  },
  content: {
    [ locale: string ]: string | undefined
  },
  isRead: boolean
}