<script setup lang="ts">
import { CONFIG_SOURCE } from '@shared/config'

const configPath = defineModel<string>('configPath', { required: true })
const remoteConfigUrl = defineModel<string>('remoteConfigUrl', { required: true })

defineProps<{
  configSource: typeof CONFIG_SOURCE.LOCAL | typeof CONFIG_SOURCE.REMOTE
  configPathValid: boolean
  configPathError: string
  remoteConfigUrlError: string
  refreshRemoteDisabled: boolean
  onInput: () => void
  onPickFile: () => void
  onConfigSourceLocal: () => void
  onConfigSourceRemote: () => void
  onRefreshRemote: () => void
}>()
</script>

<template>
  <div class="config-path-row">
    <label class="config-path-label">
      {{ $t('config.label') }}

      <span v-if="configSource === CONFIG_SOURCE.LOCAL && configPathError" class="config-path-error">
        -
        {{ configPathError }}
      </span>
      <span v-else-if="configSource === CONFIG_SOURCE.REMOTE && remoteConfigUrlError" class="config-path-error">
        -
        {{ remoteConfigUrlError }}
      </span>
    </label>

    <div class="config-path-tabs">
      <button
        type="button"
        class="tab"
        :class="{ active: configSource === CONFIG_SOURCE.LOCAL }"
        @click="onConfigSourceLocal"
      >
        {{ $t('config.local') }}
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: configSource === CONFIG_SOURCE.REMOTE }"
        @click="onConfigSourceRemote"
      >
        {{ $t('config.remote') }}
      </button>
    </div>

    <div class="config-path-input-row">
      <input
        v-if="configSource === CONFIG_SOURCE.LOCAL"
        v-model="configPath"
        type="text"
        class="config-path-input"
        :placeholder="$t('config.placeholder')"
        readonly
        @input="onInput"
      />
      <input
        v-else
        v-model="remoteConfigUrl"
        type="url"
        class="config-path-input"
        :class="{ valid: configSource === CONFIG_SOURCE.REMOTE && configPathValid }"
        :placeholder="$t('config.urlPlaceholder')"
      />

      <button
        v-if="configSource === CONFIG_SOURCE.LOCAL"
        type="button"
        class="config-path-browse"
        :aria-label="$t('config.browse')"
        @click="onPickFile"
      >
        {{ $t('config.browse') }}
      </button>
      <button
        v-else
        type="button"
        class="config-path-browse"
        :aria-label="$t('config.refresh')"
        :disabled="refreshRemoteDisabled"
        @click="onRefreshRemote"
      >
        {{ $t('config.refresh') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.config-path-row {
  @extend %flex, %flex-column, %shrink;
  gap: 6rem;
}

.config-path-label {
  font-size: 12rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.config-path-tabs {
  @extend %flex;
  gap: 4rem;
}

.tab {
  @extend %pointer;
  padding-block: 6rem;
  padding-inline: 12rem;
  font-size: 12rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-bg-elevated);
  border: 1rem solid var(--color-border);
  border-radius: 6rem;

  &.active {
    color: var(--color-text-inverse);
    background: var(--color-accent);
    border-color: var(--color-accent);
  }

  &:hover:not(.active) {
    background: var(--color-bg-hover, var(--color-bg-elevated));
  }
}

.config-path-input-row {
  @extend %flex, %items-center;
  gap: 8rem;
  user-select: auto;
}

.config-path-input {
  @extend %grow;
  min-width: 0;
  padding-block: 8rem;
  padding-inline: 10rem;
  font-size: 13rem;
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  border-radius: 6rem;
  border: 1rem solid var(--color-border);

  &::placeholder {
    color: var(--color-text-placeholder);
  }

  &.valid {
    border-color: var(--color-success);
  }
}

.config-path-browse {
  @extend %shrink;
  padding-block: 8rem;
  padding-inline: 12rem;
  font-size: 13rem;
  font-weight: 500;
  color: var(--color-text-inverse);
  background: var(--color-accent);
  border: none;
  border-radius: 6rem;
  min-width: 100rem;

  &:not(:disabled) {
    @extend %pointer;
  }

  &:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.config-path-error {
  margin-block: 0;
  margin-inline: 0;
  font-size: 12rem;
  color: var(--color-danger);
}
</style>
