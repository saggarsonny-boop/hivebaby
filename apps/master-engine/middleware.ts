import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  
  let engine = "ud-default";
  
  if (hostname.includes(".ud.hive.baby")) {
    engine = hostname.replace(".ud.hive.baby", "");
  } else if (hostname.includes(".universaldocument.org")) {
    engine = hostname.replace(".universaldocument.org", "");
  } else if (hostname.includes("vercel.app") || hostname.includes("localhost")) {
    return NextResponse.next();
  }

  // Rewrite the request to the dynamic /[engine] route
  return NextResponse.rewrite(new URL(`/${engine}${url.pathname === "/" ? "" : url.pathname}`, req.url));
}, {
  publishableKey: "pk_test_Y2hvaWNlLWRhc3NpZS02NS5jbGVyay5hY2NvdW50cy5kZXYk",
  secretKey: "sk_test_NZX6GkWzVeHuY4WKI8Fw8Qlh43i17pFF9la6Rx6AWB"
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
