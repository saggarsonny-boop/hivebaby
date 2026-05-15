import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const { episode_id } = await req.json()
  await sql`UPDATE episodes SET status = 'approved' WHERE id = ${episode_id} AND status = 'draft'`
  return NextResponse.json({ ok: true })
}
