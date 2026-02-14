import { app } from 'electron'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Locale } from './settings'

let messages: Record<Locale, Record<string, unknown>> | null = null

function getLocalesDir(): string {
  if (app.isPackaged) {
    return join(app.getAppPath(), 'shared', 'locales')
  }
  return join(process.cwd(), 'shared', 'locales')
}

function loadMessages(locale: Locale): Record<string, unknown> {
  try {
    const path = join(getLocalesDir(), `${locale}.json`)
    const raw = readFileSync(path, 'utf-8')
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

function getMessages(): Record<Locale, Record<string, unknown>> {
  if (!messages) {
    messages = {
      en: loadMessages('en'),
      ru: loadMessages('ru')
    }
  }
  return messages
}

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = obj
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[p]
  }
  return typeof current === 'string' ? current : undefined
}

export function t(locale: Locale, key: string, placeholders?: Record<string, string>): string {
  const all = getMessages()
  const msg = all[locale] ?? all.en
  let result = getByPath(msg as Record<string, unknown>, key) ?? getByPath(all.en as Record<string, unknown>, key) ?? key
  if (placeholders) {
    for (const [name, value] of Object.entries(placeholders)) {
      result = result.replace(new RegExp(`\\{${name}\\}`, 'g'), value)
    }
  }
  return result
}
