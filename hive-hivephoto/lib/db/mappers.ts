import type { DbPhoto, DbPerson, DbPhotoFace } from '@/lib/types/db'
import type { Photo, Person, PhotoFace } from '@/lib/types/photo'
import { env } from '@/lib/env'

export function mapPhoto(row: DbPhoto): Photo {
  return {
    id: row.id,
    userId: row.user_id,
    originalKey: row.original_key,
    thumbKey: row.thumb_key,
    thumbUrl: row.thumb_url
      ? row.thumb_url
      : row.thumb_key
        ? `${env.R2_PUBLIC_THUMB_URL}/${row.thumb_key}`
        : null,
    format: row.format,
    fileSizeBytes: row.file_size_bytes ? Number(row.file_size_bytes) : null,
    width: row.width,
    height: row.height,
    isProvisional: row.is_provisional,
    uploadStatus: row.upload_status,
    takenAt: row.taken_at instanceof Date ? row.taken_at.toISOString() : String(row.taken_at),
    takenAtConfidence: row.taken_at_confidence,
    uploadedAt: row.uploaded_at instanceof Date ? row.uploaded_at.toISOString() : String(row.uploaded_at),
    gpsLat: row.gps_lat,
    gpsLng: row.gps_lng,
    locationName: row.location_name,
    cameraMake: row.camera_make,
    cameraModel: row.camera_model,
    aiTitle: row.ai_title,
    userTitle: row.user_title,
    aiDescription: row.ai_description,
    objects: row.objects ?? [],
    scenes: row.scenes ?? [],
    emotions: row.emotions ?? [],
    actions: row.actions ?? [],
    colors: row.colors ?? [],
    dominantColor: row.dominant_color,
    sha256Hash: row.sha256_hash,
    pHash: row.p_hash,
    isNearDuplicate: row.is_near_duplicate,
    nearDuplicateOf: row.near_duplicate_of,
    duplicateReviewStatus: row.duplicate_review_status,
    processingStatus: row.processing_status,
    processingError: row.processing_error,
    processingAttempts: row.processing_attempts,
    deletedAt: row.deleted_at instanceof Date ? row.deleted_at.toISOString() : row.deleted_at ? String(row.deleted_at) : null,
  }
}

export function mapPerson(row: DbPerson & { face_count?: string | number }): Person {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    coverPhotoId: row.cover_photo_id,
    photoCount: row.photo_count,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  }
}

export function mapFace(row: DbPhotoFace): PhotoFace {
  return {
    id: row.id,
    photoId: row.photo_id,
    personId: row.person_id,
    boundingBox: row.bounding_box as { x: number; y: number; w: number; h: number },
    emotion: row.emotion,
    isLookingAtCamera: row.is_looking_at_camera,
    estimatedAgeGroup: row.estimated_age_group,
    confidence: row.confidence,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }
}
