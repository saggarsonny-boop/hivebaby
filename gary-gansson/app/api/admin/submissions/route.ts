import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const rows = await sql`
    SELECT id, name, country, response, created_at, used, episode_id
    FROM submissions
    ORDER BY created_at DESC
  `
  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const { id, used } = await req.json()
  await sql`UPDATE submissions SET used = ${used} WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
