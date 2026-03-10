import { app } from 'electron'
import { existsSync } from 'fs'

import { registerIpc } from './ipc'
import { reportError } from './logger'
import { startNetworkStatsPolling, stopNetworkStatsPolling } from './networkStats'
import { CONFIG_SOURCE } from '../../shared/config'
import { getPaths } from './paths'
import { getTrayIconPath, isElevated, isDev } from './platform'
import { fetchAndApplyRemoteConfig } from './remoteConfig'
import { loadSettings } from './settings'
import type { TrayApi } from './tray'
import { buildTrayMenuTemplate } from './trayMenu'
import { setupUpdater } from './updater'
import { createWindow, getWindow } from './window'
import { startVpn, stopVpn, isVpnRunning } from './vpn'

process.on('uncaughtException', (err) => {
  reportError('Uncaught exception', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  reportError('Unhandled promise rejection', reason)
  process.exit(1)
})

const gotSingleInstanceLock = app.requestSingleInstanceLock()
// if (!gotSingleInstanceLock) {
//   app.quit()
//   process.exit(0)
// }

app.on('second-instance', () => {
  const win = getWindow()
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

const REMOTE_CONFIG_INTERVAL_MS = 60 * 60 * 1000

let customConfigPath: string | null = null
let trayApi: TrayApi | null = null
let remoteConfigTimerId: ReturnType<typeof setInterval> | null = null

function clearRemoteConfigTimer() {
  if (remoteConfigTimerId !== null) {
    clearTimeout(remoteConfigTimerId)
    remoteConfigTimerId = null
  }
}

function runRemoteConfigUpdateThenScheduleNext() {
  const s = loadSettings()
  if (s.configSource !== CONFIG_SOURCE.REMOTE || !s.remoteConfigUrl.trim()) return
  void fetchAndApplyRemoteConfig(s.remoteConfigUrl.trim()).then(() => {
    startRemoteConfigTimer()
  })
}

function startRemoteConfigTimer() {
  clearRemoteConfigTimer()
  remoteConfigTimerId = setTimeout(() => {
    remoteConfigTimerId = null
    runRemoteConfigUpdateThenScheduleNext()
  }, REMOTE_CONFIG_INTERVAL_MS)
}

function getPathsWithCustom() {
  const s = loadSettings()
  if (s.configSource === CONFIG_SOURCE.REMOTE) return getPaths(null)
  return getPaths(customConfigPath)
}

function isConfigPathValid(): boolean {
  return existsSync(getPathsWithCustom().configPath)
}

const vpnDeps = {
  getWindow,
  getPaths: getPathsWithCustom,
  isDev,
  updateTrayMenu: () => {},
  onVpnStarted: () => {},
  onVpnStopped: () => {}
}

function updateTrayMenu() {
  if (!trayApi) return
  const locale = loadSettings().locale
  const template = buildTrayMenuTemplate(locale, {
    startVpn,
    stopVpn,
    isVpnRunning,
    isConfigPathValid,
    vpnDeps
  })
  trayApi.updateMenu(template)
}

vpnDeps.updateTrayMenu = updateTrayMenu

void (async () => {
  await app.whenReady()

  const settings = loadSettings()
  if (app.isPackaged && (process.platform === 'win32' || process.platform === 'darwin')) {
    const loginSettings: { openAtLogin: boolean; path?: string; args?: string[] } = {
      openAtLogin: settings.launchAtLogin
    }
    if (process.platform === 'win32') {
      loginSettings.path = process.execPath
      loginSettings.args = []
    }
    app.setLoginItemSettings(loginSettings)
  }

  createWindow({
    settings,
    isDev,
    getTrayIconPath,
    isElevated,
    getAlwaysOnTop: () => loadSettings().alwaysOnTop,
    startNetworkStatsPolling,
    stopNetworkStatsPolling,
    loadSettings,
    onReady: () => {
      const s = loadSettings()

      if (!s.autoStartVpn) return

      if (s.configSource === CONFIG_SOURCE.REMOTE) {
        const trimmedUrl = s.remoteConfigUrl.trim()
        if (!trimmedUrl) return

        void fetchAndApplyRemoteConfig(trimmedUrl).then((result) => {
          if (!result.ok || !isConfigPathValid()) return
          setTimeout(() => startVpn(vpnDeps), 500)
        })

        return
      }

      if (!isConfigPathValid()) return

      setTimeout(() => startVpn(vpnDeps), 500)
    },
    onClosed: () => {
      if (trayApi) {
        trayApi.tray.destroy()
        trayApi = null
      }
    }
  })

  registerIpc({
    getWindow,
    getTrayApi: () => trayApi,
    setTrayApi: (api) => {
      trayApi = api
    },
    getCustomConfigPath: () => customConfigPath,
    setCustomConfigPath: (path) => {
      customConfigPath = path
    },
    getPathsWithCustom,
    isConfigPathValid,
    updateTrayMenu,
    getTrayIconPath,
    clearRemoteConfigTimer,
    startRemoteConfigTimer,
    vpnDeps
  })

  const initialSettings = loadSettings()
  if (initialSettings.configSource === CONFIG_SOURCE.REMOTE && initialSettings.remoteConfigUrl.trim()) {
    startRemoteConfigTimer()
  }

  if (app.isPackaged) {
    setupUpdater(getWindow)
  }
})()

app.on('window-all-closed', () => {
  stopVpn(vpnDeps)
  clearRemoteConfigTimer()
  app.quit()
})

app.on('before-quit', () => {
  stopVpn(vpnDeps)
  clearRemoteConfigTimer()
})
