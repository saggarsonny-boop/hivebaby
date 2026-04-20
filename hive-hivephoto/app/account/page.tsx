'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { StorageBar } from '@/components/pricing/StorageBar'
import { Footer } from '@/components/layout/Footer'
import type { PricingTier } from '@/lib/pricing/tiers'

export default function AccountPage() {
  const [tier, setTier] = useState<PricingTier | null>(null)
  const [storageUsed, setStorageUsed] = useState<bigint>(0n)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subscription')
      .then((r) => r.json())
      .then((data: { tier: PricingTier; storageUsed: string }) => {
        setTier(data.tier)
        setStorageUsed(BigInt(data.storageUsed ?? '0'))
      })
      .finally(() => setLoading(false))
  }, [])

  const tierLabel = tier?.displayName ?? 'Free'
  const isFounding = tier?.isFounding

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Account</h1>

        <div className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Current plan</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{tierLabel}</span>
                {isFounding && (
                  <span className="bg-amber-400 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    Founding
                  </span>
                )}
              </div>
            </div>
            <Link
              href="/pricing"
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Upgrade
            </Link>
          </div>
          <StorageBar />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/account/billing"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors"
          >
            <p className="font-semibold mb-1">Billing</p>
            <p className="text-zinc-400 text-sm">Manage subscription & invoices</p>
          </Link>
          <Link
            href="/account/storage"
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors"
          >
            <p className="font-semibold mb-1">Storage</p>
            <p className="text-zinc-400 text-sm">View storage usage & events</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
