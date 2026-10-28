import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { SpotlightNavbar } from './SpotlightNavbar'

interface PortfolioShellProps {
  children: ReactNode
  onReplayIntro?: () => void
  visible?: boolean
}

export function PortfolioShell({
  children,
  onReplayIntro,
  visible = true,
}: PortfolioShellProps) {
  return (
    <div
      className={`relative min-h-screen text-white selection:bg-white selection:text-black flex flex-col font-sans ${
        visible
          ? 'opacity-100 pointer-events-auto transition-opacity duration-700 ease-out'
          : 'opacity-0 pointer-events-none transition-opacity duration-150 ease-in'
      }`}
    >
      {/* Exactly ONE primary navigation bar: Custom top-center Spotlight Navbar */}
      <SpotlightNavbar onReplay={onReplayIntro} visible={visible} />

      {/* Main Content Sections with transparent background for persistent particle canvas */}
      <main className="relative z-10 flex-1 pt-12 sm:pt-16">
        {children}
      </main>

      {/* Editorial Footer */}
      <Footer onReplayIntro={onReplayIntro} />
    </div>
  )
}
