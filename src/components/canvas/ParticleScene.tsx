import { useEffect, useRef } from 'react'
import { ParticleEngine } from './ParticleEngine'
import type { ParticleConfig } from '../../types/portfolio'

interface ParticleSceneProps {
  config?: ParticleConfig
  className?: string
}

export function ParticleScene({ config, className = '' }: ParticleSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<ParticleEngine | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = new ParticleEngine(config)
    engineRef.current = engine
    engine.init(container)

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [config])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
    />
  )
}
