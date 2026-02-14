import { createI18n } from 'vue-i18n'
import en from '@shared/locales/en.json'
import ru from '@shared/locales/ru.json'

export type Locale = 'en' | 'ru'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: en as Record<string, unknown>,
    ru: ru as Record<string, unknown>
  }
})
