import { app } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import { CONFIG_SOURCE } from '../../shared/config'

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
  configSource: CONFIG_SOURCE
  remoteConfigUrl: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoStartVpn: false,
  launchAtLogin: false,
  alwaysOnTop: false,
  locale: 'en',
  configSource: CONFIG_SOURCE.LOCAL,
  remoteConfigUrl: ''
}

export function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function normalizeConfigSource(value: unknown): CONFIG_SOURCE {
  if (value === CONFIG_SOURCE.REMOTE || value === 'remote') return CONFIG_SOURCE.REMOTE
  return CONFIG_SOURCE.LOCAL
}

export function loadSettings(): AppSettings {
  const defaults = { ...DEFAULT_SETTINGS, locale: getDefaultLocale() }
  try {
    const data = readFileSync(getSettingsPath(), 'utf-8')
    const parsed = JSON.parse(data) as Partial<AppSettings> & { configSource?: string }
    const out: AppSettings = { ...defaults, ...parsed }

    if (parsed.configSource) {
      out.configSource = normalizeConfigSource(parsed.configSource)
    }
    if (parsed.remoteConfigUrl) {
      out.remoteConfigUrl = parsed.remoteConfigUrl
    }

    return out
  } catch {
    return defaults
  }
}

export function saveSettings(settings: AppSettings) {
  writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf-8')
}
