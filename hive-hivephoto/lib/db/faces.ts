import { getDb } from './client'
import { mapFaceRow } from './mappers'
import type { PhotoFaceRow } from '../types/db'
import type { PhotoFace } from '../types/photo'
import type { AiFaceResult } from '../types/pipeline'

export async function insertFaces(photoId: string, faces: AiFaceResult[]): Promise<void> {
  if (faces.length === 0) return
  const sql = getDb()
  for (const face of faces) {
    await sql`
      INSERT INTO photo_faces (
        photo_id, bounding_box, emotion,
        is_looking_at_camera, estimated_age_group, confidence
      ) VALUES (
        ${photoId},
        ${JSON.stringify(face.boundingBox)},
        ${face.emotion},
        ${face.isLookingAtCamera},
        ${face.estimatedAgeGroup},
        ${face.confidence}
      )
    `
  }
}

export async function getFacesForPhoto(photoId: string): Promise<PhotoFace[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT pf.*, p.name as person_name
    FROM photo_faces pf
    LEFT JOIN people p ON p.id = pf.person_id
    WHERE pf.photo_id = ${photoId}
    ORDER BY pf.created_at ASC
  ` as PhotoFaceRow[]
  return rows.map(mapFaceRow)
}

export async function labelFace(faceId: string, personId: string | null): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE photo_faces SET person_id = ${personId}
    WHERE id = ${faceId}
  `
}
