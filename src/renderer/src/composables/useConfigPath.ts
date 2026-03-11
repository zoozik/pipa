import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { CONFIG_SOURCE } from '@shared/config'

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

export function useConfigPath() {
  const { t } = useI18n()

  const configPath = ref<string>('')
  const configPathError = ref<string>('')
  const configPathValid = ref<boolean>(false)

  const configSource = ref<CONFIG_SOURCE>(CONFIG_SOURCE.LOCAL)
  const remoteConfigUrl = ref<string>('')
  const remoteConfigUrlError = ref<string>('')
  const remoteConfigLoading = ref<boolean>(false)
  const lastFetchedRemoteUrl = ref<string>('')
  const isEditingRemoteUrl = ref<boolean>(false)
  const remoteConfigDraft = ref<string>('')

  function getConfigInvalidMessage(): string {
    return t('config.fileNotFound')
  }

  function validateRemoteUrl(url: string): boolean {
    return URL_REGEX.test(url.trim())
  }

  const isRefreshRemoteDisabled = computed(() => {
    const trimmed = remoteConfigUrl.value.trim()
    const urlValid = !!trimmed && validateRemoteUrl(trimmed)
    const configAbsent = configSource.value === CONFIG_SOURCE.REMOTE && !configPathValid.value
    return !urlValid || remoteConfigLoading.value || configAbsent
  })

  function beginEditRemoteUrl() {
    remoteConfigDraft.value = remoteConfigUrl.value
    remoteConfigUrlError.value = ''
    isEditingRemoteUrl.value = true
  }

  function cancelEditRemoteUrl() {
    isEditingRemoteUrl.value = false
    remoteConfigDraft.value = ''
    remoteConfigUrlError.value = ''
  }

  async function loadConfigSource() {
    const { configSource: src, remoteConfigUrl: url } = await window.vpn.getConfigSource()
    configSource.value = src === CONFIG_SOURCE.REMOTE ? CONFIG_SOURCE.REMOTE : CONFIG_SOURCE.LOCAL
    remoteConfigUrl.value = url
  }

  async function updateEffectiveValid() {
    const { valid } = await window.vpn.getConfigPath()
    configPathValid.value = valid
  }

  async function loadConfigPath() {
    const { path, valid } = await window.vpn.getConfigPath()
    configPath.value = path
    configPathValid.value = valid
    configPathError.value = valid ? '' : getConfigInvalidMessage()
  }

  async function applyConfigPath() {
    configPathError.value = ''
    const trimmed = configPath.value.trim()
    if (!trimmed) return

    const result = await window.vpn.setConfigPath(trimmed)
    if (result.ok) {
      configPathError.value = ''
      configPathValid.value = true
      localStorage.setItem('vpn-config-path', trimmed)
    } else {
      configPathError.value = result.error ?? getConfigInvalidMessage()
      configPathValid.value = false
    }
  }

  async function pickConfigFile() {
    const result = await window.vpn.pickConfigFile()

    if (result.path) {
      configPath.value = result.path
      configPathError.value = ''
      configPathValid.value = true
      localStorage.setItem('vpn-config-path', result.path)
    }
  }

  async function setConfigSourceLocal() {
    cancelEditRemoteUrl()

    configSource.value = CONFIG_SOURCE.LOCAL

    remoteConfigUrlError.value = ''

    const result = await window.vpn.setConfigSource({ configSource: CONFIG_SOURCE.LOCAL })
    if (!result.ok) return

    const savedPath = localStorage.getItem('vpn-config-path')
    if (savedPath) {
      configPath.value = savedPath
      const setPathResult = await window.vpn.setConfigPath(savedPath)
      configPathValid.value = setPathResult.ok
      configPathError.value = setPathResult.ok ? '' : (setPathResult.error ?? getConfigInvalidMessage())
    } else {
      await loadConfigPath()
    }
  }

  async function setConfigSourceRemote(url?: string) {
    cancelEditRemoteUrl()

    configSource.value = CONFIG_SOURCE.REMOTE

    remoteConfigUrlError.value = ''
    const raw = (url ?? remoteConfigUrl.value) || ''

    const urlToUse = raw.trim()

    if (urlToUse && !validateRemoteUrl(urlToUse)) {
      remoteConfigUrlError.value = t('config.invalidUrl')
      return
    }

    if (remoteConfigLoading.value) return

    remoteConfigLoading.value = true
    try {
      const result = await window.vpn.setConfigSource({
        configSource: CONFIG_SOURCE.REMOTE,
        remoteConfigUrl: urlToUse
      })
      if (!result.ok) {
        remoteConfigUrlError.value = result.error ?? t('config.downloadError')
        configPathValid.value = false
        return
      }
      const currentUrl = remoteConfigUrl.value.trim()
      if (urlToUse && currentUrl !== urlToUse) return

      if (urlToUse) {
        remoteConfigUrl.value = urlToUse
        lastFetchedRemoteUrl.value = urlToUse
      }
      await updateEffectiveValid()
      configPathError.value = ''
    } finally {
      remoteConfigLoading.value = false
    }
  }

  async function applyRemoteUrl() {
    const trimmed = remoteConfigDraft.value.trim()
    if (!trimmed || !validateRemoteUrl(trimmed)) {
      remoteConfigUrlError.value = t('config.invalidUrl')
      return
    }

    await setConfigSourceRemote(trimmed)
    const appliedUrl = remoteConfigUrl.value.trim()
    if (!appliedUrl || appliedUrl !== trimmed) return

    await window.vpn.start()

    isEditingRemoteUrl.value = false
    remoteConfigDraft.value = ''
    remoteConfigUrlError.value = ''
  }

  async function refreshRemoteConfig() {
    remoteConfigUrlError.value = ''
    remoteConfigLoading.value = true
    try {
      const result = await window.vpn.refreshRemoteConfig()
      if (result.ok) {
        await updateEffectiveValid()
        const url = remoteConfigUrl.value.trim()
        if (url) lastFetchedRemoteUrl.value = url
      } else {
        remoteConfigUrlError.value = result.error ?? t('config.downloadError')
        configPathValid.value = false
      }
    } finally {
      remoteConfigLoading.value = false
    }
  }

  async function restoreOrLoadConfigPath() {
    await loadConfigSource()
    if (configSource.value === CONFIG_SOURCE.REMOTE) {
      await updateEffectiveValid()
      if (configPathValid.value) {
        lastFetchedRemoteUrl.value = remoteConfigUrl.value.trim()
      }
      configPathError.value = ''
      return
    }
    const savedPath = localStorage.getItem('vpn-config-path')
    if (savedPath) {
      const result = await window.vpn.setConfigPath(savedPath)
      if (result.ok) {
        configPath.value = savedPath
        configPathValid.value = true
        configPathError.value = ''
      } else {
        configPath.value = savedPath
        configPathValid.value = false
        configPathError.value = result.error ?? getConfigInvalidMessage()
      }
    } else {
      await loadConfigPath()
    }
  }

  return {
    configPath,
    configPathError,
    configPathValid,
    configSource,
    remoteConfigUrl,
    remoteConfigUrlError,
    isRefreshRemoteDisabled,
    isEditingRemoteUrl,
    remoteConfigDraft,
    loadConfigPath,
    loadConfigSource,
    applyConfigPath,
    pickConfigFile,
    restoreOrLoadConfigPath,
    validateRemoteUrl,
    setConfigSourceLocal,
    setConfigSourceRemote,
    refreshRemoteConfig,
    updateEffectiveValid,
    beginEditRemoteUrl,
    cancelEditRemoteUrl,
    applyRemoteUrl
  }
}
