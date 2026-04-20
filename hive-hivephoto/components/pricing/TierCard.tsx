'use client'
import { FoundingBadge } from './FoundingBadge'
import { FeatureList } from './FeatureList'
import { formatBytes, isStorageUnlimited } from '@/lib/pricing/storage'
import { getFeatureList } from '@/lib/pricing/features'
import type { PricingTier } from '@/lib/pricing/tiers'

interface Props {
  tier: PricingTier
  isCurrent: boolean
  onUpgrade: () => void
  upgrading: boolean
}

export function TierCard({ tier, isCurrent, onUpgrade, upgrading }: Props) {
  const isFree = tier.name === 'free'
  const storage = isStorageUnlimited(tier.storageBytes) ? 'Unlimited' : formatBytes(tier.storageBytes)
  const priceDisplay = isFree
    ? 'Free'
    : `$${(tier.priceCents / 100).toFixed(2)}/${tier.priceInterval === 'year' ? 'yr' : 'mo'}`

  const features = getFeatureList(tier.name)
  const foundingSlotsLeft = tier.isFounding && tier.foundingSlotsTotal
    ? tier.foundingSlotsTotal - tier.foundingSlotsUsed
    : null

  return (
    <div className={`relative bg-zinc-900 rounded-2xl p-6 flex flex-col border ${
      isCurrent
        ? 'border-amber-400 ring-1 ring-amber-400/30'
        : 'border-zinc-800 hover:border-zinc-700'
    } transition-colors`}>
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">
            Current plan
          </span>
        </div>
      )}

      {tier.isFounding && <FoundingBadge tier={tier} />}

      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1">{tier.displayName}</h3>
        <div className="text-3xl font-black mb-1">{priceDisplay}</div>
        {tier.priceInterval === 'year' && (
          <p className="text-xs text-zinc-500">
            ${((tier.priceCents / 100) / 12).toFixed(2)}/mo equivalent
          </p>
        )}
        <p className="text-sm text-zinc-400 mt-2">{storage} storage</p>
        {foundingSlotsLeft !== null && (
          <p className="text-xs text-amber-400 mt-1">
            {foundingSlotsLeft} founding spots left
          </p>
        )}
      </div>

      <FeatureList features={features} />

      <div className="mt-auto pt-6">
        {isFree ? (
          <div className="w-full text-center text-sm text-zinc-500 py-2">
            {isCurrent ? 'Your current plan' : 'Always free'}
          </div>
        ) : (
          <button
            onClick={onUpgrade}
            disabled={isCurrent || upgrading || !tier.stripePriceId}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
              isCurrent
                ? 'bg-zinc-800 text-zinc-500 cursor-default'
                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 disabled:opacity-50'
            }`}
          >
            {isCurrent ? 'Current plan' : upgrading ? 'Redirecting…' : 'Upgrade'}
          </button>
        )}
      </div>
    </div>
  )
}
