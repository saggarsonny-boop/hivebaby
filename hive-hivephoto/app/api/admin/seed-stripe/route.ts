import { NextResponse } from 'next/server'
import { sql } from '@/lib/db/client'
import { getStripe } from '@/lib/stripe/client'
import { env } from '@/lib/env'

export const runtime = 'nodejs'

const TIERS = [
  { name: 'free',                       displayName: 'Free',                 priceCents: 0,     interval: null,    storageBytes: BigInt(53687091200),    isFounding: false, foundingSlotsTotal: null, sortOrder: 0 },
  { name: 'founding_patron_monthly',    displayName: 'Founding Patron',      priceCents: 399,   interval: 'month', storageBytes: BigInt(2199023255552),   isFounding: true,  foundingSlotsTotal: 1000,  sortOrder: 1 },
  { name: 'patron_monthly',             displayName: 'Patron',               priceCents: 499,   interval: 'month', storageBytes: BigInt(2199023255552),   isFounding: false, foundingSlotsTotal: null, sortOrder: 2 },
  { name: 'patron_annual',              displayName: 'Patron (Annual)',      priceCents: 4788,  interval: 'year',  storageBytes: BigInt(2199023255552),   isFounding: false, foundingSlotsTotal: null, sortOrder: 3 },
  { name: 'founding_sovereign_monthly', displayName: 'Founding Sovereign',   priceCents: 999,   interval: 'month', storageBytes: BigInt(-1),              isFounding: true,  foundingSlotsTotal: 500,  sortOrder: 4 },
  { name: 'sovereign_monthly',          displayName: 'Sovereign',            priceCents: 1299,  interval: 'month', storageBytes: BigInt(-1),              isFounding: false, foundingSlotsTotal: null, sortOrder: 5 },
  { name: 'sovereign_annual',           displayName: 'Sovereign (Annual)',   priceCents: 11688, interval: 'year',  storageBytes: BigInt(-1),              isFounding: false, foundingSlotsTotal: null, sortOrder: 6 },
]

export async function POST(req: Request) {
  const auth = req.headers.get('Authorization')
  if (!auth || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = getStripe()
  const results: { tierName: string; ok: boolean; priceId?: string; error?: string }[] = []

  for (const tier of TIERS) {
    try {
      // Upsert tier row
      await sql`
        INSERT INTO pricing_tiers
          (name, display_name, price_cents, price_interval, storage_bytes,
           is_founding, founding_slots_total, sort_order)
        VALUES
          (${tier.name}, ${tier.displayName}, ${tier.priceCents},
           ${tier.interval}, ${tier.storageBytes.toString()},
           ${tier.isFounding}, ${tier.foundingSlotsTotal}, ${tier.sortOrder})
        ON CONFLICT (name) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          sort_order = EXCLUDED.sort_order
      `

      if (tier.priceCents === 0) {
        results.push({ tierName: tier.name, ok: true, priceId: 'free' })
        continue
      }

      // Check if stripe_price_id already set
      const existing = await sql`SELECT stripe_price_id FROM pricing_tiers WHERE name = ${tier.name} LIMIT 1`
      const existingPriceId = (existing[0] as { stripe_price_id: string | null } | undefined)?.stripe_price_id
      if (existingPriceId) {
        results.push({ tierName: tier.name, ok: true, priceId: existingPriceId })
        continue
      }

      // Create Stripe product
      const product = await stripe.products.create({
        name: `HivePhoto ${tier.displayName}`,
        metadata: { tier: tier.name },
      })

      // Create Stripe price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tier.priceCents,
        currency: 'usd',
        recurring: { interval: tier.interval as 'month' | 'year' },
        metadata: { tier: tier.name },
      })

      // Store price ID
      await sql`UPDATE pricing_tiers SET stripe_price_id = ${price.id} WHERE name = ${tier.name}`

      results.push({ tierName: tier.name, ok: true, priceId: price.id })
    } catch (e) {
      results.push({ tierName: tier.name, ok: false, error: e instanceof Error ? e.message.slice(0, 200) : String(e) })
    }
  }

  const failed = results.filter(r => !r.ok)
  return NextResponse.json({
    ok: failed.length === 0,
    summary: `${results.filter(r => r.ok).length}/${results.length} tiers seeded`,
    results,
  })
}
