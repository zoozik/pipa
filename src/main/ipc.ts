import { app, ipcMain, dialog } from 'electron'
import type { BrowserWindow } from 'electron'
import { existsSync } from 'fs'
import { App } from '../../shared/app'
import { loadSettings, saveSettings, type AppSettings } from './settings'
import { startVpn, stopVpn, isVpnRunning } from './vpn'
import { createTray, type TrayApi } from './tray'
import { setWindowAlwaysOnTop } from './window'
import { quitAndInstall } from './updater'
import { t } from './i18n'

export interface IpcDeps {
  getWindow: () => BrowserWindow | null
  getTrayApi: () => TrayApi | null
  setTrayApi: (api: TrayApi | null) => void
  getCustomConfigPath: () => string | null
  setCustomConfigPath: (path: string | null) => void
  getPathsWithCustom: () => { singBoxPath: string; configPath: string }
  isConfigPathValid: () => boolean
  updateTrayMenu: () => void
  getTrayIconPath: () => string
  vpnDeps: {
    getWindow: () => BrowserWindow | null
    getPaths: () => { singBoxPath: string; configPath: string }
    isElevated: () => boolean
    isDev: boolean
    updateTrayMenu: () => void
    onVpnStarted?: () => void
    onVpnStopped?: () => void
  }
}

export function registerIpc(deps: IpcDeps) {
  const {
    getWindow,
    getTrayApi,
    setTrayApi,
    getCustomConfigPath,
    setCustomConfigPath,
    getPathsWithCustom,
    isConfigPathValid,
    updateTrayMenu,
    getTrayIconPath,
    vpnDeps
  } = deps

  ipcMain.handle('vpn-start', () => startVpn(vpnDeps))

  ipcMain.handle('vpn-stop', () => {
    stopVpn(vpnDeps)
  })

  ipcMain.handle('vpn-status', () => ({ running: isVpnRunning() }))

  ipcMain.handle('vpn-get-config-path', () => {
    const { configPath } = getPathsWithCustom()
    return { path: configPath, valid: existsSync(configPath) }
  })

  ipcMain.handle('vpn-set-config-path', (_event, path: string) => {
    if (path && typeof path === 'string' && path.trim() && existsSync(path.trim())) {
      setCustomConfigPath(path.trim())
      updateTrayMenu()
      if (isVpnRunning()) {
        stopVpn(vpnDeps)
        setTimeout(() => startVpn(vpnDeps), 200)
      }
      return { ok: true }
    }
    const locale = loadSettings().locale
    return { ok: false, error: t(locale, 'config.fileNotFound') }
  })

  ipcMain.handle('vpn-pick-config-file', async () => {
    const win = getWindow()
    if (!win) return { path: null }

    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (result.canceled || !result.filePaths[0]) return { path: null }

    setCustomConfigPath(result.filePaths[0])
    return { path: getCustomConfigPath() }
  })

  ipcMain.handle('app-quit', () => {
    stopVpn(vpnDeps)
    app.quit()
  })

  ipcMain.handle('window-minimize-to-tray', () => {
    const win = getWindow()
    if (!win) return

    let tray = getTrayApi()
    if (!tray) {
      const iconPath = getTrayIconPath()
      tray = createTray(iconPath, App.NAME, () => {
        const w = getWindow()
        if (!w) return
        w.setOpacity(0)
        w.once('show', () => {
          setTimeout(() => getWindow()?.setOpacity(1), 50)
        })
        w.show()
      })
      setTrayApi(tray)
    }
    updateTrayMenu()
    win.hide()
  })

  ipcMain.handle('settings-get', () => loadSettings())

  ipcMain.handle('settings-set', (_event, settings: Partial<AppSettings>) => {
    const current = loadSettings()
    const next: AppSettings = { ...current, ...settings }
    saveSettings(next)
    if (app.isPackaged && (process.platform === 'win32' || process.platform === 'darwin')) {
      const loginSettings: { openAtLogin: boolean; path?: string } = {
        openAtLogin: next.launchAtLogin
      }
      if (process.platform === 'win32') {
        loginSettings.path = process.execPath
      }
      app.setLoginItemSettings(loginSettings)
    }
    const win = getWindow()
    if (win && typeof next.alwaysOnTop === 'boolean') {
      setWindowAlwaysOnTop(win, next.alwaysOnTop)
    }
    if (next.locale !== undefined) {
      updateTrayMenu()
    }
    return next
  })

  ipcMain.handle('window-toggle-always-on-top', () => {
    const s = loadSettings()
    const next = !s.alwaysOnTop
    const win = getWindow()
    if (win) setWindowAlwaysOnTop(win, next)
    saveSettings({ ...s, alwaysOnTop: next })
    return next
  })

  ipcMain.handle('updater-quit-and-install', () => {
    quitAndInstall()
  })
}
