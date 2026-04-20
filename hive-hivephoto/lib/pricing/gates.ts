import { sql } from '@/lib/db/client'
import { getStorageUsedBytes } from '@/lib/db/photos'
import type { PricingTier } from './tiers'

export async function getUserSubscription(userId: string): Promise<{
  tierId: string
  tierName: string
  storageBytes: bigint
  status: string
} | null> {
  const rows = await sql`
    SELECT us.*, pt.name AS tier_name, pt.storage_bytes
    FROM user_subscriptions us
    JOIN pricing_tiers pt ON pt.id = us.tier_id
    WHERE us.user_id = ${userId}
      AND us.status IN ('active','trialing')
    ORDER BY us.created_at DESC
    LIMIT 1
  `
  if (!rows.length) return null
  const r = rows[0] as Record<string, unknown>
  return {
    tierId: r.tier_id as string,
    tierName: r.tier_name as string,
    storageBytes: BigInt(String(r.storage_bytes)),
    status: r.status as string,
  }
}

export async function getEffectiveTier(userId: string): Promise<{
  tierName: string
  storageBytes: bigint
}> {
  const sub = await getUserSubscription(userId)
  if (sub) return { tierName: sub.tierName, storageBytes: sub.storageBytes }

  // Default to free tier
  const rows = await sql`SELECT storage_bytes FROM pricing_tiers WHERE name = 'free' LIMIT 1`
  const storageBytes = rows.length
    ? BigInt(String((rows[0] as Record<string, unknown>).storage_bytes))
    : BigInt(53687091200) // 50GB fallback
  return { tierName: 'free', storageBytes }
}

export async function getStorageUsed(userId: string): Promise<bigint> {
  return getStorageUsedBytes(userId)
}

export async function checkStorageLimit(userId: string, fileSizeBytes: number): Promise<boolean> {
  const tier = await getEffectiveTier(userId)
  if (tier.storageBytes < 0n) return true // unlimited
  const used = await getStorageUsed(userId)
  return used + BigInt(fileSizeBytes) <= tier.storageBytes
}

export async function canUpload(userId: string): Promise<boolean> {
  const tier = await getEffectiveTier(userId)
  if (tier.storageBytes < 0n) return true
  const used = await getStorageUsed(userId)
  return used < tier.storageBytes
}

export async function getTier(userId: string): Promise<PricingTier | null> {
  const rows = await sql`
    SELECT pt.*
    FROM user_subscriptions us
    JOIN pricing_tiers pt ON pt.id = us.tier_id
    WHERE us.user_id = ${userId} AND us.status IN ('active','trialing')
    ORDER BY us.created_at DESC
    LIMIT 1
  `
  if (!rows.length) {
    // Return free tier
    const free = await sql`SELECT * FROM pricing_tiers WHERE name = 'free' LIMIT 1`
    if (!free.length) return null
    const r = free[0] as Record<string, unknown>
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

export async function ensureUserSubscriptionRow(userId: string): Promise<void> {
  const existing = await sql`
    SELECT id FROM user_subscriptions WHERE user_id = ${userId} LIMIT 1
  `
  if (existing.length) return

  const freeRow = await sql`SELECT id FROM pricing_tiers WHERE name = 'free' LIMIT 1`
  if (!freeRow.length) return
  const freeTierId = (freeRow[0] as { id: string }).id

  await sql`
    INSERT INTO user_subscriptions (user_id, tier_id, status)
    VALUES (${userId}, ${freeTierId}, 'active')
    ON CONFLICT DO NOTHING
  `
}
