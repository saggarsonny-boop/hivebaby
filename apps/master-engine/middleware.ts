import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. ud-maritime.ud.hive.baby, ud-maritime.universaldocument.org)
  const hostname = req.headers.get("host") || "";
  
  // Extract the engine name (e.g., 'ud-maritime')
  // This regex matches any subdomain before .ud.hive.baby or .universaldocument.org
  // Or fallback if running on vercel.app (e.g. ud-master-xyz.vercel.app -> fallback)
  let engine = "ud-default";
  
  if (hostname.includes(".ud.hive.baby")) {
    engine = hostname.replace(".ud.hive.baby", "");
  } else if (hostname.includes(".universaldocument.org")) {
    engine = hostname.replace(".universaldocument.org", "");
  } else if (hostname.includes("localhost")) {
    engine = "ud-localtest";
  }

  // Rewrite the request to the dynamic /[engine] route
  // e.g. /dashboard -> /ud-maritime/dashboard
  return NextResponse.rewrite(new URL(`/${engine}${url.pathname === "/" ? "" : url.pathname}`, req.url));
}
