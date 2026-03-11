<script setup lang="ts">
import { CONFIG_SOURCE } from '@shared/config'

const configPath = defineModel<string>('configPath', { required: true })
const remoteConfigUrl = defineModel<string>('remoteConfigUrl', { required: true })
const remoteConfigDraft = defineModel<string>('remoteConfigDraft', { required: true })

defineProps<{
  configSource: typeof CONFIG_SOURCE.LOCAL | typeof CONFIG_SOURCE.REMOTE
  configPathValid: boolean
  configPathError: string
  remoteConfigUrlError: string
  refreshRemoteDisabled: boolean
  isEditingRemote: boolean
}>()

const emit = defineEmits<{
  (e: 'input'): void
  (e: 'pickFile'): void
  (e: 'configSourceLocal'): void
  (e: 'configSourceRemote'): void
  (e: 'refreshRemote'): void
  (e: 'editRemote'): void
  (e: 'cancelRemote'): void
  (e: 'applyRemote'): void
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
      <button type="button" class="tab" :class="{ active: configSource === CONFIG_SOURCE.LOCAL }" @click="emit('configSourceLocal')">
        {{ $t('config.local') }}
      </button>
      <button type="button" class="tab" :class="{ active: configSource === CONFIG_SOURCE.REMOTE }" @click="emit('configSourceRemote')">
        {{ $t('config.remote') }}
      </button>
    </div>

    <div class="config-path-input-row">
      <template v-if="configSource === CONFIG_SOURCE.LOCAL">
        <input v-model="configPath" type="text" class="config-path-input" :placeholder="$t('config.placeholder')" readonly @input="emit('input')" />

        <button type="button" class="config-path-browse" :aria-label="$t('config.browse')" @click="emit('pickFile')">
          <span class="sr-only">
            {{ $t('config.browse') }}
          </span>

          <svg fill="none" width="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.027 9.92L16 13.95 14 16l-4.075-3.976A6.465 6.465 0 0 1 6.5 13C2.91 13 0 10.083 0 6.5 0 2.91 2.917 0 6.5 0 10.09 0 13 2.917 13 6.5a6.463 6.463 0 0 1-.973 3.42zM1.997 6.452c0 2.48 2.014 4.5 4.5 4.5 2.48 0 4.5-2.015 4.5-4.5 0-2.48-2.015-4.5-4.5-4.5-2.48 0-4.5 2.014-4.5 4.5z"
              fill="currentColor"
              fill-rule="evenodd"
            />
          </svg>
        </button>
      </template>

      <template v-else-if="configSource === CONFIG_SOURCE.REMOTE">
        <input
          v-if="!isEditingRemote"
          v-model="remoteConfigUrl"
          type="url"
          class="config-path-input"
          :class="{ valid: configPathValid }"
          :placeholder="$t('config.urlPlaceholder')"
          readonly
        />
        <input
          v-else
          v-model="remoteConfigDraft"
          type="url"
          class="config-path-input"
          :class="{ valid: configPathValid }"
          :placeholder="$t('config.urlPlaceholder')"
        />

        <template v-if="isEditingRemote">
          <button type="button" class="config-path-edit" :aria-label="$t('config.apply')" @click="emit('applyRemote')">
            <span class="sr-only">
              {{ $t('config.apply') }}
            </span>

            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9.5 16.5 5 12l1.5-1.5L9.5 13.5 17.5 5.5 19 7z" />
            </svg>
          </button>

          <button type="button" class="config-path-browse" :aria-label="$t('config.cancel')" @click="emit('cancelRemote')">
            <span class="sr-only">
              {{ $t('config.cancel') }}
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M7.05 7.05a1 1 0 0 1 1.4 0L12 10.59l3.55-3.54a1 1 0 1 1 1.4 1.4L13.41 12l3.54 3.55a1 1 0 0 1-1.4 1.4L12 13.41l-3.55 3.54a1 1 0 0 1-1.4-1.4L10.59 12 7.05 8.45a1 1 0 0 1 0-1.4z"
              />
            </svg>
          </button>
        </template>

        <template v-else>
          <button type="button" class="config-path-edit" :aria-label="$t('config.edit')" @click="emit('editRemote')">
            <span class="sr-only">
              {{ $t('config.edit') }}
            </span>

            <svg width="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="m3.99 16.854-1.314 3.504a.75.75 0 0 0 .966.965l3.503-1.314a3 3 0 0 0 1.068-.687L18.36 9.175s-.354-1.061-1.414-2.122c-1.06-1.06-2.122-1.414-2.122-1.414L4.677 15.786a3 3 0 0 0-.687 1.068zm12.249-12.63 1.383-1.383c.248-.248.579-.406.925-.348.487.08 1.232.322 1.934 1.025.703.703.945 1.447 1.025 1.934.058.346-.1.677-.348.925L19.774 7.76s-.353-1.06-1.414-2.12c-1.06-1.062-2.121-1.415-2.121-1.415z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            type="button"
            class="config-path-browse"
            :aria-label="$t('config.refresh')"
            :disabled="refreshRemoteDisabled"
            @click="emit('refreshRemote')"
          >
            <span class="sr-only">
              {{ $t('config.refresh') }}
            </span>

            <svg width="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C9.69494 21 7.59227 20.1334 6 18.7083L3 16M3 12C3 7.02944 7.02944 3 12 3C14.3051 3 16.4077 3.86656 18 5.29168L21 8M3 21V16M3 16H8M21 3V8M21 8H16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </template>
      </template>
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
  inline-size: 32rem;
  aspect-ratio: 1 / 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  background: var(--color-accent);
  border: none;
  border-radius: 6rem;

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

.config-path-edit {
  @extend .config-path-browse;
}

.sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.config-path-error {
  margin-block: 0;
  margin-inline: 0;
  font-size: 12rem;
  color: var(--color-danger);
}
</style>
