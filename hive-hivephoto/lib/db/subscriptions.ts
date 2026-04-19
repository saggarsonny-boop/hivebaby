import { getDb } from './client'
import type { PricingTierRow, UserSubscriptionRow } from '../types/db'
import type { PricingTier, UserSubscription, TierFeatures } from '../types/photo'

const FREE_TIER_ID = 'free'

function mapTierRow(row: PricingTierRow): PricingTier {
  return {
    id: row.id,
    displayName: row.display_name,
    tierClass: row.tier_class as PricingTier['tierClass'],
    billingInterval: row.billing_interval as PricingTier['billingInterval'],
    priceCents: row.price_cents,
    originalPriceCents: row.original_price_cents,
    storageBytes: row.storage_bytes,
    isFounding: row.is_founding,
    foundingSlotsTotal: row.founding_slots_total,
    foundingSlotsUsed: row.founding_slots_used,
    isFoundingOpen: row.is_founding_open,
    stripePriceId: row.stripe_price_id,
    features: row.features as unknown as TierFeatures,
  }
}

export async function getAllTiers(): Promise<PricingTier[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM pricing_tiers WHERE is_active = TRUE ORDER BY price_cents ASC
  ` as PricingTierRow[]
  return rows.map(mapTierRow)
}

export async function getTierById(tierId: string): Promise<PricingTier | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM pricing_tiers WHERE id = ${tierId} LIMIT 1
  ` as PricingTierRow[]
  return rows[0] ? mapTierRow(rows[0]) : null
}

export async function getOrCreateSubscription(userId: string): Promise<UserSubscription> {
  const sql = getDb()
  // Ensure free tier exists as a default
  let rows = await sql`
    SELECT us.*, pt.*,
      pt.id as tier_id,
      us.id as sub_id
    FROM user_subscriptions us
    JOIN pricing_tiers pt ON pt.id = us.tier_id
    WHERE us.user_id = ${userId}
    LIMIT 1
  ` as (UserSubscriptionRow & PricingTierRow & { tier_id: string; sub_id: string })[]

  if (rows.length === 0) {
    // Create default free subscription
    const freeTier = await sql`
      SELECT * FROM pricing_tiers WHERE id = ${FREE_TIER_ID} LIMIT 1
    ` as PricingTierRow[]

    if (freeTier.length === 0) throw new Error('Free tier not found in DB')

    await sql`
      INSERT INTO user_subscriptions (user_id, tier_id, storage_limit_bytes)
      VALUES (${userId}, ${FREE_TIER_ID}, ${freeTier[0].storage_bytes})
      ON CONFLICT (user_id) DO NOTHING
    `
    rows = await sql`
      SELECT us.*, pt.*, pt.id as tier_id, us.id as sub_id
      FROM user_subscriptions us
      JOIN pricing_tiers pt ON pt.id = us.tier_id
      WHERE us.user_id = ${userId}
      LIMIT 1
    ` as (UserSubscriptionRow & PricingTierRow & { tier_id: string; sub_id: string })[]
  }

  const row = rows[0]
  const tier = mapTierRow({
    ...row,
    id: row.tier_id,
    price_cents: row.price_cents,
    original_price_cents: row.original_price_cents,
    storage_bytes: row.storage_bytes,
    is_founding: row.is_founding,
    founding_slots_total: row.founding_slots_total,
    founding_slots_used: row.founding_slots_used,
    is_founding_open: row.is_founding_open,
  } as PricingTierRow)

  return {
    id: row.sub_id,
    userId: row.user_id,
    tierId: row.tier_id,
    tier,
    isFounding: row.is_founding,
    foundingPriceLockedCents: row.founding_price_locked_cents,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeStatus: row.stripe_status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    storageUsedBytes: row.storage_used_bytes,
    storageLimitBytes: row.storage_limit_bytes,
  }
}

export async function checkStorageAvailable(userId: string, fileSizeBytes: number): Promise<boolean> {
  const sql = getDb()
  const rows = await sql`
    SELECT (storage_used_bytes + ${fileSizeBytes}) <= storage_limit_bytes as has_space,
           storage_limit_bytes
    FROM user_subscriptions
    WHERE user_id = ${userId}
  ` as { has_space: boolean; storage_limit_bytes: number }[]

  if (rows.length === 0) return true // New user — will create free on presign
  // -1 = unlimited (sovereign)
  if (rows[0].storage_limit_bytes === -1) return true
  return rows[0].has_space
}

export async function trackStorageEvent(
  userId: string,
  photoId: string | null,
  eventType: 'upload' | 'delete' | 'thumbnail',
  bytesDelta: number
): Promise<void> {
  const sql = getDb()
  await sql`
    WITH updated AS (
      UPDATE user_subscriptions
      SET storage_used_bytes = GREATEST(0, storage_used_bytes + ${bytesDelta})
      WHERE user_id = ${userId}
      RETURNING storage_used_bytes
    )
    INSERT INTO storage_events (user_id, photo_id, event_type, bytes_delta, storage_after_bytes)
    SELECT ${userId}, ${photoId}, ${eventType}, ${bytesDelta}, storage_used_bytes
    FROM updated
  `
}

export async function reconcileUserStorage(userId: string): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE user_subscriptions us
    SET storage_used_bytes = COALESCE((
      SELECT SUM(file_size_bytes)
      FROM photos
      WHERE user_id = ${userId}
        AND deleted_at IS NULL
        AND is_provisional = FALSE
        AND upload_status = 'uploaded'
    ), 0)
    WHERE us.user_id = ${userId}
  `
}
