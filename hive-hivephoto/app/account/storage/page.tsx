'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { formatBytes, storagePercent, isStorageUnlimited } from '@/lib/pricing/storage'

interface StorageEvent {
  id: string
  eventType: string
  bytesDelta: number
  storageAfter: number
  createdAt: string
  photoId: string | null
}

export default function StoragePage() {
  const [data, setData] = useState<{
    usedBytes: string
    totalBytes: string
    tierName: string
    events: StorageEvent[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/storage/usage')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const used = data ? BigInt(data.usedBytes) : 0n
  const total = data ? BigInt(data.totalBytes) : BigInt(53687091200)
  const unlimited = isStorageUnlimited(total)
  const pct = unlimited ? 0 : storagePercent(used, total)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="text-zinc-400 hover:text-white text-sm">← Account</Link>
          <h1 className="text-2xl font-bold">Storage</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Storage used</span>
                <span className="font-semibold">
                  {formatBytes(used)} {unlimited ? '' : `/ ${formatBytes(total)}`}
                  {unlimited && '/ Unlimited'}
                </span>
              </div>
              {!unlimited && (
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                Plan: {data?.tierName ?? 'free'}
              </p>
            </div>

            {data?.events && data.events.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Recent Storage Events</h2>
                <div className="space-y-2">
                  {data.events.map((event) => (
                    <div key={event.id} className="bg-zinc-900 rounded-lg p-3 flex items-center justify-between text-sm border border-zinc-800">
                      <div>
                        <span className="font-medium capitalize">{event.eventType}</span>
                        <span className="text-zinc-500 ml-2 text-xs">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={event.bytesDelta > 0 ? 'text-amber-400' : 'text-green-400'}>
                        {event.bytesDelta > 0 ? '+' : ''}{formatBytes(event.bytesDelta)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
