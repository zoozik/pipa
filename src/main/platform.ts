import { app } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'

const isDev = !app.isPackaged

export function getTrayIconPath(): string {
  if (isDev) {
    return join(process.cwd(), 'resources', 'icon.png')
  }
  return join(process.resourcesPath, 'icon.png')
}

export function trayIconExists(): boolean {
  return existsSync(getTrayIconPath())
}

export { isDev }
