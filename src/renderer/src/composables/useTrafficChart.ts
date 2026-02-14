import { ref, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { formatSpeed } from '../utils/formatSpeed'

Chart.register(...registerables);

const MAX_POINTS = 60;

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${day}.${month}.${year} ${h}:${m}:${s}`;
}

export type NetworkStatsPayload = {
  totalDownload: number;
  totalUpload: number;
};

export function useTrafficChart() {
  const { t, locale } = useI18n();
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  const totalDownload = ref(0);
  const totalUpload = ref(0);
  const totalDownloadSpeeds = ref<number[]>([]);
  const totalUploadSpeeds = ref<number[]>([]);
  const totalTimestamps = ref<number[]>([]);
  let chartInstance: Chart | null = null;

  function subscribeNetworkStats() {
    window.vpn.onNetworkStats((payload: NetworkStatsPayload) => {
      totalDownload.value = payload.totalDownload;
      totalUpload.value = payload.totalUpload;
      const now = Date.now();
      totalDownloadSpeeds.value = [
        ...totalDownloadSpeeds.value,
        payload.totalDownload,
      ].slice(-MAX_POINTS);
      totalUploadSpeeds.value = [
        ...totalUploadSpeeds.value,
        payload.totalUpload,
      ].slice(-MAX_POINTS);
      totalTimestamps.value = [...totalTimestamps.value, now].slice(-MAX_POINTS);
      if (chartInstance?.data?.labels && chartInstance?.data?.datasets) {
        chartInstance.data.labels = totalTimestamps.value.map(formatDateTime);
        (chartInstance.data.datasets[0] as { data: number[] }).data =
          totalDownloadSpeeds.value;
        (chartInstance.data.datasets[1] as { data: number[] }).data =
          totalUploadSpeeds.value;
        chartInstance.update('none')
      }
    });
  }

  function getCssVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || ''
  }

  function initChart() {
    nextTick(() => {
      if (!chartCanvas.value) return;
      const chartDownload = getCssVar('--color-chart-download') || '#a6e3a1'
      const chartDownloadFill = getCssVar('--color-chart-download-fill') || 'rgba(166, 227, 161, 0.1)'
      const chartUpload = getCssVar('--color-chart-upload') || '#f38ba8'
      const chartUploadFill = getCssVar('--color-chart-upload-fill') || 'rgba(243, 139, 168, 0.1)'
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: t('chart.download'),
              data: [],
              borderColor: chartDownload,
              backgroundColor: chartDownloadFill,
              fill: true,
              tension: 0.3,
              borderWidth: 1,
              pointRadius: 2,
              pointBorderWidth: 0,
              pointBackgroundColor: chartDownload,
            },
            {
              label: t('chart.upload'),
              data: [],
              borderColor: chartUpload,
              backgroundColor: chartUploadFill,
              fill: true,
              tension: 0.3,
              borderWidth: 1,
              pointRadius: 2,
              pointBorderWidth: 0,
              pointBackgroundColor: chartUpload,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          layout: { padding: { top: 2, bottom: 0, left: 0, right: 0 } },
          scales: {
            x: { display: false },
            y: {
              beginAtZero: true,
              ticks: {
                callback: (v) => (typeof v === 'number' ? formatSpeed(v) : v),
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed?.y;
                  if (typeof value === 'number') {
                    return `${context.dataset.label}: ${formatSpeed(value)}`;
                  }
                  return String(context.formattedValue ?? value);
                },
              },
            },
          },
        },
      });
    });
  }

  watch(locale, () => {
    if (chartInstance?.data?.datasets?.length === 2) {
      chartInstance.data.datasets[0].label = t('chart.download')
      chartInstance.data.datasets[1].label = t('chart.upload')
      chartInstance.update('none')
    }
  });

  return {
    chartCanvas,
    totalDownload,
    totalUpload,
    formatSpeed,
    subscribeNetworkStats,
    initChart,
  };
}
