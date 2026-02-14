import { app } from 'electron'
import type { Locale } from './settings'
import { t } from './i18n'
import type { VpnDeps } from './vpn'

export interface TrayMenuDeps {
  startVpn: (deps: VpnDeps) => { ok: boolean; error?: string }
  stopVpn: (deps: VpnDeps) => void
  isVpnRunning: () => boolean
  isConfigPathValid: () => boolean
  vpnDeps: VpnDeps
}

export function buildTrayMenuTemplate(locale: Locale, deps: TrayMenuDeps): Electron.MenuItemConstructorOptions[] {
  const { startVpn, stopVpn, isVpnRunning, isConfigPathValid, vpnDeps } = deps
  const template: Electron.MenuItemConstructorOptions[] = []

  if (isVpnRunning()) {
    template.push({ label: t(locale, 'tray.disconnect'), click: () => stopVpn(vpnDeps) })
  } else {
    template.push({
      label: t(locale, 'tray.connect'),
      enabled: isConfigPathValid(),
      click: () => startVpn(vpnDeps)
    })
  }

  template.push({
    label: t(locale, 'tray.quit'),
    click: () => {
      stopVpn(vpnDeps)
      app.quit()
    }
  })

  return template
}
