import type { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

export function setupUpdater(getWindow: () => BrowserWindow | null): void {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-downloaded', (info: { version: string }) => {
    const win = getWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('updater:update-downloaded', { version: info.version })
    }
  })

  checkForUpdate()

  const hourMs = 60 * 60 * 1000
  setInterval(checkForUpdate, hourMs)
}

const checkForUpdate = () => {
  void autoUpdater.checkForUpdatesAndNotify()
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall()
}
