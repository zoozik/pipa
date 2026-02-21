import { app, BrowserWindow } from 'electron'
import { join } from 'path'

import type { NetworkStatsPayload } from './networkStats'
import type { AppSettings } from './settings'

function getPreloadPath(): string {
  // В production getAppPath() = путь к app.asar; внутри asar структура out/preload/index.js
  if (app.isPackaged) {
    return join(app.getAppPath(), 'out', 'preload', 'index.js')
  }
  return join(__dirname, '..', 'preload', 'index.js')
}

function getRendererPath(): string {
  if (app.isPackaged) {
    return join(app.getAppPath(), 'out', 'renderer', 'index.html')
  }
  return join(__dirname, '..', 'renderer', 'index.html')
}

let mainWindow: BrowserWindow | null = null

export function getWindow(): BrowserWindow | null {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow
  }
  return null
}

/** На Windows с level 'screen-saver' закрепление поверх всех окон работает стабильнее после билда. */
function applyAlwaysOnTop(win: BrowserWindow, value: boolean) {
  if (process.platform === 'win32' && value) {
    win.setAlwaysOnTop(true, 'screen-saver')
  } else {
    win.setAlwaysOnTop(value)
  }
}

export function setWindowAlwaysOnTop(win: BrowserWindow, value: boolean) {
  applyAlwaysOnTop(win, value)
}

export interface CreateWindowOpts {
  settings: AppSettings
  isDev: boolean
  getTrayIconPath: () => string
  isElevated: () => boolean
  getAlwaysOnTop: () => boolean
  startNetworkStatsPolling: (send: (payload: NetworkStatsPayload) => void) => void
  stopNetworkStatsPolling: () => void
  loadSettings: () => AppSettings
  onReady: () => void
  onClosed: () => void
}

export function createWindow(opts: CreateWindowOpts) {
  const {
    settings,
    isDev,
    getTrayIconPath,
    isElevated,
    getAlwaysOnTop,
    startNetworkStatsPolling,
    stopNetworkStatsPolling,
    loadSettings,
    onReady,
    onClosed
  } = opts

  mainWindow = new BrowserWindow({
    width: 500,
    height: 800,
    frame: false,
    transparent: true,
    resizable: true,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  applyAlwaysOnTop(mainWindow, settings.alwaysOnTop)

  mainWindow.on('show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      applyAlwaysOnTop(mainWindow, getAlwaysOnTop())
    }
  })

  if (isDev) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] ?? 'http://localhost:5173')
  } else {
    mainWindow.loadFile(getRendererPath())
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    stopNetworkStatsPolling()
    onClosed()
  })

  startNetworkStatsPolling((payload) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('network-stats', payload)
    }
  })

  if (isDev) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.send('dev-elevation-status', { elevated: isElevated() })
      mainWindow?.webContents.openDevTools({ mode: 'detach' })
    })
  }

  mainWindow.webContents.once('did-finish-load', () => {
    onReady()
  })
}
