// GOVERNANCE: Photos are NEVER deleted due to tier changes or downgrades.
// Photos are NEVER held hostage. On downgrade: all existing photos remain
// accessible and downloadable. New uploads blocked only if over storage limit.
// This is a Hive governance rule — not a product decision.

import { sql } from '@/lib/db/client'

export async function syncSubscription(params: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}): Promise<void> {
  // Find tier by stripe_price_id
  const tierRows = await sql`
    SELECT id FROM pricing_tiers WHERE stripe_price_id = ${params.stripePriceId} LIMIT 1
  `
  const tierId = tierRows.length
    ? (tierRows[0] as { id: string }).id
    : (await sql`SELECT id FROM pricing_tiers WHERE name = 'free' LIMIT 1`).map(
        (r) => (r as { id: string }).id
      )[0]

  if (!tierId) return

  await sql`
    INSERT INTO user_subscriptions (
      user_id, tier_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
      status, current_period_start, current_period_end, cancel_at_period_end
    ) VALUES (
      ${params.userId}, ${tierId}, ${params.stripeCustomerId}, ${params.stripeSubscriptionId},
      ${params.stripePriceId}, ${params.status}, ${params.currentPeriodStart.toISOString()},
      ${params.currentPeriodEnd.toISOString()}, ${params.cancelAtPeriodEnd}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      tier_id = EXCLUDED.tier_id,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = NOW()
  `
}

export async function cancelSubscription(userId: string): Promise<void> {
  await sql`
    UPDATE user_subscriptions SET
      status = 'canceled',
      updated_at = NOW()
    WHERE user_id = ${userId}
  `
}
