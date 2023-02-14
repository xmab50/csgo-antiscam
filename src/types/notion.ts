export interface notionDocumentSiteListType extends notionDatabaseDocument {
  'results': siteListNotionDatabaseDocumentResult[],
}

export interface notionDocumentNotificationType extends notionDatabaseDocument {
  'results': notificationNotionDatabaseDocumentResult[],
}

export interface notionDatabaseDocument {
  'object': string,
  'next_cursor': null,
  'has_more': boolean,
  'type': string,
  'page': {}
}

export interface notionDatabaseDocumentResults {
  'object': string,
  'id': string,
  'created_time': string,
  'last_edited_time': string,
  'created_by': {
    'object': string,
    'id': string,
  },
  'last_edited_by': {
    'object': string,
    'id': string,
  },
  'cover': string | null,
    'icon': string | null,
    'parent': {
      'type': string,
      'database_id': string,
    },
    'archived': boolean,
    'url': string
}

export interface siteListNotionDatabaseDocumentResult extends notionDatabaseDocumentResults {
  'properties': {
    'checkDate': notionPropertyDate,
    'similarityScore': notionPropertyNumber,
    'trustScore': notionPropertyNumber,
    'url': notionPropertyURL,
    'domain': notionPropertyTitle,
    [ key: string ]: notionPropertyText | any
  },
}

export interface notificationNotionDatabaseDocumentResult extends notionDatabaseDocumentResults {
  'properties': {
    'title': notionPropertyTitle,
    'date': notionPropertyDate,
    'enContent': notionPropertyText,
    'ptContent': notionPropertyText,
    'ruContent': notionPropertyText,
    [ key: string ]: notionPropertyText | any
  },
  [ key: string ]: any
}

export interface notionPropertyDate {
  'id': string,
  'type': string,
  'date': {
    'start': string,
    'end': string | null,
    'time_zone': string | null
  }
}

export interface notionPropertyURL {
  'id': string,
  'type': string,
  'url': string,
}

export interface notionPropertyNumber {
  'id': string,
  'type': string,
  'number': number,
}

export interface notionPropertyTitle {
  'id': string,
  'type': string,
  'title': [{
    'type': string,
    'text': {
      'content': string,
      'link': string | null,
    },
    'annotations': notionPropertyAnnotations,
    'plain_text': string,
    'href': string | null,
  }]
}

export interface notionPropertyText {
  'id': string,
  'type': string,
  'rich_text': [{
    'type': string,
    'text': {
      'content': string,
      'link': string | null
    },
    'annotations': notionPropertyAnnotations,
    'plain_text': string,
    'href': string | null
  }]
}

export interface notionPropertyAnnotations {
  'bold': boolean,
  'italic': boolean,
  'strikethrough': boolean,
  'underline': boolean,
  'code': boolean,
  'color': string
}
