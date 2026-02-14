import { Tray, nativeImage, Menu } from 'electron'
import { existsSync } from 'fs'
import type { MenuItemConstructorOptions } from 'electron'

const FALLBACK_ICON_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

export interface TrayApi {
  tray: Tray
  updateMenu: (template: MenuItemConstructorOptions[]) => void
}

export function createTray(iconPath: string, tooltip: string, onClick: () => void): TrayApi {
  const fallbackIcon = nativeImage.createFromDataURL(FALLBACK_ICON_DATA).resize({ width: 16, height: 16 })
  const icon = existsSync(iconPath) ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }) : fallbackIcon
  const tray = new Tray(icon.isEmpty() ? fallbackIcon : icon)

  tray.setToolTip(tooltip)

  tray.on('click', () => {
    onClick()
  })

  return {
    tray,
    updateMenu(template: MenuItemConstructorOptions[]) {
      tray.setContextMenu(Menu.buildFromTemplate(template))
    }
  }
}
