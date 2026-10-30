import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FastForward } from 'lucide-react'
import { CinematicParticleEngine } from '../canvas/CinematicParticleEngine'
import { IntroTimeline } from './IntroTimeline'

interface IntroExperienceProps {
  onIntroComplete?: () => void
  onIntroStart?: () => void
  onRegisterReplay?: (replayFn: () => void) => void
  onEngineReady?: (engine: CinematicParticleEngine) => void
}

export function IntroExperience({
  onIntroComplete,
  onIntroStart,
  onRegisterReplay,
  onEngineReady,
}: IntroExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<CinematicParticleEngine | null>(null)
  const timelineRef = useRef<IntroTimeline | null>(null)

  const [isIntroActive, setIsIntroActive] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false
    }
    return true
  })
  const [engineReady, setEngineReady] = useState(false)

  const onIntroCompleteRef = useRef(onIntroComplete)
  const onIntroStartRef = useRef(onIntroStart)
  const onEngineReadyRef = useRef(onEngineReady)

  useEffect(() => {
    onIntroCompleteRef.current = onIntroComplete
    onIntroStartRef.current = onIntroStart
    onEngineReadyRef.current = onEngineReady
  })

  const handleFinish = useCallback(() => {
    setIsIntroActive(false)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
    if (onIntroCompleteRef.current) {
      onIntroCompleteRef.current()
    }
  }, [])

  const skipIntro = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.skip()
    } else if (engineRef.current) {
      engineRef.current.setSettledState()
    }
    handleFinish()
  }, [handleFinish])

  const replayIntro = useCallback(() => {
    if (!engineRef.current) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }

    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    setIsIntroActive(true)

    if (onIntroStartRef.current) {
      onIntroStartRef.current()
    }

    const tl = new IntroTimeline(engineRef.current, {
      onComplete: handleFinish,
    })
    timelineRef.current = tl
    tl.start()
  }, [handleFinish])

  const replayIntroRef = useRef(replayIntro)
  useEffect(() => {
    replayIntroRef.current = replayIntro
  }, [replayIntro])

  useEffect(() => {
    if (onRegisterReplay) {
      onRegisterReplay(replayIntro)
    }
  }, [onRegisterReplay, replayIntro])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isIntroActive) {
        skipIntro()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isIntroActive, skipIntro])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isReducedMotion = mediaQuery.matches

    let isDisposed = false
    const engine = new CinematicParticleEngine()
    engineRef.current = engine

    engine
      .init(container)
      .then(() => {
        if (isDisposed) return
        setEngineReady(true)

        if (onEngineReadyRef.current) {
          onEngineReadyRef.current(engine)
        }

        if (isReducedMotion) {
          engine.setSettledState()
          handleFinish()
          return
        }

        if (typeof document !== 'undefined') {
          document.body.style.overflow = 'hidden'
        }
        window.scrollTo({ top: 0, behavior: 'instant' })
        if (onIntroStartRef.current) {
          onIntroStartRef.current()
        }

        const tl = new IntroTimeline(engine, {
          onComplete: handleFinish,
        })
        timelineRef.current = tl
        tl.start()
      })
      .catch((err) => {
        console.error('WebGL initialization error, falling back to permanent portfolio:', err)
        handleFinish()
      })

    return () => {
      isDisposed = true
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      engine.destroy()
      engineRef.current = null
    }
  }, [handleFinish])

  return (
    <>
      {/* Three.js Particle Canvas (Persistent background across intro and portfolio) */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black"
      />

      {/* Cinematic Intro Controls */}
      <AnimatePresence>
        {isIntroActive && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-5 sm:p-10"
          >
            {/* Minimal Top-Right Skip Control */}
            <div className="flex items-center justify-end w-full max-w-7xl mx-auto pointer-events-auto">
              {engineReady && (
                <button
                  type="button"
                  onClick={skipIntro}
                  aria-label="Skip Cinematic Intro"
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 border border-white/15 bg-black/60 hover:bg-white hover:text-black hover:border-white text-zinc-400 hover:text-black transition-all duration-200 font-mono-code text-xs uppercase tracking-wider cursor-pointer rounded-full backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                >
                  <span>Skip</span>
                  <FastForward className="w-3.5 h-3.5" />
                  <kbd className="hidden sm:inline text-[9px] text-zinc-500 group-hover:text-black border border-white/20 group-hover:border-black/30 px-1 rounded">
                    ESC
                  </kbd>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
