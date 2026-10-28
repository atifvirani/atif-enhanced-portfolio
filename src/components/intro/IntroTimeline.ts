import gsap from 'gsap'
import type { CinematicParticleEngine } from '../canvas/CinematicParticleEngine'

export type IntroPhase =
  | 'void'
  | 'ring'
  | 'impact'
  | 'atif'
  | 'dissolution'
  | 'portfolio'
  | 'transition'
  | 'portrait'
  | 'settled'

export interface IntroTimelineOptions {
  onStageChange?: (stage: IntroPhase) => void
  onComplete?: () => void
}

export class IntroTimeline {
  private timeline: gsap.core.Timeline | null = null
  private engine: CinematicParticleEngine
  private options: IntroTimelineOptions
  private currentPhase: IntroPhase = 'void'

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

  public getCurrentPhase(): IntroPhase {
    return this.currentPhase
  }

  /**
   * Authoritative phase state machine: centrally configures engine target buffers,
   * uniforms, lighting, and stage callbacks.
   */
  public enterPhase(phase: IntroPhase): void {
    this.currentPhase = phase
    if (this.options.onStageChange) {
      this.options.onStageChange(phase)
    }

    switch (phase) {
      case 'void':
        this.engine.prepareRing()
        this.engine.setLightIntensity(0.0)
        break

      case 'ring':
        this.engine.prepareRing()
        this.engine.setLightIntensity(0.12)
        break

      case 'impact':
        this.engine.triggerImpactBurst()
        this.engine.setLightIntensity(0.48)
        break

      case 'atif':
        this.engine.morphToAtif()
        this.engine.setLightIntensity(0.60)
        break

      case 'dissolution':
        this.engine.triggerAtifDissolution()
        this.engine.setLightIntensity(0.55)
        break

      case 'portfolio':
        this.engine.morphToPortfolio()
        this.engine.setLightIntensity(0.68)
        break

      case 'transition':
        this.engine.uniforms.uDispersal.value = 0.18
        this.engine.setLightIntensity(0.72)
        break

      case 'portrait':
        this.engine.morphToPortrait()
        this.engine.setLightIntensity(0.85)
        break

      case 'settled':
        this.engine.setSettledState()
        break
    }
  }

  public start(): gsap.core.Timeline {
    this.kill()

    const tl = gsap.timeline({
      onComplete: () => {
        this.enterPhase('settled')
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

    // 01. VOID (0.00s – 0.45s)
    this.enterPhase('void')
    tl.to({}, { duration: 0.45 })

    // 02. RING FORMATION (0.45s – 1.65s)
    tl.add(() => this.enterPhase('ring'))
    tl.to(proxy, {
      ringOpacity: 1,
      duration: 0.20,
      ease: 'power2.out',
      onUpdate: () => {
        this.engine.updateRingProgress(proxy.ringProgress, proxy.ringY, proxy.ringScaleY, proxy.ringOpacity)
      },
    })
    tl.to(
      proxy,
      {
        ringProgress: 1,
        duration: 0.75,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.engine.updateRingProgress(proxy.ringProgress, proxy.ringY, proxy.ringScaleY, proxy.ringOpacity)
        },
      },
      '<'
    )
    tl.to({}, { duration: 0.25 })

    // 03. IMPACT & PARTICLE DISPERSION (1.65s – 2.55s)
    tl.to(proxy, {
      ringY: -5.5,
      ringScaleY: 0.75,
      duration: 0.32,
      ease: 'power2.in',
      onUpdate: () => {
        this.engine.updateRingProgress(proxy.ringProgress, proxy.ringY, proxy.ringScaleY, proxy.ringOpacity)
      },
    })
    tl.add(() => this.enterPhase('impact'))
    tl.fromTo(this.engine.uniforms.uDispersal, { value: 0 }, { value: 0.68, duration: 0.22, ease: 'power3.out' })
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 0.58, ease: 'power2.out' }, '<')
    tl.to(this.engine.uniforms.uDispersal, { value: 0.04, duration: 0.35, ease: 'power2.inOut' })

    // 04. ATIF TYPOGRAPHY CONVERGENCE (2.55s – 4.55s)
    tl.add(() => this.enterPhase('atif'))
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 1.45, ease: 'power2.inOut' })
    tl.to({}, { duration: 0.55 }) // readable hold

    // 05. ATIF DISSOLUTION INTO DUST FIELD (4.55s – 5.55s)
    tl.add(() => this.enterPhase('dissolution'))
    tl.fromTo(this.engine.uniforms.uDissolveProgress, { value: 0.0 }, { value: 1.0, duration: 0.75, ease: 'power1.inOut' })
    tl.to(this.engine.uniforms.uDispersal, { value: 0.12, duration: 0.75, ease: 'power2.out' }, '<')
    tl.to({}, { duration: 0.25 })

    // 06. PORTFOLIO KINETIC ASSEMBLY (5.55s – 7.65s)
    tl.add(() => this.enterPhase('portfolio'))
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 1.45, ease: 'power2.inOut' })
    tl.fromTo(this.engine.uniforms.uLetterStep, { value: 0.0 }, { value: 9.8, duration: 1.45, ease: 'power1.inOut' }, '<')
    tl.to(this.engine.uniforms.uDispersal, { value: 0.0, duration: 1.45, ease: 'power2.out' }, '<')
    tl.to(this.engine.uniforms.uLetterStep, { value: 10.0, duration: 0.20, ease: 'power2.out' })
    tl.to({}, { duration: 0.50 }) // readable hold

    // 07. TRANSITION TO PORTRAIT (7.65s – 8.35s)
    tl.add(() => this.enterPhase('transition'))
    tl.to(this.engine.uniforms.uDispersal, { value: 0.18, duration: 0.45, ease: 'power2.out' })
    tl.to({}, { duration: 0.25 })

    // 08. PORTRAIT RECONSTRUCTION (8.35s – 10.45s)
    tl.add(() => this.enterPhase('portrait'))
    tl.fromTo(this.engine.uniforms.uDispersal, { value: 0.18 }, { value: 0.0, duration: 1.65, ease: 'power3.out' })
    tl.fromTo(this.engine.uniforms.uProgress, { value: 0 }, { value: 1.0, duration: 1.65, ease: 'power2.inOut' }, '<')
    tl.to({}, { duration: 0.45 })

    return tl
  }

  public skip(): void {
    if (this.timeline) {
      this.timeline.kill()
      this.timeline = null
    }
    this.enterPhase('settled')
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
