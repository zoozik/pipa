<script setup lang="ts">
const configPath = defineModel<string>('configPath', { required: true })
defineProps<{
  configPathError: string;
  onInput: () => void;
  onPickFile: () => void;
}>();
</script>

<template>
  <div class="config-path-row">
    <label class="config-path-label">{{ $t('config.label') }}</label>
    <div class="config-path-input-row">
      <input
        v-model="configPath"
        type="text"
        class="config-path-input"
        :placeholder="$t('config.placeholder')"
        @input="onInput"
        readonly
      />
      <button
        type="button"
        class="config-path-browse"
        :aria-label="$t('config.browse')"
        @click="onPickFile"
      >
        {{ $t('config.browse') }}
      </button>
    </div>
    <p v-if="configPathError" class="config-path-error">
      {{ configPathError }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.config-path-row {
  @extend %flex, %flex-column, %shrink;
  gap: 6px;
}

.config-path-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.config-path-input-row {
  @extend %flex, %items-center;
  gap: 8px;
  user-select: auto;
}

.config-path-input {
  @extend %grow;
  min-width: 0;
  padding-block: 8px;
  padding-inline: 10px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  border-radius: 6px;
  border: 1px solid var(--color-border);

  &::placeholder {
    color: var(--color-text-placeholder);
  }
}

.config-path-browse {
  @extend %pointer, %shrink;
  padding-block: 8px;
  padding-inline: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-inverse);
  background: var(--color-accent);
  border: none;
  border-radius: 6px;
  min-width: 100px;

  &:hover {
    background: var(--color-accent-hover);
  }
}

.config-path-error {
  margin-block: 0;
  margin-inline: 0;
  font-size: 12px;
  color: var(--color-danger);
}
</style>
