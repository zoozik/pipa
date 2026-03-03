import { app, dialog, ipcMain } from 'electron'
import type { BrowserWindow } from 'electron'
import { existsSync } from 'fs'

import { App } from '../../shared/app'
import { CONFIG_SOURCE } from '../../shared/config'
import { t } from './i18n'
import { fetchAndApplyRemoteConfig } from './remoteConfig'
import { loadSettings, saveSettings, type AppSettings } from './settings'
import { createTray, type TrayApi } from './tray'
import { quitAndInstall } from './updater'
import { setWindowAlwaysOnTop } from './window'
import { isVpnRunning, startVpn, stopVpn } from './vpn'

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
  clearRemoteConfigTimer: () => void
  startRemoteConfigTimer: () => void
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
    clearRemoteConfigTimer,
    startRemoteConfigTimer,
    vpnDeps
  } = deps

  // --- VPN
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
    const trimmed = path.trim()
    if (!trimmed || !existsSync(trimmed)) {
      const locale = loadSettings().locale
      return { ok: false, error: t(locale, 'config.fileNotFound') }
    }

    setCustomConfigPath(trimmed)
    updateTrayMenu()
    if (isVpnRunning()) {
      stopVpn(vpnDeps)
      setTimeout(() => startVpn(vpnDeps), 200)
    }
    return { ok: true }
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

  // --- Config source (local / remote)
  ipcMain.handle('config-get-source', () => {
    const s = loadSettings()
    return { configSource: s.configSource, remoteConfigUrl: s.remoteConfigUrl }
  })

  ipcMain.handle('config-set-remote-url', (_event, url: string) => {
    const s = loadSettings()
    saveSettings({ ...s, remoteConfigUrl: url })
  })

  ipcMain.handle('config-set-source', async (_event, payload: { configSource: CONFIG_SOURCE; remoteConfigUrl?: string }) => {
    const current = loadSettings()
    const remoteConfigUrl = (payload.remoteConfigUrl || current.remoteConfigUrl).trim()
    const next: AppSettings = {
      ...current,
      configSource: payload.configSource,
      remoteConfigUrl
    }
    saveSettings(next)

    if (payload.configSource !== CONFIG_SOURCE.REMOTE) {
      clearRemoteConfigTimer()
      updateTrayMenu()
      return { ok: true }
    }

    setCustomConfigPath(null)

    if (!remoteConfigUrl) {
      startRemoteConfigTimer()
      updateTrayMenu()
      return { ok: true }
    }

    const result = await fetchAndApplyRemoteConfig(remoteConfigUrl)
    if (result.ok) {
      startRemoteConfigTimer()
      if (isVpnRunning()) {
        stopVpn(vpnDeps)
        setTimeout(() => startVpn(vpnDeps), 200)
      }
    }
    updateTrayMenu()
    return result
  })

  ipcMain.handle('config-refresh-remote', async () => {
    const s = loadSettings()
    const trimmedUrl = s.remoteConfigUrl.trim()
    if (s.configSource !== CONFIG_SOURCE.REMOTE || !trimmedUrl) {
      return { ok: false, error: 'Remote config URL not set' }
    }
    clearRemoteConfigTimer()
    const result = await fetchAndApplyRemoteConfig(trimmedUrl)
    startRemoteConfigTimer()
    if (result.ok) updateTrayMenu()
    return result
  })

  // --- App
  ipcMain.handle('app-quit', () => {
    stopVpn(vpnDeps)
    app.quit()
  })

  // --- Window
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

  // --- Settings
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
    if (settings.locale) {
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

  // --- Updater
  ipcMain.handle('updater-quit-and-install', () => {
    quitAndInstall()
  })
}
