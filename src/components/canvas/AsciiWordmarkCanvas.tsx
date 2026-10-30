import { useEffect, useRef, useCallback } from 'react'

interface AsciiCell {
  originX: number
  originY: number
  x: number
  y: number
  vx: number
  vy: number
  char: string
  altChars: string[]
  brightness: number
  isActive: boolean
  flickerSpeed: number
  flickerPhase: number
}

interface AsciiWordmarkCanvasProps {
  wordmark?: string
  className?: string
}

// Restrained, typographic character palette
const RESTING_GLYPHS = ['·', '·', ':', '+', '·']

export function AsciiWordmarkCanvas({
  wordmark = 'ATIF',
  className = '',
}: AsciiWordmarkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mutable animation state references to avoid React render churn
  const stateRef = useRef<{
    cells: AsciiCell[]
    animId: number | null
    isVisible: boolean
    isReducedMotion: boolean
    width: number
    height: number
    dpr: number
    pointer: {
      x: number
      y: number
      targetX: number
      targetY: number
      isActive: boolean
    }
  }>({
    cells: [],
    animId: null,
    isVisible: false,
    isReducedMotion: false,
    width: 0,
    height: 0,
    dpr: 1,
    pointer: {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      isActive: false,
    },
  })

  // Precompute and sample text mask into ASCII grid
  const rebuildGrid = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const width = Math.floor(rect.width)
    // Adaptive height based on available width
    const height = width < 480 ? 280 : width < 768 ? 340 : 420
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const state = stateRef.current
    state.width = width
    state.height = height
    state.dpr = dpr

    // Determine cell sizing based on viewport density
    const isMobile = width < 540
    const isTablet = width < 960
    const cellWidth = isMobile ? 8 : isTablet ? 10 : 12
    const cellHeight = isMobile ? 12 : isTablet ? 14 : 16

    const cols = Math.floor(width / cellWidth)
    const rows = Math.floor(height / cellHeight)

    const gridOffsetX = (width - cols * cellWidth) / 2 + cellWidth / 2
    const gridOffsetY = (height - rows * cellHeight) / 2 + cellHeight / 2

    // 1. Render wordmark to offscreen canvas
    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
    if (!offCtx) return

    offCtx.fillStyle = '#000000'
    offCtx.fillRect(0, 0, width, height)

    // Calculate font size to command ~78% of available container width
    const targetTextWidth = width * (isMobile ? 0.88 : 0.74)
    let fontSize = Math.floor(height * (isMobile ? 0.52 : 0.62))

    offCtx.font = `900 ${fontSize}px "Cinzel", "Syne", "Inter", -apple-system, sans-serif`
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'

    // Scale font size down if it exceeds target width
    let measured = offCtx.measureText(wordmark).width
    if (measured > targetTextWidth && measured > 0) {
      fontSize = Math.floor(fontSize * (targetTextWidth / measured))
      offCtx.font = `900 ${fontSize}px "Cinzel", "Syne", "Inter", -apple-system, sans-serif`
    }

    offCtx.fillStyle = '#FFFFFF'
    // Render wordmark with deliberate letter spacing
    offCtx.fillText(wordmark, width / 2, height / 2 + (isMobile ? 2 : 4))

    const imgData = offCtx.getImageData(0, 0, width, height)
    const pixels = imgData.data
    const finalMeasured = offCtx.measureText(wordmark).width
    const wordmarkLeft = (width - finalMeasured) / 2

    // 2. Build cell grid from luminance samples
    const cells: AsciiCell[] = []
    const EDGE_RAMP = ['.', ':', '-', '+', '*']

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = gridOffsetX + c * cellWidth
        const oy = gridOffsetY + r * cellHeight

        const px = Math.min(width - 1, Math.max(0, Math.floor(ox)))
        const py = Math.min(height - 1, Math.max(0, Math.floor(oy)))
        const pIdx = (py * width + px) * 4

        const red = pixels[pIdx]
        const green = pixels[pIdx + 1]
        const blue = pixels[pIdx + 2]
        const alpha = pixels[pIdx + 3]

        const lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255 * (alpha / 255)
        const isActive = lum > 0.16

        let char = '·'
        let altChars: string[] = ['·']

        if (isActive) {
          if (lum < 0.55) {
            // Anti-aliased stroke contour / edge
            const edgeIdx = Math.min(
              EDGE_RAMP.length - 1,
              Math.max(0, Math.floor((lum / 0.55) * EDGE_RAMP.length))
            )
            char = EDGE_RAMP[edgeIdx]
            altChars = [char, EDGE_RAMP[Math.max(0, edgeIdx - 1)], char]
          } else {
            // Solid stroke body: map to letter zone across the ATIF wordmark
            const u = finalMeasured > 0 ? (ox - wordmarkLeft) / finalMeasured : 0.5
            const seed = (c * 7 + r * 11) % 6

            if (u < 0.28) {
              // 'A' zone
              const aVariants = ['A', '@', 'A', '#', 'A', '*']
              char = aVariants[seed]
              altChars = ['A', '@', '#', 'A']
            } else if (u < 0.52) {
              // 'T' zone
              const tVariants = ['T', '+', 'T', '=', 'T', '#']
              char = tVariants[seed]
              altChars = ['T', '+', '=', 'T']
            } else if (u < 0.72) {
              // 'I' zone
              const iVariants = ['I', ':', 'I', '|', 'I', '!']
              char = iVariants[seed]
              altChars = ['I', ':', '|', 'I']
            } else {
              // 'F' zone
              const fVariants = ['F', '%', 'F', '#', 'F', '=']
              char = fVariants[seed]
              altChars = ['F', '%', '#', 'F']
            }
          }
        } else {
          // Ambient resting glyph
          char = RESTING_GLYPHS[(c + r * 3) % RESTING_GLYPHS.length]
          altChars = [char]
        }

        cells.push({
          originX: ox,
          originY: oy,
          x: ox,
          y: oy,
          vx: 0,
          vy: 0,
          char,
          altChars,
          brightness: lum,
          isActive,
          flickerSpeed: 0.02 + Math.random() * 0.04,
          flickerPhase: Math.random() * Math.PI * 2,
        })
      }
    }

    state.cells = cells
  }, [wordmark])

  useEffect(() => {
    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    stateRef.current.isReducedMotion = isReduced

    rebuildGrid()

    const handleResize = () => {
      rebuildGrid()
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [rebuildGrid])

  // Core Animation Loop with Spring-Physics and Dynamic Rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frameCount = 0

    const render = () => {
      const state = stateRef.current
      if (!state.isVisible) {
        state.animId = requestAnimationFrame(render)
        return
      }

      frameCount++
      const { cells, width, height, dpr, pointer, isReducedMotion } = state

      // Smooth pointer interpolation
      pointer.x += (pointer.targetX - pointer.x) * 0.15
      pointer.y += (pointer.targetY - pointer.y) * 0.15

      ctx.save()
      ctx.scale(dpr, dpr)

      // 1. Deep Black Canvas Background
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      // 2. Subtle Volumetric Central Gradient
      const radial = ctx.createRadialGradient(
        width * 0.50,
        height * 0.50,
        10,
        width * 0.50,
        height * 0.50,
        width * 0.55
      )
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.038)')
      radial.addColorStop(0.5, 'rgba(255, 255, 255, 0.012)')
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = radial
      ctx.fillRect(0, 0, width, height)

      // 3. Typographic Font Setup
      const isMobile = width < 540
      const fontSize = isMobile ? 9 : 11
      ctx.font = `${fontSize}px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const forceRadius = isMobile ? 70 : 105
      const forceRadiusSq = forceRadius * forceRadius
      const stiffness = 0.09
      const damping = 0.82
      const forceStrength = isMobile ? 3.0 : 4.8

      // 4. Update Physics & Draw Cells
      const cellCount = cells.length
      for (let i = 0; i < cellCount; i++) {
        const cell = cells[i]

        if (!isReducedMotion) {
          // Hooke's Law Spring Force towards rest origin
          const springX = (cell.originX - cell.x) * stiffness
          const springY = (cell.originY - cell.y) * stiffness

          let pushX = 0
          let pushY = 0

          // Pointer Deflection Force
          if (pointer.isActive) {
            const dx = cell.x - pointer.x
            const dy = cell.y - pointer.y
            const distSq = dx * dx + dy * dy

            if (distSq < forceRadiusSq && distSq > 0.01) {
              const dist = Math.sqrt(distSq)
              const norm = 1.0 - dist / forceRadius
              const force = norm * norm * forceStrength
              pushX = (dx / dist) * force
              pushY = (dy / dist) * force
            }
          }

          cell.vx = (cell.vx + springX + pushX) * damping
          cell.vy = (cell.vy + springY + pushY) * damping
          cell.x += cell.vx
          cell.y += cell.vy
        } else {
          cell.x = cell.originX
          cell.y = cell.originY
        }

        // Active vs Resting Glyph Styling
        if (cell.isActive) {
          const dispSq =
            (cell.x - cell.originX) * (cell.x - cell.originX) +
            (cell.y - cell.originY) * (cell.y - cell.originY)

          let displayChar = cell.char
          if (!isReducedMotion && cell.altChars.length > 1) {
            // Subtle living shimmer (cycles occasionally)
            const phase = Math.sin(frameCount * cell.flickerSpeed + cell.flickerPhase)
            if (phase > 0.88) {
              const altIdx = Math.floor((phase - 0.88) / 0.12 * cell.altChars.length)
              displayChar = cell.altChars[altIdx % cell.altChars.length]
            }
          }

          if (dispSq > 2.0 && !isReducedMotion) {
            // Cool-blue energetic accent during pointer displacement
            const disp = Math.sqrt(dispSq)
            const t = Math.min(1.0, disp / 20.0)
            const r = Math.round(230 - 90 * t)
            const g = Math.round(238 - 50 * t)
            const b = Math.round(250 + 5 * t)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.85 + 0.15 * cell.brightness})`
          } else {
            // Resting warm silver-white with high-contrast luminance
            const alpha = 0.72 + 0.28 * cell.brightness
            ctx.fillStyle = `rgba(238, 242, 248, ${alpha.toFixed(2)})`
          }

          ctx.fillText(displayChar, cell.x, cell.y)
        } else {
          // Low-contrast ambient resting grid
          ctx.fillStyle = 'rgba(255, 255, 255, 0.075)'
          ctx.fillText(cell.char, cell.x, cell.y)
        }
      }

      ctx.restore()
      state.animId = requestAnimationFrame(render)
    }

    const state = stateRef.current
    state.animId = requestAnimationFrame(render)

    return () => {
      if (state.animId !== null) {
        cancelAnimationFrame(state.animId)
        state.animId = null
      }
    }
  }, [])

  // Pointer Interaction Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    stateRef.current.pointer.targetX = e.clientX - rect.left
    stateRef.current.pointer.targetY = e.clientY - rect.top
    stateRef.current.pointer.isActive = true
  }

  const handlePointerLeave = () => {
    stateRef.current.pointer.targetX = -9999
    stateRef.current.pointer.targetY = -9999
    stateRef.current.pointer.isActive = false
  }

  // IntersectionObserver to pause hot loop when offscreen
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        stateRef.current.isVisible = entry.isIntersecting
      },
      { threshold: 0.05 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className={`relative w-full overflow-hidden select-none touch-none ${className}`}
      style={{ cursor: 'default' }}
      aria-label="Interactive ASCII ATIF typographic canvas"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        aria-hidden="true"
      />
      {/* Screen reader fallback text */}
      <span className="sr-only">Interactive ASCII wordmark spelling ATIF</span>
    </div>
  )
}
