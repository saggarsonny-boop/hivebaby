import { getClerkCurrentUser } from './clerk'

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await getClerkCurrentUser()
  if (!user) return null

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    name: user.fullName ?? user.firstName ?? null,
  }
}
