import { NextResponse } from 'next/server'
import { runCleanup } from '@/lib/cron/cleanup'

export async function GET(req: Request) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
  }
  const result = await runCleanup()
  return NextResponse.json(result)
}
