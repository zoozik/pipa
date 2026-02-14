const MB = 1024 * 1024
const GB = 1024 * 1024 * 1024

export type FormatSpeedOptions = {
  /** Default 2. */
  minFractionDigits?: number
  /** Default 2 (hundredths). Set to undefined/null to not limit fraction digits. */
  maxFractionDigits?: number | null
  /** If provided, used to format the number (e.g. i18n n()). Receives value, minFractionDigits, maxFractionDigits. */
  formatNumber?: (value: number, minFractionDigits: number, maxFractionDigits: number) => string
  /** Unit for MB/s (e.g. from t('chart.speedMb')). */
  unitMb?: string
  /** Unit for GB/s (e.g. from t('chart.speedGb')). */
  unitGb?: string
}

const defaultUnitMb = ' MB/s'
const defaultUnitGb = ' GB/s'

function roundToHundredths(value: number): number {
  return Math.round(value * 100) / 100
}

export function formatSpeed(bytesPerSec: number, options?: FormatSpeedOptions): string {
  const minFd = options?.minFractionDigits ?? 2
  const maxFd = options?.maxFractionDigits ?? 2
  const effectiveMaxFd = maxFd == null ? 20 : maxFd
  const unitMb = options?.unitMb ?? defaultUnitMb
  const unitGb = options?.unitGb ?? defaultUnitGb

  let value: number
  let unit: string
  if (bytesPerSec >= GB) {
    value = roundToHundredths(bytesPerSec / GB)
    unit = unitGb
  } else {
    value = roundToHundredths(bytesPerSec / MB)
    unit = unitMb
  }

  const formatted =
    options?.formatNumber != null
      ? options.formatNumber(value, minFd, effectiveMaxFd)
      : value.toFixed(Math.max(minFd, effectiveMaxFd))
  return formatted + (unit.startsWith(' ') ? unit : ' ' + unit)
}
