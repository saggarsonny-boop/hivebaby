import { NextResponse } from 'next/server'
import { runCleanupProvisional } from '@/lib/cron/cleanup-provisional'

export async function GET(req: Request) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
  }
  const result = await runCleanupProvisional()
  return NextResponse.json(result)
}
