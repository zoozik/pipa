<script setup lang="ts">
import { App } from '@shared/app'
import type { Locale } from '../i18n'

const props = defineProps<{
  alwaysOnTop: boolean
  locale: Locale
}>()

const emit = defineEmits<{
  (e: 'toggleAlwaysOnTop'): void
  (e: 'minimizeToTray'): void
  (e: 'localeChange', locale: Locale): void
  (e: 'close'): void
}>()
</script>

<template>
  <header class="header" data-tauri-drag-region>
    <h1 class="title">{{ $t('header.title', { appName: App.NAME }) }}</h1>
    <div class="header-actions">
      <select
        :value="props.locale"
        class="locale-select"
        aria-label="Language"
        @change="(e) => emit('localeChange', (e.target as HTMLSelectElement).value as Locale)"
      >
        <option value="en">{{ $t('locale.en') }}</option>
        <option value="ru">{{ $t('locale.ru') }}</option>
      </select>
      <div class="header-buttons">
        <button
          type="button"
          class="pin-btn"
          :class="{ active: props.alwaysOnTop }"
          :aria-label="$t('header.alwaysOnTop')"
          :title="$t('header.alwaysOnTop')"
          @click="emit('toggleAlwaysOnTop')"
        >
          📌
        </button>
        <button type="button" class="tray-btn" :aria-label="$t('header.minimizeToTray')" @click="emit('minimizeToTray')">
          −
        </button>
        <button type="button" class="close-btn" :aria-label="$t('header.close')" @click="emit('close')">×</button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  @extend %flex, %items-center, %justify-between, %shrink;
  padding-block: 10rem;
  padding-inline: var(--app-base-offset);
  background: var(--color-bg-surface);
  -webkit-app-region: drag;
  app-region: drag;

  .title {
    margin-block: 0;
    margin-inline: 0;
    font-size: 14rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .header-actions {
    @extend %flex, %items-center;
    gap: 8rem;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .locale-select {
    @extend %pointer;
    padding-block: 4rem;
    padding-inline: 8rem;
    font-size: 12rem;
    color: var(--color-text-primary);
    background: var(--color-bg-elevated);
    border: 1rem solid var(--color-border);
    border-radius: 6rem;
  }

  .header-buttons {
    @extend %flex, %items-center;
    gap: 4rem;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .pin-btn {
    @extend %flex, %items-center, %justify-center, %pointer;
    width: 28rem;
    height: 28rem;
    border: 1rem solid var(--color-border-transparent);
    border-radius: 6rem;
    background: var(--color-bg-transparent);
    color: var(--color-text-muted);
    font-size: 14rem;
    line-height: 1;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;

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
    width: 28rem;
    height: 28rem;
    border: none;
    border-radius: 6rem;
    background: var(--color-bg-transparent);
    color: var(--color-text-muted);
    font-size: 18rem;
    line-height: 1;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-button-hover-bg);
      color: var(--color-text-primary);
    }
  }

  .close-btn {
    @extend %flex, %items-center, %justify-center, %pointer;
    -webkit-app-region: no-drag;
    app-region: no-drag;
    width: 28rem;
    height: 28rem;
    border: none;
    border-radius: 6rem;
    background: var(--color-bg-transparent);
    color: var(--color-text-muted);
    font-size: 20rem;
    line-height: 1;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--color-button-hover-bg);
      color: var(--color-danger);
    }
  }
}
</style>
