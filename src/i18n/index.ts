import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import si from './locales/si.json'

export const supportedLanguages = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
] as const

const storedLanguage = localStorage.getItem('teapro.language')
const initialLanguage = storedLanguage === 'si' ? 'si' : 'en'

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, si: { translation: si } },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

i18n.on('languageChanged', (language) => {
  localStorage.setItem('teapro.language', language)
  document.documentElement.lang = language
})

document.documentElement.lang = initialLanguage

export default i18n
