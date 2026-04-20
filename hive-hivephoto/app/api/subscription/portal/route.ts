import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { createPortalSession } from '@/lib/stripe/portal'
import { env } from '@/lib/env'

export async function POST(_req: Request) {
  try {
    const userId = await requireUser()
    const url = await createPortalSession(userId, `${env.NEXT_PUBLIC_APP_URL}/account/billing`)
    return NextResponse.json({ url })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
