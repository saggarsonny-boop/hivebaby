'use client'
import { useEffect, useState } from 'react'
import { formatBytes, storagePercent, isStorageUnlimited } from '@/lib/pricing/storage'
import Link from 'next/link'

export function StorageBar() {
  const [data, setData] = useState<{ usedBytes: string; totalBytes: string } | null>(null)

  useEffect(() => {
    fetch('/api/storage/usage')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
  }, [])

  if (!data) return null

  const used = BigInt(data.usedBytes)
  const total = BigInt(data.totalBytes)
  const unlimited = isStorageUnlimited(total)
  const pct = unlimited ? 0 : storagePercent(used, total)
  const nearLimit = !unlimited && pct >= 80

  return (
    <div className="text-sm">
      <div className="flex justify-between text-zinc-400 mb-1.5">
        <span>Storage</span>
        <span>
          {formatBytes(used)}
          {unlimited ? ' / Unlimited' : ` / ${formatBytes(total)}`}
        </span>
      </div>
      {!unlimited && (
        <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${nearLimit ? 'bg-red-500' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {nearLimit && (
        <p className="text-xs text-red-400">
          Storage nearly full.{' '}
          <Link href="/pricing" className="underline hover:text-red-300">
            Upgrade
          </Link>
        </p>
      )}
    </div>
  )
}
