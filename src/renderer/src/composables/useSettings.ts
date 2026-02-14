import { ref } from 'vue'
import { i18n } from '../i18n'
import type { Locale } from '../i18n'

export function useSettings() {
  const autoStartVpn = ref(false)
  const launchAtLogin = ref(false)
  const alwaysOnTop = ref(false)
  const locale = ref<Locale>('en')

  async function loadSettings() {
    const s = await window.app?.getSettings?.()
    if (!s) return
    autoStartVpn.value = s.autoStartVpn
    launchAtLogin.value = s.launchAtLogin
    alwaysOnTop.value = s.alwaysOnTop
    if (s.locale === 'en' || s.locale === 'ru') {
      locale.value = s.locale
      i18n.global.locale.value = s.locale
    }
  }

  async function onLocaleChange(newLocale: Locale) {
    locale.value = newLocale
    i18n.global.locale.value = newLocale
    await window.app?.setSettings?.({ locale: newLocale })
  }

  async function onAutoStartVpnChange(checked: boolean) {
    autoStartVpn.value = checked
    await window.app?.setSettings?.({ autoStartVpn: checked })
  }

  async function onLaunchAtLoginChange(checked: boolean) {
    launchAtLogin.value = checked
    await window.app?.setSettings?.({ launchAtLogin: checked })
  }

  async function onToggleAlwaysOnTop() {
    const next = await window.app?.toggleAlwaysOnTop?.()
    if (typeof next === 'boolean') alwaysOnTop.value = next
  }

  return {
    autoStartVpn,
    launchAtLogin,
    alwaysOnTop,
    locale,
    loadSettings,
    onAutoStartVpnChange,
    onLaunchAtLoginChange,
    onToggleAlwaysOnTop,
    onLocaleChange
  }
}
