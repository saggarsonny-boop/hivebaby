import type { PhotoRow, PhotoFaceRow } from '../types/db'
import type { Photo, PhotoSummary, PhotoFace } from '../types/photo'

export function mapPhotoRow(row: PhotoRow): Photo {
  return {
    id: row.id,
    userId: row.user_id,
    originalKey: row.original_key,
    thumbKey: row.thumb_key,
    thumbUrl: row.thumb_url,
    format: row.format,
    fileSizeBytes: row.file_size_bytes,
    width: row.width,
    height: row.height,
    isProvisional: row.is_provisional,
    uploadStatus: row.upload_status as Photo['uploadStatus'],
    takenAt: row.taken_at,
    takenAtConfidence: row.taken_at_confidence as Photo['takenAtConfidence'],
    uploadedAt: row.uploaded_at,
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
    duplicateReviewStatus: row.duplicate_review_status as Photo['duplicateReviewStatus'],
    processingStatus: row.processing_status as Photo['processingStatus'],
    processingError: row.processing_error,
    processingAttempts: row.processing_attempts,
    processingLastAttemptedAt: row.processing_last_attempted_at,
    deletedAt: row.deleted_at,
  }
}

export function mapPhotoSummaryRow(row: PhotoRow): PhotoSummary {
  return {
    id: row.id,
    thumbUrl: row.thumb_url!,
    takenAt: row.taken_at,
    takenAtConfidence: row.taken_at_confidence as PhotoSummary['takenAtConfidence'],
    aiTitle: row.ai_title,
    userTitle: row.user_title,
    width: row.width!,
    height: row.height!,
    isNearDuplicate: row.is_near_duplicate,
    duplicateReviewStatus: row.duplicate_review_status as PhotoSummary['duplicateReviewStatus'],
    processingStatus: row.processing_status as PhotoSummary['processingStatus'],
  }
}

export function mapFaceRow(row: PhotoFaceRow): PhotoFace {
  return {
    id: row.id,
    photoId: row.photo_id,
    personId: row.person_id,
    boundingBox: {
      x: row.bounding_box.x,
      y: row.bounding_box.y,
      width: row.bounding_box.width,
      height: row.bounding_box.height,
    },
    emotion: row.emotion,
    isLookingAtCamera: row.is_looking_at_camera,
    estimatedAgeGroup: row.estimated_age_group as PhotoFace['estimatedAgeGroup'],
    confidence: row.confidence,
    createdAt: row.created_at,
  }
}
