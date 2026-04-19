export const GB = 1024 * 1024 * 1024
export const TB = 1024 * GB

export const STORAGE_LIMITS = {
  free: 50 * GB,
  patron: 2 * TB,
  sovereign: -1,
} as const

export function canUpload(storageUsedBytes: number, storageLimitBytes: number, newBytes: number): boolean {
  if (storageLimitBytes === -1) return true
  return storageUsedBytes + newBytes <= storageLimitBytes
}

export function formatBytes(bytes: number): string {
  if (bytes === -1) return 'Unlimited'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let value = bytes
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toFixed(i >= 2 ? 1 : 0)} ${units[i]}`
}
