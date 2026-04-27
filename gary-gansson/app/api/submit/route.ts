import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, country, response } = body

    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      return NextResponse.json({ error: 'Response is required' }, { status: 400 })
    }

    if (response.length > 500) {
      return NextResponse.json({ error: 'Response must be 500 characters or fewer' }, { status: 400 })
    }

    await sql`
      INSERT INTO submissions (name, country, response)
      VALUES (${name ?? null}, ${country ?? null}, ${response.trim()})
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
