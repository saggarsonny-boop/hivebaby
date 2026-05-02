import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`
    SELECT id, title, script, audio_url, video_url, published_at, created_at
    FROM episodes
    ORDER BY created_at DESC
  `
  return NextResponse.json(rows)
}
