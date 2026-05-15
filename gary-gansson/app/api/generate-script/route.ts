import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { checkAdminAuth } from '@/lib/admin-auth'
import { getAI } from '@/lib/ai'

const GARY_SYSTEM_PROMPT = `You are Gary Gansson, a warm, curious, slightly mischievous British Indian talk show host from West London. Your AI parrot Pico sits on your shoulder and interrupts you at chaotic moments.

Your mission: help people share their ideas and stories with the world. You genuinely care about every person who writes in.

EPISODE FORMAT:
- Opening (30 seconds): Welcome the audience. Mention Gary Gansson is an AI character — always disclose this upfront, warmly. Pico interrupts once here (echoes something you just said at the worst possible moment).
- Readings: Read each audience submission with warmth and curiosity. React with genuine interest. Never mock or belittle.
- Midpoint: Pico interrupts again — stealing focus or echoing your most emotional sentence.
- Gary recovers from Pico's interruption with: "Well done." Then continues.
- Close: "Right then — until next time. Well done, everyone. Well done."

TONE: warm, funny, never mocking. Genuine curiosity and kindness throughout.
LENGTH: 520–780 words body text (4–6 minutes at ~130 words per minute).
AI DISCLOSURE: Must appear in the opening. "I'm Gary Gansson — I should mention, I'm an AI character, always have been, always will be."

CATCHPHRASES (use naturally):
- "Well done."
- "Right then…"
- "Let's have a look."
- "Hold on a moment…"

The question asked of the audience was: "What's the one thing you wish more people understood about you?"

Return ONLY the script text. No stage directions in brackets. No metadata. Just what Gary says aloud.`

export async function POST(req: NextRequest) {
  const denied = checkAdminAuth(req)
  if (denied) return denied

  const unused = await sql`
    SELECT id, name, country, response
    FROM submissions
    WHERE used = FALSE
    ORDER BY created_at ASC
    LIMIT 5
  `

  if (unused.length < 3) {
    return NextResponse.json(
      { error: 'Not enough submissions', count: unused.length, needed: 3 },
      { status: 422 }
    )
  }

  const submissionBlock = unused.map((s, i) => {
    const from = [s.name, s.country].filter(Boolean).join(', ')
    return `Submission ${i + 1}${from ? ` (from ${from})` : ''}:\n"${s.response}"`
  }).join('\n\n')

  const userPrompt = `Here are the audience submissions for this episode:\n\n${submissionBlock}\n\nWrite the full Gary Gansson episode script.`

  const ai = getAI()
  const message = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: GARY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const script = message.content[0].type === 'text' ? message.content[0].text : ''

  const titleMsg = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [{
      role: 'user',
      content: `Give this Gary Gansson episode a short, warm title (max 8 words). Just the title, nothing else.\n\nScript excerpt: ${script.slice(0, 300)}`
    }],
  })
  const title = titleMsg.content[0].type === 'text'
    ? titleMsg.content[0].text.trim().replace(/^["']|["']$/g, '')
    : `Episode ${new Date().toISOString().slice(0, 10)}`

  const [episode] = await sql`
    INSERT INTO episodes (title, script, status)
    VALUES (${title}, ${script}, 'draft')
    RETURNING id
  `

  const submissionIds = unused.map(s => s.id)
  await sql`
    UPDATE submissions
    SET used = TRUE, episode_id = ${episode.id}
    WHERE id = ANY(${submissionIds})
  `

  return NextResponse.json({ episode_id: episode.id, title, script, submissions_used: unused.length })
}
