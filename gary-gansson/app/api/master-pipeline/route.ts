import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret')
  const vecelCron = req.headers.get('x-vercel-cron')
  if (!vecelCron && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gary.hive.baby'
  const adminPw = process.env.ADMIN_PASSWORD!
  const authHeaders = { 'Authorization': `Bearer ${adminPw}`, 'Content-Type': 'application/json' }

  const [{ count }] = await sql`SELECT COUNT(*) as count FROM submissions WHERE used = FALSE`
  const unusedCount = Number(count)

  if (unusedCount < 3) {
    const resendKey = process.env.RESEND_API_KEY
    const alertEmail = process.env.ALERT_EMAIL
    if (resendKey && alertEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'gary@gary.hive.baby',
          to: alertEmail,
          subject: `Gary Gansson needs more submissions (${unusedCount} remaining)`,
          html: `<p>Gary has only <strong>${unusedCount}</strong> unused submission${unusedCount !== 1 ? 's' : ''}.</p><p>Share the submission link to get more: <a href="${siteUrl}">${siteUrl}</a></p>`,
        }),
      }).catch(() => {})
    }
    return NextResponse.json({ status: 'waiting', count: unusedCount, needed: 3 })
  }

  // Generate script
  const scriptRes = await fetch(`${siteUrl}/api/generate-script`, { method: 'POST', headers: authHeaders })
  if (!scriptRes.ok) {
    const err = await scriptRes.json()
    return NextResponse.json({ error: 'Script generation failed', detail: err }, { status: 500 })
  }
  const { episode_id } = await scriptRes.json()

  // Auto-approve
  await sql`UPDATE episodes SET status = 'approved' WHERE id = ${episode_id}`

  // Generate audio
  const audioRes = await fetch(`${siteUrl}/api/generate-audio`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ episode_id }),
  })
  if (!audioRes.ok) {
    const err = await audioRes.json()
    return NextResponse.json({ error: 'Audio generation failed', detail: err }, { status: 500 })
  }

  // Generate video
  const videoRes = await fetch(`${siteUrl}/api/generate-video`, {
    method: 'POST', headers: authHeaders,
    body: JSON.stringify({ episode_id }),
  })
  if (!videoRes.ok) {
    const err = await videoRes.json()
    return NextResponse.json({ error: 'Video generation failed', detail: err }, { status: 500 })
  }

  // Queue all platforms for their respective cron jobs
  const platforms = ['youtube', 'tiktok', 'instagram', 'reddit', 'discord']
  for (const platform of platforms) {
    await sql`
      INSERT INTO publish_log (episode_id, platform, status, response_json)
      VALUES (${episode_id}, ${platform}, 'queued', '{}')
      ON CONFLICT DO NOTHING
    `
  }

  return NextResponse.json({ status: 'pipeline_complete', episode_id })
}
