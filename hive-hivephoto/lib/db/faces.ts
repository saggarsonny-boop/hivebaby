import { sql } from './client'
import type { DbPhotoFace } from '@/lib/types/db'
import type { PhotoFace } from '@/lib/types/photo'
import { mapFace } from './mappers'

export interface FaceInput {
  boundingBox: { x: number; y: number; w: number; h: number }
  emotion?: string
  isLookingAtCamera?: boolean
  estimatedAgeGroup?: 'child' | 'teen' | 'adult' | 'elderly'
}

export async function insertFaces(photoId: string, faces: FaceInput[]): Promise<void> {
  for (const face of faces) {
    await sql`
      INSERT INTO photo_faces (photo_id, bounding_box, emotion, is_looking_at_camera, estimated_age_group)
      VALUES (
        ${photoId},
        ${JSON.stringify(face.boundingBox)},
        ${face.emotion ?? null},
        ${face.isLookingAtCamera ?? null},
        ${face.estimatedAgeGroup ?? null}
      )
    `
  }
}

export async function getFacesByPhoto(photoId: string): Promise<PhotoFace[]> {
  const rows = await sql`
    SELECT * FROM photo_faces WHERE photo_id = ${photoId} ORDER BY created_at ASC
  `
  return (rows as unknown as DbPhotoFace[]).map(mapFace)
}

export async function getFacesByPerson(personId: string): Promise<PhotoFace[]> {
  const rows = await sql`
    SELECT * FROM photo_faces WHERE person_id = ${personId} ORDER BY created_at ASC
  `
  return (rows as unknown as DbPhotoFace[]).map(mapFace)
}

export async function labelFace(faceId: string, personId: string): Promise<void> {
  await sql`
    UPDATE photo_faces SET person_id = ${personId} WHERE id = ${faceId}
  `
}

export async function unlabelFace(faceId: string): Promise<void> {
  await sql`
    UPDATE photo_faces SET person_id = NULL WHERE id = ${faceId}
  `
}
