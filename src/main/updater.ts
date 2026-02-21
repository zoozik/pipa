import type { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

import { debugLog } from './logger'

export function setupUpdater(getWindow: () => BrowserWindow | null): void {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-downloaded', (info: { version: string }) => {
    const win = getWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('updater:update-downloaded', { version: info.version })
    }
  })

  autoUpdater.on('error', (err: Error) => {
    debugLog(`Updater error: ${err.message}`)
  })

  checkForUpdate()

  setInterval(() => {
    checkForUpdate()
  }, 3600)
}

const checkForUpdate = () => {
  autoUpdater.checkForUpdatesAndNotify().catch((err: unknown) => {
    debugLog(`Updater check failed: ${err instanceof Error ? err.message : String(err)}`)
  })
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall()
}
