# Component & Technical Inventory — Mohammed Atif Portfolio

**Audit Date:** October 26, 2026  
**Auditor:** Senior Digital Art Director & Frontend Architect  
**Repository Path:** `c:\Users\LENOVO\Desktop\atif portfolio`  
**Application Entry Point:** [`src/main.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/main.tsx) $\to$ [`src/App.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/App.tsx)  

---

## 1. Project Tooling & Runtime Dependencies

The application is built on modern React 19 with a GPU-accelerated client architecture.

### Package Ecosystem & Versions (`package.json`)
- **Package Manager:** `npm` (Lockfile: `package-lock.json`, version 3)
- **Frontend Framework:** `react` ^19.3.1, `react-dom` ^19.3.1
- **Language / Compiler:** `typescript` ~6.0.3 (Strict mode, ES2022 target)
- **Build Tool:** `vite` ^8.3.4 with `@vitejs/plugin-react` ^6.1.2
- **Styling Engine:** `tailwindcss` ^4.3.3 with `@tailwindcss/vite` ^4.3.3
- **3D / WebGL Library:** `three` ^0.186.1, `@types/three` ^0.186.0
- **Timeline & Scroll Engine:** `gsap` ^3.15.0 (includes ScrollTrigger)
- **UI Motion Library:** `framer-motion` ^14.6.0
- **Iconography:** `lucide-react` ^1.61.0
- **Linter:** `oxlint` ^1.88.0

### Verified Scripts & Exit Codes
| Command | Execution Command | Result | Verified Metric / Notes |
|:---|:---|:---:|:---|
| `dev` | `vite` | **SUCCESS** | Local server ready in 356ms at `http://localhost:5173/`. |
| `lint` | `oxlint` | **SUCCESS** | 0 warnings, 0 errors across 23 files in 51ms. |
| `build` | `tsc -b && vite build` | **SUCCESS** | Built in 8.48s; JS bundle `1,093.44 kB` (gzip: `316.89 kB`), CSS `49.52 kB` (gzip: `8.55 kB`). |
| `preview` | `vite preview` | **READY** | Production bundle preview on port 4173. |

---

## 2. Architecture & Entry Points

```
[index.html]
    │
    ▼
[src/main.tsx]
    │
    ▼
[src/App.tsx]
    ├── State: introCompleted (boolean)
    ├── Refs: engineRef, scrollControllerRef, replayTriggerRef
    │
    ├──► <IntroExperience /> (src/components/intro/IntroExperience.tsx)
    │       ├── Persistent Fullscreen Canvas (div#containerRef)
    │       ├── Engine Instance: CinematicParticleEngine
    │       ├── Timeline: IntroTimeline (GSAP)
    │       └── Intro Overlay HUD (Skip Intro button, Stage counter)
    │
    └──► <PortfolioShell /> (src/components/layout/PortfolioShell.tsx)
            │
            ├──► <SpotlightNavbar /> (src/components/layout/SpotlightNavbar.tsx)
            │       └── Top-center fixed floating pill dock (6 anchors + Replay)
            │
            ├──► <main>
            │       ├──► #hero-scroll-container -> <HeroSection />
            │       ├──► #about -> <AboutSection />
            │       ├──► #works -> <ProjectsSection /> (GSAP 3D Curved Pin)
            │       ├──► #skills -> <SkillsSection />
            │       ├──► #journey -> <JourneySection />
            │       └──► #contact -> <ContactSection />
            │
            └──► <footer> -> <Footer /> (Inventory only; strictly preserved)
```

---

## 3. Comprehensive Component Inventory

