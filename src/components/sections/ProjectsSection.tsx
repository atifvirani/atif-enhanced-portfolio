import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useProjects } from '../../hooks/useProjects'
import { ScrambleHover, UnderlineAnimation } from '../fancy'

gsap.registerPlugin(ScrollTrigger)

export function ProjectsSection() {
  const { projects } = useProjects()
  const sectionRef = useRef<HTMLElement>(null)
  const pinContainerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
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
    if (!projects || projects.length === 0) return

    const section = sectionRef.current
    const pinContainer = pinContainerRef.current
    const track = trackRef.current

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
            y: 36,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.1,
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
          end: () => `+=${Math.max(window.innerHeight * 2, horizontalDistance * 1.1)}`,
          pin: pinContainer,
          anticipatePin: 1,
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress
            setScrollProgress(progress)

            // Translate main horizontal project track
            const currentX = -progress * horizontalDistance
            gsap.set(track, { x: currentX })

            // Dynamic Cylindrical Curve: Calculate 3D perspective transforms for each tile
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
                closestIndex = Math.min(projects.length - 1, i)
              }

              // Cylindrical projection physics
              const clampedNorm = Math.max(-1.8, Math.min(1.8, normDist))
              const rotateY = -clampedNorm * 14 // shallow cylindrical arc
              const translateZ = -Math.pow(Math.min(1.8, absDist), 1.45) * 120 // depth recession
              const scale = 1.0 - Math.min(0.12, absDist * 0.07) // focal emphasis
              const opacity = 1.0 - Math.min(0.45, absDist * 0.3) // atmospheric falloff

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
  }, [isMobile, projects])

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
            : 'w-full min-h-[640px] h-screen overflow-hidden flex flex-col justify-between pt-24 pb-8 lg:pt-28 lg:pb-12'
        }`}
      >
        {/* Gallery Header */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 font-mono-code text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-zinc-400">
              <ScrambleHover text="SELECTED WORKS" scrambleSpeed={30} maxIterations={8} />
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white">
              Curated Artifacts
            </h2>
          </div>

          {/* Scrub Indicator */}
          <div className="flex items-center gap-6 font-mono-code text-xs text-zinc-400">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Focus</span>
              <span className="text-white font-semibold tracking-wider">
                № 0{Math.min(activeProjectIndex + 1, projects.length)} / 0{projects.length}
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
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="curved-tile-wrapper w-[450px] flex-shrink-0 transition-all duration-200"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <article
                    tabIndex={0}
                    aria-label={`${project.title} - ${project.category}`}
                    className="group relative p-6 border border-white/15 bg-zinc-950/85 backdrop-blur-xl rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-white/40 transition-colors duration-300 flex flex-col justify-between h-[380px] focus:outline-none focus:ring-1 focus:ring-white"
                  >
                    {/* Top Metadata Row */}
                    <div className="flex items-center justify-between font-mono-code text-xs text-zinc-500 border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <ScrambleHover text={`№ 0${index + 1}`} scrambleSpeed={20} maxIterations={5} className="text-white font-semibold" />
                        <span className="w-3 h-[1px] bg-zinc-700" />
                        <span className="uppercase tracking-widest text-[10px] text-zinc-400">
                          {project.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-white/10 text-zinc-400">
                          {project.status}
                        </span>
                        <span className="tracking-widest text-zinc-400">{project.year}</span>
                      </div>
                    </div>

                    {/* Interactive Project Visual Blueprint */}
                    <div className="relative w-full h-24 my-auto bg-black/60 border border-white/[0.06] overflow-hidden flex items-center justify-center group-hover:border-white/20 transition-colors">
                      <ProjectVisualThumbnail index={index} project={project} />
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5 pt-2">
                      <h3 className="font-editorial text-lg sm:text-xl font-bold text-white tracking-wide group-hover:text-zinc-200 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    </div>

                    {/* Tech Stack & Action Footer */}
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[240px]">
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="font-mono-code text-[9px] uppercase tracking-wider px-2 py-0.5 bg-white/[0.04] border border-white/10 text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open live deployment for ${project.title}`}
                            className="inline-flex items-center gap-1 font-mono-code text-xs text-zinc-300 hover:text-white group/live"
                          >
                            <UnderlineAnimation direction="left">Live</UnderlineAnimation>
                            <ExternalLink className="w-3 h-3 transition-transform group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5 text-zinc-400" />
                          </a>
                        )}

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Inspect source for ${project.title}`}
                            className="inline-flex items-center gap-1 font-mono-code text-xs text-white hover:text-zinc-300 group/link"
                          >
                            <UnderlineAnimation direction="left">
                              Source
                            </UnderlineAnimation>
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Mobile / Touch Responsive Horizontal Swipe Gallery */
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between font-mono-code text-xs text-zinc-500 px-1">
              <span>SWIPE HORIZONTALLY</span>
              <span>{projects.length} SELECTED WORKS</span>
            </div>

            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 no-scrollbar">
              {projects.map((project, index) => (
                <article
                  key={project.id}
                  className="snap-center w-[85vw] max-w-[340px] flex-shrink-0 p-6 border border-white/15 bg-zinc-950/90 rounded-none shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between font-mono-code text-xs text-zinc-500 border-b border-white/10 pb-3">
                    <span className="text-white font-semibold">№ 0{index + 1}</span>
                    <span className="uppercase tracking-widest text-[10px] text-zinc-400">
                      {project.category}
                    </span>
                    <span>{project.year}</span>
                  </div>

                  <div className="w-full h-24 bg-black/60 border border-white/10 flex items-center justify-center">
                    <ProjectVisualThumbnail index={index} project={project} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-editorial text-xl font-bold text-white">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
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

                    <div className="flex items-center gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono-code text-xs text-zinc-300"
                        >
                          <UnderlineAnimation direction="left">Live</UnderlineAnimation>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono-code text-xs text-white group"
                        >
                          <UnderlineAnimation direction="left">
                            Source
                          </UnderlineAnimation>
                          <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Procedural visual thumbnail for each project tile
function ProjectVisualThumbnail({ index, project }: { index: number; project?: any }) {
  if (project?.thumbnail) {
    return (
      <img
        src={project.thumbnail}
        alt={project.title}
        className="w-full h-full object-cover opacity-80"
        onError={(e) => {
          // Graceful fallback to vector blueprint if image fails
          (e.target as HTMLElement).style.display = 'none'
        }}
      />
    )
  }

  // 1. NEXORA SEARCH (Meta-Search Node Graph & Query Ring)
  if (index === 0 || project?.id === 'proj-nexora') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-90">
          <circle cx="80" cy="40" r="26" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <circle cx="80" cy="40" r="14" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" />
          <line x1="80" y1="26" x2="80" y2="14" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <line x1="80" y1="54" x2="80" y2="66" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <line x1="66" y1="40" x2="54" y2="40" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <line x1="94" y1="40" x2="106" y2="40" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <circle cx="80" cy="14" r="2.5" fill="#ffffff" />
          <circle cx="80" cy="66" r="2.5" fill="#ffffff" />
          <circle cx="54" cy="40" r="2.5" fill="#ffffff" />
          <circle cx="106" cy="40" r="2.5" fill="#ffffff" />
          <circle cx="80" cy="40" r="4" fill="#ffffff" />
        </svg>
      </div>
    )
  }

  // 2. MyPocket (AI Finance Waveform & Ledger Scan)
  if (index === 1 || project?.id === 'proj-mypocket') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-90">
          <rect x="44" y="16" width="72" height="48" rx="4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1="52" y1="26" x2="78" y2="26" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
          <line x1="52" y1="34" x2="108" y2="34" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1="52" y1="42" x2="96" y2="42" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M 52 54 L 68 48 L 84 52 L 108 44" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
          <circle cx="108" cy="44" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    )
  }

  // 3. DuoSync Booth (Asynchronous Pose Photostrip Frames)
  if (index === 2 || project?.id === 'proj-duosync') {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-90">
          <rect x="52" y="14" width="24" height="52" rx="2" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <rect x="84" y="14" width="24" height="52" rx="2" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <line x1="52" y1="31" x2="76" y2="31" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="52" y1="48" x2="76" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="84" y1="31" x2="108" y2="31" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="84" y1="48" x2="108" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <path d="M 76 40 L 84 40" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      </div>
    )
  }

  // Fallback Geometric Wireframe
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 160 80" className="w-36 h-18 opacity-90">
        <g stroke="rgba(255,255,255,0.5)" strokeWidth="0.75" fill="none">
          <line x1="30" y1="20" x2="130" y2="20" />
          <line x1="20" y1="40" x2="140" y2="40" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
          <line x1="30" y1="60" x2="130" y2="60" />
          <line x1="40" y1="10" x2="30" y2="70" />
          <line x1="80" y1="10" x2="80" y2="70" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
          <line x1="120" y1="10" x2="130" y2="70" />
          <circle cx="80" cy="40" r="4" fill="#ffffff" />
        </g>
      </svg>
    </div>
  )
}
