export { queenBeeMiddleware as middleware } from '@hive/auth/middleware';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
