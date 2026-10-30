import { useState, useRef, useCallback, useEffect } from 'react'
import { IntroExperience } from './components/intro/IntroExperience'
import { PortfolioShell } from './components/layout/PortfolioShell'
import { HeroSection } from './components/sections/HeroSection'
import { AboutSection } from './components/sections/AboutSection'
import { JourneySection } from './components/sections/JourneySection'
import { ProjectsSection } from './components/sections/ProjectsSection'
import { SkillsSection } from './components/sections/SkillsSection'
import { ContactSection } from './components/sections/ContactSection'
import type { CinematicParticleEngine } from './components/canvas/CinematicParticleEngine'
import { ScrollParticleController } from './components/canvas/ScrollParticleController'
import { AdminApp } from './components/admin/AdminApp'
import { Matrix404Page } from './components/error/Matrix404Page'
import { ErrorBoundary } from './components/error/ErrorBoundary'

export default function App() {
  const getRouteState = () => {
    const pathname = window.location.pathname.replace(/\/$/, '')
    const hash = window.location.hash

    const isAdmin =
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      hash.startsWith('#/admin') ||
      hash === '#admin'

    const is404 =
      hash === '#404' ||
      hash === '#/404' ||
      (pathname !== '' && pathname !== '/' && !isAdmin)

    return { isAdmin, is404 }
  }

  const [routeState, setRouteState] = useState(getRouteState)

  useEffect(() => {
    const handleRouteChange = () => {
      setRouteState(getRouteState())
    }
    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('hashchange', handleRouteChange)
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('hashchange', handleRouteChange)
    }
  }, [])

  const [introCompleted, setIntroCompleted] = useState(false)
  const replayTriggerRef = useRef<(() => void) | null>(null)
  const engineRef = useRef<CinematicParticleEngine | null>(null)
  const scrollControllerRef = useRef<ScrollParticleController | null>(null)

  const handleRegisterReplay = useCallback((replayFn: () => void) => {
    replayTriggerRef.current = replayFn
  }, [])

  const handleEngineReady = useCallback((engine: CinematicParticleEngine) => {
    engineRef.current = engine
  }, [])

  const handleIntroComplete = useCallback(() => {
    setIntroCompleted(true)
  }, [])

  const handleIntroStart = useCallback(() => {
    setIntroCompleted(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (scrollControllerRef.current) {
      scrollControllerRef.current.destroy()
      scrollControllerRef.current = null
    }
  }, [])

  const handleReplay = useCallback(() => {
    if (replayTriggerRef.current) {
      if (scrollControllerRef.current) {
        scrollControllerRef.current.destroy()
        scrollControllerRef.current = null
      }
      setIntroCompleted(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
      replayTriggerRef.current()
    }
  }, [])

  // Initialize ScrollTrigger controller once intro completes and hero is rendered
  useEffect(() => {
    if (routeState.isAdmin || routeState.is404) return
    if (!introCompleted || !engineRef.current) return

    const triggerElement = document.getElementById('hero-scroll-container') || document.getElementById('top')
    if (!triggerElement) return

    const controller = new ScrollParticleController(engineRef.current)
    controller.init(triggerElement)
    scrollControllerRef.current = controller

    // Allow layout to stabilize then refresh ScrollTrigger
    const timer = setTimeout(() => {
      controller.refresh()
    }, 150)

    return () => {
      clearTimeout(timer)
      controller.destroy()
      scrollControllerRef.current = null
    }
  }, [introCompleted, routeState])

  return (
    <ErrorBoundary>
      {routeState.is404 ? (
        <Matrix404Page />
      ) : routeState.isAdmin ? (
        <AdminApp />
      ) : (
        <>
          {/* Cinematic Intro & Persistent GPU Particle Scene */}
          <IntroExperience
            onIntroComplete={handleIntroComplete}
            onIntroStart={handleIntroStart}
            onRegisterReplay={handleRegisterReplay}
            onEngineReady={handleEngineReady}
          />

          {/* Main Responsive Portfolio Shell & Sections in verified chronological order */}
          <PortfolioShell
            visible={introCompleted}
            onReplayIntro={handleReplay}
          >
            <div id="hero-scroll-container" className="relative w-full">
              <HeroSection onReplayIntro={handleReplay} />
            </div>
            <AboutSection />
            <ProjectsSection />
            <SkillsSection />
            <JourneySection />
            <ContactSection />
          </PortfolioShell>
        </>
      )}
    </ErrorBoundary>
  )
}
