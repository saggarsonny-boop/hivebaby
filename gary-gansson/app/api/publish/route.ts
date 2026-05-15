import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'
import { publishYouTube } from '@/lib/publishers/youtube'
import { publishTikTok } from '@/lib/publishers/tiktok'
import { publishInstagram } from '@/lib/publishers/instagram'
import { publishReddit } from '@/lib/publishers/reddit'
import { publishDiscord } from '@/lib/publishers/discord'

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'reddit' | 'discord'

export async function POST(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const { episode_id, platform } = await req.json() as { episode_id: number; platform: Platform }
  if (!episode_id || !platform) {
    return NextResponse.json({ error: 'episode_id and platform required' }, { status: 400 })
  }

  const [episode] = await sql`
    SELECT id, title, script, audio_url, video_url, platforms_json, status
    FROM episodes WHERE id = ${episode_id}
  `
  if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
  if (episode.status !== 'video_ready' && episode.status !== 'published') {
    return NextResponse.json({ error: 'Episode not ready for publishing', status: episode.status }, { status: 422 })
  }

  const platforms = episode.platforms_json as { portrait?: string; landscape?: string }
  let publishedUrl = ''

  try {
    switch (platform) {
      case 'youtube':
        publishedUrl = await publishYouTube(episode_id, platforms.landscape!, episode.title, episode.script ?? '')
        break
      case 'tiktok':
        publishedUrl = await publishTikTok(platforms.portrait!, episode.title)
        break
      case 'instagram':
        publishedUrl = await publishInstagram(platforms.portrait!, episode.title)
        break
      case 'reddit': {
        const ytLog = await sql`SELECT response_json FROM publish_log WHERE episode_id = ${episode_id} AND platform = 'youtube' LIMIT 1`
        const ytUrl = ytLog[0]?.response_json?.url ?? ''
        publishedUrl = await publishReddit(episode.title, ytUrl)
        break
      }
      case 'discord': {
        const ytLog = await sql`SELECT response_json FROM publish_log WHERE episode_id = ${episode_id} AND platform = 'youtube' LIMIT 1`
        const ytUrl = ytLog[0]?.response_json?.url ?? ''
        await publishDiscord(episode.title, ytUrl, episode.audio_url ?? '')
        publishedUrl = 'discord'
        break
      }
      default:
        return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 })
    }

    await sql`
      INSERT INTO publish_log (episode_id, platform, status, response_json)
      VALUES (${episode_id}, ${platform}, 'published', ${JSON.stringify({ url: publishedUrl })})
    `

    await sql`UPDATE episodes SET status = 'published', published_at = NOW() WHERE id = ${episode_id}`

    return NextResponse.json({ ok: true, platform, url: publishedUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await sql`
      INSERT INTO publish_log (episode_id, platform, status, response_json)
      VALUES (${episode_id}, ${platform}, 'failed', ${JSON.stringify({ error: msg })})
    `
    return NextResponse.json({ error: 'Publish failed', detail: msg }, { status: 502 })
  }
}
