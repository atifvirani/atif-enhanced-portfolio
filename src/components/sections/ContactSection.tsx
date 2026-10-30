import { useState, type FormEvent } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowUpRight, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'
import { LetterSwap, ScrambleHover, UnderlineAnimation } from '../fancy'
import { api } from '../../services/api'

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
}

export function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', website: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: null, message: '' })

    try {
      const res = await api.submitContact({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        website: formData.website, // honeypot
      })

      if (res.success) {
        setStatus({
          type: 'success',
          message: res.message || 'Your inquiry has been received. Thank you.',
        })
        setFormData({ name: '', email: '', message: '', website: '' })
      } else {
        setStatus({
          type: 'error',
          message: res.error || 'Failed to dispatch message. Please reach out via GitHub.',
        })
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Could not connect to contact API. Please reach out directly on GitHub.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter only confirmed social links
  const confirmedSocials = PORTFOLIO_CONFIG.socials.filter(
    (link) => link.confirmed !== false && link.href && !link.href.endsWith('linkedin.com') && !link.href.endsWith('twitter.com')
  )

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 sm:scroll-mt-28 pt-28 sm:pt-36 pb-36 px-4 sm:px-12 lg:px-20 max-w-7xl mx-auto border-t border-white/[0.08]"
    >
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={revealVariant}
        className="font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-400 mb-8"
      >
        <ScrambleHover text="Initiate Collaboration" scrambleSpeed={30} maxIterations={8} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start">
        {/* Left Column: Direct Info, Availability & Social Links */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={revealVariant}
          className="lg:col-span-6 space-y-8"
        >
          <div className="space-y-4">
            <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-tight">
              Let&apos;s build <br />
              something real.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-md font-sans">
              Available for ambitious full-stack software development, offline-first architectures,
              agentic AI systems, and high-performance digital products.
            </p>
          </div>

          {/* Availability Status */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 font-mono-code text-xs text-zinc-300 py-1.5 px-3.5 bg-zinc-950/80 border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block flex-shrink-0" />
              <span>{PORTFOLIO_CONFIG.personal.availability}</span>
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-white/[0.08] font-mono-code text-xs">
            {/* Primary Direct Channel: GitHub */}
            <div className="space-y-2">
              <span className="text-zinc-500 uppercase tracking-widest block text-[10px]">Primary Direct Channel</span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/atifvirani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-zinc-300 text-sm tracking-wider inline-flex items-center gap-2 group"
                >
                  <UnderlineAnimation direction="left">
                    github.com/atifvirani
                  </UnderlineAnimation>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Confirmed Social Links */}
            {confirmedSocials.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-zinc-500 uppercase tracking-widest block text-[10px]">Verified Network</span>
                <div className="flex flex-wrap items-center gap-3">
                  {confirmedSocials.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/30 text-xs font-mono-code text-zinc-300 hover:text-white transition-colors duration-200"
                    >
                      <LetterSwap label={link.label} mode="pingpong" />
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-6 text-zinc-500 uppercase tracking-widest text-[11px]">
              <span>Timezone: {PORTFOLIO_CONFIG.personal.timezone}</span>
              <span>•</span>
              <span>{PORTFOLIO_CONFIG.personal.location}</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: API-Connected Contact Form */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={revealVariant}
          className="lg:col-span-6"
        >
          <form
            onSubmit={handleSubmit}
            className="p-8 sm:p-10 border border-white/[0.08] bg-zinc-950/40 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-mono-code text-xs uppercase tracking-widest text-zinc-500">
                Direct Dispatch Interface
              </span>
              <span className="text-[10px] font-mono-code text-zinc-600">SECURE API / SMTP</span>
            </div>

            {/* Status Notifications */}
            {status.type === 'success' && (
              <div className="p-4 border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-mono-code flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <span>{status.message}</span>
              </div>
            )}
            {status.type === 'error' && (
              <div className="p-4 border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-mono-code flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{status.message}</span>
              </div>
            )}

            {/* Anti-spam honeypot (visually hidden from real users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website (Leave blank)</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400"
              >
                Name / Organization
              </label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Morgan / Organization"
                disabled={isSubmitting}
                className="w-full bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors font-mono-code disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400"
              >
                Your Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                maxLength={150}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. alex@domain.com"
                disabled={isSubmitting}
                className="w-full bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors font-mono-code disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="message"
                className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400"
              >
                Message / Scope
              </label>
              <textarea
                id="message"
                required
                rows={4}
                minLength={10}
                maxLength={5000}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Briefly describe project requirements, timeline, or engineering opportunity..."
                disabled={isSubmitting}
                className="w-full bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors font-mono-code resize-none disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-white text-black font-semibold uppercase tracking-[0.2em] text-xs font-mono-code hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
