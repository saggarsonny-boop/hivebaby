'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import type { PricingTier } from '@/lib/pricing/tiers'

export default function BillingPage() {
  const [tier, setTier] = useState<PricingTier | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    fetch('/api/subscription')
      .then((r) => r.json())
      .then((data: { tier: PricingTier }) => setTier(data.tier))
      .finally(() => setLoading(false))
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' })
      const data = (await res.json()) as { url: string }
      if (data.url) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  async function cancelSubscription() {
    if (!confirm('Cancel your subscription? You keep access until the end of the billing period.')) return
    setCancelLoading(true)
    try {
      await fetch('/api/subscription/cancel', { method: 'POST' })
      alert('Subscription will cancel at end of billing period.')
    } finally {
      setCancelLoading(false)
    }
  }

  const isFree = !tier || tier.name === 'free'

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="text-zinc-400 hover:text-white text-sm">← Account</Link>
          <h1 className="text-2xl font-bold">Billing</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="mb-6">
              <p className="text-sm text-zinc-400 mb-1">Current plan</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{tier?.displayName ?? 'Free'}</span>
                {tier?.isFounding && (
                  <span className="bg-amber-400 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    Founding
                  </span>
                )}
              </div>
              {!isFree && tier?.priceCents && (
                <p className="text-zinc-400 text-sm mt-1">
                  ${(tier.priceCents / 100).toFixed(2)}/{tier.priceInterval ?? 'mo'}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {isFree ? (
                <Link
                  href="/pricing"
                  className="bg-amber-400 hover:bg-amber-300 text-zinc-950 py-3 rounded-lg text-sm font-semibold text-center transition-colors"
                >
                  Upgrade Plan
                </Link>
              ) : (
                <>
                  <button
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="bg-amber-400 hover:bg-amber-300 text-zinc-950 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {portalLoading ? 'Loading...' : 'Manage Billing & Invoices'}
                  </button>
                  <button
                    onClick={cancelSubscription}
                    disabled={cancelLoading}
                    className="border border-zinc-600 hover:border-red-500 text-zinc-400 hover:text-red-400 py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {cancelLoading ? 'Loading...' : 'Cancel Subscription'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
