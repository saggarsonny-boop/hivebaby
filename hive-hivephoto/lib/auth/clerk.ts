import { auth, currentUser } from '@clerk/nextjs/server'

export async function getClerkAuth() {
  return auth()
}

export async function getClerkCurrentUser() {
  return currentUser()
}
