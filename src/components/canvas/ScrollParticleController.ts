import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { CinematicParticleEngine } from './CinematicParticleEngine'

gsap.registerPlugin(ScrollTrigger)

export class ScrollParticleController {
  private scrollTriggerInstance: ScrollTrigger | null = null
  private engine: CinematicParticleEngine

  constructor(engine: CinematicParticleEngine) {
    this.engine = engine
  }

  public init(triggerElement: HTMLElement): void {
    this.destroy()

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.engine.setSettledState()
      return
    }

    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: triggerElement,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        this.engine.updateScrollProgress(self.progress)
      },
    })
  }

  public refresh(): void {
    ScrollTrigger.refresh()
  }

  public destroy(): void {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill()
      this.scrollTriggerInstance = null
    }
  }
}
