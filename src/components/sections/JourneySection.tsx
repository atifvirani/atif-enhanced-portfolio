import { motion, type Variants } from 'framer-motion'
import { Calendar, Briefcase, Sparkles } from 'lucide-react'
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
      staggerChildren: 0.15,
    },
  },
}

export function JourneySection() {
  return (
    <section
      id="journey"
      className="relative scroll-mt-24 sm:scroll-mt-28 py-24 sm:py-32 px-4 sm:px-12 lg:px-20 max-w-7xl mx-auto border-t border-white/[0.08]"
    >
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={revealVariant}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500">
            <span>05</span>
            <span className="w-8 h-[1px] bg-zinc-700" />
            <span>Chronological Milestones</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-medium tracking-tight text-white">
            Engineering Journey
          </h2>
        </div>
        <p className="font-mono-code text-xs text-zinc-400 max-w-md tracking-wider">
          A progression from experimental creative computing into production-grade real-time systems and motion architecture.
        </p>
      </motion.div>

      {/* Chronological Timeline */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={staggerContainer}
        className="relative border-l border-white/[0.12] ml-3 sm:ml-6 space-y-12"
      >
        {PORTFOLIO_CONFIG.journey.map((item, index) => (
          <motion.div
            key={index}
            variants={revealVariant}
            className="relative pl-8 sm:pl-12 group"
          >
            {/* Timeline node */}
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-black border border-white/60 group-hover:border-white group-hover:bg-white transition-colors duration-300" />

            <div className="p-6 sm:p-8 border border-white/[0.08] bg-zinc-950/40 hover:border-white/20 transition-all duration-300 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-editorial text-lg sm:text-xl font-bold text-white tracking-wide">
                    {item.role}
                  </span>
                  {item.isPlaceholder && (
                    <span className="text-[9px] font-mono-code text-amber-400/90 border border-amber-400/30 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Verified Milestone
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono-code text-xs text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{item.year}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono-code text-xs text-zinc-400">
                <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
                <span>{item.organization}</span>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                {item.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono-code text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/60 border border-white/10 text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={revealVariant}
        className="mt-12 flex items-center gap-3 font-mono-code text-xs text-zinc-500 pl-3 sm:pl-6"
      >
        <Sparkles className="w-4 h-4 text-zinc-400" />
        <span>Documented progression across real-time graphics, creative engineering, and motion systems.</span>
      </motion.div>
    </section>
  )
}

