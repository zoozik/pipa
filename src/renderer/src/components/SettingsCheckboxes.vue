<script setup lang="ts">
defineProps<{
  autoStartVpn: boolean
  launchAtLogin: boolean
  onAutoStartVpnChange: (checked: boolean) => void
  onLaunchAtLoginChange: (checked: boolean) => void
}>()
</script>

<template>
  <div class="checkboxes">
    <label class="checkbox-row">
      <input type="checkbox" :checked="autoStartVpn" @change="(e) => onAutoStartVpnChange((e.target as HTMLInputElement).checked)" />
      <span>{{ $t('settings.autoStartVpn') }}</span>
    </label>
    <label class="checkbox-row">
      <input type="checkbox" :checked="launchAtLogin" @change="(e) => onLaunchAtLoginChange((e.target as HTMLInputElement).checked)" />
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
