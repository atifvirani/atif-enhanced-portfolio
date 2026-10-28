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

  // 1. Ring Impact Target (Initial narrow ring at center)
  const ringImpactPos = toWorld(0.50, 0.50)
  const ringRadius = isMobile ? 2.2 : 2.8
  const ringImpact = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2
    const i3 = i * 3
    const r = ringRadius * (0.88 + Math.random() * 0.24)
    ringImpact[i3] = ringImpactPos.x + Math.cos(theta) * r + (Math.random() - 0.5) * 0.2
    ringImpact[i3 + 1] = ringImpactPos.y + Math.sin(theta) * r + (Math.random() - 0.5) * 0.2
    ringImpact[i3 + 2] = (Math.random() - 0.5) * 0.8
  }

  // 2. Impact Burst Target (Fine radial dispersion from impact point to full viewport)
  const centerPos = toWorld(0.50, 0.50)
  const impactBurst = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    // Controlled exponential spread filling viewport with fine silver dust
    const spreadPower = Math.pow(Math.random(), 0.55)
    const maxRadius = isMobile ? visibleWidth * 0.70 : visibleWidth * 0.65
    const radius = spreadPower * maxRadius
    const i3 = i * 3
    impactBurst[i3] = centerPos.x + Math.cos(angle) * radius + (Math.random() - 0.5) * 4.0
    impactBurst[i3 + 1] = centerPos.y + Math.sin(angle) * radius * (visibleHeight / visibleWidth) + (Math.random() - 0.5) * 4.0
    impactBurst[i3 + 2] = (Math.random() - 0.5) * 22.0
  }

  // 3. ATIF Typography Target
  const atifCenter = toWorld(0.50, isMobile ? 0.48 : 0.47)
  const atifWidth = isMobile ? visibleWidth * 0.76 : visibleWidth * 0.46
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
    isMobile ? 145 : 190,
    0.15
  )

  // 4. PORTFOLIO Typography Target with discrete letter indices
  const portfolioCenter = toWorld(0.50, isMobile ? 0.50 : 0.50)
  const portWidth = isMobile ? visibleWidth * 0.86 : visibleWidth * 0.72
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
    isMobile ? 82 : 115,
    0.16
  )

  // 5. Atif Portrait Target (Commanding central vertical axis, breathing room below navbar)
  const portraitAspect = 944 / 1050
  const maxPortraitH = isMobile ? visibleHeight * 0.52 : visibleHeight * 0.72
  const maxPortraitW = isMobile ? visibleWidth * 0.75 : visibleWidth * 0.86
  const portraitWidth = Math.min(maxPortraitH * portraitAspect, maxPortraitW)
  const portraitHeight = portraitWidth / portraitAspect
  const portraitCenter = toWorld(0.50, isMobile ? 0.42 : 0.45)

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
    0.08
  )

  // 6. Tabletop Particle Field (Fine ambient silver-dust plane)
  const table = new Float32Array(count * 3)
  const tableTones = new Float32Array(count * 3)
  const tableSizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    table[i3] = (Math.random() - 0.5) * (visibleWidth * 1.25)
    table[i3 + 1] = (Math.random() - 0.5) * (visibleHeight * 0.95) - 6.0
    table[i3 + 2] = (Math.random() - 0.5) * 35.0

    const toneVal = 0.42 + Math.random() * 0.32
    tableTones[i3] = toneVal * 0.95
    tableTones[i3 + 1] = toneVal * 0.98
    tableTones[i3 + 2] = toneVal

    tableSizes[i] = Math.random() < 0.85 ? 0.42 + Math.random() * 0.22 : 0.68 + Math.random() * 0.30
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

/**
 * Samples high-density typography contours and interior stippling.
 */
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
      if (alpha > 36) {
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

    // Organic dissolution gradient (left-to-right sweep with vertical noise)
    const normX = (pt.x - minX) / bboxWidth
    const normY = (pt.y - minY) / Math.max(1, maxY - minY)
    dissolveNoise[i] = normX * 0.75 + normY * 0.15 + (Math.random() - 0.5) * 0.20

    // Tonal variation: refined silver-white contours with soft silver core
    if (pt.isEdge) {
      tones[i3] = 0.94
      tones[i3 + 1] = 0.95
      tones[i3 + 2] = 0.98
      sizes[i] = 0.56 + Math.random() * 0.18
      brightness[i] = 0.82 + Math.random() * 0.14
    } else {
      tones[i3] = 0.72 + Math.random() * 0.14
      tones[i3 + 1] = 0.74 + Math.random() * 0.14
      tones[i3 + 2] = 0.78 + Math.random() * 0.14
      sizes[i] = 0.44 + Math.random() * 0.18
      brightness[i] = 0.60 + Math.random() * 0.14
    }
  }

  return { positions, dissolveNoise, tones, sizes, brightness }
}

