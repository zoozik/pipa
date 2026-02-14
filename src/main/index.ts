import { app } from 'electron'
import { existsSync } from 'fs'
import { getPaths } from './paths'
import { getTrayIconPath, isElevated, isDev } from './platform'
import { startVpn, stopVpn, isVpnRunning } from './vpn'
import type { TrayApi } from './tray'
import { startNetworkStatsPolling, stopNetworkStatsPolling } from './networkStats'
import { createWindow, getWindow } from './window'
import { registerIpc } from './ipc'
import { loadSettings } from './settings'
import { debugLog, reportError } from './logger'
import { buildTrayMenuTemplate } from './trayMenu'
import { setupUpdater } from './updater'

process.on('uncaughtException', (err) => {
  reportError('Uncaught exception', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  reportError('Unhandled promise rejection', reason)
  process.exit(1)
})

debugLog('main process loaded')

let customConfigPath: string | null = null
let trayApi: TrayApi | null = null

function getPathsWithCustom() {
  return getPaths(customConfigPath)
}

function isConfigPathValid(): boolean {
  return existsSync(getPathsWithCustom().configPath)
}

const vpnDeps = {
  getWindow,
  getPaths: getPathsWithCustom,
  isElevated,
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
  debugLog('app.whenReady() done')

  const settings = loadSettings()
  if (process.platform === 'win32' || process.platform === 'darwin') {
    app.setLoginItemSettings({ openAtLogin: settings.launchAtLogin })
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
      if (s.autoStartVpn) setTimeout(() => startVpn(vpnDeps), 500)
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
    vpnDeps
  })

  if (app.isPackaged) {
    setupUpdater(getWindow)
  }
})()

app.on('window-all-closed', () => {
  stopVpn(vpnDeps)
  app.quit()
})

app.on('before-quit', () => {
  stopVpn(vpnDeps)
})
