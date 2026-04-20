export function formatBytes(bytes: bigint | number): string {
  const n = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (n < 0) return 'Unlimited'
  if (n === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(n) / Math.log(1024))
  const val = n / Math.pow(1024, i)
  return `${val.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

export function storagePercent(used: bigint, total: bigint): number {
  if (total < 0n) return 0 // unlimited
  if (total === 0n) return 100
  return Math.min(100, Math.round((Number(used) / Number(total)) * 100))
}

export function isStorageUnlimited(storageBytes: bigint): boolean {
  return storageBytes < 0n
}
