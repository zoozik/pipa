<script setup lang="ts">
import { onMounted } from 'vue'

import AppHeader from './components/AppHeader.vue'
import ConfigPathRow from './components/ConfigPathRow.vue'
import SettingsCheckboxes from './components/SettingsCheckboxes.vue'
import VpnActionButton from './components/VpnActionButton.vue'
import TrafficChart from './components/TrafficChart.vue'
import LogBlock from './components/LogBlock.vue'
import Footer from './components/Footer.vue'

import { useVpn } from './composables/useVpn'
import { useConfigPath } from './composables/useConfigPath'
import { useSettings } from './composables/useSettings'

const { vpnRunning, logLines, currentOutbound, logContainer, initStatus, toggleVpn, subscribeVpnEvents } = useVpn()

const { configPath, configPathError, configPathValid, applyConfigPath, pickConfigFile, restoreOrLoadConfigPath } = useConfigPath()

const {
  autoStartVpn,
  launchAtLogin,
  alwaysOnTop,
  locale,
  loadSettings,
  onAutoStartVpnChange,
  onLaunchAtLoginChange,
  onToggleAlwaysOnTop,
  onLocaleChange
} = useSettings()

async function onClose() {
  await window.app?.quit?.()
}

async function onMinimizeToTray() {
  await window.app?.minimizeToTray?.()
}

function handleLogContainerRef(el: HTMLElement | null) {
  logContainer.value = el
}

onMounted(async () => {
  await initStatus()
  await restoreOrLoadConfigPath()
  await loadSettings()

  subscribeVpnEvents()
})
</script>

<template>
  <div class="app">
    <div class="inner">
      <AppHeader
        :always-on-top="alwaysOnTop"
        :locale="locale"
        :on-toggle-always-on-top="onToggleAlwaysOnTop"
        :on-minimize-to-tray="onMinimizeToTray"
        :on-locale-change="onLocaleChange"
        :on-close="onClose"
      />

      <div class="content">
        <ConfigPathRow
          v-model:config-path="configPath"
          :config-path-error="configPathError"
          :on-input="applyConfigPath"
          :on-pick-file="pickConfigFile"
        />

        <SettingsCheckboxes
          :auto-start-vpn="autoStartVpn"
          :launch-at-login="launchAtLogin"
          :on-auto-start-vpn-change="onAutoStartVpnChange"
          :on-launch-at-login-change="onLaunchAtLoginChange"
        />

        <VpnActionButton :running="vpnRunning" :disabled="!configPathValid" :on-toggle="toggleVpn" />

        <TrafficChart :current-outbound="currentOutbound" />

        <LogBlock :log-lines="logLines" :on-container-ref="handleLogContainerRef" />

        <Footer />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app {
  @extend %flex, %flex-column;
  min-height: 100dvh;
  padding-block: var(--app-shadow-offset);
  padding-inline: var(--app-shadow-offset);
  color: var(--color-text-app);
  max-height: 100dvh;
}

.inner {
  @extend %flex, %flex-column, %grow;
  box-shadow: 0 4px var(--app-shadow-offset) var(--color-shadow);
  background: var(--color-bg-base);
  border-radius: 12px;
  overflow: hidden;
}

.content {
  @extend %flex, %flex-column, %grow;
  padding-block: var(--app-base-offset);
  padding-inline: var(--app-base-offset);
  gap: 12px;
  overflow: hidden;
}
</style>
