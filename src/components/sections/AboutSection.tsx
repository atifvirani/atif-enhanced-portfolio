import { useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'
import { ScrambleHover } from '../fancy'

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

  const capabilities = [
    {
      num: '01',
      title: 'Full-Stack Product Engineering',
      description:
        'Building end-to-end web architectures, type-safe APIs, and containerized backend services using React 19, TypeScript, Node.js, and Supabase with Row-Level Security.',
    },
    {
      num: '02',
      title: 'Local-First & Offline Systems',
      description:
        'Architecting resilient applications with client-side persistence, IndexedDB, Dexie.js, and local-first data synchronization models.',
    },
    {
      num: '03',
      title: 'Custom Agentic AI & Systems',
      description:
        'Integrating multimodal AI workflows, Ollama local inference, OCR document extraction, and autonomous agent orchestration into practical digital tools.',
    },
    {
      num: '04',
      title: 'Tactile UI/UX & Spatial Motion',
      description:
        'Designing thoughtful user interfaces with Three.js WebGL particle physics, custom shaders, and fluid Framer Motion choreography.',
    },
  ]

  const metadata = [
    { label: 'DISCIPLINE', value: PORTFOLIO_CONFIG.personal.title },
    { label: 'LOCATION', value: `${PORTFOLIO_CONFIG.personal.location} (${PORTFOLIO_CONFIG.personal.timezone})` },
    { label: 'CURRENT ROLE', value: PORTFOLIO_CONFIG.personal.responsibility },
    { label: 'ACADEMIC PATH', value: 'Class 12 PCMB + IT · JEE Main Preparation' },
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
        <div className="flex items-center gap-3 font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-400">
          <ScrambleHover text="ABOUT ME" scrambleSpeed={30} maxIterations={8} />
        </div>
        <div className="font-mono-code text-[11px] text-zinc-500 uppercase tracking-widest">
          <span>Engineering Philosophy</span>
        </div>
      </motion.div>

      {/* Main Editorial Asymmetric Layout */}
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
              <ScrambleHover text="Core Ethos" scrambleSpeed={25} maxIterations={8} />
            </p>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl lg:text-[2.75rem] font-medium text-white tracking-wide leading-[1.25]">
              Building real software products with architectural rigor and tactile craft.
            </h2>
          </div>

          {/* Capabilities List */}
          <div className="space-y-6 pt-6 border-t border-white/[0.08]">
            <p className="font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500 mb-6">
              <ScrambleHover text="Engineering Approach" scrambleSpeed={25} maxIterations={8} />
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
                      <ScrambleHover text={cap.num} scrambleSpeed={20} maxIterations={6} />
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
              <ScrambleHover text="Background" scrambleSpeed={25} maxIterations={8} />
            </p>
            
            {/* High-contrast opening statement */}
            <p className="font-sans text-lg sm:text-xl text-[#F1F5F9] font-light leading-[1.65]">
              I am <strong className="text-white font-medium">Mohammed Atif</strong> — a full-stack software developer, UI/UX designer, and AI systems builder based in Cuttack, Odisha, India. Currently serving as CTO and Lead Architect at BaseCamp Education.
            </p>

            {/* Supporting idea block 1 */}
            <p className="font-sans text-base sm:text-[17px] text-[#A1A1AA] leading-[1.68]">
              Rather than assembling static demonstrations, my engineering approach emphasizes real utility: local-first and offline-first architectures, self-hosted environments, custom agentic AI orchestration, and practical integration across frontend, backend, databases, and deployment infrastructure.
            </p>

            {/* Supporting idea block 2 */}
            <p className="font-sans text-base sm:text-[17px] text-[#A1A1AA] leading-[1.68]">
              Alongside my product and architectural responsibilities at BaseCamp Education, I completed my second year in Class 12 Science (PCMB with Information Technology) at Stewart Science Higher Secondary School, with dedicated preparation for the JEE Main examination.
            </p>
          </div>

          {/* Operational Metadata Grid */}
          <div className="pt-8 border-t border-white/[0.08] space-y-4">
            <p className="font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500 mb-6">
              <ScrambleHover text="Profile Details" scrambleSpeed={25} maxIterations={8} />
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
                    <ScrambleHover text={item.label} scrambleSpeed={25} maxIterations={6} />
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
