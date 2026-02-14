<script setup lang="ts">
import { App } from '@shared/app'
import type { Locale } from '../i18n'

defineProps<{
  alwaysOnTop: boolean
  locale: Locale
  onToggleAlwaysOnTop: () => void | Promise<void>
  onMinimizeToTray: () => void
  onLocaleChange: (locale: Locale) => void | Promise<void>
  onClose: () => void
}>()
</script>

<template>
  <header class="header" data-tauri-drag-region>
    <h1 class="title">{{ $t('header.title', { appName: App.NAME }) }}</h1>
    <div class="header-actions">
      <select
        :value="locale"
        class="locale-select"
        aria-label="Language"
        @change="(e) => onLocaleChange((e.target as HTMLSelectElement).value as Locale)"
      >
        <option value="en">{{ $t('locale.en') }}</option>
        <option value="ru">{{ $t('locale.ru') }}</option>
      </select>
      <div class="header-buttons">
        <button
          type="button"
          class="pin-btn"
          :class="{ active: alwaysOnTop }"
          :aria-label="$t('header.alwaysOnTop')"
          :title="$t('header.alwaysOnTop')"
          @click="onToggleAlwaysOnTop"
        >
          📌
        </button>
        <button
          type="button"
          class="tray-btn"
          :aria-label="$t('header.minimizeToTray')"
          @click="onMinimizeToTray"
        >
          −
        </button>
        <button type="button" class="close-btn" :aria-label="$t('header.close')" @click="onClose">
          ×
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  @extend %flex, %items-center, %justify-between, %shrink;
  padding-block: 10px;
  padding-inline: var(--app-base-offset);
  background: var(--color-bg-surface);
  -webkit-app-region: drag;
  app-region: drag;

  .title {
    margin-block: 0;
    margin-inline: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .header-actions {
    @extend %flex, %items-center;
    gap: 8px;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .locale-select {
    @extend %pointer;
    padding-block: 4px;
    padding-inline: 8px;
    font-size: 12px;
    color: var(--color-text-primary);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }

  .header-buttons {
    @extend %flex, %items-center;
    gap: 4px;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .pin-btn {
    @extend %flex, %items-center, %justify-center, %pointer;
    width: 28px;
    height: 28px;
    border: 1px solid var(--color-border-transparent);
    border-radius: 6px;
    background: var(--color-bg-transparent);
    color: var(--color-text-muted);
    font-size: 14px;
    line-height: 1;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    &:hover {
      background: var(--color-button-hover-bg);
      color: var(--color-text-primary);
    }

    &.active {
      background: var(--color-accent-pin-bg);
      color: var(--color-accent);
      border-color: var(--color-accent);

      &:hover {
        background: var(--color-accent-pin-bg-hover);
        color: var(--color-accent-pin-text-hover);
      }
    }
  }

  .tray-btn {
    @extend %flex, %items-center, %justify-center, %pointer;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: var(--color-bg-transparent);
    color: var(--color-text-muted);
    font-size: 18px;
    line-height: 1;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--color-button-hover-bg);
      color: var(--color-text-primary);
    }
  }

  .close-btn {
    @extend %flex, %items-center, %justify-center, %pointer;
    -webkit-app-region: no-drag;
    app-region: no-drag;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: var(--color-bg-transparent);
    color: var(--color-text-muted);
    font-size: 20px;
    line-height: 1;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--color-button-hover-bg);
      color: var(--color-danger);
    }
  }
}
</style>
