export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec >= 1024 * 1024) return (bytesPerSec / (1024 * 1024)).toFixed(2) + ' MB/s'
  if (bytesPerSec >= 1024) return (bytesPerSec / 1024).toFixed(2) + ' KB/s'
  return bytesPerSec.toFixed(0) + ' B/s'
}
