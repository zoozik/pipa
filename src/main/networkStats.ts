import si from 'systeminformation'

export type NetworkStatsPayload = {
  totalDownload: number
  totalUpload: number
}

export type SendNetworkStats = (payload: NetworkStatsPayload) => void

let interval: ReturnType<typeof setInterval> | null = null
let lastTotalRx = 0
let lastTotalTx = 0
let lastStatsTime = 0

async function poll(send: SendNetworkStats): Promise<void> {
  try {
    const stats = await si.networkStats('*')
    let totalRx = 0
    let totalTx = 0

    for (const s of stats) {
      totalRx += s.rx_bytes ?? 0
      totalTx += s.tx_bytes ?? 0
    }

    const now = Date.now()
    const elapsed = lastStatsTime > 0 ? (now - lastStatsTime) / 1000 : 1

    const totalDownload =
      lastStatsTime > 0 ? Math.max(0, (totalRx - lastTotalRx) / elapsed) : 0
    const totalUpload =
      lastStatsTime > 0 ? Math.max(0, (totalTx - lastTotalTx) / elapsed) : 0

    lastTotalRx = totalRx
    lastTotalTx = totalTx
    lastStatsTime = now

    send({ totalDownload, totalUpload })
  } catch {
    send({ totalDownload: 0, totalUpload: 0 })
  }
}

export function startNetworkStatsPolling(send: SendNetworkStats) {
  lastTotalRx = 0
  lastTotalTx = 0
  lastStatsTime = 0
  stopNetworkStatsPolling()
  interval = setInterval(() => void poll(send), 1000)
  void poll(send)
}

export function stopNetworkStatsPolling() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}
