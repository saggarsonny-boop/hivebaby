import { getStripe } from './client'
import { sql } from '@/lib/db/client'

export async function createPortalSession(userId: string, returnUrl: string): Promise<string> {
  const stripe = getStripe()

  const rows = await sql`
    SELECT stripe_customer_id FROM user_subscriptions
    WHERE user_id = ${userId} AND stripe_customer_id IS NOT NULL
    LIMIT 1
  `
  if (!rows.length) throw new Error('No Stripe customer found')
  const customerId = (rows[0] as { stripe_customer_id: string }).stripe_customer_id

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}
