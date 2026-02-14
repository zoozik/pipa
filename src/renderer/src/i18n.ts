import { createI18n } from 'vue-i18n'
import en from '@shared/locales/en.json'
import ru from '@shared/locales/ru.json'

export type Locale = 'en' | 'ru'

const datetimeFormats = {
  en: {
    chartDateTime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  },
  ru: {
    chartDateTime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  }
} as const

const numberFormats = {
  en: {
    decimal2: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
    decimal: { minimumFractionDigits: 0, maximumFractionDigits: 20 }
  },
  ru: {
    decimal2: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
    decimal: { minimumFractionDigits: 0, maximumFractionDigits: 20 }
  }
} as const

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: en as Record<string, unknown>,
    ru: ru as Record<string, unknown>
  },
  datetimeFormats,
  numberFormats
})
