export async function publishReddit(title: string, youtubeUrl: string): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID!
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!
  const username = process.env.REDDIT_USERNAME!
  const password = process.env.REDDIT_PASSWORD!

  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'GaryGansson/1.0',
    },
    body: new URLSearchParams({ grant_type: 'password', username, password }),
  })
  const { access_token } = await tokenRes.json()

  const submitRes = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'GaryGansson/1.0' },
    body: new URLSearchParams({
      sr: 'GaryGansson',
      kind: 'link',
      title: `${title} — New episode out now`,
      url: youtubeUrl,
      resubmit: 'true',
    }),
  })
  const data = await submitRes.json()
  return data.json?.data?.url ?? ''
}
