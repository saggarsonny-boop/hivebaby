import { sql } from './client'
import type { DbPerson } from '@/lib/types/db'
import type { Person } from '@/lib/types/photo'
import { mapPerson } from './mappers'

export async function getPeopleByUser(userId: string): Promise<Person[]> {
  const rows = await sql`
    SELECT pe.*
    FROM people pe
    WHERE pe.user_id = ${userId}
    ORDER BY pe.name ASC
  `
  return (rows as unknown as DbPerson[]).map((r) => mapPerson(r))
}

export async function getPersonById(id: string, userId: string): Promise<Person | null> {
  const rows = await sql`
    SELECT * FROM people
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `
  if (!rows.length) return null
  return mapPerson(rows[0] as unknown as DbPerson)
}

export async function createPerson(userId: string, name: string): Promise<Person> {
  const rows = await sql`
    INSERT INTO people (user_id, name)
    VALUES (${userId}, ${name})
    RETURNING *
  `
  return mapPerson(rows[0] as unknown as DbPerson)
}

export async function updatePersonName(id: string, userId: string, name: string): Promise<void> {
  await sql`
    UPDATE people SET name = ${name}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `
}

export async function deletePerson(id: string, userId: string): Promise<void> {
  await sql`DELETE FROM people WHERE id = ${id} AND user_id = ${userId}`
}

export async function updatePersonCoverPhoto(personId: string, photoId: string): Promise<void> {
  await sql`
    UPDATE people SET cover_photo_id = ${photoId}, updated_at = NOW()
    WHERE id = ${personId}
  `
}

export async function incrementPersonPhotoCount(personId: string, delta: number): Promise<void> {
  await sql`
    UPDATE people SET photo_count = GREATEST(0, photo_count + ${delta}), updated_at = NOW()
    WHERE id = ${personId}
  `
}
