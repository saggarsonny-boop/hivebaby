import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { createCheckoutSession } from '@/lib/stripe/checkout'

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()
    const body = await req.json() as { tierId: string; email: string }
    if (!body.tierId || !body.email) {
      return NextResponse.json({ error: 'tierId and email required' }, { status: 400 })
    }

    const origin = new URL(req.url).origin
    const successUrl = `${origin}/account/billing?status=success`
    const cancelUrl = `${origin}/pricing?status=cancel`

    const checkoutUrl = await createCheckoutSession(userId, body.email, body.tierId, successUrl, cancelUrl)
    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
