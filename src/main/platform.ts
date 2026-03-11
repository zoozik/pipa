import { app } from 'electron'
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const isDev = !app.isPackaged

export function getTrayIconPath(): string {
  if (isDev) {
    return join(process.cwd(), 'resources', 'icon.png')
  }
  return join(process.resourcesPath, 'icon.png')
}

export function trayIconExists(): boolean {
  return existsSync(getTrayIconPath())
}

export function isElevated(): boolean {
  if (process.platform === 'win32') {
    try {
      const result = spawnSync('fsutil', ['dirty', 'query', process.env.SYSTEMDRIVE ?? 'C:'], {
        stdio: 'ignore'
      })
      return result.status === 0
    } catch {
      return false
    }
  }

  const getuid = (process as unknown as { getuid?: () => number }).getuid
  if (!getuid) return false

  try {
    return getuid() === 0
  } catch {
    return false
  }
}

export { isDev }
