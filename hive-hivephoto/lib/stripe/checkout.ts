import { getStripe } from './client'
import { env } from '../env'
import { getTierById, getOrCreateSubscription } from '../db/subscriptions'

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tierId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const stripe = getStripe()
  const tier = await getTierById(tierId)
  if (!tier) throw new Error(`Tier not found: ${tierId}`)
  if (!tier.stripePriceId) throw new Error(`No Stripe price ID for tier: ${tierId}`)

  const sub = await getOrCreateSubscription(userId)
  let customerId = sub.stripeCustomerId ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
    })
    customerId = customer.id
    const { getDb } = await import('../db/client')
    const sql = getDb()
    await sql`
      UPDATE user_subscriptions SET stripe_customer_id = ${customerId}
      WHERE user_id = ${userId}
    `
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: tier.stripePriceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, tierId },
    subscription_data: {
      metadata: { userId, tierId },
    },
  })

  return session.url!
}
