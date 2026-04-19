import { purgeDeleted } from '../db/photos'

export async function runCleanup(): Promise<{ purged: number }> {
  const purged = await purgeDeleted(30)
  return { purged }
}
