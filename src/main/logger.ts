import { app, dialog } from 'electron'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import { App } from '../../shared/app'

const DEBUG_LOG_DIR = process.env.LOCALAPPDATA?.trim() ? join(process.env.LOCALAPPDATA.trim(), App.NAME) : null

export function debugLog(msg: string): void {
  if (!DEBUG_LOG_DIR) return
  try {
    if (!existsSync(DEBUG_LOG_DIR)) mkdirSync(DEBUG_LOG_DIR, { recursive: true })
    writeFileSync(join(DEBUG_LOG_DIR, 'debug.log'), `${new Date().toISOString()} ${msg}\n`, {
      flag: 'a'
    })
  } catch {
    // ignore
  }
}

export function reportError(title: string, err: unknown): void {
  const message = err instanceof Error ? (err.stack ?? err.message) : String(err)
  debugLog(`${title}: ${message}`)
  try {
    const logPath = join(app.getPath('userData'), 'error.log')
    writeFileSync(logPath, `${new Date().toISOString()} [${title}]\n${message}\n\n`, {
      flag: 'a'
    })
  } catch {
    // ignore
  }
  if (app.isReady()) {
    dialog.showErrorBox(title, message)
  }
}
