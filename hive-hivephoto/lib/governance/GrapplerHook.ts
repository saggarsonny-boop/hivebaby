import { sql } from '@/lib/db/client'
import { getPhotoById } from '@/lib/db/photos'

export class GrapplerHook {
  async validatePhotoOwnership(photoId: string, userId: string): Promise<boolean> {
    const photo = await getPhotoById(photoId, userId)
    return photo !== null && photo.userId === userId
  }

  async checkStorageLimit(userId: string, bytes: number): Promise<boolean> {
    const rows = await sql`
      SELECT pt.storage_bytes, COALESCE(SUM(p.file_size_bytes), 0)::bigint AS used
      FROM user_subscriptions us
      JOIN pricing_tiers pt ON pt.id = us.tier_id
      LEFT JOIN photos p ON p.user_id = ${userId} AND p.is_provisional = FALSE AND p.deleted_at IS NULL
      WHERE us.user_id = ${userId} AND us.status IN ('active','trialing')
      GROUP BY pt.storage_bytes
      LIMIT 1
    `
    if (!rows.length) {
      // Default free tier: 50GB
      const freeLimit = BigInt(53687091200)
      const usedRows = await sql`
        SELECT COALESCE(SUM(file_size_bytes), 0)::bigint AS used FROM photos
        WHERE user_id = ${userId} AND is_provisional = FALSE AND deleted_at IS NULL
      `
      const used = BigInt(String((usedRows[0] as { used: string }).used))
      return used + BigInt(bytes) <= freeLimit
    }
    const r = rows[0] as { storage_bytes: string; used: string }
    const limit = BigInt(r.storage_bytes)
    if (limit < 0n) return true // unlimited
    const used = BigInt(r.used)
    return used + BigInt(bytes) <= limit
  }

  // GOVERNANCE RULE: Photos are NEVER deleted on tier downgrade.
  // Users always retain access to their photos regardless of subscription status.
  enforceNoDeleteOnDowngrade(_userId: string): void {
    // This is a no-op by design — photos survive downgrades.
    // Enforced at the application layer: downgrade does not trigger any photo deletion.
  }

  async logGovernanceEvent(event: {
    type: string
    userId: string
    photoId?: string
    details?: Record<string, unknown>
  }): Promise<void> {
    try {
      await sql`
        INSERT INTO storage_events (user_id, photo_id, event_type, bytes_delta, storage_after)
        VALUES (
          ${event.userId},
          ${event.photoId ?? null},
          ${event.type},
          0,
          0
        )
      `
    } catch {
      // Governance logging is best-effort
      console.warn('[GrapplerHook] Failed to log governance event:', event)
    }
  }
}

export const grapplerHook = new GrapplerHook()
