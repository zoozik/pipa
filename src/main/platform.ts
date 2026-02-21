import { app } from 'electron'
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const isDev = !app.isPackaged

export function getTrayIconPath(): string {
  if (isDev) {
    return join(process.cwd(), 'resources', 'icon.png')
  }
  return join(process.resourcesPath, 'icon.png')
}

export function isElevated(): boolean {
  if (process.platform !== 'win32') return true

  try {
    execSync('net session', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export function trayIconExists(): boolean {
  return existsSync(getTrayIconPath())
}

export { isDev }
