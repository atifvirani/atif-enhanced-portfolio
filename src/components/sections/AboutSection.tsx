import { useEffect, useState, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollYProgress, setScrollYProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight + rect.height)))
        setScrollYProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const capabilities = [
    {
      num: '01',
      title: 'Real-Time Graphics & GLSL',
      description:
        'Building procedural particle engines, custom GLSL vertex/fragment shaders, and hardware-accelerated 3D scenes engineered for buttery 60 FPS performance.',
    },
    {
      num: '02',
      title: 'Cinematic Timeline Choreography',
      description:
        'Orchestrating precision multi-stage animation sequences, scroll-bound spatial morphs, and responsive physics using GSAP, ScrollTrigger, and Framer Motion.',
    },
    {
      num: '03',
      title: 'Production Frontend Architecture',
      description:
        'Architecting robust component hierarchies, type-safe state machines, mathematical typographic scales, and clean modular systems in React and TypeScript.',
    },
  ]

  const metadata = [
    { label: 'DISCIPLINE', value: 'Creative Developer & Graphics Engineer' },
    { label: 'LOCATION', value: `${PORTFOLIO_CONFIG.personal.location} (${PORTFOLIO_CONFIG.personal.timezone})` },
    { label: 'METHODOLOGY', value: 'Computational Geometry & Restrained Contrast' },
    { label: 'STATUS', value: 'Open for Select Collaborations' },
  ]

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative scroll-mt-24 sm:scroll-mt-28 py-24 sm:py-32 px-4 sm:px-12 lg:px-20 max-w-7xl mx-auto border-t border-white/[0.08]"
    >
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={revealVariant}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10 border-b border-white/[0.08]"
      >
        <div className="flex items-center gap-3 font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500">
          <span className="text-white font-semibold">02</span>
          <span className="w-10 h-px bg-zinc-700 relative overflow-hidden">
            <span
              className="absolute inset-y-0 left-0 bg-white transition-all duration-75"
              style={{ width: `${Math.round(scrollYProgress * 100)}%` }}
            />
          </span>
          <span>ABOUT ME</span>
        </div>
        <div className="font-mono-code text-[11px] text-zinc-500 uppercase tracking-widest">
          <span>Engineering Philosophy / Personal Index</span>
        </div>
      </motion.div>

      {/* Main Editorial Asymmetric Layout (Option B: High-End Editorial Tech, No Images) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 pt-12 lg:pt-16 items-start">
        {/* Left Column: Core Ethos Headline & Technical Capabilities */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={revealVariant}
          className="lg:col-span-6 space-y-12"
        >
          <div className="space-y-5">
            <p className="font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500">
              [ 01 // CORE ETHOS ]
            </p>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl lg:text-[2.75rem] font-medium text-white tracking-wide leading-[1.25]">
              Engineering digital experiences with uncompromising rigor and spatial depth.
            </h2>
          </div>

          {/* Capabilities List */}
          <div className="space-y-6 pt-6 border-t border-white/[0.08]">
            <p className="font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500 mb-6">
              [ 02 // TECHNICAL FOCUS ]
            </p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
              className="divide-y divide-white/[0.08]"
            >
              {capabilities.map((cap) => (
                <motion.div
                  key={cap.num}
                  variants={revealVariant}
                  className="py-5 first:pt-0 group hover:pl-2 transition-all duration-300"
                >
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="font-mono-code text-xs text-zinc-500 font-semibold">
                      {cap.num}
                    </span>
                    <h3 className="font-serif-luxury text-lg sm:text-xl font-medium text-white tracking-wide group-hover:text-zinc-300 transition-colors">
                      {cap.title}
                    </h3>
                  </div>
                  <p className="font-sans text-[15px] sm:text-base text-[#A1A1AA] leading-[1.65] pl-8">
                    {cap.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column: Structured Narrative & Operational Metadata Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={revealVariant}
          className="lg:col-span-6 space-y-10 lg:pt-2"
        >
          <div className="space-y-6">
            <p className="font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500">
              [ 03 // NARRATIVE ]
            </p>
            
            {/* High-contrast opening statement */}
            <p className="font-sans text-lg sm:text-xl text-[#F1F5F9] font-light leading-[1.65]">
              I am <strong className="text-white font-medium">Mohammed Atif</strong> — a creative developer focused on crafting interactive digital architectures that unite real-time 3D graphics, procedural particle mechanics, and high-performance frontend engineering.
            </p>

            {/* Supporting idea block 1 */}
            <p className="font-sans text-base sm:text-[17px] text-[#A1A1AA] leading-[1.68]">
              Rather than assembling generic template components or superficial decorative animations, my practice treats code as an architectural medium. Every interaction is mathematically grounded—from custom GLSL vertex shaders to precision timeline state machines—ensuring experiences that feel tactile, responsive, and physically coherent.
            </p>

            {/* Supporting idea block 2 */}
            <p className="font-sans text-base sm:text-[17px] text-[#A1A1AA] leading-[1.68]">
              Based in Global Remote ({PORTFOLIO_CONFIG.personal.timezone}), I collaborate with design studios, technology innovators, and forward-looking product teams seeking signature web experiences that leave a lasting impression.
            </p>
          </div>

          {/* Operational Metadata Grid */}
          <div className="pt-8 border-t border-white/[0.08] space-y-4">
            <p className="font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500 mb-6">
              [ 04 // OPERATIONAL METADATA ]
            </p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {metadata.map((item) => (
                <motion.div
                  key={item.label}
                  variants={revealVariant}
                  className="p-5 bg-zinc-950/60 border border-white/[0.08] space-y-1 hover:border-white/20 transition-colors duration-200"
                >
                  <span className="block font-mono-code text-[10px] text-zinc-500 uppercase tracking-widest">
                    {item.label}
                  </span>
                  <span className="block font-mono-code text-xs text-white tracking-wide">
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

