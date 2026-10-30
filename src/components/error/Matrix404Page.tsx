import { useEffect, useRef, useState } from 'react'
import { Terminal, RefreshCw, Home } from 'lucide-react'

interface Matrix404PageProps {
  errorTitle?: string
  errorMessage?: string
  errorDetails?: string
  onReset?: () => void
}

export function Matrix404Page({
  errorTitle = '404 // SIGNAL TERMINATED',
  errorMessage = 'The requested coordinates do not exist within the portfolio matrix.',
  errorDetails,
  onReset,
}: Matrix404PageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [timestamp] = useState(() => new Date().toISOString())
  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/unknown'

  // Canvas Matrix Digital Rain Effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      columns = Math.floor(width / fontSize)
      drops = new Array(columns).fill(1)
    }

    window.addEventListener('resize', handleResize)

    // Katakana, Latin, Math, and Binary Glyphs
    const chars = '01モヘヤモマミムメモラリルレロワン0123456789ABCDEF<>{}/*+-~#_λπ∑∆Ω'
    const fontSize = 14
    let columns = Math.floor(width / fontSize)
    let drops: number[] = new Array(columns).fill(1)

    // Stagger drop starts randomly
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50)
    }

    let mouseX = -1000
    let mouseY = -1000

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const render = () => {
      // Fade out background gently to create rain trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'
      ctx.fillRect(0, 0, width, height)

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Proximity to mouse cursor: brighter white disturbance
        const distToMouse = Math.hypot(x - mouseX, y - mouseY)
        if (distToMouse < 90) {
          ctx.fillStyle = '#ffffff'
        } else if (drops[i] % 7 === 0) {
          ctx.fillStyle = '#e2e8f0' // Silver white highlight
        } else if (drops[i] % 3 === 0) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.9)' // Emerald accent
        } else {
          ctx.fillStyle = 'rgba(5, 150, 105, 0.55)' // Matrix green falloff
        }

        ctx.fillText(text, x, y)

        if (y > height && Math.random() > 0.985) {
          drops[i] = 0
        }
        drops[i]++
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleReturnHome = () => {
    if (onReset) {
      onReset()
    } else {
      window.location.href = '/'
    }
  }

  const handleCopyDiagnostics = () => {
    const diagnostic = `ERROR: 404 Not Found\nURI: ${currentPath}\nTIME: ${new Date().toISOString()}\nAGENT: ${navigator.userAgent}`
    navigator.clipboard.writeText(diagnostic).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col justify-between select-none">
      {/* Background Matrix Digital Rain Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
      />

      {/* Atmospheric Vignette & Scanline Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-40" />

      {/* Top Status Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono-code text-[11px] uppercase tracking-[0.25em] text-zinc-400">
            SYSTEM CORE // ANOMALY DETECTED
          </span>
        </div>
        <div className="font-mono-code text-[11px] text-zinc-500 hidden sm:block">
          STATUS: 0x404_PAGE_FAULT
        </div>
      </header>

      {/* Central 404 Matrix Stage */}
      <main className="relative z-20 max-w-2xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center my-auto space-y-6">
        {/* Large Monospace 404 Glyph */}
        <div className="relative">
          <div className="font-mono-code text-7xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-[0_0_35px_rgba(16,185,129,0.35)]">
            404
          </div>
          <div className="absolute -inset-1 blur-xl opacity-20 bg-emerald-500 -z-10" />
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-medium tracking-tight text-white">
            {errorTitle}
          </h1>
          <p className="font-sans text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {/* Technical Diagnostics Box */}
        <div className="w-full bg-zinc-950/80 border border-white/10 p-4 sm:p-5 text-left font-mono-code text-xs space-y-2 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between text-zinc-500 border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase tracking-wider text-[10px]">Diagnostics Readout</span>
            </div>
            <button
              onClick={handleCopyDiagnostics}
              className="text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? 'COPIED ✓' : 'COPY LOG'}
            </button>
          </div>
          <div className="text-zinc-300 space-y-1 text-[11px] pt-1">
            <div><span className="text-zinc-500">REQUEST_PATH:</span> {currentPath}</div>
            <div><span className="text-zinc-500">EXCEPTION:</span> NULL_POINTER_COORDINATE</div>
            <div><span className="text-zinc-500">TIMESTAMP:</span> {timestamp}</div>
            {errorDetails && (
              <div className="text-rose-400 pt-1 border-t border-white/5 break-all">
                <span className="text-zinc-500">TRACE:</span> {errorDetails}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Return Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono-code text-xs">
          <button
            onClick={handleReturnHome}
            className="px-6 py-3.5 bg-white text-black font-semibold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Origin</span>
          </button>

          <a
            href="/#admin"
            className="px-6 py-3.5 bg-zinc-950 border border-white/15 text-zinc-300 hover:text-white hover:border-white/40 transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Terminal</span>
          </a>

          <button
            onClick={() => window.location.reload()}
            className="p-3.5 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Reload Matrix"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer Colophon */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/[0.08] flex items-center justify-between font-mono-code text-[11px] text-zinc-500">
        <div>Mohammed Atif &bull; Spatial Matrix v2.0</div>
        <div>Cuttack, Odisha, India</div>
      </footer>
    </div>
  )
}
