export async function publishTikTok(portraitUrl: string, title: string): Promise<string> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN!

  const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      post_info: {
        title: `${title} — Gary Gansson is an AI character. #GaryGansson #HiveTV #AI`,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: { source: 'PULL_FROM_URL', video_url: portraitUrl },
    }),
  })
  const data = await initRes.json()
  return data.data?.publish_id ?? ''
}
