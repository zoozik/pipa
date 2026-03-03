<script setup lang="ts">
const props = defineProps<{
  autoStartVpn: boolean
  launchAtLogin: boolean
}>()

const emit = defineEmits<{
  (e: 'autoStartVpnChange', checked: boolean): void
  (e: 'launchAtLoginChange', checked: boolean): void
}>()
</script>

<template>
  <div class="checkboxes">
    <label class="checkbox-row">
      <input
        type="checkbox"
        :checked="props.autoStartVpn"
        @change="(e) => emit('autoStartVpnChange', (e.target as HTMLInputElement).checked)"
      />
      <span>{{ $t('settings.autoStartVpn') }}</span>
    </label>
    <label class="checkbox-row">
      <input
        type="checkbox"
        :checked="props.launchAtLogin"
        @change="(e) => emit('launchAtLoginChange', (e.target as HTMLInputElement).checked)"
      />
      <span>{{ $t('settings.launchAtLogin') }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.checkboxes {
  @extend %flex, %flex-column, %shrink;
  gap: 10rem;
}

.checkbox-row {
  @extend %flex, %items-center, %pointer;
  gap: 10rem;
  font-size: 13rem;
  color: var(--color-text-primary);
  user-select: none;

  input[type='checkbox'] {
    @extend %pointer;
    width: 18rem;
    height: 18rem;
    accent-color: var(--color-accent);

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}
</style>
