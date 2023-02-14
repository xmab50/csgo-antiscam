import en from './localizations/en.json'
import ru from './localizations/ru.json'
import pt from './localizations/pt.json'
import es from './localizations/es.json'

export const localeList = [ 'en', 'ru', 'pt', 'es' ]
export enum Locales {
  EN = 'en',
  RU = 'ru',
  PT = 'pt',
  ES = 'es',
}
export const messages = {
  [Locales.EN]: en,
  [Locales.RU]: ru,
  [Locales.PT]: pt,
  [Locales.ES]: es,
};