<script setup lang="ts">
import logoUrl from '@logo';

defineProps<{
  running: boolean;
  disabled: boolean;
  onToggle: () => void;
}>();
</script>

<template>
  <button type="button" class="action-btn" :class="{ running }" :disabled="disabled" @click="onToggle">
    <img :src="logoUrl" alt="" class="action-btn-logo" />
    <!-- {{ running ? $t('vpn.disconnect') : $t('vpn.connect') }} -->
  </button>
</template>

<style lang="scss" scoped>
.action-btn {
  @extend %pointer, %shrink, %flex, %items-center, %justify-center;
  gap: 8px;
  padding-block: 10px;
  padding-inline: 24px;
  font-size: 15px;
  font-weight: 600;
  background: transparent;
  border: none;
  aspect-ratio: 1/1;
  border-radius: 50%;
  width: 40%;
  margin-block: auto;
  margin-inline: auto;
  transition: filter 0.5s ease;

  .action-btn-logo {
    @extend %block, %shrink;
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: contain;
  }

  &:hover {
  }

  &:active {
    scale: 0.98 0.98;
  }

  &:disabled {
    cursor: not-allowed;
    filter: hue-rotate(135deg) grayscale(0.2) brightness(1.2);
  }

  &.running {
    filter: hue-rotate(285deg) contrast(0.9) brightness(1.4);
  }
}
</style>
