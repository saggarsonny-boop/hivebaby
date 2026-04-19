import { getStripe } from './client'
import { env } from '../env'
import { getDb } from '../db/client'
import type Stripe from 'stripe'

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret)
}

export async function syncSubscription(stripeSubId: string): Promise<void> {
  const stripe = getStripe()
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId, {
    expand: ['items.data.price'],
  }) as Stripe.Subscription

  const userId = stripeSub.metadata?.userId
  if (!userId) {
    console.warn(`Stripe subscription ${stripeSubId} has no userId metadata`)
    return
  }

  const tierId = stripeSub.metadata?.tierId
  const sql = getDb()

  // Governance: NEVER reduce storage_limit_bytes below what's already in use.
  // Only set new limit from tier; downgrade protection handled by UI/policy layer.
  if (tierId) {
    const tierRows = await sql`
      SELECT storage_bytes FROM pricing_tiers WHERE id = ${tierId} LIMIT 1
    ` as { storage_bytes: number }[]
    const storageBytes = tierRows[0]?.storage_bytes ?? -1

    await sql`
      UPDATE user_subscriptions SET
        tier_id = ${tierId},
        stripe_subscription_id = ${stripeSubId},
        stripe_status = ${String(stripeSub.status || '')},
        current_period_start = ${stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000).toISOString() : null},
        current_period_end = ${stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null},
        cancel_at_period_end = ${Boolean(stripeSub.cancel_at_period_end)},
        storage_limit_bytes = ${storageBytes}
      WHERE user_id = ${userId}
    `
  } else {
    await sql`
      UPDATE user_subscriptions SET
        stripe_subscription_id = ${stripeSubId},
        stripe_status = ${String(stripeSub.status || '')},
        current_period_start = ${stripeSub.current_period_start ? new Date(stripeSub.current_period_start * 1000).toISOString() : null},
        current_period_end = ${stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null},
        cancel_at_period_end = ${Boolean(stripeSub.cancel_at_period_end)}
      WHERE user_id = ${userId}
    `
  }
}
