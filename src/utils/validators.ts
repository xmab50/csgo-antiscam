export function url (value: string): boolean {
  const exprUrl = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,8}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi
  return exprUrl.test(value)
}
