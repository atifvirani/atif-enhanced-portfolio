import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Terminal, Sparkles, Activity } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'
import { ScrambleHover, UnderlineAnimation } from '../fancy'

gsap.registerPlugin(ScrollTrigger)

// Curated architectural project telemetry & companion specs for the exhibition wall
const PROJECT_TELEMETRY = [
  {
    id: 'telemetry-01',
    refId: 'proj-01',
    title: 'Shader Kernel & Poisson Topology',
    badge: 'GLSL SPEC',
    metric: '32,000 PTL',
    secondaryMetric: '60 FPS LOCKED',
    details: 'Custom buffer geometry with dual vec3 position buffers for continuous morph targets. Luminance probability sampling with blue-noise stipple distribution.',
    codeSnippet: 'gl_PointSize = uSize * (1.0 + aSeed * 0.4) * (200.0 / -mvPos.z);',
  },
  {
    id: 'telemetry-02',
    refId: 'proj-02',
    title: 'Kinetic Timeline State Machine',
    badge: 'GSAP CORE',
    metric: '9.80s INTRO',
    secondaryMetric: '0.6s SCRUB',
    details: 'Multi-phase continuous animation pipeline orchestrating loader sphere, center burst, typography convergence, and fluid particle portrait reconstruction.',
    codeSnippet: 'tl.to(particles, { aTarget: portraitTarget, ease: "power2.inOut" });',
  },
  {
    id: 'telemetry-03',
    refId: 'proj-03',
    title: 'Spotlight Beam & Typographic Tokens',
    badge: 'DESIGN SYSTEM',
    metric: '100% MONO',
    secondaryMetric: '4.8:1 RATIO',
    details: 'Tactile navigation dock with real-time dynamic spotlight cone, strict mathematical typographic hierarchy, and zero third-party UI dependencies.',
    codeSnippet: 'background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent);',
  },
  {
    id: 'telemetry-04',
    refId: 'proj-04',
    title: 'Vertex Displacement & Normal Vector Mesh',
    badge: 'MESH SHADER',
    metric: '16.6ms BUDGET',
    secondaryMetric: '4K RES READY',
    details: 'Real-time procedural sine-cosine vertex displacement shader responsive to pointer velocity vector and simulated surface tension.',
    codeSnippet: 'vNormal = normalMatrix * normalize(vec3(-dx, 1.0, -dz));',
  },
]

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinContainerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const parallaxBgRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect touch / narrow screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024 || window.matchMedia('(hover: none)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Setup GSAP Pinned Curved Horizontal Gallery on Desktop
  useEffect(() => {
    if (isMobile) return

    const section = sectionRef.current
    const pinContainer = pinContainerRef.current
    const track = trackRef.current
    const parallaxBg = parallaxBgRef.current

    if (!section || !pinContainer || !track) return

    // Allow layout to settle before calculating bounding sizes
    const initTimer = setTimeout(() => {
      const trackWidth = track.scrollWidth
      const windowWidth = window.innerWidth
      const horizontalDistance = Math.max(0, trackWidth - windowWidth + 140)

      const ctx = gsap.context(() => {
        // Tile cards selection
        const cards = track.querySelectorAll<HTMLElement>('.curved-tile-wrapper')

        // Entry reveal animation when section enters viewport
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 40,
            scale: 0.94,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: {
              from: 'center',
              amount: 0.45,
            },
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Main Scrubbed Pin ScrollTrigger
        const mainScrollTrigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(window.innerHeight * 2.2, horizontalDistance * 1.15)}`,
          pin: pinContainer,
          anticipatePin: 1,
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress
            setScrollProgress(progress)

            // 1. Translate main horizontal project track
            const currentX = -progress * horizontalDistance
            gsap.set(track, { x: currentX })

            // 2. Parallax background architectural lines (moves at 35% speed)
            if (parallaxBg) {
              gsap.set(parallaxBg, { x: currentX * 0.35 })
            }

            // 3. Dynamic Cylindrical Curve: Calculate 3D perspective transforms for each tile
            const screenCenter = windowWidth / 2
            let closestIndex = 0
            let closestDist = Infinity

            cards.forEach((card, i) => {
              const rect = card.getBoundingClientRect()
              const cardCenter = rect.left + rect.width / 2
              const normDist = (cardCenter - screenCenter) / (screenCenter * 0.9)
              const absDist = Math.abs(normDist)

              if (absDist < closestDist) {
                closestDist = absDist
                closestIndex = Math.min(PORTFOLIO_CONFIG.projects.length - 1, Math.floor(i / 2))
              }

              // Cylindrical projection physics
              const clampedNorm = Math.max(-1.8, Math.min(1.8, normDist))
              const rotateY = -clampedNorm * 16 // shallow cylindrical arc
              const translateZ = -Math.pow(Math.min(1.8, absDist), 1.45) * 135 // depth recession
              const scale = 1.0 - Math.min(0.12, absDist * 0.07) // focal emphasis
              const opacity = 1.0 - Math.min(0.48, absDist * 0.32) // atmospheric falloff

              card.style.transform = `perspective(1400px) rotateY(${rotateY.toFixed(2)}deg) translateZ(${translateZ.toFixed(1)}px) scale(${scale.toFixed(3)})`
              card.style.opacity = `${opacity.toFixed(3)}`
            })

            setActiveProjectIndex(closestIndex)
          },
        })

        // Refresh ScrollTrigger to recalculate exact offsets
        ScrollTrigger.refresh()

        return () => {
          mainScrollTrigger.kill()
        }
      }, section)

      return () => ctx.revert()
    }, 120)

    return () => clearTimeout(initTimer)
  }, [isMobile])

  return (
    <section
      id="works"
      ref={sectionRef}
      className="relative scroll-mt-24 sm:scroll-mt-28 w-full bg-black text-white border-t border-white/[0.08]"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={pinContainerRef}
        className={`${
          isMobile
            ? 'py-20 px-4 sm:px-10'
            : 'w-full min-h-[640px] h-screen overflow-hidden flex flex-col justify-between pt-24 pb-6 lg:pt-28 lg:pb-8'
        }`}
      >
        {/* Gallery Header HUD Bar - Positioned with clear negative space below top-center navbar */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 font-mono-code text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              <span className="text-white">03</span>
              <span className="w-8 h-[1px] bg-zinc-700" />
              <ScrambleHover text="Architectural Exhibit" scrambleSpeed={30} maxIterations={8} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-600 hidden md:inline">CURVED 3D PROJECTION</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white flex items-center gap-4">
              <span>Curated Artifacts</span>
              <span className="text-[10px] sm:text-xs font-mono-code text-zinc-500 font-normal tracking-widest hidden sm:inline border border-white/10 px-2 py-0.5">
                VIRTUAL ARC 1400PX
              </span>
            </h2>
          </div>

          {/* Telemetry / Scrub Indicator */}
          <div className="flex items-center gap-6 font-mono-code text-xs text-zinc-400">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Selected Focus</span>
              <span className="text-white font-semibold tracking-wider">
                № 0{activeProjectIndex + 1} / 0{PORTFOLIO_CONFIG.projects.length}
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-28 sm:w-36 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
              <div
                className="h-full bg-white transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>

            <span className="text-[11px] text-zinc-500 tracking-widest font-mono-code">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>

        {/* Desktop Curved 3D Gallery Stage */}
        {!isMobile ? (
          <div className="relative w-full flex-1 flex items-center overflow-visible select-none my-auto">
            {/* Parallax Background Architectural Blueprint Lines */}
            <div
              ref={parallaxBgRef}
              className="absolute inset-0 pointer-events-none opacity-20 flex items-center"
              style={{ width: '220%' }}
            >
              <div
                className="w-full h-48 border-y border-dashed border-white/20 flex items-center justify-around font-mono-code text-[10px] text-zinc-600 tracking-[0.4em]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                  backgroundSize: '80px 80px',
                }}
              >
                <span>AXIS_X_PARALLAX_01</span>
                <span>GEO_CURVATURE_R1400</span>
                <span>SPATIAL_PROJECTION_GLSL</span>
                <span>LATENCY_0.4MS</span>
                <span>DEPTH_Z_RECESSION</span>
              </div>
            </div>

            {/* Horizontal 3D Projected Track */}
            <div
              ref={trackRef}
              className="flex items-center gap-8 pl-12 sm:pl-24 pr-32 py-8"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1400px',
                willChange: 'transform',
              }}
            >
              {/* Column 0: Exhibit Overview Intro Tile */}
              <div
                className="curved-tile-wrapper w-[360px] flex-shrink-0 transition-all duration-200"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="p-6 border border-white/15 bg-zinc-950/80 backdrop-blur-md rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-mono-code text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                      EXHIBITION RECORD
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-editorial text-xl font-bold uppercase tracking-tight text-white">
                      Curved Tiled Exhibition Wall
                    </h3>
                    <p className="font-mono-code text-[11px] text-zinc-400 leading-relaxed">
                      A physical-style perspective surface presenting four production-grade creative engineering artifacts.
                      Scroll continuously to travel through procedural particle physics, timeline orchestrations, and spatial shaders.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono-code text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      4 Primary Artifacts
                    </span>
                    <span>Scroll to scrub →</span>
                  </div>
                </div>
              </div>

              {/* Columns 1 to 4: Real Project Tiles with Companion Telemetry */}
              {PORTFOLIO_CONFIG.projects.map((project, index) => {
                const telemetry = PROJECT_TELEMETRY[index] || PROJECT_TELEMETRY[0]

                return (
                  <div
                    key={project.id}
                    className="flex flex-col gap-4 w-[420px] flex-shrink-0"
                  >
                    {/* Primary Showcase Tile */}
                    <div
                      className="curved-tile-wrapper transition-all duration-200"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <article
                        tabIndex={0}
                        aria-label={`${project.title} - ${project.category}`}
                        className="group relative p-4 sm:p-5 border border-white/15 bg-zinc-950/85 backdrop-blur-xl rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-white/40 transition-colors duration-300 flex flex-col justify-between h-[255px] focus:outline-none focus:ring-1 focus:ring-white"
                      >
                        {/* Top Metadata Row */}
                        <div className="flex items-center justify-between font-mono-code text-xs text-zinc-500 border-b border-white/[0.08] pb-2">
                          <div className="flex items-center gap-2">
                            <ScrambleHover text={`№ 0${index + 1}`} scrambleSpeed={20} maxIterations={5} className="text-white font-semibold" />
                            <span className="w-3 h-[1px] bg-zinc-700" />
                            <span className="uppercase tracking-widest text-[10px] text-zinc-400">
                              {project.category}
                            </span>
                          </div>
                          <span className="tracking-widest text-zinc-400">{project.year}</span>
                        </div>

                        {/* Interactive Project Visual Blueprint */}
                        <div className="relative w-full h-16 my-auto bg-black/60 border border-white/[0.06] overflow-hidden flex items-center justify-center group-hover:border-white/20 transition-colors">
                          <ProjectVisualThumbnail index={index} />
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 font-mono-code text-[8px] uppercase tracking-widest text-zinc-500 bg-black/80 border border-white/10">
                            {project.status}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1">
                          <h3 className="font-editorial text-base sm:text-lg font-bold text-white tracking-wide group-hover:text-zinc-200 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {/* Tech Stack & Action Footer */}
                        <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {project.techStack.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="font-mono-code text-[9px] uppercase tracking-wider px-2 py-0.5 bg-white/[0.04] border border-white/10 text-zinc-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Inspect source for ${project.title}`}
                              className="inline-flex items-center gap-1 font-mono-code text-xs text-white hover:text-zinc-300 group/link"
                            >
                              <UnderlineAnimation direction="left">
                                Inspect
                              </UnderlineAnimation>
                              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                            </a>
                          )}
                        </div>
                      </article>
                    </div>

                    {/* Secondary Companion Telemetry Tile */}
                    <div
                      className="curved-tile-wrapper transition-all duration-200"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="p-3.5 sm:p-4 border border-white/[0.08] bg-zinc-950/60 backdrop-blur-md font-mono-code space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-zinc-500" />
                            {telemetry.badge}
                          </span>
                          <ScrambleHover text={telemetry.metric} scrambleSpeed={25} maxIterations={6} className="text-white font-semibold tracking-wider" />
                        </div>

                        <div className="text-[10px] text-zinc-400 leading-normal line-clamp-2">
                          {telemetry.details}
                        </div>

                        <div className="p-1.5 bg-black/80 border border-white/[0.06] text-[9px] text-zinc-300 overflow-x-auto whitespace-nowrap">
                          <code>{telemetry.codeSnippet}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Column 5: Concluding Experimental Lab Tile */}
              <div
                className="curved-tile-wrapper w-[360px] flex-shrink-0 transition-all duration-200"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="p-8 border border-white/15 bg-zinc-950/80 backdrop-blur-md rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="font-mono-code text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                      HORIZON 2026+
                    </span>
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-editorial text-2xl font-bold uppercase tracking-tight text-white">
                      Exploratory Graphics Lab
                    </h3>
                    <p className="font-mono-code text-xs text-zinc-400 leading-relaxed">
                      Continuous research into WebGPU compute shaders, procedural fluid dynamics, neural radiance caching, and high-frequency tactile physics for spatial web environments.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono-code text-[11px] text-zinc-500">
                    <span className="text-zinc-400">Release into Skills →</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mobile / Touch Responsive Horizontal Swipe Gallery */
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between font-mono-code text-xs text-zinc-500 px-1">
              <span>SWIPE HORIZONTALLY</span>
              <span>4 SELECTED WORKS</span>
            </div>

            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 no-scrollbar">
              {PORTFOLIO_CONFIG.projects.map((project, index) => {
                const telemetry = PROJECT_TELEMETRY[index] || PROJECT_TELEMETRY[0]

                return (
                  <article
                    key={project.id}
                    className="snap-center w-[85vw] max-w-[340px] flex-shrink-0 p-6 border border-white/15 bg-zinc-950/90 rounded-none shadow-xl flex flex-col justify-between space-y-5"
                  >
                    <div className="flex items-center justify-between font-mono-code text-xs text-zinc-500 border-b border-white/10 pb-3">
                      <span className="text-white font-semibold">№ 0{index + 1}</span>
                      <span className="uppercase tracking-widest text-[10px] text-zinc-400">
                        {project.category}
                      </span>
                      <span>{project.year}</span>
                    </div>

                    <div className="w-full h-24 bg-black/60 border border-white/10 flex items-center justify-center">
                      <ProjectVisualThumbnail index={index} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-editorial text-xl font-bold text-white">
                        {project.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="p-3 bg-black/80 border border-white/[0.08] font-mono-code text-[10px] text-zinc-400 space-y-1.5">
                      <div className="flex justify-between text-zinc-500">
                        <span>{telemetry.badge}</span>
                        <ScrambleHover text={telemetry.metric} scrambleSpeed={25} maxIterations={6} className="text-white" />
                      </div>
                      <div className="text-zinc-300 truncate">
                        <code>{telemetry.codeSnippet}</code>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {project.techStack.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="font-mono-code text-[10px] uppercase px-2 py-0.5 bg-white/5 border border-white/10 text-zinc-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono-code text-xs text-white group"
                        >
                          <UnderlineAnimation direction="left">
                            Inspect
                          </UnderlineAnimation>
                          <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {/* Gallery Footer HUD Bar */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between font-mono-code text-[11px] text-zinc-500 border-t border-white/[0.08] pt-4 z-20">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              PERSPECTIVE: 1400PX
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:inline text-zinc-500">
              AXIS_TRAVEL: {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-400 uppercase tracking-widest text-[10px]">
              Continuous Vertical Scroll
            </span>
            <span className="w-4 h-[1px] bg-zinc-600" />
            <span className="text-white">RELEASES INTO SKILLS</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Procedural visual thumbnail for each project tile
function ProjectVisualThumbnail({ index }: { index: number }) {
  if (index === 0) {
    // Salt Particle Ring Simulation Thumbnail
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-90">
          <circle cx="80" cy="40" r="28" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <circle cx="80" cy="40" r="16" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" />
          {/* Stipple particles */}
          {[...Array(24)].map((_, i) => {
            const angle = (i / 24) * Math.PI * 2
            const r = 22 + (i % 3) * 6
            const x = 80 + Math.cos(angle) * r
            const y = 40 + Math.sin(angle) * r * 0.7
            return <circle key={i} cx={x} cy={y} r="1" fill="#ffffff" opacity={0.6 + (i % 4) * 0.12} />
          })}
        </svg>
      </div>
    )
  }

  if (index === 1) {
    // Cinematic Timeline Choreography Waveform Thumbnail
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-85">
          <path
            d="M 10 40 Q 40 10 80 40 T 150 40"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />
          <path
            d="M 10 40 Q 40 60 80 40 T 150 40"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <circle cx="80" cy="40" r="3" fill="#ffffff" />
          <line x1="80" y1="15" x2="80" y2="65" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      </div>
    )
  }

  if (index === 2) {
    // Spotlight Dock Emitter Optical Cone Thumbnail
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-90">
          <defs>
            <linearGradient id="spotLightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points="65,15 95,15 125,70 35,70" fill="url(#spotLightGrad)" />
          <line x1="68" y1="15" x2="92" y2="15" stroke="#ffffff" strokeWidth="2" />
          <rect x="55" y="65" width="50" height="6" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>
      </div>
    )
  }

  // Spatial Canvas & Dynamic Shader Mesh Thumbnail
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-85">
        <g transform="rotate(15 80 40)">
          <path
            d="M 20 40 L 80 15 L 140 40 L 80 65 Z"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.2"
          />
          <path
            d="M 40 40 L 80 25 L 120 40 L 80 55 Z"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line x1="80" y1="15" x2="80" y2="65" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1="20" y1="40" x2="140" y2="40" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}
