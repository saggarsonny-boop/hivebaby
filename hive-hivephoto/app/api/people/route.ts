import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth/guards'
import { getPeople, upsertPerson } from '@/lib/db/people'

export async function GET(_req: NextRequest) {
  try {
    const userId = await requireAuth()
    const people = await getPeople(userId)
    return NextResponse.json({ people })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()
    const body = await req.json() as { name: string }
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const person = await upsertPerson(userId, body.name.trim())
    return NextResponse.json(person, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
