import { deleteProvisionalPhotos } from '@/lib/db/photos'

const STALE_MINUTES = 60

export async function runCleanupProvisional(): Promise<{ deleted: number }> {
  const deleted = await deleteProvisionalPhotos(STALE_MINUTES)
  return { deleted }
}
