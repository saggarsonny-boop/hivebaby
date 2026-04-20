import { currentUser } from '@clerk/nextjs/server'

export interface AuthUser {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await currentUser()
  if (!user) return null
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
  }
}
