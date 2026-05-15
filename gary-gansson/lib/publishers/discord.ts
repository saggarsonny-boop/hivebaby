export async function publishDiscord(title: string, youtubeUrl: string, audioUrl: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL!

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `🎙️ New episode: ${title}`,
        description: `Gary Gansson is live with a new episode.\n\n**Watch:** ${youtubeUrl}\n\n*Gary Gansson is an AI character. All content is AI-generated.*`,
        color: 0xd4a017,
        footer: { text: 'No ads. No investors. No agenda. · HiveTV' },
      }],
    }),
  })
}
