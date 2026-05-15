import { NextResponse } from 'next/server'
import { ensureTables, sql } from '@/lib/db'

export async function GET() {
  try {
    await ensureTables()
    await sql`SELECT 1`
    return NextResponse.json({ status: 'ok', engine: 'gary-gansson', db: 'connected' })
  } catch {
    return NextResponse.json({ status: 'error', engine: 'gary-gansson', db: 'unreachable' }, { status: 503 })
  }
}
