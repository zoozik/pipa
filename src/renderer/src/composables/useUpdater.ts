import { ref, onMounted, onUnmounted } from 'vue'

export function useUpdater() {
  const pendingVersion = ref<string | null>(null)
  let removeListener: (() => void) | null = null

  onMounted(() => {
    if (typeof window.app?.onUpdateDownloaded !== 'function') return
    const callback = (payload: { version: string }) => {
      pendingVersion.value = payload.version
    }
    window.app.onUpdateDownloaded(callback)

    removeListener = () => {
      // ipcRenderer.removeListener would need to be exposed for true cleanup
    }
  })

  onUnmounted(() => {
    removeListener?.()
  })

  async function quitAndInstall() {
    await window.app?.quitAndInstall?.()
  }

  return { pendingVersion, quitAndInstall }
}
