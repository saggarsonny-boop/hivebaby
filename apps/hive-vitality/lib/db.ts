import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL not configured. HiveVitality requires a Neon connection string for session logging.",
    );
  }
  return neon(url);
}

/** True iff the database is reachable AND the schema migration has run. */
export async function isReady(): Promise<boolean> {
  try {
    const sql = getDb();
    const rows = await sql`SELECT to_regclass('hv_users') AS exists`;
    return Boolean((rows[0] as { exists: string | null } | undefined)?.exists);
  } catch {
    return false;
  }
}
