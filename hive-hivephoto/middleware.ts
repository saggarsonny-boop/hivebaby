import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublic = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/_next/(.*)',
  '/favicon.ico',
])
export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect()
})
export const config = { matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'] }
