<script setup lang="ts">
import { onMounted } from 'vue'
import { useTrafficChart } from '../composables/useTrafficChart'

defineProps<{ currentOutbound?: string }>()

const { chartCanvas, totalDownload, totalUpload, formatSpeed, subscribeNetworkStats, initChart } = useTrafficChart()

onMounted(() => {
  subscribeNetworkStats()
  initChart()
})
</script>

<template>
  <div class="chart-block">
    <div class="chart-top">
      <div class="chart-outbound">
        {{ currentOutbound }}
      </div>

      <div class="chart-speeds">
        <span class="speed download">↓ {{ formatSpeed(totalDownload) }}</span>
        <span class="speed upload">↑ {{ formatSpeed(totalUpload) }}</span>
      </div>
    </div>

    <div class="chart-wrap">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-block {
  @extend %shrink, %flex, %flex-column;
  gap: 4px;
  background: linear-gradient(to top, var(--color-chart-bg-start) 0%, var(--color-chart-bg-mid) 50%, var(--color-chart-bg-end) 100%);
  border-radius: 8px;
  padding-block-start: 10px;
  padding-block-end: 0;
  padding-inline: 10px;
}

.chart-top {
  @extend %shrink, %flex, %items-center;
  gap: 8px;

  .chart-outbound {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .chart-speeds {
    @extend %flex, %flex-wrap;
    margin-inline-start: auto;
    gap: 12px 16px;
    font-size: 12px;
    font-weight: 500;

    .speed.download {
      color: var(--color-chart-download);
    }
    .speed.upload {
      color: var(--color-chart-upload);
    }
  }
}

.chart-wrap {
  height: 150px;
  position: relative;

  canvas {
    @extend %block;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
