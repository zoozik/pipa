import type { BrowserWindow } from 'electron'
import { spawn, type ChildProcess } from 'child_process'
import { watch, type FSWatcher } from 'fs'
import { dirname } from 'path'

export interface VpnDeps {
  getWindow: () => BrowserWindow | null
  getPaths: () => { singBoxPath: string; configPath: string }
  isDev: boolean
  updateTrayMenu: () => void
  onVpnStarted?: () => void
  onVpnStopped?: () => void
}

let vpnProcess: ChildProcess | null = null
let configWatcher: FSWatcher | null = null

function stopConfigWatcher() {
  if (configWatcher) {
    configWatcher.close()
    configWatcher = null
  }
}

function startConfigWatcher(configPath: string, deps: VpnDeps, restart: () => void) {
  stopConfigWatcher()

  let restartTimer: ReturnType<typeof setTimeout> | null = null
  const debounceMs = 400

  configWatcher = watch(configPath, (eventType, filename) => {
    if (eventType !== 'change' || !filename) return

    if (restartTimer) clearTimeout(restartTimer)

    restartTimer = setTimeout(() => {
      restartTimer = null
      if (!vpnProcess) return
      restart()
    }, debounceMs)
  })
}

export function isVpnRunning(): boolean {
  return vpnProcess !== null
}

export function startVpn(deps: VpnDeps): { ok: boolean; error?: string } {
  if (vpnProcess) {
    return { ok: true }
  }

  const { singBoxPath, configPath } = deps.getPaths()

  try {
    vpnProcess = spawn(singBoxPath, ['run', '-c', configPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: dirname(configPath)
    })

    vpnProcess.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      deps.getWindow()?.webContents.send('vpn-log', { line: text, stream: 'stdout' })
    })

    vpnProcess.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      deps.getWindow()?.webContents.send('vpn-log', { line: text, stream: 'stderr' })
    })

    vpnProcess.on('error', (err) => {
      deps.getWindow()?.webContents.send('vpn-status', { running: false, error: err.message })
    })

    vpnProcess.on('exit', (code, signal) => {
      vpnProcess = null
      stopConfigWatcher()
      deps.onVpnStopped?.()
      deps.getWindow()?.webContents.send('vpn-status', {
        running: false,
        code: code ?? undefined,
        signal: signal ?? undefined
      })
      deps.updateTrayMenu()
    })

    const restart = () => {
      stopVpn(deps)
      setTimeout(() => startVpn(deps), 200)
    }
    startConfigWatcher(configPath, deps, restart)

    deps.getWindow()?.webContents.send('vpn-status', { running: true })
    deps.updateTrayMenu()
    deps.onVpnStarted?.()

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    deps.getWindow()?.webContents.send('vpn-status', { running: false, error: message })
    return { ok: false, error: message }
  }
}

export function stopVpn(deps: VpnDeps) {
  if (vpnProcess) {
    vpnProcess.kill('SIGTERM')
    vpnProcess = null
  }

  stopConfigWatcher()
  deps.onVpnStopped?.()
  deps.getWindow()?.webContents.send('vpn-status', { running: false })
  deps.updateTrayMenu()
}
