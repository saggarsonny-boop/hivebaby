import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { getPeopleByUser, createPerson } from '@/lib/db/people'

export async function GET(_req: Request) {
  try {
    const userId = await requireUser()
    const people = await getPeopleByUser(userId)
    return NextResponse.json({ people })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUser()
    const body = (await req.json()) as { name: string }
    const person = await createPerson(userId, body.name)
    return NextResponse.json(person, { status: 201 })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
