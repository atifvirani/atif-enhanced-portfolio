import gsap from 'gsap'
import type { CinematicParticleEngine } from '../canvas/CinematicParticleEngine'

export interface IntroTimelineOptions {
  onStageChange?: (stage: string) => void
  onComplete?: () => void
}

export class IntroTimeline {
  private timeline: gsap.core.Timeline | null = null
  private engine: CinematicParticleEngine
  private options: IntroTimelineOptions

  constructor(
    engine: CinematicParticleEngine,
    options: IntroTimelineOptions = {}
  ) {
    this.engine = engine
    this.options = options
  }

  public getTimeline(): gsap.core.Timeline | null {
    return this.timeline
  }

  public start(): gsap.core.Timeline {
    this.kill()

    const tl = gsap.timeline({
      onComplete: () => {
        this.engine.setSettledState()
        if (this.options.onComplete) {
          this.options.onComplete()
        }
      },
    })
    this.timeline = tl

    const proxy = {
      ringProgress: 0,
      ringY: 0,
      ringScaleY: 1,
      ringOpacity: 0,
    }

    this.engine.prepareRing()
    if (this.options.onStageChange) this.options.onStageChange('LOADER')

    // ==========================================================================
    // PHASE 01 — Small loader ball solidifies in the center (0.00s – 1.05s)
    // A sleek glowing circular ring traces itself into existence, then locks.
    // ==========================================================================
    tl.to(proxy, {
      ringOpacity: 1,
      duration: 0.18,
      ease: 'power2.out',
      onUpdate: () => {
        this.engine.updateRingProgress(proxy.ringProgress, proxy.ringY, proxy.ringScaleY, proxy.ringOpacity)
      },
    })
    tl.to(
      proxy,
      {
        ringProgress: 1,
        duration: 0.72,
        ease: 'power1.inOut',
        onUpdate: () => {
          this.engine.updateRingProgress(proxy.ringProgress, proxy.ringY, proxy.ringScaleY, proxy.ringOpacity)
        },
      },
      '<'
    )
    // Sphere is complete & solidifies — tension pause before detonation
    tl.to({}, { duration: 0.15 })

    // ==========================================================================
    // PHASE 02 — Loader ball shatters: full-screen particle dispersion (1.05s – 2.05s)
    // The sphere detonates in place. Fine grains burst across the entire screen.
    // ==========================================================================
    tl.add(() => {
      this.engine.triggerCenterBurst()
      if (this.options.onStageChange) this.options.onStageChange('IMPACT')
    })
    tl.fromTo(this.engine.uniforms.uDispersal, { value: 0 }, { value: 0.75, duration: 0.22, ease: 'power3.out' })
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 0.65, ease: 'power2.out' }, '<')
    tl.to(this.engine.uniforms.uDispersal, { value: 0.04, duration: 0.45, ease: 'power2.inOut' })
    tl.to({}, { duration: 0.25 })

    // ==========================================================================
    // PHASE 03 — Particles converge into ATIF (2.05s – 4.30s)
    // All grains travel smoothly from full screen into the letters ATIF.
    // ==========================================================================
    tl.add(() => {
      this.engine.morphToAtif()
      if (this.options.onStageChange) this.options.onStageChange('ATIF')
    })
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 1.75, ease: 'power2.inOut' })
    // Hold ATIF in sharp focus
    tl.to({}, { duration: 0.65 })

    // ==========================================================================
    // PHASE 04 — Seamless continuous morph into PORTFOLIO (4.30s – 6.85s)
    // NO scene cut, NO fade to black! Particles flow directly from ATIF to PORTFOLIO.
    // ==========================================================================
    tl.add(() => {
      this.engine.morphToPortfolio()
      if (this.options.onStageChange) this.options.onStageChange('PORTFOLIO')
    })
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 1.95, ease: 'power2.inOut' })
    tl.fromTo(this.engine.uniforms.uLetterStep, { value: 0.0 }, { value: 9.8, duration: 1.95, ease: 'power1.inOut' }, '<')
    tl.fromTo(this.engine.uniforms.uDispersal, { value: 0.16 }, { value: 0.0, duration: 1.95, ease: 'power2.out' }, '<')
    tl.to(this.engine.uniforms.uLetterStep, { value: 10.0, duration: 0.25, ease: 'power2.out' })
    // Hold PORTFOLIO in crisp focus
    tl.to({}, { duration: 0.65 })

    // ==========================================================================
    // PHASE 05 — Particles flow continuously into Portrait (6.85s – 9.60s)
    // Direct fluid transformation: PORTFOLIO particles reconstruct the living face.
    // ==========================================================================
    tl.add(() => {
      this.engine.morphToPortrait()
      if (this.options.onStageChange) this.options.onStageChange('PORTRAIT')
    })
    tl.fromTo(this.engine.uniforms.uDispersal, { value: 0.24 }, { value: 0.0, duration: 2.10, ease: 'power3.out' })
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 2.10, ease: 'power2.inOut' }, '<')
    // Hold the completed portrait with subtle ambient hover
    tl.to({}, { duration: 1.10 })

    return tl
  }

  public skip(): void {
    if (this.timeline) {
      this.timeline.kill()
      this.timeline = null
    }
    this.engine.setSettledState()
    if (this.options.onComplete) {
      this.options.onComplete()
    }
  }

  public kill(): void {
    if (this.timeline) {
      this.timeline.kill()
      this.timeline = null
    }
  }
}
