import { getDb } from '../db/client'
import { reconcileUserStorage } from '../db/subscriptions'

export async function runStorageReconcile(): Promise<{ reconciled: number }> {
  const sql = getDb()
  const users = await sql`
    SELECT DISTINCT user_id FROM photos
    WHERE deleted_at IS NULL AND is_provisional = FALSE
  ` as { user_id: string }[]

  await Promise.allSettled(
    users.map(u => reconcileUserStorage(u.user_id))
  )

  return { reconciled: users.length }
}