| Component Name | File Location | Responsibility & Behavior | Key State / Hooks | Child Components / Dependencies |
|:---|:---|:---|:---|:---|
| **`App`** | [`src/App.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/App.tsx) | Root application orchestrator; coordinates intro completion state, initializes `ScrollParticleController`, manages instant replay scroll behavior. | `introCompleted`, `replayTriggerRef`, `engineRef`, `scrollControllerRef` | `IntroExperience`, `PortfolioShell`, `HeroSection`, `AboutSection`, `ProjectsSection`, `SkillsSection`, `JourneySection`, `ContactSection` |
| **`PortfolioShell`** | [`src/components/layout/PortfolioShell.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/layout/PortfolioShell.tsx) | Root structural shell; controls page-wide visibility transitions (700ms ease-out on enter, 150ms on exit), hosts fixed navbar and footer. | `visible`, `onReplayIntro` | `SpotlightNavbar`, `Footer`, React `<main>` |
| **`SpotlightNavbar`** | [`src/components/layout/SpotlightNavbar.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/layout/SpotlightNavbar.tsx) | Fixed top-center floating dock; tracks active section on scroll; provides smooth anchor navigation; displays micro-hairline active indicator and Replay button. | `activeTab` ('home', 'about', 'works', 'skills', 'journey', 'contact') | `lucide-react` icons, `framer-motion` `layoutId="spotlight-active-indicator"` |
| **`Footer`** | [`src/components/layout/Footer.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/layout/Footer.tsx) | Editorial brand closure; lists metadata, global social links, copyright, availability badge, and back-to-top action. *(Preserved unmodified)*. | `scrollToTop`, `onReplayIntro` | `PORTFOLIO_CONFIG`, `lucide-react` icons |
| **`IntroExperience`** | [`src/components/intro/IntroExperience.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/intro/IntroExperience.tsx) | Mounts fullscreen WebGL canvas; instantiates `CinematicParticleEngine`; runs `IntroTimeline`; exposes `window.__INTRO_TIMELINE__`; handles ESC skip key. | `isIntroActive`, `currentStage`, `engineReady` | `CinematicParticleEngine`, `IntroTimeline`, `framer-motion` `AnimatePresence` |
| **`IntroTimeline`** | [`src/components/intro/IntroTimeline.ts`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/intro/IntroTimeline.ts) | Pure GSAP sequential timeline; controls 5 animation stages across 10.50s total duration; orchestrates shader uniforms (`uProgress`, `uDispersal`, `uLetterStep`). | `timeline` (`gsap.core.Timeline`) | `gsap`, `CinematicParticleEngine` |
| **`CinematicParticleEngine`** | [`src/components/canvas/CinematicParticleEngine.ts`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/canvas/CinematicParticleEngine.ts) | Core WebGL / Three.js engine; manages 34,000 particle points, custom vertex/fragment shaders, pointer repulsion physics, ring mesh, and render loop. | `uniforms`, `camera`, `scene`, `renderer`, `geometry` | `THREE.WebGLRenderer`, `THREE.PerspectiveCamera`, `ParticleTargetGenerator` |
| **`ParticleTargetGenerator`** | [`src/components/canvas/ParticleTargetGenerator.ts`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/canvas/ParticleTargetGenerator.ts) | Precomputes particle target buffers for Ring, Burst, ATIF, PORTFOLIO, Table, and 3D Portrait via native image luminance and edge gradient sampling. | Float32Array coordinate buffers | HTML `<canvas>` 2D context image sampler, `PORTFOLIO_CONFIG` |
| **`ScrollParticleController`** | [`src/components/canvas/ScrollParticleController.ts`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/canvas/ScrollParticleController.ts) | Binds hero scroll position to particle engine; triggers subtle upward translation, depth recession, and outer halo particle dispersion as hero scrolls away. | `scrollTriggerInstance` | `gsap/ScrollTrigger`, `CinematicParticleEngine` |
| **`HeroSection`** | [`src/components/sections/HeroSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/HeroSection.tsx) | Settled hero composition; renders top metadata row, leaves open center for 3D portrait, renders `MOHAMMED ATIF` editorial typography, scroll indicator, corner replay. | `scrollY`, `nameParallaxY`, `heroOpacity` | `PORTFOLIO_CONFIG`, `lucide-react` `RotateCcw` |
| **`AboutSection`** | [`src/components/sections/AboutSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/AboutSection.tsx) | Core ethos & engineering philosophy; renders section progress meter, editorial lead statement, 3 numbered capability cards, and 4-item metadata grid. | `scrollYProgress` | `framer-motion` `whileInView`, `PORTFOLIO_CONFIG` |
| **`ProjectsSection`** | [`src/components/sections/ProjectsSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/ProjectsSection.tsx) | Pinned 3D cylindrical horizontal project gallery; tracks scroll progress over $2.2\times$ viewport height; transforms cards in 3D perspective ($R=1400\text{px}$). | `scrollProgress`, `activeProjectIndex`, `isMobile` | `gsap/ScrollTrigger`, `PORTFOLIO_CONFIG` |
| **`SkillsSection`** | [`src/components/sections/SkillsSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/SkillsSection.tsx) | Technical engineering matrix; 2-column responsive grid displaying 4 core domain cards, category descriptions, and monospace skill pill chips. | Static props | `framer-motion`, `PORTFOLIO_CONFIG` |
| **`JourneySection`** | [`src/components/sections/JourneySection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/JourneySection.tsx) | Chronological career timeline; vertical hairline rail with circular nodes, role titles, organizations, milestone descriptions, and tech stacks. | Static props | `framer-motion`, `lucide-react` icons, `PORTFOLIO_CONFIG` |
| **`ContactSection`** | [`src/components/sections/ContactSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/ContactSection.tsx) | Dispatch and collaboration section; direct mailto action, clipboard copy button, social links, availability badge, and dispatch input form. | `formData`, `copied` | `PORTFOLIO_CONFIG`, `lucide-react` icons |

---

## 4. Design Tokens, CSS Variables & Typography Classes

The design tokens are defined in [`src/index.css`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/index.css):

### CSS Variables (`:root`)
```css
:root {
  --bg-primary: #000000;
  --bg-secondary: #080808;
  --bg-tertiary: #101010;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-visible: rgba(255, 255, 255, 0.16);
}
```

### Typography Classes
- **`.font-serif-luxury`**: `font-family: 'Cinzel', 'Cormorant Garamond', Georgia, serif;`  
  *Role:* Hero name `ATIF` and all section primary titles (`About`, `Curated Artifacts`, `Engineering Matrix`, `Engineering Journey`, `Let's build something exceptional`).
- **`.font-editorial`**: `font-family: 'Syne', 'Space Grotesk', -apple-system, sans-serif;`  
  *Role:* Capability card titles, timeline role names, and brand wordmarks.
- **`.font-mono-code`**: `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;`  
  *Role:* Section markers (`01 // CORE ETHOS`), metadata telemetry, badge chips, code snippets, and button labels.
- **Default Sans-Serif**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`  
  *Role:* High-contrast body paragraphs, descriptions, and form labels.

### Layout & Breakpoints (Tailwind CSS v4)
- **`sm`**: `640px` (Tablet / Large phone horizontal)
- **`md`**: `768px` (Tablet portrait threshold; switches mobile particle count 20,000 $\to$ 34,000)
- **`lg`**: `1024px` (Desktop threshold; switches gallery from touch carousel $\to$ GSAP 3D Pin)
- **`max-w-7xl`**: `1280px` (Main section width constraint across all sections)
- **Global Gutters**: `px-6 sm:px-12 lg:px-20` (24px mobile, 48px tablet, 80px desktop)
