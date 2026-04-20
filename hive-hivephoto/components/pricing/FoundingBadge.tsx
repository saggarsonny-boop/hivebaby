import type { PricingTier } from '@/lib/pricing/tiers'

interface Props {
  tier: PricingTier
}

export function FoundingBadge({ tier }: Props) {
  const isPatron = tier.name.includes('patron')
  const slotsLeft = tier.foundingSlotsTotal != null
    ? tier.foundingSlotsTotal - tier.foundingSlotsUsed
    : null
  const isClosed = slotsLeft !== null && slotsLeft <= 0

  return (
    <div className={`mb-4 rounded-lg px-3 py-2 text-xs font-semibold ${
      isClosed
        ? 'bg-zinc-800 text-zinc-500'
        : 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
    }`}>
      {isClosed ? (
        'Founding closed'
      ) : isPatron ? (
        <>
          <span className="font-bold">Founding Patron</span>
          {slotsLeft !== null && (
            <span className="ml-1 opacity-75">
              · {slotsLeft}/{tier.foundingSlotsTotal} slots left
            </span>
          )}
        </>
      ) : (
        <>
          <span className="font-bold">Founding Sovereign</span>
          {slotsLeft !== null && (
            <span className="ml-1 opacity-75">
              · {slotsLeft}/{tier.foundingSlotsTotal} slots left
            </span>
          )}
        </>
      )}
    </div>
  )
}
