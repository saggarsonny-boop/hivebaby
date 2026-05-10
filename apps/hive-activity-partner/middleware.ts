import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/api/clinical(.*)",
  "/api/reports(.*)",
  "/api/patients(.*)",
  "/api/files(.*)",
  "/api/ai(.*)",
  "/api/pdf(.*)",
  "/api/pdfs(.*)",
  "/api/audit(.*)",
  "/api/audit-logs(.*)",
  "/api/explanations(.*)",
  "/api/org(.*)",
  "/api/compliance(.*)",
  "/api/me(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://api.anthropic.com https://*.clerk.accounts.dev https://*.clerk.com;"
  );
  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
