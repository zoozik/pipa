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
  gap: 4rem;
  background: linear-gradient(to top, var(--color-chart-bg-start) 0%, var(--color-chart-bg-mid) 50%, var(--color-chart-bg-end) 100%);
  border-radius: 8rem;
  padding-block-start: 10rem;
  padding-block-end: 0;
  padding-inline: 10rem;
}

.chart-top {
  @extend %shrink, %flex, %items-center;
  gap: 8rem;

  .chart-outbound {
    font-size: 12rem;
    font-weight: 500;
    text-transform: uppercase;
  }

  .chart-speeds {
    @extend %flex, %flex-wrap;
    margin-inline-start: auto;
    gap: 12rem 16rem;
    font-size: 12rem;
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
  height: 150rem;
  position: relative;

  canvas {
    @extend %block;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
