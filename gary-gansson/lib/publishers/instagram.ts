export async function publishInstagram(portraitUrl: string, title: string): Promise<string> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN!
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID!

  const caption = `${title}\n\nGary Gansson is an AI character. All content is AI-generated.\n\n#GaryGansson #HiveTV #AI #TalkShow #Stories`

  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: portraitUrl, caption, media_type: 'REELS', access_token: accessToken }),
    }
  )
  const { id: containerId } = await containerRes.json()

  // Poll until ready
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const statusRes = await fetch(
      `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
    )
    const { status_code } = await statusRes.json()
    if (status_code === 'FINISHED') break
  }

  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
    }
  )
  const { id } = await publishRes.json()
  return `https://instagram.com/p/${id}`
}
