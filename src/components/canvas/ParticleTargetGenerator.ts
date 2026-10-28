import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'

export interface TargetSet {
  ringImpact: Float32Array
  impactBurst: Float32Array
  atif: Float32Array
  atifDissolveNoise: Float32Array
  atifTones: Float32Array
  atifSizes: Float32Array
  atifBrightness: Float32Array
  portfolio: Float32Array
  portfolioSweepX: Float32Array
  portfolioLetterIdx: Float32Array
  portfolioTones: Float32Array
  portfolioSizes: Float32Array
  portfolioBrightness: Float32Array
  portrait: Float32Array
  portraitBrightness: Float32Array
  portraitTones: Float32Array
  portraitSizes: Float32Array
  table: Float32Array
  tableTones: Float32Array
  tableSizes: Float32Array
}

export interface ViewportProjection {
  width: number
  height: number
  visibleWidth: number
  visibleHeight: number
  isMobile: boolean
  toWorld: (nx: number, ny: number) => { x: number; y: number }
}

/**
 * Calculates world bounds and projection from normalized screen coordinates (0 to 1).
 */
export function calculateViewportProjection(
  width: number,
  height: number,
  cameraZ = 110,
  fov = 54
): ViewportProjection {
  const aspect = width / height
  const fovRad = (fov * Math.PI) / 360
  const visibleHeight = 2 * cameraZ * Math.tan(fovRad)
  const visibleWidth = visibleHeight * aspect
  const isMobile = width < 768

  return {
    width,
    height,
    visibleWidth,
    visibleHeight,
    isMobile,
    toWorld: (nx: number, ny: number) => ({
      x: (nx - 0.5) * visibleWidth,
      y: -(ny - 0.5) * visibleHeight,
    }),
  }
}

/**
 * Generates all deterministic particle target coordinate buffers based on composition anchors.
 */
