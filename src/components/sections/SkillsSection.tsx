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

export function SkillsSection() {
  return (
    <section
      id="skills"
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
            <span>04</span>
            <span className="w-8 h-[1px] bg-zinc-700" />
            <span>Technical Capabilities</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-medium tracking-tight text-white">
            Engineering Matrix
          </h2>
        </div>
        <p className="font-mono-code text-xs text-zinc-400 max-w-md tracking-wider">
          A disciplined stack chosen for maximum frame rate, developer predictability, and immersive creative expression.
        </p>
      </motion.div>

      {/* Grid of Capabilities */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
      >
        {PORTFOLIO_CONFIG.skills.map((group, index) => (
          <motion.div
            key={group.category}
            variants={revealVariant}
            className="p-8 sm:p-10 border border-white/[0.08] bg-zinc-950/40 hover:border-white/20 transition-all duration-300 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-mono-code text-xs text-zinc-500 tracking-wider">
                CAP-0{index + 1}
              </span>
              <span className="w-1.5 h-1.5 bg-white/40" />
            </div>

            <div className="space-y-2">
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                {group.category}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono-code">
                {group.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="font-mono-code text-xs uppercase tracking-wider px-3 py-1.5 border border-white/10 text-zinc-300 bg-black/60 hover:border-white/30 hover:text-white transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

