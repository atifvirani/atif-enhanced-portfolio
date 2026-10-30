import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'
import { AsciiWordmarkCanvas } from '../canvas/AsciiWordmarkCanvas'
import { LetterSwap, UnderlineAnimation } from '../fancy'

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

  // Filter only confirmed social channels (hide placeholders)
  const confirmedSocials = PORTFOLIO_CONFIG.socials.filter(
    (link) => link.confirmed !== false && link.href && !link.href.endsWith('linkedin.com') && !link.href.endsWith('twitter.com')
  )

  return (
    <footer className="relative z-10 w-full border-t border-white/[0.12] bg-[#050505] text-zinc-400 overflow-hidden">
      {/* 1. Signature Interactive ASCII Typographic Stage */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-8">
        <div className="relative border border-white/[0.08] bg-[#050505] rounded-none shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden">
          <AsciiWordmarkCanvas wordmark="ATIF" />
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
                PORTFOLIO {CURRENT_YEAR}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-400 max-w-md leading-relaxed font-sans">
              Full-Stack Software Developer, UI/UX Designer, and AI Systems Builder based in Cuttack, Odisha, India.
              CTO and Lead Architect at BaseCamp Education.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 font-mono-code text-[11px] text-zinc-300 py-1 px-3 bg-zinc-950 border border-white/10 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
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
                    <UnderlineAnimation direction="left">
                      {item.label}
                    </UnderlineAnimation>
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
              {confirmedSocials.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white transition-colors duration-200 bg-zinc-950/60"
                >
                  <LetterSwap label={link.label} mode="pingpong" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors duration-200" />
                </a>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.06]">
              {onReplayIntro && (
                <button
                  type="button"
                  onClick={onReplayIntro}
                  className="group inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors duration-200 uppercase tracking-widest cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <LetterSwap label="Replay Intro" mode="forward" />
                </button>
              )}

              <button
                type="button"
                onClick={scrollToTop}
                className="group text-zinc-500 hover:text-white transition-colors duration-200 uppercase tracking-widest cursor-pointer pl-3 border-l border-white/10"
              >
                <UnderlineAnimation direction="left">
                  Back to Top ↑
                </UnderlineAnimation>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Colophon Strip */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-code text-[11px] text-zinc-400">
          <div>
            <span>© {CURRENT_YEAR} Mohammed Atif. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Cuttack, Odisha, India</span>
            <span>•</span>
            <span className="text-zinc-400">{PORTFOLIO_CONFIG.personal.timezone}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
