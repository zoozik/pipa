import { ref, nextTick } from 'vue';

export interface LogEntry {
  text: string;
  stream: string;
}

export function useVpn() {
  const vpnRunning = ref(false);
  const logLines = ref<LogEntry[]>([]);
  const currentOutbound = ref<string>();
  const logContainer = ref<HTMLElement | null>(null);

  function appendLog(line: string, stream: string) {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parts = trimmed.split('\n');
    parts.forEach((p) => {
      if (p) {
        logLines.value.push({ text: p, stream });
        logLines.value = logLines.value.slice(-100);
      }
    });

    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  }

  function detectOutbound(line: string, stream: string) {
    const trimmed = line.trim();

    if (!trimmed) return;

    const match = trimmed.match(/.+outbound\/(.+)\[(.+)\]/);

    if (!match) return;

    if (['direct', 'urltest'].includes(match[1])) return;

    const result = `${match[1]} [${match[2]}]`;

    if (currentOutbound.value === result) return;

    currentOutbound.value = result
  }

  async function initStatus() {
    const r = await window.vpn.getStatus();
    vpnRunning.value = r.running;
  }

  async function toggleVpn() {
    if (vpnRunning.value) {
      await window.vpn.stop();
    } else {
      await window.vpn.start();
    }
  }

  function subscribeVpnEvents() {
    window.vpn.onStatus((payload: { running: boolean; error?: string }) => {
      vpnRunning.value = payload.running;
      if (payload.error) appendLog(payload.error, 'stderr');
    });
    window.vpn.onLog((payload: { line: string; stream: string }) => {
      appendLog(payload.line, payload.stream);
      detectOutbound(payload.line, payload.stream);
    });
  }

  return {
    vpnRunning,
    logLines,
    currentOutbound,
    logContainer,
    appendLog,
    detectOutbound,
    initStatus,
    toggleVpn,
    subscribeVpnEvents,
  };
}
