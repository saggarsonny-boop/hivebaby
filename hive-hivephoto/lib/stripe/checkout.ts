import { getStripe } from './client'
import { env } from '@/lib/env'

export async function createCheckoutSession(params: {
  userId: string
  email: string
  stripePriceId: string
  successUrl: string
  cancelUrl: string
}): Promise<string> {
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: params.stripePriceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.userId,
    customer_email: params.email,
    metadata: { userId: params.userId },
  })

  if (!session.url) throw new Error('No checkout URL returned from Stripe')
  return session.url
}
