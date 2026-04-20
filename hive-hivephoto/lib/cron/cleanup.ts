import { sql } from '@/lib/db/client'

export async function runCleanup(): Promise<{ deletedOrphanFaces: number; deletedErrorPhotos: number }> {
  const orphanResult = await sql`
    DELETE FROM photo_faces
    WHERE photo_id NOT IN (SELECT id FROM photos)
    RETURNING id
  `

  const errorResult = await sql`
    DELETE FROM photos
    WHERE processing_status = 'error'
      AND processing_last_attempted_at < NOW() - INTERVAL '7 days'
    RETURNING id
  `

  return {
    deletedOrphanFaces: orphanResult.length,
    deletedErrorPhotos: errorResult.length,
  }
}