export async function generateAllParticleTargets(
  count: number,
  proj: ViewportProjection
): Promise<TargetSet> {
  const { visibleWidth, visibleHeight, isMobile, toWorld } = proj

  // Composition Anchors
  const ringImpactPos = toWorld(0.50, 0.50)
  const atifCenter = toWorld(0.50, 0.47)
  const portfolioCenter = toWorld(0.50, 0.50)
  // Portrait centered vertically on page axis with comfortable clearance below navbar
  const portraitCenter = toWorld(0.50, isMobile ? 0.44 : 0.45)
  const ringRadius = isMobile ? 2.0 : 2.5
  const ringImpact = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2
    const i3 = i * 3
    const r = ringRadius * (0.82 + Math.random() * 0.36)
    ringImpact[i3] = ringImpactPos.x + Math.cos(theta) * r + (Math.random() - 0.5) * 0.3
    ringImpact[i3 + 1] = ringImpactPos.y + Math.sin(theta) * r + (Math.random() - 0.5) * 0.3
    ringImpact[i3 + 2] = (Math.random() - 0.5) * 1.5
  }

  // 2. Impact Burst Target (particles scatter from center to full viewport edges)
  // The sphere shatters from center — particles fly to ALL directions, filling entire screen
  const centerPos = toWorld(0.50, 0.50)
  const impactBurst = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    // Use power distribution so most particles reach the outer edges
    const radius = Math.pow(Math.random(), 0.45) * (isMobile ? visibleWidth * 0.75 : visibleWidth * 0.72)
    const i3 = i * 3
    impactBurst[i3] = centerPos.x + Math.cos(angle) * radius
    impactBurst[i3 + 1] = centerPos.y + Math.sin(angle) * radius * (visibleHeight / visibleWidth)
    impactBurst[i3 + 2] = (Math.random() - 0.5) * 25
  }

  // 3. ATIF Typography Target
  const atifWidth = isMobile ? visibleWidth * 0.74 : visibleWidth * 0.44
  const {
    positions: atif,
    dissolveNoise: atifDissolveNoise,
    tones: atifTones,
    sizes: atifSizes,
    brightness: atifBrightness,
  } = generateTextGlyphs(
    'ATIF',
    count,
    atifCenter.x,
    atifCenter.y,
    atifWidth,
    isMobile ? 140 : 185,
    0.20
  )

  // 4. PORTFOLIO Typography Target with discrete letter indices for stop-motion assembly
  const portWidth = isMobile ? visibleWidth * 0.84 : visibleWidth * 0.72
  const {
    positions: portfolio,
    sweepNormalizedX: portfolioSweepX,
    letterIndices: portfolioLetterIdx,
    tones: portfolioTones,
    sizes: portfolioSizes,
    brightness: portfolioBrightness,
  } = generatePortfolioGlyphs(
    count,
    portfolioCenter.x,
    portfolioCenter.y,
    portWidth,
    isMobile ? 80 : 112,
    0.20
  )

  // 5. Atif Portrait Target (Calibrated to command central canvas with clear breathing room)
  const portraitAspect = 944 / 1050
  const maxPortraitH = isMobile ? visibleHeight * 0.64 : visibleHeight * 0.76
  const maxPortraitW = isMobile ? visibleWidth * 0.82 : visibleWidth * 0.90
  const portraitWidth = Math.min(maxPortraitH * portraitAspect, maxPortraitW)
  const portraitHeight = portraitWidth / portraitAspect
  const {
    positions: portrait,
    brightness: portraitBrightness,
    tones: portraitTones,
    sizes: portraitSizes,
  } = await generatePortraitPoints(
    PORTFOLIO_CONFIG.personal.portraitUrl,
    count,
    portraitCenter.x,
    portraitCenter.y,
    portraitWidth,
    portraitHeight,
    0.10
  )

  // 6. Tabletop Particle Field (fine ambient silver-dust plane)
  const table = new Float32Array(count * 3)
  const tableTones = new Float32Array(count * 3)
  const tableSizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    table[i3] = (Math.random() - 0.5) * (visibleWidth * 1.20)
    table[i3 + 1] = (Math.random() - 0.5) * (visibleHeight * 0.95) - 6.0
    table[i3 + 2] = (Math.random() - 0.5) * 35.0

    // Ambient soft silver-gray tones
    const toneVal = 0.40 + Math.random() * 0.35
    tableTones[i3] = toneVal * 0.96
    tableTones[i3 + 1] = toneVal * 0.98
    tableTones[i3 + 2] = toneVal

    // Mostly tiny grains with sparse highlights
    tableSizes[i] = Math.random() < 0.80 ? 0.45 + Math.random() * 0.25 : 0.70 + Math.random() * 0.35
  }

  return {
    ringImpact,
    impactBurst,
    atif,
    atifDissolveNoise,
    atifTones,
    atifSizes,
    atifBrightness,
    portfolio,
    portfolioSweepX,
    portfolioLetterIdx,
    portfolioTones,
    portfolioSizes,
    portfolioBrightness,
    portrait,
    portraitBrightness,
    portraitTones,
    portraitSizes,
    table,
    tableTones,
    tableSizes,
  }
}

