<script setup lang="ts">
import { APP_VERSION } from '@renderer/version'
import { useUpdater } from '@renderer/composables/useUpdater'

const { pendingVersion, quitAndInstall } = useUpdater()
</script>

<template>
  <div class="footer">
    <span class="version">v{{ APP_VERSION }}</span>

    <template v-if="pendingVersion">
      <span class="separator">→</span>

      <button type="button" class="version-link" @click="quitAndInstall">
        {{ $t('update.to', { version: `v${pendingVersion}` }) }}
      </button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.footer {
  @extend %flex, %items-center, %justify-center, %shrink;
  gap: 6rem;
  color: var(--color-text-muted);
  font-size: 12rem;
}

.version {
  user-select: none;
}

.separator {
  opacity: 0.7;
}

.version-link {
  @extend %pointer;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-accent);
  font-size: inherit;
  font-family: inherit;
  text-decoration: underline;
  text-underline-offset: 2rem;

  &:hover {
    color: var(--color-accent-hover, var(--color-accent));
    text-decoration: none;
  }
}
</style>
