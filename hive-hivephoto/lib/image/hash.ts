import { createHash } from 'crypto'
import sharp from 'sharp'
import type { ImageHashes } from '../types/pipeline'

// ─── SHA-256 ──────────────────────────────────────────────────────────────────

export function computeSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

// ─── pHash (perceptual hash, 64-bit) ─────────────────────────────────────────
// DCT-based, 8×8 grid, outputs 16 hex chars (64 bits)

export async function computePHash(buffer: Buffer): Promise<string | null> {
  try {
    // Resize to 32×32 greyscale, compute 8×8 DCT
    const { data } = await sharp(buffer)
      .resize(32, 32, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = Array.from(data)
    const dct = computeDct8x8(pixels)
    const flatDct = dct.flat()
    const median = computeMedian(flatDct.slice(1)) // Skip DC component

    // Build 64-bit hash as hex
    let hash = ''
    for (let i = 0; i < 64; i++) {
      // Pack 4 bits at a time
    }

    // Simpler approach: threshold each of 64 DCT coefficients
    let bits = ''
    for (let i = 0; i < 64; i++) {
      bits += flatDct[i] > median ? '1' : '0'
    }

    // Convert 64 bits to 16 hex chars
    hash = ''
    for (let i = 0; i < 64; i += 4) {
      hash += parseInt(bits.slice(i, i + 4), 2).toString(16)
    }

    return hash
  } catch {
    return null
  }
}

function computeDct8x8(pixels: number[]): number[][] {
  const N = 8
  const result: number[][] = Array.from({ length: N }, () => new Array(N).fill(0))
  const sqrt2N = Math.sqrt(2 / N)

  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0
      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          // Sample from center of 32×32 image using 8×8 blocks
          const px = Math.floor(x * 4 + 2)
          const py = Math.floor(y * 4 + 2)
          const pixelVal = pixels[px * 32 + py] ?? 0
          sum +=
            pixelVal *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N))
        }
      }
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1
      result[u][v] = (sqrt2N * sqrt2N * cu * cv * sum) / 2
    }
  }
  return result
}

function computeMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

export async function computeHashes(buffer: Buffer): Promise<ImageHashes> {
  const [sha256, pHash] = await Promise.all([
    computeSha256(buffer),
    computePHash(buffer),
  ])
  return { sha256, pHash }
}