function generateTextGlyphs(
  text: string,
  count: number,
  centerX: number,
  centerY: number,
  worldWidth: number,
  fontSize: number,
  jitter: number
): {
  positions: Float32Array
  dissolveNoise: Float32Array
  tones: Float32Array
  sizes: Float32Array
  brightness: Float32Array
} {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const positions = new Float32Array(count * 3)
  const dissolveNoise = new Float32Array(count)
  const tones = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)

  if (!ctx) return { positions, dissolveNoise, tones, sizes, brightness }

  canvas.width = 1800
  canvas.height = 600

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 ${fontSize}px 'Syne', 'Inter', sans-serif`
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

  const validPixelCoords: Array<{ x: number; y: number; isEdge: boolean }> = []

  const step = 2
  for (let y = 2; y < canvas.height - 2; y += step) {
    for (let x = 2; x < canvas.width - 2; x += step) {
      const idx = (y * canvas.width + x) * 4
      const alpha = data[idx + 3]
      if (alpha > 40) {
        // Check if edge
        const leftAlpha = data[(y * canvas.width + (x - 2)) * 4 + 3]
        const rightAlpha = data[(y * canvas.width + (x + 2)) * 4 + 3]
        const topAlpha = data[((y - 2) * canvas.width + x) * 4 + 3]
        const bottomAlpha = data[((y + 2) * canvas.width + x) * 4 + 3]
        const isEdge = leftAlpha < 80 || rightAlpha < 80 || topAlpha < 80 || bottomAlpha < 80

        validPixelCoords.push({ x, y, isEdge })
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (validPixelCoords.length === 0) return { positions, dissolveNoise, tones, sizes, brightness }

  const bboxWidth = Math.max(1, maxX - minX)
  const bboxCenterX = (minX + maxX) / 2
  const bboxCenterY = (minY + maxY) / 2
  const scale = worldWidth / bboxWidth

  for (let i = 0; i < count; i++) {
    const randomIdx = Math.floor(Math.random() * validPixelCoords.length)
    const pt = validPixelCoords[randomIdx]

    const wx = centerX + (pt.x - bboxCenterX) * scale + (Math.random() - 0.5) * jitter
    const wy = centerY - (pt.y - bboxCenterY) * scale + (Math.random() - 0.5) * jitter
    const wz = (Math.random() - 0.5) * 1.0

    const i3 = i * 3
    positions[i3] = wx
    positions[i3 + 1] = wy
    positions[i3 + 2] = wz

    // Thanos dissolution wave coordinate
    const normX = (pt.x - minX) / bboxWidth
    dissolveNoise[i] = normX * 0.70 + Math.random() * 0.30

    // Tonal variation: crisp silver-white edge with gentle silver interior
    if (pt.isEdge) {
      tones[i3] = 0.92
      tones[i3 + 1] = 0.94
      tones[i3 + 2] = 0.96
      sizes[i] = 0.58 + Math.random() * 0.20
      brightness[i] = 0.75 + Math.random() * 0.15
    } else {
      tones[i3] = 0.68 + Math.random() * 0.15
      tones[i3 + 1] = 0.70 + Math.random() * 0.15
      tones[i3 + 2] = 0.74 + Math.random() * 0.15
      sizes[i] = 0.45 + Math.random() * 0.20
      brightness[i] = 0.55 + Math.random() * 0.15
    }
  }

  return { positions, dissolveNoise, tones, sizes, brightness }
}

function generatePortfolioGlyphs(
  count: number,
  centerX: number,
  centerY: number,
  worldWidth: number,
  fontSize: number,
  jitter: number
): {
  positions: Float32Array
  sweepNormalizedX: Float32Array
  letterIndices: Float32Array
  tones: Float32Array
  sizes: Float32Array
  brightness: Float32Array
} {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const positions = new Float32Array(count * 3)
  const sweepNormalizedX = new Float32Array(count)
  const letterIndices = new Float32Array(count)
  const tones = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const brightness = new Float32Array(count)

  if (!ctx) return { positions, sweepNormalizedX, letterIndices, tones, sizes, brightness }

  canvas.width = 2400
  canvas.height = 600

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 ${fontSize}px 'Syne', 'Inter', sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.imageSmoothingEnabled = true

  const word = 'PORTFOLIO'
  const letterPositions: Array<{ char: string; x: number; width: number }> = []

  let currentX = 120
  for (let c = 0; c < word.length; c++) {
    const char = word[c]
    const w = ctx.measureText(char).width
    letterPositions.push({ char, x: currentX, width: w })
    currentX += w + fontSize * 0.26 // generous letter-spacing
  }

  const totalTextWidth = currentX - 120
  const startCanvasX = (canvas.width - totalTextWidth) / 2
  const textY = canvas.height / 2

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let c = 0; c < word.length; c++) {
    const lp = letterPositions[c]
    ctx.fillText(lp.char, startCanvasX + (lp.x - 120), textY)
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data

  let minX = canvas.width
  let maxX = 0
  let minY = canvas.height
  let maxY = 0

  const validPixelCoords: Array<{ x: number; y: number; letterIdx: number; isEdge: boolean }> = []

  const step = 2
  for (let y = 2; y < canvas.height - 2; y += step) {
    for (let x = 2; x < canvas.width - 2; x += step) {
      const idx = (y * canvas.width + x) * 4
      if (data[idx + 3] > 40) {
        let letterIdx = 0
        const relX = x - startCanvasX + 120
        for (let l = 0; l < letterPositions.length; l++) {
          if (relX >= letterPositions[l].x - 8 && relX <= letterPositions[l].x + letterPositions[l].width + 8) {
            letterIdx = l
            break
          }
        }

        const leftAlpha = data[(y * canvas.width + (x - 2)) * 4 + 3]
        const rightAlpha = data[(y * canvas.width + (x + 2)) * 4 + 3]
        const isEdge = leftAlpha < 80 || rightAlpha < 80

        validPixelCoords.push({ x, y, letterIdx, isEdge })
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (validPixelCoords.length === 0) return { positions, sweepNormalizedX, letterIndices, tones, sizes, brightness }

  const bboxWidth = Math.max(1, maxX - minX)
  const bboxCenterX = (minX + maxX) / 2
  const bboxCenterY = (minY + maxY) / 2
  const scale = worldWidth / bboxWidth

  for (let i = 0; i < count; i++) {
    const randomIdx = Math.floor(Math.random() * validPixelCoords.length)
    const pt = validPixelCoords[randomIdx]

    const wx = centerX + (pt.x - bboxCenterX) * scale + (Math.random() - 0.5) * jitter
    const wy = centerY - (pt.y - bboxCenterY) * scale + (Math.random() - 0.5) * jitter
    const wz = (Math.random() - 0.5) * 1.0

    const i3 = i * 3
    positions[i3] = wx
    positions[i3 + 1] = wy
    positions[i3 + 2] = wz

    sweepNormalizedX[i] = (pt.x - minX) / bboxWidth
    letterIndices[i] = pt.letterIdx

    if (pt.isEdge) {
      tones[i3] = 0.90
      tones[i3 + 1] = 0.92
      tones[i3 + 2] = 0.95
      sizes[i] = 0.56 + Math.random() * 0.18
      brightness[i] = 0.72 + Math.random() * 0.15
    } else {
      tones[i3] = 0.65 + Math.random() * 0.15
      tones[i3 + 1] = 0.68 + Math.random() * 0.15
      tones[i3 + 2] = 0.72 + Math.random() * 0.15
      sizes[i] = 0.44 + Math.random() * 0.18
      brightness[i] = 0.52 + Math.random() * 0.15
    }
  }

  return { positions, sweepNormalizedX, letterIndices, tones, sizes, brightness }
}

async function generatePortraitPoints(
  imageSrc: string,
  count: number,
  centerX: number,
  centerY: number,
  worldWidth: number,
  worldHeight: number,
  jitter: number
): Promise<{
  positions: Float32Array
  brightness: Float32Array
  tones: Float32Array
  sizes: Float32Array
}> {
  const positions = new Float32Array(count * 3)
  const brightness = new Float32Array(count)
  const tones = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.crossOrigin = 'anonymous'
      el.onload = () => resolve(el)
      el.onerror = (e) => reject(e)
      el.src = imageSrc
    })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('2D context unavailable')

    const naturalW = img.naturalWidth || 944
    const naturalH = img.naturalHeight || 1050

    // Full native resolution sampling to avoid downsampling blur & aliasing
    const sampleWidth = naturalW
    const sampleHeight = naturalH
    canvas.width = sampleWidth
    canvas.height = sampleHeight

    ctx.clearRect(0, 0, sampleWidth, sampleHeight)
    ctx.drawImage(img, 0, 0, naturalW, naturalH)

    const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight)
    const data = imgData.data

    interface CandidatePoint {
      x: number
      y: number
      zOffset: number
      weight: number
      toneR: number
      toneG: number
      toneB: number
      size: number
      brightness: number
    }

    const candidatePoints: CandidatePoint[] = []

    const getPixelInfo = (px: number, py: number): { lum: number; alpha: number } => {
      const cx = Math.max(0, Math.min(sampleWidth - 1, Math.round(px)))
      const cy = Math.max(0, Math.min(sampleHeight - 1, Math.round(py)))
      const i = (cy * sampleWidth + cx) * 4
      const alpha = data[i + 3]
      const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
      return { lum, alpha }
    }

    // Precise grid sampling across native dimensions
    const step = 1.35
    for (let y = 4; y < sampleHeight - 4; y += step) {
      for (let x = 4; x < sampleWidth - 4; x += step) {
        const { lum, alpha } = getPixelInfo(x, y)
        if (alpha < 24) continue // Exclude background wall cleanly

        // Normalized coordinates relative to facial center
        const nx = (x - sampleWidth * 0.50) / (sampleWidth * 0.32)
        const ny = (y - sampleHeight * 0.32) / (sampleHeight * 0.26)

        // Gradient edge detection for facial contours & sharp features
        const left = getPixelInfo(x - 2, y).lum
        const right = getPixelInfo(x + 2, y).lum
        const top = getPixelInfo(x, y - 2).lum
        const bottom = getPixelInfo(x, y + 2).lum
        const edgeContrast = Math.abs(right - left) + Math.abs(bottom - top)
        const isDetailEdge = edgeContrast > 0.07

        // Anatomical feature zones
        const isFaceZone = Math.abs(nx) < 0.90 && ny > -0.55 && ny < 0.72
        const isEyesBrows = Math.abs(nx) < 0.74 && ny > -0.38 && ny < 0.06
        const isNoseLips = Math.abs(nx) < 0.48 && ny >= 0.06 && ny < 0.46
        const isDarkZone = lum < 0.16 && alpha > 30

        // Lower body gradual falloff (starts below chest, smoothly dissolves into black void)
        let fade = 1.0
        if (y > sampleHeight * 0.74) {
          fade = Math.max(0.0, Math.min(1.0, 1.0 - (y - sampleHeight * 0.74) / (sampleHeight * 0.24)))
          fade = Math.pow(fade, 1.35)
        }

        // Sampling probability: high density along anatomical features, never zero for dark hair/clothing
        let prob = 0.58
        let weight = 0.65

        if (isDetailEdge && (isEyesBrows || isNoseLips)) {
          prob = 0.99
          weight = 4.2
        } else if (isDetailEdge && isFaceZone) {
          prob = 0.96
          weight = 3.4
        } else if (isEyesBrows || isNoseLips) {
          prob = 0.94
          weight = 2.8
        } else if (isFaceZone) {
          prob = 0.88
          weight = 1.8
        } else if (isDarkZone) {
          // Retain dark hair and black sweatshirt as visible low-intensity silver grains
          prob = 0.76
          weight = 0.95
        } else {
          prob = 0.60
          weight = 0.65
        }

        weight *= fade
        if (Math.random() > prob) continue

        const jx = x + (Math.random() - 0.5) * step * 0.85
        const jy = y + (Math.random() - 0.5) * step * 0.85

        // Sculpted 4-stop silver tonal palette calibrated to actual image luminance percentiles
        let toneR = 0.40
        let toneG = 0.44
        let toneB = 0.50
        let pointAlpha = 0.48
        let pointSize = 0.82

        if (lum < 0.14) {
          // Deep shadows & hair/clothing: subtle low-intensity silver (visible, never pitch black)
          const t = lum / 0.14
          toneR = 0.38 + 0.12 * t
          toneG = 0.42 + 0.12 * t
          toneB = 0.48 + 0.12 * t
          pointAlpha = (0.42 + 0.18 * t) * fade
          pointSize = 0.82
        } else if (lum < 0.32) {
          // Facial shadows & contours: cool platinum silver
          const t = (lum - 0.14) / 0.18
          toneR = 0.50 + 0.22 * t
          toneG = 0.54 + 0.22 * t
          toneB = 0.60 + 0.22 * t
          pointAlpha = (0.60 + 0.16 * t) * fade
          pointSize = 0.94
        } else if (lum < 0.58) {
          // Facial midtones (cheeks, bridge of nose, chin): luminous refined silver
          const t = (lum - 0.32) / 0.26
          toneR = 0.72 + 0.16 * t
          toneG = 0.76 + 0.14 * t
          toneB = 0.82 + 0.10 * t
          pointAlpha = (0.76 + 0.14 * t) * fade
          pointSize = 1.05
        } else {
          // Highlights (forehead, nose tip highlight): restrained silver-white (no blown-out white blobs)
          const t = Math.min(1.0, (lum - 0.58) / 0.38)
          toneR = 0.88 + 0.06 * t
          toneG = 0.90 + 0.05 * t
          toneB = 0.94 + 0.04 * t
          pointAlpha = (0.88 + 0.06 * t) * fade
          pointSize = 1.15
        }

        // Restrained anatomical 3D depth (avoids warping or scattering facial planes)
        const headDome = Math.sqrt(Math.max(0.0, 1.0 - Math.min(1.0, (nx / 1.05) ** 2 + (ny / 1.15) ** 2))) * 2.2

        let zRelief = 0.0
        // Nose bridge & tip
        if (Math.abs(nx) < 0.18 && ny > -0.15 && ny < 0.18) {
          zRelief += (1.0 - Math.abs(nx) / 0.18) * (1.0 - Math.abs(ny) / 0.18) * 1.6
        }
        // Brow ridge
        if (Math.abs(nx) < 0.40 && ny > -0.36 && ny < -0.16) {
          zRelief += (1.0 - Math.abs(nx) / 0.40) * 0.8
        }
        // Eye socket recession
        if (Math.abs(nx) > 0.10 && Math.abs(nx) < 0.36 && ny > -0.28 && ny < -0.06) {
          zRelief -= 0.8
        }
        // Cheekbones
        if (Math.abs(nx) > 0.24 && Math.abs(nx) < 0.65 && ny > -0.05 && ny < 0.26) {
          zRelief += 0.9 * (1.0 - Math.min(1.0, Math.abs(Math.abs(nx) - 0.45) / 0.22))
        }
        // Chin
        if (Math.abs(nx) < 0.30 && ny > 0.42 && ny < 0.68) {
          zRelief += 0.7 * (1.0 - Math.abs(nx) / 0.30)
        }
        // Neck
        if (Math.abs(nx) < 0.36 && ny > 0.68 && ny < 0.98) {
          zRelief -= 1.1
        }
        // Shoulders & torso sweep
        if (ny > 0.98) {
          zRelief += (1.0 - Math.min(1.0, Math.abs(nx) / 1.8)) * 0.8 - (ny - 0.98) * 0.6
        }

        const zOffset = headDome + zRelief + (Math.random() - 0.5) * 0.25

        candidatePoints.push({
          x: jx,
          y: jy,
          zOffset,
          weight,
          toneR,
          toneG,
          toneB,
          size: pointSize,
          brightness: pointAlpha,
        })
      }
    }

    // Add ambient stray dust halo particles (outer atmosphere)
    const haloCount = Math.floor(count * 0.05)
    for (let h = 0; h < haloCount; h++) {
      const angle = Math.random() * Math.PI * 2
      const radiusX = (0.42 + Math.random() * 0.24) * sampleWidth
      const radiusY = (0.44 + Math.random() * 0.28) * sampleHeight
      const hx = sampleWidth * 0.50 + Math.cos(angle) * radiusX
      const hy = sampleHeight * 0.45 + Math.sin(angle) * radiusY

      candidatePoints.push({
        x: hx,
        y: hy,
        zOffset: (Math.random() - 0.5) * 8.0,
        weight: 0.35,
        toneR: 0.784,
        toneG: 0.824,
        toneB: 0.902,
        size: 0.75,
        brightness: 0.15,
      })
    }

    if (candidatePoints.length === 0) throw new Error('No candidate points found')

    // Cumulative weights for true importance-weighted sampling
    const cumulativeWeights = new Float64Array(candidatePoints.length)
    let totalWeight = 0
    for (let i = 0; i < candidatePoints.length; i++) {
      totalWeight += candidatePoints[i].weight
      cumulativeWeights[i] = totalWeight
    }

    const scaleX = worldWidth / sampleWidth
    const scaleY = worldHeight / sampleHeight

    for (let i = 0; i < count; i++) {
      // Binary search on cumulative weights for importance sampling
      const targetWeight = Math.random() * totalWeight
      let low = 0
      let high = candidatePoints.length - 1
      let selectedIdx = 0

      while (low <= high) {
        const mid = (low + high) >> 1
        if (cumulativeWeights[mid] >= targetWeight) {
          selectedIdx = mid
          high = mid - 1
        } else {
          low = mid + 1
        }
      }

      const pt = candidatePoints[selectedIdx]
      const wx = centerX + (pt.x - sampleWidth / 2) * scaleX + (Math.random() - 0.5) * jitter
      const wy = centerY - (pt.y - sampleHeight / 2) * scaleY + (Math.random() - 0.5) * jitter
      const wz = pt.zOffset

      const i3 = i * 3
      positions[i3] = wx
      positions[i3 + 1] = wy
      positions[i3 + 2] = wz

      tones[i3] = pt.toneR
      tones[i3 + 1] = pt.toneG
      tones[i3 + 2] = pt.toneB

      sizes[i] = pt.size
      brightness[i] = pt.brightness
    }

    return { positions, brightness, tones, sizes }
  } catch (err) {
    console.warn('Fallback silhouette portrait used:', err)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const rx = Math.sqrt(Math.random()) * (worldWidth * 0.44)
      const ry = Math.sqrt(Math.random()) * (worldHeight * 0.48)
      const i3 = i * 3
      positions[i3] = centerX + Math.cos(angle) * rx
      positions[i3 + 1] = centerY + Math.sin(angle) * ry
      positions[i3 + 2] = (Math.random() - 0.5) * 1.0

      tones[i3] = 0.70
      tones[i3 + 1] = 0.72
      tones[i3 + 2] = 0.75

      sizes[i] = 0.50
      brightness[i] = 0.50
    }
    return { positions, brightness, tones, sizes }
  }
}
