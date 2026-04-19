import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { createBillingPortalSession } from '@/lib/stripe/portal'

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()
    const origin = new URL(req.url).origin
    const portalUrl = await createBillingPortalSession(userId, `${origin}/account/billing`)
    return NextResponse.json({ portalUrl })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const msg = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
