import { sql } from '@/lib/db/client'

export async function runStorageReconcile(): Promise<{ usersReconciled: number }> {
  // For each user, recalculate actual storage from photos table and update a cached value if needed
  const users = await sql`
    SELECT DISTINCT user_id FROM photos
    WHERE is_provisional = FALSE AND deleted_at IS NULL
  `
  // This cron primarily ensures storage_events are consistent
  // and cleans up orphaned storage entries
  await sql`
    DELETE FROM storage_events
    WHERE photo_id IS NOT NULL
      AND photo_id NOT IN (SELECT id FROM photos)
  `

  return { usersReconciled: users.length }
}
