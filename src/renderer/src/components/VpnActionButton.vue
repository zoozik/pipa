<script setup lang="ts">
import logoUrl from '@logo'

defineProps<{
  running: boolean
  disabled: boolean
  onToggle: () => void
}>()
</script>

<template>
  <button type="button" class="action-btn" :class="{ running }" :disabled="disabled" @click="onToggle">
    <img :src="logoUrl" alt="" class="action-btn-logo" />

    <div class="text">
      {{ running ? $t('vpn.disconnect') : $t('vpn.connect') }}
    </div>
  </button>
</template>

<style lang="scss" scoped>
.action-btn {
  @extend %pointer, %shrink, %flex, %flex-column, %items-center, %justify-center;
  gap: 2rem;
  padding-block: 10rem;
  padding-inline: 24rem;
  background: transparent;
  border: none;
  width: 40%;
  aspect-ratio: 1/1;
  margin-block: auto;
  margin-inline: auto;
  border-radius: 50%;

  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(-45deg, transparent 35%, #fff 45%, #fff 55%, transparent 65%);
    z-index: 3;
    translate: -100% -100%;
    animation: wale 3s ease infinite;
    mix-blend-mode: overlay;
    display: none;
  }

  @keyframes wale {
    15% {
      translate: -100% -100%;
    }
    50%,
    60% {
      translate: 100% 100%;
    }
  }

  .text {
    @extend %w-full;
    @extend %flex;
    @extend %items-center;
    @extend %justify-center;
    position: absolute;
    inset-inline-start: 50%;
    min-height: 32rem;
    inset-block-end: 25%;
    translate: -50% 0;
    background: hsl(from var(--color-text-inverse) h s l / 75%);
    backdrop-filter: blur(3rem);
    border-radius: 8rem;
    padding: 8rem 12rem;
    font-size: 14rem;
    line-height: 1;
    font-weight: 500;
    color: var(--color-text-app);
    text-transform: uppercase;
    text-shadow: 1rem 1rem 0rem var(--color-text-inverse);
  }

  .action-btn-logo {
    @extend %block, %shrink;
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: contain;
    transition:
      filter 0.5s ease,
      scale 0.1s ease-out;
  }

  &:hover {
    .action-btn-logo {
      scale: 0.96 0.96;
    }
  }

  &:active {
    .action-btn-logo {
      scale: 0.92 0.92;
    }
  }

  &:disabled {
    cursor: not-allowed;

    .action-btn-logo {
      filter: hue-rotate(135deg) grayscale(0.2) brightness(1.2);
    }
  }

  &.running {
    .action-btn-logo {
      filter: hue-rotate(285deg) contrast(0.9) brightness(1.4);
    }

    &::before {
      display: block;
    }

    .text {
      display: none;
    }
  }
}
</style>
