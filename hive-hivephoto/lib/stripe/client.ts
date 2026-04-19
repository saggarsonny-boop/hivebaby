import Stripe from 'stripe'
import { env } from '../env'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecretKey, { apiVersion: '2026-03-25.dahlia' })
  }
  return _stripe
}
