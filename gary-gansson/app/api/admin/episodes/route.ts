import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const rows = await sql`
    SELECT id, title, script, audio_url, video_url, published_at, created_at, status
    FROM episodes
    ORDER BY created_at DESC
  `
  return NextResponse.json(rows)
}
