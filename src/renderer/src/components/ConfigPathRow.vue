<script setup lang="ts">
const configPath = defineModel<string>('configPath', { required: true })
defineProps<{
  configPathError: string
  onInput: () => void
  onPickFile: () => void
}>()
</script>

<template>
  <div class="config-path-row">
    <label class="config-path-label">
      {{ $t('config.label') }}

      <span v-if="configPathError" class="config-path-error">
        -
        {{ configPathError }}
      </span>
    </label>

    <div class="config-path-input-row">
      <input v-model="configPath" type="text" class="config-path-input" :placeholder="$t('config.placeholder')" readonly @input="onInput" />
      <button type="button" class="config-path-browse" :aria-label="$t('config.browse')" @click="onPickFile">
        {{ $t('config.browse') }}
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
}

.config-path-browse {
  @extend %pointer, %shrink;
  padding-block: 8rem;
  padding-inline: 12rem;
  font-size: 13rem;
  font-weight: 500;
  color: var(--color-text-inverse);
  background: var(--color-accent);
  border: none;
  border-radius: 6rem;
  min-width: 100rem;

  &:hover {
    background: var(--color-accent-hover);
  }
}

.config-path-error {
  margin-block: 0;
  margin-inline: 0;
  font-size: 12rem;
  color: var(--color-danger);
}
</style>
