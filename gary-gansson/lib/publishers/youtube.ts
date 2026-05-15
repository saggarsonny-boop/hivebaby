export async function publishYouTube(episodeId: number, landscapeUrl: string, title: string, script: string): Promise<string> {
  const clientId = process.env.YOUTUBE_CLIENT_ID!
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN!

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  })
  const { access_token } = await tokenRes.json()

  const description = `${script.slice(0, 400)}...\n\nGary Gansson is an AI character. All content is AI-generated and clearly labelled as such.\n\nNo ads. No investors. No agenda. · A Hive production.`

  const initRes = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json', 'X-Upload-Content-Type': 'video/mp4' },
      body: JSON.stringify({
        snippet: { title, description, tags: ['GaryGansson', 'HiveTV', 'AI', 'TalkShow'], categoryId: '22' },
        status: { privacyStatus: 'public', selfDeclaredMadeForKids: false },
      }),
    }
  )
  const uploadUrl = initRes.headers.get('location')!

  const videoBuffer = await (await fetch(landscapeUrl)).arrayBuffer()
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4' },
    body: videoBuffer,
  })
  const { id: videoId } = await uploadRes.json()
  return `https://youtube.com/watch?v=${videoId}`
}
