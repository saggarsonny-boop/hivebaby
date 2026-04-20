'use client'
import { useEffect, useState } from 'react'
import { TierCard } from './TierCard'
import type { PricingTier } from '@/lib/pricing/tiers'

// Display order: free, founding_patron_monthly, patron_monthly, founding_sovereign_monthly, sovereign_monthly
const DISPLAY_TIERS = [
  'free',
  'founding_patron_monthly',
  'patron_monthly',
  'founding_sovereign_monthly',
  'sovereign_monthly',
]

export function PricingTable() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [currentTierName, setCurrentTierName] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/pricing').then((r) => r.json()),
      fetch('/api/subscription').then((r) => r.json()).catch(() => ({ tier: null })),
    ]).then(([pricingData, subData]: [{ tiers: PricingTier[] }, { tier: PricingTier | null }]) => {
      setTiers(pricingData.tiers ?? [])
      if (subData.tier?.name) setCurrentTierName(subData.tier.name)
    }).finally(() => setLoading(false))
  }, [])

  async function handleUpgrade(tier: PricingTier) {
    if (!tier.stripePriceId) return
    setUpgrading(tier.id)
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: tier.id }),
      })
      const data = (await res.json()) as { url: string }
      if (data.url) window.location.href = data.url
    } finally {
      setUpgrading(null)
    }
  }

  const displayTiers = DISPLAY_TIERS
    .map((name) => tiers.find((t) => t.name === name))
    .filter((t): t is PricingTier => t != null)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:grid-cols-5">
      {displayTiers.map((tier) => (
        <TierCard
          key={tier.id}
          tier={tier}
          isCurrent={tier.name === currentTierName}
          onUpgrade={() => handleUpgrade(tier)}
          upgrading={upgrading === tier.id}
        />
      ))}
    </div>
  )
}
