import { auth } from "@clerk/nextjs/server";

export function checkIsPlusPaid(): boolean {
  const { sessionClaims } = auth();
  
  // Clerk syncs publicMetadata to the session token if configured,
  // or we can read it from the metadata object directly.
  const isPlusPaid = sessionClaims?.metadata?.isPlusPaid || sessionClaims?.publicMetadata?.isPlusPaid;
  
  return !!isPlusPaid;
}
