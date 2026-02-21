import { contextBridge, ipcRenderer } from 'electron'

// --- VPN API
contextBridge.exposeInMainWorld('vpn', {
  start: () => ipcRenderer.invoke('vpn-start'),
  stop: () => ipcRenderer.invoke('vpn-stop'),
  getStatus: () => ipcRenderer.invoke('vpn-status'),
  getConfigPath: () => ipcRenderer.invoke('vpn-get-config-path'),
  setConfigPath: (path: string) => ipcRenderer.invoke('vpn-set-config-path', path),
  pickConfigFile: () => ipcRenderer.invoke('vpn-pick-config-file'),

  onLog: (callback: (payload: { line: string; stream: string }) => void) => {
    ipcRenderer.on('vpn-log', (_event, payload) => callback(payload))
  },

  onStatus: (callback: (payload: { running: boolean; error?: string }) => void) => {
    ipcRenderer.on('vpn-status', (_event, payload) => callback(payload))
  },

  onNetworkStats: (callback: (payload: { totalDownload: number; totalUpload: number }) => void) => {
    ipcRenderer.on('network-stats', (_event, payload) => callback(payload))
  },

  onDevElevationStatus: (callback: (payload: { elevated: boolean }) => void) => {
    ipcRenderer.on('dev-elevation-status', (_event, payload) => callback(payload))
  }
})

// --- App / Window / Updater API
contextBridge.exposeInMainWorld('app', {
  quit: () => ipcRenderer.invoke('app-quit'),
  minimizeToTray: () => ipcRenderer.invoke('window-minimize-to-tray'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window-toggle-always-on-top') as Promise<boolean>,
  getSettings: () => ipcRenderer.invoke('settings-get'),
  setSettings: (settings: { autoStartVpn?: boolean; launchAtLogin?: boolean; alwaysOnTop?: boolean; locale?: string }) =>
    ipcRenderer.invoke('settings-set', settings),

  onUpdateDownloaded: (callback: (payload: { version: string }) => void) => {
    ipcRenderer.on('updater:update-downloaded', (_event, payload) => callback(payload))
  },
  quitAndInstall: () => ipcRenderer.invoke('updater-quit-and-install')
})
