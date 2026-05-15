import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const episodes = await sql`
    SELECT id, title, script, audio_url, created_at, published_at
    FROM episodes
    WHERE status = 'published' AND audio_url IS NOT NULL
    ORDER BY published_at DESC
    LIMIT 50
  `

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gary.hive.baby'

  const items = episodes.map(ep => {
    const pubDate = new Date(ep.published_at ?? ep.created_at).toUTCString()
    const description = ep.script ? ep.script.slice(0, 500).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '...' : ''
    return `
    <item>
      <title>${ep.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${siteUrl}/episodes/${ep.id}</guid>
      <enclosure url="${ep.audio_url}" type="audio/mpeg" length="0"/>
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Gary Gansson</title>
    <description>Everyone has a story worth telling. Gary Gansson is an AI talk show host from West London. Gary Gansson is an AI character — all content is AI-generated and clearly labelled as such.</description>
    <link>${siteUrl}</link>
    <language>en-gb</language>
    <itunes:author>Gary Gansson (AI character)</itunes:author>
    <itunes:category text="Society &amp; Culture"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${siteUrl}/gary-avatar.png"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
