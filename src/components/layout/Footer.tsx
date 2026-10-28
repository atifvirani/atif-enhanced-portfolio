import { ArrowUpRight, RotateCcw, Sparkles } from 'lucide-react'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'
import { AsciiWordmarkCanvas } from '../canvas/AsciiWordmarkCanvas'

const CURRENT_YEAR = new Date().getFullYear()

interface FooterProps {
  onReplayIntro?: () => void
}

const SECTION_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#works' },
  { label: 'Skills', href: '#skills' },
  { label: 'Journey', href: '#journey' },
  { label: 'Contact', href: '#contact' },
]

export function Footer({ onReplayIntro }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const targetId = href.replace('#', '')
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      const top = targetEl.getBoundingClientRect().top + window.scrollY - 30
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }
  }

  return (
    <footer className="relative z-10 w-full border-t border-white/[0.12] bg-[#050505] text-zinc-400 overflow-hidden">
      {/* 1. Signature Interactive ASCII Typographic Stage */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-8">
        <div className="relative border border-white/[0.10] bg-black rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden">
          {/* Top Stage HUD Controls & Metadata */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-zinc-950/70 font-mono-code text-[10px] sm:text-[11px] uppercase tracking-widest text-zinc-500 select-none">
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold tracking-wider">ATIF®</span>
              <span className="hidden sm:inline text-zinc-600">/</span>
              <span className="hidden sm:inline text-zinc-400">SIGNATURE CANVAS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">DIGITAL // 01</span>
            </div>
          </div>

          {/* Full-width interactive ASCII Canvas */}
          <div className="relative w-full bg-[#050505]">
            <AsciiWordmarkCanvas wordmark="ATIF" />
          </div>

          {/* Bottom Stage Footnote Labels */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-white/[0.08] bg-zinc-950/70 font-mono-code text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-zinc-500 select-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>[ 07 // INTERACTIVE TYPOGRAPHY ]</span>
            </div>
            <span className="hidden sm:inline text-zinc-400">
              [ HOVER TO DEFLECT // SPRING RECOVERY ]
            </span>
          </div>
        </div>
      </div>

      {/* 2. Structured Footer Content, Navigation & Social Links */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 items-start">
          {/* Column 1: Identity & Discipline */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-editorial text-xl tracking-wider text-white font-bold uppercase">
                {PORTFOLIO_CONFIG.personal.fullName}
              </span>
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-zinc-400 border border-white/10 px-2 py-0.5">
                PORTFOLIO 2026
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-400 max-w-md leading-relaxed font-sans">
              Creative developer and real-time graphics engineer specializing in GPU shader architecture,
              procedural particle physics, and cinematic UI systems.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 font-mono-code text-[11px] text-zinc-400 py-1 px-2.5 bg-zinc-950 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>{PORTFOLIO_CONFIG.personal.availability}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Index Navigation Links */}
          <div className="md:col-span-3 space-y-3 font-mono-code text-xs">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-3">
              Section Index
            </span>
            <ul className="space-y-2">
              {SECTION_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleSectionClick(e, item.href)}
                    className="text-zinc-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="text-zinc-600 group-hover:text-white transition-colors">→</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social Network & Actions */}
          <div className="md:col-span-4 space-y-4 font-mono-code text-xs">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-3">
              Network Channels
            </span>
            <div className="flex flex-wrap gap-2.5">
              {PORTFOLIO_CONFIG.socials.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition-colors duration-200 bg-zinc-950/60"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors duration-200" />
                </a>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.06]">
              {onReplayIntro && (
                <button
                  type="button"
                  onClick={onReplayIntro}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors duration-200 uppercase tracking-widest cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Intro</span>
                </button>
              )}

              <button
                type="button"
                onClick={scrollToTop}
                className="text-zinc-500 hover:text-white transition-colors duration-200 uppercase tracking-widest cursor-pointer pl-3 border-l border-white/10"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Operational Bar */}
      <div className="w-full border-t border-white/[0.04] bg-black/60 py-6 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono-code text-zinc-500">
          <div>
            © {CURRENT_YEAR} Engineered by {PORTFOLIO_CONFIG.personal.fullName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-zinc-600">
            <span>{PORTFOLIO_CONFIG.personal.location}</span>
            <span>•</span>
            <span>{PORTFOLIO_CONFIG.personal.timezone}</span>
            <span>•</span>
            <span className="text-zinc-500">HTML5 Canvas 2D</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
