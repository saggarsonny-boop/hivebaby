import { NextRequest, NextResponse } from 'next/server'
import { requireCronSecret } from '@/lib/auth/guards'
import { runAnalyzeCron } from '@/lib/cron/analyze'

export async function GET(req: NextRequest) {
  try {
    requireCronSecret(req)
    const result = await runAnalyzeCron()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'error'
    if (msg === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
    console.error('[cron/analyze]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
