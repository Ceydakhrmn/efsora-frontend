import { createContext, useContext } from 'react'
import { tr } from './tr'
import { en } from './en'

export type Language = 'tr' | 'en'
export type Translations = typeof tr

export const translations: Record<Language, Translations> = { tr, en }

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

export const I18nContext = createContext<I18nContextType>({
  language: 'tr',
  setLanguage: () => {},
  t: tr,
})

export const useI18n = () => useContext(I18nContext)
