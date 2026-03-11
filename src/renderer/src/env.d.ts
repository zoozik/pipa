export {}

declare module '@resources' {
  const url: string
  export default url
}

declare global {
  interface Window {
    vpn: {
      start: () => Promise<{ ok: boolean; error?: string }>
      stop: () => Promise<void>
      getStatus: () => Promise<{ running: boolean }>
      getConfigPath: () => Promise<{ path: string; valid: boolean }>
      setConfigPath: (path: string) => Promise<{ ok: boolean; error?: string }>
      pickConfigFile: () => Promise<{ path: string | null }>
      getConfigSource: () => Promise<{ configSource: string; remoteConfigUrl: string }>
      setRemoteConfigUrl: (url: string) => Promise<void>
      setConfigSource: (payload: { configSource: string; remoteConfigUrl?: string }) => Promise<{ ok: boolean; error?: string }>
      refreshRemoteConfig: () => Promise<{ ok: boolean; error?: string }>
      onLog: (callback: (payload: { line: string; stream: string }) => void) => void
      onStatus: (callback: (payload: { running: boolean; error?: string }) => void) => void
      onNetworkStats: (callback: (payload: { totalDownload: number; totalUpload: number }) => void) => void
    }

    app: {
      quit: () => Promise<void>
      minimizeToTray: () => Promise<void>
      toggleAlwaysOnTop: () => Promise<boolean>
      getSettings: () => Promise<{
        autoStartVpn: boolean
        launchAtLogin: boolean
        alwaysOnTop: boolean
        locale: string
        configSource: string
        remoteConfigUrl: string
      }>
      setSettings: (settings: {
        autoStartVpn?: boolean
        launchAtLogin?: boolean
        alwaysOnTop?: boolean
        locale?: string
      }) => Promise<{ autoStartVpn: boolean; launchAtLogin: boolean; alwaysOnTop: boolean; locale: string }>
      onUpdateDownloaded: (callback: (payload: { version: string }) => void) => void
      quitAndInstall: () => Promise<void>
    }
  }
}
