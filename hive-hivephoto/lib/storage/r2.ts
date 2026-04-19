import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../env'

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  })
}

// ─── Presigned PUT URL (direct browser upload) ────────────────────────────────

export async function createPresignedPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 900 // 15 min
): Promise<string> {
  const client = getR2Client()
  const cmd = new PutObjectCommand({
    Bucket: env.r2BucketPrivate,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds })
}

// ─── Signed GET URL for originals (1 hour) ───────────────────────────────────

export async function createSignedGetUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getR2Client()
  const cmd = new GetObjectCommand({
    Bucket: env.r2BucketPrivate,
    Key: key,
  })
  return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds })
}

// ─── Download object as Buffer (for server-side processing) ──────────────────

export async function downloadObject(key: string): Promise<Buffer> {
  const client = getR2Client()
  const cmd = new GetObjectCommand({ Bucket: env.r2BucketPrivate, Key: key })
  const res = await client.send(cmd)
  if (!res.Body) throw new Error(`R2 object not found: ${key}`)
  const chunks: Uint8Array[] = []
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

// ─── Upload thumbnail to public bucket ───────────────────────────────────────

export async function uploadThumbnail(
  key: string,
  buffer: Buffer
): Promise<void> {
  const client = getR2Client()
  await client.send(new PutObjectCommand({
    Bucket: env.r2BucketPublic,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }))
}

// ─── Delete original from private bucket ─────────────────────────────────────

export async function deleteOriginal(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(new DeleteObjectCommand({
    Bucket: env.r2BucketPrivate,
    Key: key,
  }))
}

// ─── Delete thumbnail from public bucket ─────────────────────────────────────

export async function deleteThumbnail(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(new DeleteObjectCommand({
    Bucket: env.r2BucketPublic,
    Key: key,
  }))
}
