import { app } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export type Locale = 'en' | 'ru'

export function getDefaultLocale(): Locale {
  const osLocale = app.getLocale().toLowerCase()
  return osLocale.startsWith('ru') ? 'ru' : 'en'
}

export interface AppSettings {
  autoStartVpn: boolean
  launchAtLogin: boolean
  alwaysOnTop: boolean
  locale: Locale
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoStartVpn: false,
  launchAtLogin: false,
  alwaysOnTop: false,
  locale: 'en'
}

export function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function loadSettings(): AppSettings {
  const defaults = { ...DEFAULT_SETTINGS, locale: getDefaultLocale() }
  try {
    const data = readFileSync(getSettingsPath(), 'utf-8')
    const parsed = JSON.parse(data) as Partial<AppSettings>
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

export function saveSettings(settings: AppSettings) {
  writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
}
