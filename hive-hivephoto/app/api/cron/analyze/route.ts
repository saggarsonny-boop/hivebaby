import { NextResponse } from 'next/server'
import { runAnalyzeCron } from '@/lib/cron/analyze'

export async function GET(req: Request) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 401 })
  }
  const result = await runAnalyzeCron()
  return NextResponse.json(result)
}
