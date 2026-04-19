import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new AuthError('Unauthorized')
  return userId
}

export async function getUserId(): Promise<string | null> {
  try {
    const { userId } = await auth()
    return userId
  } catch {
    return null
  }
}

export function requireCronSecret(req: NextRequest): void {
  const secret = req.headers.get('x-cron-secret')
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
  const expected = process.env.CRON_SECRET
  if (!expected || secret !== expected) {
    throw new AuthError('Forbidden')
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
