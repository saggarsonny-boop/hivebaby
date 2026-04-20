export interface PricingTier {
  id: string
  name: string
  displayName: string
  priceCents: number
  priceInterval: 'month' | 'year' | null
  storageBytes: bigint
  isFounding: boolean
  foundingSlotsTotal: number | null
  foundingSlotsUsed: number
  stripePriceId: string | null
  isActive: boolean
  sortOrder: number
}

import { sql } from '@/lib/db/client'

export async function getAllTiers(): Promise<PricingTier[]> {
  const rows = await sql`
    SELECT * FROM pricing_tiers WHERE is_active = TRUE ORDER BY sort_order ASC
  `
  return (rows as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    displayName: r.display_name as string,
    priceCents: Number(r.price_cents),
    priceInterval: r.price_interval as 'month' | 'year' | null,
    storageBytes: BigInt(String(r.storage_bytes)),
    isFounding: r.is_founding as boolean,
    foundingSlotsTotal: r.founding_slots_total ? Number(r.founding_slots_total) : null,
    foundingSlotsUsed: Number(r.founding_slots_used),
    stripePriceId: r.stripe_price_id as string | null,
    isActive: r.is_active as boolean,
    sortOrder: Number(r.sort_order),
  }))
}

export async function getTierById(id: string): Promise<PricingTier | null> {
  const rows = await sql`SELECT * FROM pricing_tiers WHERE id = ${id} LIMIT 1`
  if (!rows.length) return null
  const r = rows[0] as Record<string, unknown>
  return {
    id: r.id as string,
    name: r.name as string,
    displayName: r.display_name as string,
    priceCents: Number(r.price_cents),
    priceInterval: r.price_interval as 'month' | 'year' | null,
    storageBytes: BigInt(String(r.storage_bytes)),
    isFounding: r.is_founding as boolean,
    foundingSlotsTotal: r.founding_slots_total ? Number(r.founding_slots_total) : null,
    foundingSlotsUsed: Number(r.founding_slots_used),
    stripePriceId: r.stripe_price_id as string | null,
    isActive: r.is_active as boolean,
    sortOrder: Number(r.sort_order),
  }
}

export async function getFreeTier(): Promise<PricingTier | null> {
  const rows = await sql`SELECT * FROM pricing_tiers WHERE name = 'free' LIMIT 1`
  if (!rows.length) return null
  const r = rows[0] as Record<string, unknown>
  return {
    id: r.id as string,
    name: r.name as string,
    displayName: r.display_name as string,
    priceCents: 0,
    priceInterval: null,
    storageBytes: BigInt(String(r.storage_bytes)),
    isFounding: false,
    foundingSlotsTotal: null,
    foundingSlotsUsed: 0,
    stripePriceId: null,
    isActive: true,
    sortOrder: 0,
  }
}
