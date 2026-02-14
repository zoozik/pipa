<script setup lang="ts">
import type { LogEntry } from '../composables/useVpn'

const props = defineProps<{
  logLines: LogEntry[]
  onContainerRef?: (el: HTMLElement | null) => void
}>()

function setContainerRef(el: unknown) {
  props.onContainerRef?.(el as HTMLElement | null)
}
</script>

<template>
  <div class="log-block" :ref="setContainerRef">
    <div class="log-content">
      <div
        v-for="(entry, i) in logLines"
        :key="i"
        class="log-line"
        :class="entry.stream"
      >
        {{ entry.text }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.log-block {
  @extend %grow;
  min-height: 160px;
  background: var(--color-bg-dark);
  border-radius: 8px;
  overflow-y: auto;
  padding-block: 10px;
  padding-inline: 10px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.45;
  user-select: text;
}

.log-content {
  @extend %flex, %flex-column;
  gap: 2px;
}

.log-line {
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--color-text-muted);

  &.stderr {
    color: var(--color-warning);
  }
}
</style>
