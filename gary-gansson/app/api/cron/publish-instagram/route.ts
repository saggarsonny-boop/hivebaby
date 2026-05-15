import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (req.headers.get('x-vercel-cron') !== '1' && req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gary.hive.baby'
  const authHeaders = { 'Authorization': `Bearer ${process.env.ADMIN_PASSWORD}`, 'Content-Type': 'application/json' }

  const [queued] = await sql`
    SELECT pl.episode_id FROM publish_log pl
    WHERE pl.platform = 'instagram' AND pl.status = 'queued'
    ORDER BY pl.published_at ASC LIMIT 1
  `
  if (!queued) return NextResponse.json({ status: 'nothing_queued' })

  await fetch(`${siteUrl}/api/publish`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ episode_id: queued.episode_id, platform: 'instagram' }),
  })
  return NextResponse.json({ status: 'published', episode_id: queued.episode_id })
}
