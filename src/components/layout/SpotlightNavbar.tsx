import { useState, useEffect } from 'react'
import { Home, User, Milestone, FolderGit2, Sparkles, Mail, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  id: string
  label: string
  href: string
  icon: typeof Home
}

// Chronological navigation order:
// 1. Home, 2. About, 3. Projects, 4. Skills, 5. Journey, 6. Contact
const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', href: '#top', icon: Home },
  { id: 'about', label: 'About', href: '#about', icon: User },
  { id: 'works', label: 'Projects', href: '#works', icon: FolderGit2 },
  { id: 'skills', label: 'Skills', href: '#skills', icon: Sparkles },
  { id: 'journey', label: 'Journey', href: '#journey', icon: Milestone },
  { id: 'contact', label: 'Contact', href: '#contact', icon: Mail },
]

function smoothScrollTo(targetY: number, maxDuration = 550) {
  const startY = window.scrollY
  const diff = targetY - startY
  if (Math.abs(diff) < 15) {
    window.scrollTo(0, targetY)
    return
  }
  if (Math.abs(diff) < 1600) {
    window.scrollTo({ top: targetY, behavior: 'smooth' })
    return
  }
  const startTime = performance.now()
  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / maxDuration)
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
    window.scrollTo(0, startY + diff * ease)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

interface SpotlightNavbarProps {
  onReplay?: () => void
  visible?: boolean
}

export function SpotlightNavbar({ onReplay, visible = true }: SpotlightNavbarProps) {
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const sections = ['contact', 'journey', 'skills', 'works', 'about']
      const navbarOffset = 180

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el) {
          const rect = el.getBoundingClientRect()
          const top = rect.top + window.scrollY - navbarOffset
          if (scrollY >= top) {
            setActiveTab(sectionId)
            return
          }
        }
      }
      setActiveTab('home')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <header
      className={`fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 z-50 max-w-[96vw] transition-all duration-500 ease-out ${
        visible
          ? 'opacity-100 pointer-events-auto translate-y-0 visible'
          : 'opacity-0 pointer-events-none -translate-y-6 invisible'
      }`}
    >
      <nav
        aria-label="Primary Navigation Dock"
        className="relative flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.85)]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                setActiveTab(item.id)
                if (item.href === '#top') {
                  smoothScrollTo(0, 500)
                } else {
                  const targetId = item.href.replace('#', '')
                  const targetEl = document.getElementById(targetId)
                  if (targetEl) {
                    const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY
                    smoothScrollTo(Math.max(0, elementPosition - 20), 550)
                  }
                }
              }}
              aria-label={item.label}
              className={`relative px-2 sm:px-3 py-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 group ${
                isActive
                  ? 'text-white bg-white/[0.08] border border-white/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {/* Crisp Minimal Active Section Hairline Indicator */}
              {isActive && (
                <motion.div
                  layoutId="spotlight-active-indicator"
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-4 sm:w-5 h-[1.5px] bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}

              {/* Icon calibrated to 16-17px */}
              <Icon
                className={`relative z-10 w-4 h-4 sm:w-[17px] sm:h-[17px] transition-transform duration-200 ${
                  isActive ? 'scale-105 text-white' : 'group-hover:scale-105'
                }`}
              />

              {/* Accessible Tooltip */}
              <span className="absolute -bottom-8 px-2 py-0.5 rounded bg-black/90 border border-white/10 text-[9px] sm:text-[10px] font-mono-code uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
            </a>
          )
        })}

        {/* Divider & Replay Intro Control */}
        {onReplay && (
          <>
            <div className="w-[1px] h-3.5 sm:h-4 bg-white/15 my-auto mx-0.5 sm:mx-1" />
            <button
              type="button"
              onClick={onReplay}
              title="Replay Cinematic Particle Sequence"
              aria-label="Replay Cinematic Intro"
              className="relative px-2 sm:px-2.5 py-1.5 sm:py-1.5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors duration-200 group cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:-rotate-90" />
              <span className="absolute -bottom-8 px-2 py-0.5 rounded bg-black/90 border border-white/10 text-[9px] sm:text-[10px] font-mono-code uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Replay Intro
              </span>
            </button>
          </>
        )}
      </nav>
    </header>
  )
}
