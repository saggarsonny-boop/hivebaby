import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'
import { put } from '@vercel/blob'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export const maxDuration = 300

async function runFFmpeg(args: string[]): Promise<void> {
  const ffmpegStatic = (await import('ffmpeg-static')).default as string
  const { execFile } = await import('child_process')
  const { promisify } = await import('util')
  const execFileAsync = promisify(execFile)
  await execFileAsync(ffmpegStatic, args)
}

export async function POST(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const { episode_id } = await req.json()
  if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 })

  const [episode] = await sql`
    SELECT id, audio_url, status FROM episodes WHERE id = ${episode_id}
  `
  if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
  if (!episode.audio_url) return NextResponse.json({ error: 'Episode has no audio' }, { status: 422 })

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `gary-ep${episode_id}-`))

  try {
    const audioPath = path.join(tmpDir, 'audio.mp3')
    const portraitPath = path.join(tmpDir, 'portrait.mp4')
    const landscapePath = path.join(tmpDir, 'landscape.mp4')

    // Download audio
    const audioRes = await fetch(episode.audio_url)
    const audioBuffer = await audioRes.arrayBuffer()
    await fs.writeFile(audioPath, Buffer.from(audioBuffer))

    // Use gary-set.png for the video background (the talk show set)
    const avatarSrc = path.join(process.cwd(), 'public', 'gary-set.png')
    const avatarFallback = path.join(process.cwd(), 'public', 'gary-avatar.png')
    const avatarPath = await fs.access(avatarSrc).then(() => avatarSrc).catch(() => avatarFallback)

    // Portrait 1080x1920
    await runFFmpeg([
      '-loop', '1', '-i', avatarPath,
      '-i', audioPath,
      '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=#0d1b2a',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-tune', 'stillimage',
      '-c:a', 'aac', '-b:a', '192k',
      '-pix_fmt', 'yuv420p', '-shortest',
      '-y', portraitPath,
    ])

    // Landscape 1920x1080
    await runFFmpeg([
      '-loop', '1', '-i', avatarPath,
      '-i', audioPath,
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#0d1b2a',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-tune', 'stillimage',
      '-c:a', 'aac', '-b:a', '192k',
      '-pix_fmt', 'yuv420p', '-shortest',
      '-y', landscapePath,
    ])

    const [portraitBlob, landscapeBlob] = await Promise.all([
      put(`episodes/${episode_id}/portrait.mp4`, await fs.readFile(portraitPath), { access: 'public', contentType: 'video/mp4' }),
      put(`episodes/${episode_id}/landscape.mp4`, await fs.readFile(landscapePath), { access: 'public', contentType: 'video/mp4' }),
    ])

    await sql`
      UPDATE episodes
      SET video_url = ${portraitBlob.url},
          platforms_json = ${JSON.stringify({ portrait: portraitBlob.url, landscape: landscapeBlob.url })},
          status = 'video_ready'
      WHERE id = ${episode_id}
    `

    return NextResponse.json({
      episode_id,
      portrait_url: portraitBlob.url,
      landscape_url: landscapeBlob.url,
    })
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}
