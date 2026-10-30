import { useEffect, useState, useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { LetterSwap } from '../fancy'

interface HeroSectionProps {
  onReplayIntro?: () => void
}

export function HeroSection({ onReplayIntro }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Parallax offsets as the hero scrolls away naturally
  const nameParallaxY = Math.min(40, scrollY * 0.12)
  const heroOpacity = Math.max(0, 1 - scrollY / 350)

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative w-full min-h-screen flex flex-col justify-between px-4 sm:px-12 lg:px-20 pt-20 sm:pt-24 lg:pt-24 pb-6 sm:pb-8 max-w-7xl mx-auto overflow-hidden pointer-events-none"
    >
      {/* Center 3D Space is kept open for the Three.js Particle Portrait */}
      <div className="flex-1 w-full min-h-[40vh] sm:min-h-[48vh]" aria-hidden="true" />

      {/* Hero Typography: MOHAMMED ATIF (High-End Editorial Tech) */}
      <div
        style={{
          transform: `translate3d(0, ${nameParallaxY}px, 0)`,
          opacity: heroOpacity,
        }}
        className="w-full flex flex-col items-center justify-center pb-2 sm:pb-4 transition-transform duration-75 ease-out will-change-transform pointer-events-auto"
      >
        {/* MOHAMMED: Editorial subtitle centered beneath portrait, wide tracking */}
        <p className="font-mono-code text-[11px] sm:text-xs font-normal tracking-[0.38em] pl-[0.38em] text-[#94A3B8] uppercase select-none mb-1.5 sm:mb-2 text-center">
          MOHAMMED
        </p>

        {/* ATIF: Refined architectural serif, silver-white #E2E8F0, soft lighting */}
        <div className="relative flex items-center justify-center">
          <h1 className="relative font-serif-luxury text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-medium tracking-[0.20em] text-[#E2E8F0] leading-none select-none pl-[0.20em] text-center drop-shadow-[0_2px_12px_rgba(255,255,255,0.06)]">
            ATIF
          </h1>
        </div>

        {/* Circular Scroll Target with Hairline */}
        <div className="flex flex-col items-center pt-3 sm:pt-4">
          <a
            href="#about"
            aria-label="Scroll down into portfolio sections"
            className="group flex flex-col items-center gap-1.5 transition-opacity duration-300 hover:opacity-100"
          >
            <div className="w-4 h-4 rounded-full border border-white/30 group-hover:border-white/80 flex items-center justify-center transition-colors duration-300">
              <div className="w-1 h-1 rounded-full bg-white/60 group-hover:bg-white animate-ping" />
            </div>
            <div className="w-px h-5 sm:h-7 bg-gradient-to-b from-white/40 via-white/15 to-transparent group-hover:from-white group-hover:h-8 transition-all duration-300" />
          </a>
        </div>
      </div>

      {/* Corner Quiet Replay Intro Button */}
      {onReplayIntro && (
        <div className="absolute bottom-5 right-6 sm:right-12 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={onReplayIntro}
            aria-label="Replay Cinematic Introduction"
            className="group inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono-code uppercase tracking-wider text-zinc-500 hover:text-white bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-full transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">
              <LetterSwap label="Replay Intro" mode="forward" />
            </span>
          </button>
        </div>
      )}
    </section>
  )
}