/**
 * Samples PORTFOLIO lettering with progressive letter indices for stop-motion assembly.
 */
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
    currentX += w + fontSize * 0.26
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
      if (data[idx + 3] > 36) {
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
      tones[i3] = 0.92
      tones[i3 + 1] = 0.94
      tones[i3 + 2] = 0.97
      sizes[i] = 0.54 + Math.random() * 0.16
      brightness[i] = 0.78 + Math.random() * 0.14
    } else {
      tones[i3] = 0.68 + Math.random() * 0.14
      tones[i3 + 1] = 0.70 + Math.random() * 0.14
      tones[i3 + 2] = 0.75 + Math.random() * 0.14
      sizes[i] = 0.42 + Math.random() * 0.16
      brightness[i] = 0.56 + Math.random() * 0.14
    }
  }

  return { positions, sweepNormalizedX, letterIndices, tones, sizes, brightness }
}

/**
 * Samples the true particle portrait points with continuous importance weighting,
 * smooth anatomical depth relief, and zero artificial horizontal shelves.
 */
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

    const naturalW = img.naturalWidth || 944
    const naturalH = img.naturalHeight || 1050

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('2D context unavailable')

    canvas.width = naturalW
    canvas.height = naturalH

    ctx.clearRect(0, 0, naturalW, naturalH)
    ctx.drawImage(img, 0, 0, naturalW, naturalH)

    const imgData = ctx.getImageData(0, 0, naturalW, naturalH)
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
      const cx = Math.max(0, Math.min(naturalW - 1, Math.round(px)))
      const cy = Math.max(0, Math.min(naturalH - 1, Math.round(py)))
      const i = (cy * naturalW + cx) * 4
      const alpha = data[i + 3]
      const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
      return { lum, alpha }
    }

    // Actual anatomical facial center in 944x1050 image
    const faceCenterX = 464
    const faceCenterY = 410
    const faceRadiusX = 220
    const faceRadiusY = 260

    const step = 1.4
    for (let y = 10; y < naturalH - 10; y += step) {
      for (let x = 10; x < naturalW - 10; x += step) {
        const { lum, alpha } = getPixelInfo(x, y)
        // Discard outer transparent pixels and pure black background margin
        if (alpha < 20 || (lum < 0.035 && alpha < 180)) continue

        // Normalized distance from facial center
        const dx = (x - faceCenterX) / faceRadiusX
        const dy = (y - faceCenterY) / faceRadiusY
        const faceRadialDist = Math.sqrt(dx * dx + dy * dy)

        // Gradient edge detection for crisp facial contours (eyes, lips, nose, jaw)
        const left = getPixelInfo(x - 2, y).lum
        const right = getPixelInfo(x + 2, y).lum
        const top = getPixelInfo(x, y - 2).lum
        const bottom = getPixelInfo(x, y + 2).lum
        const edgeContrast = Math.abs(right - left) + Math.abs(bottom - top)
        const isDetailEdge = edgeContrast > 0.06

        // Continuous smooth weighting (no step discontinuities or cliffs!)
        // 1. Base weight proportional to luminance and edge contrast
        let weight = 0.70 + lum * 1.80

        // 2. High feature density around eyes, nose, lips
        if (faceRadialDist < 0.85) {
          const facialEmphasis = 1.0 - faceRadialDist / 0.85
          weight += facialEmphasis * 2.20
          if (isDetailEdge) {
            weight += 2.50
          }
        } else if (faceRadialDist < 1.30 && isDetailEdge) {
          // Jawline and hair silhouette
          weight += 1.80
        }

        // 3. Dark sweatshirt and hair midtones: ensure sufficient density without pitch black
        if (lum < 0.20 && faceRadialDist > 0.80) {
          weight = Math.max(weight, 1.10)
        }

        // 4. Smooth organic lower torso fade starting at y > 760 down to naturalH
        if (y > 760) {
          const torsoProgress = (y - 760) / (naturalH - 760)
          const torsoFade = Math.max(0.0, 1.0 - torsoProgress)
          weight *= Math.pow(torsoFade, 1.4)
        }

        // Probability rejection
        const sampleProb = Math.min(0.98, 0.40 + weight * 0.16)
        if (Math.random() > sampleProb) continue

        const jx = x + (Math.random() - 0.5) * step * 0.80
        const jy = y + (Math.random() - 0.5) * step * 0.80

        // 4-stop refined silver tonal palette (no blowouts, visible dark midtones)
        let toneR = 0.45
        let toneG = 0.48
        let toneB = 0.54
        let pointAlpha = 0.55
        let pointSize = 0.85

        if (lum < 0.14) {
          // Deep shadows, dark hair, knit sweatshirt: subtle visible platinum silver
          const t = lum / 0.14
          toneR = 0.40 + 0.14 * t
          toneG = 0.43 + 0.14 * t
          toneB = 0.50 + 0.12 * t
          pointAlpha = 0.48 + 0.16 * t
          pointSize = 0.82
        } else if (lum < 0.35) {
          // Facial shading, contours: refined cool silver
          const t = (lum - 0.14) / 0.21
          toneR = 0.54 + 0.18 * t
          toneG = 0.57 + 0.17 * t
          toneB = 0.62 + 0.16 * t
          pointAlpha = 0.64 + 0.14 * t
          pointSize = 0.94
        } else if (lum < 0.65) {
          // Skin midtones: luminous silver-white
          const t = (lum - 0.35) / 0.30
          toneR = 0.72 + 0.18 * t
          toneG = 0.74 + 0.17 * t
          toneB = 0.78 + 0.16 * t
          pointAlpha = 0.78 + 0.12 * t
          pointSize = 1.05
        } else {
          // Highlights (forehead, bridge of nose): crisp silver-white
          const t = Math.min(1.0, (lum - 0.65) / 0.35)
          toneR = 0.90 + 0.08 * t
          toneG = 0.91 + 0.07 * t
          toneB = 0.96 + 0.04 * t
          pointAlpha = 0.90 + 0.08 * t
          pointSize = 1.18
        }

        // Continuous anatomical 3D depth (Smooth, continuous Gaussians — zero stepped boxes)
        // 1. Cranium dome
        const headDomeDist = Math.min(1.0, faceRadialDist)
        const headDome = Math.sqrt(Math.max(0.0, 1.0 - headDomeDist * headDomeDist)) * 2.4

        // 2. Nose bridge & tip relief (Gaussian kernel)
        const noseDistSq = (dx * dx) / 0.04 + ((dy - 0.05) * (dy - 0.05)) / 0.06
        const noseRelief = Math.exp(-noseDistSq) * 1.80

        // 3. Brow ridge arch
        const browDistSq = (dx * dx) / 0.22 + ((dy + 0.22) * (dy + 0.22)) / 0.03
        const browRelief = Math.exp(-browDistSq) * 0.85

        // 4. Eye sockets recession
        const leftEyeDistSq = ((dx + 0.35) * (dx + 0.35)) / 0.04 + ((dy + 0.10) * (dy + 0.10)) / 0.03
        const rightEyeDistSq = ((dx - 0.35) * (dx - 0.35)) / 0.04 + ((dy + 0.10) * (dy + 0.10)) / 0.03
        const eyeRecession = (Math.exp(-leftEyeDistSq) + Math.exp(-rightEyeDistSq)) * 0.90

        // 5. Cheekbones
        const leftCheekSq = ((dx + 0.42) * (dx + 0.42)) / 0.08 + ((dy - 0.15) * (dy - 0.15)) / 0.08
        const rightCheekSq = ((dx - 0.42) * (dx - 0.42)) / 0.08 + ((dy - 0.15) * (dy - 0.15)) / 0.08
        const cheekRelief = (Math.exp(-leftCheekSq) + Math.exp(-rightCheekSq)) * 0.75

        // 6. Chin
        const chinDistSq = (dx * dx) / 0.10 + ((dy - 0.55) * (dy - 0.55)) / 0.05
        const chinRelief = Math.exp(-chinDistSq) * 0.70

        // 7. Smooth neck and shoulder slope
        let torsoSlope = 0.0
        if (dy > 0.65) {
          torsoSlope = -(dy - 0.65) * 0.80
        }

        const zOffset =
          headDome +
          noseRelief +
          browRelief -
          eyeRecession +
          cheekRelief +
          chinRelief +
          torsoSlope +
          (Math.random() - 0.5) * 0.18

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

    // Add subtle ambient dust halo particles around the head and shoulders
    const haloCount = Math.floor(count * 0.06)
    for (let h = 0; h < haloCount; h++) {
      const angle = Math.random() * Math.PI * 2
      const radiusX = (0.42 + Math.random() * 0.28) * naturalW
      const radiusY = (0.44 + Math.random() * 0.32) * naturalH
      const hx = naturalW * 0.50 + Math.cos(angle) * radiusX
      const hy = naturalH * 0.46 + Math.sin(angle) * radiusY

      candidatePoints.push({
        x: hx,
        y: hy,
        zOffset: (Math.random() - 0.5) * 6.0,
        weight: 0.30,
        toneR: 0.78,
        toneG: 0.82,
        toneB: 0.90,
        size: 0.70,
        brightness: 0.18,
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

    const scaleX = worldWidth / naturalW
    const scaleY = worldHeight / naturalH

    for (let i = 0; i < count; i++) {
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
      const wx = centerX + (pt.x - naturalW / 2) * scaleX + (Math.random() - 0.5) * jitter
      const wy = centerY - (pt.y - naturalH / 2) * scaleY + (Math.random() - 0.5) * jitter
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
