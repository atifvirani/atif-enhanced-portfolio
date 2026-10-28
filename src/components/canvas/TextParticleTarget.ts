export interface TextTargetOptions {
  fontSize?: number
  fontWeight?: string
  fontFamily?: string
  worldWidth?: number
  jitter?: number
}

export interface TextTargetResult {
  positions: Float32Array
  sweepNormalizedX: Float32Array
}

/**
 * Samples typography pixels on an offscreen canvas and maps them to 3D particle positions.
 */
export function generateTextParticles(
  text: string,
  totalParticles: number,
  options: TextTargetOptions = {}
): TextTargetResult {
  const {
    fontSize = 170,
    fontWeight = '800',
    fontFamily = "'Syne', 'Inter', sans-serif",
    worldWidth = 74,
    jitter = 0.35,
  } = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    const fallback = new Float32Array(totalParticles * 3)
    const sweep = new Float32Array(totalParticles)
    return { positions: fallback, sweepNormalizedX: sweep }
  }

  canvas.width = 1800
  canvas.height = 600

  ctx.fillStyle = '#ffffff'
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.imageSmoothingEnabled = true

  const textX = canvas.width / 2
  const textY = canvas.height / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillText(text, textX, textY)

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data

  let minX = canvas.width
  let maxX = 0
  let minY = canvas.height
  let maxY = 0

  const validPixelCoords: Array<[number, number]> = []

  const step = 2
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4
      const alpha = data[idx + 3]

      if (alpha > 45) {
        validPixelCoords.push([x, y])
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const positions = new Float32Array(totalParticles * 3)
  const sweepNormalizedX = new Float32Array(totalParticles)

  if (validPixelCoords.length === 0) {
    return { positions, sweepNormalizedX }
  }

  const bboxWidth = Math.max(1, maxX - minX)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const scale = worldWidth / bboxWidth

  // Randomly distribute particles over the valid pixels for organic convergence
  for (let i = 0; i < totalParticles; i++) {
    const randomIdx = Math.floor(Math.random() * validPixelCoords.length)
    const coord = validPixelCoords[randomIdx]
    const px = coord[0]
    const py = coord[1]

    // Normalized X from 0.0 (left) to 1.0 (right) for directional sweep effect
    const normX = Math.max(0, Math.min(1, (px - minX) / bboxWidth))
    sweepNormalizedX[i] = normX

    const wx = (px - centerX) * scale + (Math.random() - 0.5) * jitter
    const wy = -(py - centerY) * scale + (Math.random() - 0.5) * jitter
    const wz = (Math.random() - 0.5) * 1.2

    const i3 = i * 3
    positions[i3] = wx
    positions[i3 + 1] = wy
    positions[i3 + 2] = wz
  }

  return { positions, sweepNormalizedX }
}
