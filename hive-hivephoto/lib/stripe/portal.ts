import { getStripe } from './client'
import { getOrCreateSubscription } from '../db/subscriptions'
import { env } from '../env'

export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe()
  const sub = await getOrCreateSubscription(userId)
  if (!sub.stripeCustomerId) throw new Error('No Stripe customer found')

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  })

  return session.url
}
