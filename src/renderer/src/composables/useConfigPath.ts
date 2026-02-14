import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export function useConfigPath() {
  const { t } = useI18n()
  const configPath = ref('')
  const configPathError = ref('')
  const configPathValid = ref(false)

  function getConfigInvalidMessage() {
    return t('config.fileNotFound')
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

  async function restoreOrLoadConfigPath() {
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
    loadConfigPath,
    applyConfigPath,
    pickConfigFile,
    restoreOrLoadConfigPath
  }
}
