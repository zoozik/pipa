import { app } from 'electron'
import { join } from 'path'

const isDev = !app.isPackaged

export function getDefaultPaths(): { singBoxPath: string; configPath: string } {
  if (isDev) {
    return {
      singBoxPath: join(process.cwd(), 'resources', 'sing-box.exe'),
      configPath: join(process.cwd(), 'resources', 'config.json')
    }
  }

  const exeDir = join(app.getPath('exe'), '..')

  return {
    singBoxPath: join(process.resourcesPath, 'sing-box.exe'),
    configPath: join(exeDir, 'config.json')
  }
}

export function getPaths(customConfigPath: string | null): { singBoxPath: string; configPath: string } {
  const defaultPaths = getDefaultPaths()

  return {
    singBoxPath: defaultPaths.singBoxPath,
    configPath: customConfigPath ?? defaultPaths.configPath
  }
}
