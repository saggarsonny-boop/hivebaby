import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getAuthUser } from '@/lib/auth/user'
import { createCheckoutSession } from '@/lib/stripe/checkout'
import { getTierById } from '@/lib/pricing/tiers'
import { env } from '@/lib/env'

export async function POST(req: Request) {
  try {
    const userId = await requireUser()
    const user = await getAuthUser()
    const body = (await req.json()) as { tierId: string }
    const tier = await getTierById(body.tierId)
    if (!tier?.stripePriceId) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }
    const url = await createCheckoutSession({
      userId,
      email: user?.email ?? '',
      stripePriceId: tier.stripePriceId,
      successUrl: `${env.NEXT_PUBLIC_APP_URL}/account/billing?success=1`,
      cancelUrl: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
    })
    return NextResponse.json({ url })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
