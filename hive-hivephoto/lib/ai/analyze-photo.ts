import { getAnthropicClient } from './client'

export interface PhotoAnalysis {
  title: string
  description: string
  objects: string[]
  scenes: string[]
  emotions: string[]
  actions: string[]
  colors: string[]
  dominantColor: string
  locationName?: string
  faces: Array<{
    boundingBox: { x: number; y: number; w: number; h: number }
    emotion?: string
    isLookingAtCamera?: boolean
    estimatedAgeGroup?: 'child' | 'teen' | 'adult' | 'elderly'
  }>
}

const SYSTEM_PROMPT = `You are an AI photo analyst for a personal photo library. Analyze the image and return a JSON object with exactly these fields:
- title: A short, descriptive title (5-10 words)
- description: 1-3 sentence description of the photo
- objects: array of objects/subjects visible (5-15 items)
- scenes: array of scene classifications (e.g. "outdoor", "beach", "portrait", "landscape")
- emotions: array of emotions/moods conveyed (e.g. "happy", "peaceful", "nostalgic")
- actions: array of actions occurring (e.g. "running", "laughing", "eating")
- colors: array of dominant colors (e.g. "blue", "golden", "green")
- dominantColor: single most dominant color as hex code (e.g. "#4a90e2")
- locationName: visually identifiable location name, or null if unknown
- faces: array of detected faces, each with:
  - boundingBox: {x, y, w, h} as fractions 0.0-1.0 of image dimensions
  - emotion: optional emotion string
  - isLookingAtCamera: boolean
  - estimatedAgeGroup: "child"|"teen"|"adult"|"elderly" or omit if uncertain

Return ONLY valid JSON. No markdown, no explanation.`

export async function analyzePhoto(imageBuffer: Buffer): Promise<PhotoAnalysis> {
  const client = getAnthropicClient()
  const base64 = imageBuffer.toString('base64')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Analyze this photo and return the JSON response.',
          },
        ],
      },
    ],
  })

  const text = response.content.find((c) => c.type === 'text')?.text ?? '{}'

  try {
    const parsed = JSON.parse(text) as Partial<PhotoAnalysis>
    return {
      title: parsed.title ?? 'Untitled Photo',
      description: parsed.description ?? '',
      objects: Array.isArray(parsed.objects) ? parsed.objects : [],
      scenes: Array.isArray(parsed.scenes) ? parsed.scenes : [],
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      colors: Array.isArray(parsed.colors) ? parsed.colors : [],
      dominantColor: parsed.dominantColor ?? '#888888',
      locationName: parsed.locationName ?? undefined,
      faces: Array.isArray(parsed.faces) ? parsed.faces : [],
    }
  } catch {
    return {
      title: 'Untitled Photo',
      description: text.slice(0, 500),
      objects: [],
      scenes: [],
      emotions: [],
      actions: [],
      colors: [],
      dominantColor: '#888888',
      faces: [],
    }
  }
}
