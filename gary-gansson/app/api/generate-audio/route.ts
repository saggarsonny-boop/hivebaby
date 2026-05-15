import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const { episode_id } = await req.json()
  if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400 })

  const [episode] = await sql`
    SELECT id, script, status FROM episodes WHERE id = ${episode_id}
  `
  if (!episode) return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
  if (!episode.script) return NextResponse.json({ error: 'Episode has no script' }, { status: 422 })

  const voiceId = process.env.ELEVENLABS_VOICE_ID
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!voiceId || !apiKey) {
    return NextResponse.json({ error: 'ElevenLabs credentials not configured' }, { status: 503 })
  }

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: episode.script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    }),
  })

  if (!ttsRes.ok) {
    const err = await ttsRes.text()
    return NextResponse.json({ error: 'ElevenLabs error', detail: err }, { status: 502 })
  }

  const audioBuffer = await ttsRes.arrayBuffer()
  const blob = await put(`episodes/${episode_id}/audio.mp3`, Buffer.from(audioBuffer), {
    access: 'public',
    contentType: 'audio/mpeg',
  })

  await sql`
    UPDATE episodes
    SET audio_url = ${blob.url}, status = 'audio_ready'
    WHERE id = ${episode_id}
  `

  return NextResponse.json({ episode_id, audio_url: blob.url })
}
