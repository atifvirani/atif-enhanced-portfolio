export interface ImageTargetOptions {
  worldWidth?: number
  worldHeight?: number
  jitter?: number
}

export interface ImageTargetResult {
  positions: Float32Array
  brightness: Float32Array
  success: boolean
}

/**
 * Loads Atif's photograph and samples facial structure, eyes, beard, and silhouette
 * to generate 3D particle target positions.
 */
export async function generateImageParticles(
  imageSrc: string,
  totalParticles: number,
  options: ImageTargetOptions = {}
): Promise<ImageTargetResult> {
  const {
    worldWidth = 46,
    worldHeight = 60,
    jitter = 0.28,
  } = options

  const positions = new Float32Array(totalParticles * 3)
  const brightness = new Float32Array(totalParticles)

  try {
    const img = await loadImage(imageSrc)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) {
      throw new Error('Canvas 2D context not available')
    }

    // High resolution canvas for sharp facial sampling
    const sampleWidth = 360
    const sampleHeight = 480
    canvas.width = sampleWidth
    canvas.height = sampleHeight

    // Draw image focused on face and upper torso (top-aligned with slight offset)
    const imgAspect = img.width / img.height
    const targetAspect = sampleWidth / sampleHeight

    let drawWidth = sampleWidth
    let drawHeight = sampleHeight
    let offsetX = 0
    let offsetY = 0

    if (imgAspect > targetAspect) {
      drawWidth = sampleHeight * imgAspect
      offsetX = (sampleWidth - drawWidth) / 2
      offsetY = 0
    } else {
      drawHeight = sampleWidth / imgAspect
      // Focus on head and chest (upper portion of tall phone portrait)
      offsetY = (sampleHeight - drawHeight) * 0.12
    }

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, sampleWidth, sampleHeight)
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    let imgData: ImageData
    try {
      imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight)
    } catch {
      throw new Error('Failed to sample image canvas data')
    }
    const data = imgData.data

    const candidatePoints: Array<{ x: number; y: number; weight: number }> = []

    // Sample pixels across image
    const step = 2
    for (let y = 2; y < sampleHeight - 2; y += step) {
      for (let x = 2; x < sampleWidth - 2; x += step) {
        const idx = (y * sampleWidth + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]

        // Luminance
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255

        // Gradient edges (eyes, eyebrows, nose, lips, beard line, shoulders)
        const leftIdx = (y * sampleWidth + (x - 2)) * 4
        const rightIdx = (y * sampleWidth + (x + 2)) * 4
        const topIdx = ((y - 2) * sampleWidth + x) * 4
        const bottomIdx = ((y + 2) * sampleWidth + x) * 4

        const lumL = (0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2]) / 255
        const lumR = (0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2]) / 255
        const lumT = (0.299 * data[topIdx] + 0.587 * data[topIdx + 1] + 0.114 * data[topIdx + 2]) / 255
        const lumB = (0.299 * data[bottomIdx] + 0.587 * data[bottomIdx + 1] + 0.114 * data[bottomIdx + 2]) / 255

        const edge = Math.abs(lumR - lumL) + Math.abs(lumB - lumT)

        // Give weight to facial highlights, skin, and sharp features
        const weight = Math.min(1.0, lum * 0.8 + edge * 1.8)

        if (weight > 0.12) {
          candidatePoints.push({ x, y, weight })
        }
      }
    }

    if (candidatePoints.length === 0) {
      return generateFallbackPortrait(totalParticles, worldWidth, worldHeight)
    }

    // Shuffle candidate points so particles converge organically from all angles
    for (let i = candidatePoints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = candidatePoints[i]
      candidatePoints[i] = candidatePoints[j]
      candidatePoints[j] = temp
    }

    const scaleX = worldWidth / sampleWidth
    const scaleY = worldHeight / sampleHeight

    for (let i = 0; i < totalParticles; i++) {
      const pt = candidatePoints[i % candidatePoints.length]

      // Map to world space centered at (0, 0, 0)
      const wx = (pt.x - sampleWidth / 2) * scaleX + (Math.random() - 0.5) * jitter
      const wy = -(pt.y - sampleHeight / 2) * scaleY + (Math.random() - 0.5) * jitter
      const wz = (Math.random() - 0.5) * 1.4

      const i3 = i * 3
      positions[i3] = wx
      positions[i3 + 1] = wy
      positions[i3 + 2] = wz
      brightness[i] = 0.5 + pt.weight * 0.5
    }

    return { positions, brightness, success: true }
  } catch (error) {
    console.warn('Portrait image load fallback triggered:', error)
    return generateFallbackPortrait(totalParticles, worldWidth, worldHeight)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
    img.src = src
  })
}

function generateFallbackPortrait(
  totalParticles: number,
  worldWidth: number,
  worldHeight: number
): ImageTargetResult {
  const positions = new Float32Array(totalParticles * 3)
  const brightness = new Float32Array(totalParticles)

  for (let i = 0; i < totalParticles; i++) {
    const angle = Math.random() * Math.PI * 2
    const radiusX = Math.sqrt(Math.random()) * (worldWidth * 0.44)
    const radiusY = Math.sqrt(Math.random()) * (worldHeight * 0.48)

    const wx = Math.cos(angle) * radiusX
    const wy = Math.sin(angle) * radiusY
    const wz = (Math.random() - 0.5) * 1.8

    const i3 = i * 3
    positions[i3] = wx
    positions[i3 + 1] = wy
    positions[i3 + 2] = wz
    brightness[i] = 0.85
  }

  return { positions, brightness, success: false }
}
