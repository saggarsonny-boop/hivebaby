import { getDb } from './client'
import type { PersonRow } from '../types/db'
import type { Person } from '../types/photo'

function mapPerson(row: PersonRow): Person {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    coverPhotoId: row.cover_photo_id,
    photoCount: row.photo_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPeople(userId: string): Promise<Person[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM people
    WHERE user_id = ${userId}
    ORDER BY name ASC
  ` as PersonRow[]
  return rows.map(mapPerson)
}

export async function getPersonById(personId: string, userId: string): Promise<Person | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM people WHERE id = ${personId} AND user_id = ${userId} LIMIT 1
  ` as PersonRow[]
  return rows[0] ? mapPerson(rows[0]) : null
}

export async function upsertPerson(userId: string, name: string): Promise<Person> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO people (user_id, name)
    VALUES (${userId}, ${name})
    ON CONFLICT (user_id, name) DO UPDATE SET updated_at = NOW()
    RETURNING *
  ` as PersonRow[]
  return mapPerson(rows[0])
}

export async function incrementPersonPhotoCount(personId: string, delta: number): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE people SET photo_count = GREATEST(0, photo_count + ${delta})
    WHERE id = ${personId}
  `
}

export async function deletePerson(personId: string, userId: string): Promise<void> {
  const sql = getDb()
  // Unlink faces first
  await sql`UPDATE photo_faces SET person_id = NULL WHERE person_id = ${personId}`
  await sql`DELETE FROM people WHERE id = ${personId} AND user_id = ${userId}`
}
