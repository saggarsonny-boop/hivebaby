import { NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/lib/stripe/webhooks'

export async function POST(req: Request) {
  try {
    await handleStripeWebhook(req)
    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[webhook/stripe]', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
