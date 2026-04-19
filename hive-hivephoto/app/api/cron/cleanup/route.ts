import { NextRequest, NextResponse } from 'next/server'
import { requireCronSecret, AuthError } from '@/lib/auth/guards'
import { runCleanup } from '@/lib/cron/cleanup'

export async function GET(req: NextRequest) {
  try {
    requireCronSecret(req)
    const result = await runCleanup()
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
