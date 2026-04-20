import { auth } from '@clerk/nextjs/server'
export async function requireUser(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Response('Unauthorized', { status: 401 })
  return userId
}

export function requireCronSecret(req: Request): void {
  const secret = req.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    throw new Response('Forbidden', { status: 403 })
  }
}
