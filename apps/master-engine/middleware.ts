import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  
  let engine = "ud-default";
  
  if (hostname.includes(".ud.hive.baby")) {
    engine = hostname.replace(".ud.hive.baby", "");
  } else if (hostname.includes(".universaldocument.org")) {
    engine = hostname.replace(".universaldocument.org", "");
  } else if (hostname.includes("vercel.app") || hostname.includes("localhost")) {
    return NextResponse.next();
  }

  // Proxy rewrite to the canonical Vercel URL to bypass Next.js App Router Host-matching 404 bugs on wildcards
  return NextResponse.rewrite(new URL(`/${engine}${url.pathname === "/" ? "" : url.pathname}`, "https://ud-master.vercel.app"));
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
