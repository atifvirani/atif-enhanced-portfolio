import { useState, type FormEvent } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowUpRight, Send, Copy, Check } from 'lucide-react'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'
import { LetterSwap, ScrambleHover, UnderlineAnimation } from '../fancy'

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
}

export function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(PORTFOLIO_CONFIG.personal.email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
        return
      }
    } catch {
      // Fall through to textarea fallback
    }

    try {
      const textarea = document.createElement('textarea')
      textarea.value = PORTFOLIO_CONFIG.personal.email
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (e) {
      console.warn('Clipboard copy fallback failed:', e)
    }
  }

  const handleDispatch = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio Inquiry from ${formData.name}`)
    const body = encodeURIComponent(
      `From: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`
    )
    window.location.href = `mailto:${PORTFOLIO_CONFIG.personal.email}?subject=${subject}&body=${body}`
  }

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
        className="flex items-center gap-2 font-mono-code text-xs uppercase tracking-[0.25em] text-zinc-500 mb-8"
      >
        <span>06</span>
        <span className="w-8 h-[1px] bg-zinc-700" />
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
              something exceptional.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-md font-sans">
              Available for ambitious digital projects, creative engineering consulting,
              and interactive real-time 3D experiences.
            </p>
          </div>

          {/* Availability Status: dot aligned with text baseline */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2.5 font-mono-code text-xs text-zinc-400 py-1.5 px-3 bg-zinc-950/80 border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block flex-shrink-0" />
              <span>{PORTFOLIO_CONFIG.personal.availability}</span>
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-white/[0.08] font-mono-code text-xs">
            <div className="space-y-2">
              <span className="text-zinc-500 uppercase tracking-widest block text-[10px]">Direct Email</span>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${PORTFOLIO_CONFIG.personal.email}`}
                  className="text-white hover:text-zinc-300 text-sm tracking-wider inline-flex items-center gap-2 group"
                >
                  <UnderlineAnimation direction="left">
                    {PORTFOLIO_CONFIG.personal.email}
                  </UnderlineAnimation>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-white/10 hover:border-white/30 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Social Links Group: aligned deliberately with consistent spacing */}
            <div className="space-y-2 pt-2">
              <span className="text-zinc-500 uppercase tracking-widest block text-[10px]">Network Channels</span>
              <div className="flex flex-wrap items-center gap-3">
                {PORTFOLIO_CONFIG.socials.map((link) => (
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

            <div className="pt-2 flex flex-wrap items-center gap-6 text-zinc-500 uppercase tracking-widest text-[11px]">
              <span>Timezone: {PORTFOLIO_CONFIG.personal.timezone}</span>
              <span>•</span>
              <span>{PORTFOLIO_CONFIG.personal.location}</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Genuine Email Dispatch Composer */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={revealVariant}
          className="lg:col-span-6"
        >
          <form
            onSubmit={handleDispatch}
            className="p-8 sm:p-10 border border-white/[0.08] bg-zinc-950/40 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-mono-code text-xs uppercase tracking-widest text-zinc-500">
                Direct Dispatch Composer
              </span>
              <span className="text-[10px] font-mono-code text-zinc-600">CLIENT MAILTO</span>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400"
              >
                Name / Studio
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe / Studio"
                className="w-full bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors font-mono-code"
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. contact@domain.com"
                className="w-full bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors font-mono-code"
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
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Briefly describe project scope, timeline, and objectives..."
                className="w-full bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors font-mono-code resize-none"
              />
            </div>

            {/* Launch Mail Client Action: fully visible, prominent, accessible */}
            <button
              type="submit"
              className="w-full py-4 px-6 bg-white text-black font-semibold uppercase tracking-[0.2em] text-xs font-mono-code hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Mail Client</span>
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
