# Section-by-Section Forensic Design Audit

**Lead Digital Art Director & Visual QA Auditor**  
**Audit Date:** October 26, 2026  
**Primary Reference Viewport:** 1440 × 900 CSS pixels  
**Screenshot References:** [`artifacts/design-audit/screenshots/`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/)  

---

## 1. Spotlight Navbar

- **Owning Component:** [`src/components/layout/SpotlightNavbar.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/layout/SpotlightNavbar.tsx)
- **Primary Screenshot:** [`06-final-hero-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/06-final-hero-1440x900.png) & [`anchor_01_about_1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/anchor_01_about_1440x900.png)

```
        ┌─────────────────────────────────────────────────────────┐
        │  [Home]  [About]  [Projects]  [Skills]  [Journey]  [Mail] │ [Replay]
        └─────────────────────────────────────────────────────────┘
```

### Measured Specifications (1440 × 900)
- **Positioning:** `fixed`, top: `20px` (`top-4 sm:top-5`), horizontally centered (`left: 541px`, `right: 894px`).
- **Dimensions:** Width: `353px`, Height: `41px`.
- **Z-Index:** `50` (sits above all content and pinned elements).
- **Surface Treatment:** Background `rgba(9, 9, 11, 0.90)` (Zinc-950), `backdrop-filter: blur(40px)`, border `1px solid rgba(255, 255, 255, 0.10)`, border-radius: `9999px` (full pill), shadow `0 12px 40px rgba(0, 0, 0, 0.85)`.
- **Navigation Items (6 Anchors):**
  1. `Home` (`#top`, Lucide `Home`, active on scroll $< 720\text{px}$)
  2. `About` (`#about`, Lucide `User`)
  3. `Projects` (`#works`, Lucide `FolderGit2`)
  4. `Skills` (`#skills`, Lucide `Sparkles`)
  5. `Journey` (`#journey`, Lucide `Milestone`)
  6. `Contact` (`#contact`, Lucide `Mail`)
- **Action Control:** Divider (`1px` width, `16px` height, `rgba(255, 255, 255, 0.15)`) + `Replay Intro` button (`RotateCcw` icon).
- **Active State Indicator:** Framer Motion spring indicator (`layoutId="spotlight-active-indicator"`), width: `20px`, height: `1.5px`, color `#FFFFFF`, shadow `0 0 6px rgba(255, 255, 255, 0.70)`.

### Anchor Navigation Landings
- **Direct Measurement:**
  - Clicking `#about`: scrolls to `scrollY = 900px`, section top lands at viewport `Y = 0px`. Clearance below navbar bottom ($Y = 61\text{px}$) is $-61\text{px}$, but internal section padding of `pt-32` ($128\text{px}$) leaves $67\text{px}$ of clear negative space above section title.
  - Clicking `#works`: scrolls to `scrollY = 2150px`, HUD lands at $Y = 112\text{px}$ (clear of navbar).
  - Clicking `#skills`: scrolls to `scrollY = 4969px`, lands at $Y = 62\text{px}$.
  - Clicking `#journey`: scrolls to `scrollY = 6144px`.
  - Clicking `#contact`: scrolls to `scrollY = 7466px`.
  - Clicking `#top`: triggers `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Observed Behavior:** No card snippets or preceding section text are cut off or occluded behind the navbar dock.

---

## 2. Hero Section

- **Owning Component:** [`src/components/sections/HeroSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/HeroSection.tsx)
- **Primary Screenshot:** [`06-final-hero-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/06-final-hero-1440x900.png)

### Layout & Composition
- **Height & Bounds:** Height: `836px` (`min-h-[calc(100vh-4rem)]`), Width: `1280px` (`max-w-7xl`), centered at $X = 77\text{px}$.
- **Top Metadata Row:** Positioned at $Y = 77\text{px}$ (16px below navbar dock). Left: `• CREATIVE DEVELOPER & REAL-TIME GRAPHICS ENGINEER` (with emerald pulse dot `6px × 6px`). Right: `Three.js + GLSL | Global Remote`.
- **Central Void:** Sits directly over the 3D Three.js particle portrait. Canvas center aligns with screen center ($X = 720\text{px}$, $Y = 405\text{px}$).
- **Hero Typography Unit:**
  - `MOHAMMED`: font-mono-code, `12px`, letter-spacing `4.2px` (`0.35em`), color `#94A3B8`, centered above ATIF.
  - `ATIF`: font-serif-luxury, `64px`, font-weight `500`, tracking `11.52px` (`0.18em`), color `#CBD5E1`.
- **Scroll Target Indicator:** Circular ring ($16\text{px} \times 16\text{px}$) with pulsing center dot + vertical gradient hairline ($28\text{px}$ height).
- **Parallax Scroll Behavior:** As user scrolls downward, typography translates upward via `translate3d(0, scrollY * 0.15px, 0)` while opacity decays smoothly via `1 - scrollY / 650`.

---

## 3. About / Core Ethos Section

- **Owning Component:** [`src/components/sections/AboutSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/AboutSection.tsx)
- **Primary Screenshot:** [`07-about-top-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/07-about-top-1440x900.png)

### Architecture & Typography
- **Dimensions:** Width `1280px`, Height `1250px`, Offset Top `900px`.
- **Header HUD Bar:**
  - Section index: `02` (pure white).
  - Progress bar: `40px` width hairline with real-time scroll fill indicator.
  - Title: `ABOUT ME` in monospace tracking `0.25em`.
  - Right telemetry: `Engineering Philosophy / Personal Index`.
- **Editorial Headline:** *"Engineering digital experiences with uncompromising rigor and spatial depth."* (`Cinzel`, `48px`, `#FFFFFF`).
- **Body Hierarchy:**
  - Lead statement: `18px`, line-height `1.68`, color `#F1F5F9`.
  - Supporting copy: `16px`, line-height `1.68`, color `#A1A1AA`.
- **Numbered Capabilities (3 Columns):**
  1. `01 / Real-Time Graphics & GLSL`
  2. `02 / Cinematic Timeline Choreography`
  3. `03 / Production Frontend Architecture`
- **Metadata Grid (4 Items):** `DISCIPLINE`, `LOCATION`, `METHODOLOGY`, `STATUS` rendered with monospace uppercase labels and silver values. Zero placeholder imagery or broken image frames.

---

## 4. Projects Gallery (Curated Artifacts)

- **Owning Component:** [`src/components/sections/ProjectsSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/ProjectsSection.tsx)
- **Primary Screenshots:** [`08-project-gallery-entry-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/08-project-gallery-entry-1440x900.png), [`09-project-gallery-middle-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/09-project-gallery-middle-1440x900.png), [`10-project-gallery-end-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/10-project-gallery-end-1440x900.png)

```
        ┌────────────────────────────────────────────────────────┐
        │  03 // ARCHITECTURAL EXHIBIT        [ 01 / 04 SCRUB ] │
        │  CURATED ARTIFACTS                                     │
        │                                                        │
        │      ┌──────────┐    ┌──────────┐    ┌──────────┐      │
        │     /  CARD 01   \  |  CARD 02  |  /  CARD 03   \     │
        │    /   (Z-135)    \ |   FOCAL   | /   (Z-135)    \    │
        │   /                \|           |/                \   │
        └────────────────────────────────────────────────────────┘
```

### Architectural & Pinning Mechanics
- **Section Dimensions:** Width `1434px` (full bleed), total scroll height `2881px`.
- **GSAP ScrollTrigger Pin:**
  - Start: `top top` (pins at $Y = 2150\text{px}$).
  - End: `+=2.2vh` (holds viewport locked for $\approx 1,980\text{px}$ of scroll travel).
  - Scrub duration: `0.65s` smoothing.
- **3D Cylindrical Geometry:**
  - Radius: $1400\text{px}$ virtual cylinder.
  - Dynamic transform per card: `perspective(1400px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`.
  - Focused center card: `scale(1.0)`, `opacity(1.0)`, `translateZ(0)`.
  - Outer cards: rotate up to $\pm 16^\circ$, recede to `translateZ(-135px)`, scale to `0.88`, opacity `0.52`.
- **Mobile Fallback ($< 1024\text{px}$):** Deactivates ScrollTrigger pin; replaces with a horizontal touch swipe track (`overflow-x-auto snap-x snap-mandatory`).

---

## 5. Skills Section (Engineering Matrix)

- **Owning Component:** [`src/components/sections/SkillsSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/SkillsSection.tsx)
- **Primary Screenshot:** [`11-skills-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/11-skills-1440x900.png)

### Layout & Elements
- **Dimensions:** Width `1280px`, Height `1113px`, Offset Top `5031px`.
- **Header:** `04 // Technical Capabilities` $\to$ `Engineering Matrix` (`Cinzel`, `48px`).
- **2-Column Capability Grid:**
  1. `CAP-01 / Real-Time 3D & Graphics` (Three.js, WebGL, GLSL Shaders, Particle Systems, Buffer Geometry, Math & Vectors).
  2. `CAP-02 / Creative Motion & Timelines` (GSAP Core, ScrollTrigger, Framer Motion, Micro-interactions, Spring Physics, Easing Curves).
  3. `CAP-03 / Frontend Engineering` (React 19, TypeScript, Vite, Tailwind CSS v4, State Machines, Clean Architecture).
  4. `CAP-04 / Performance & Tooling` (GPU Memory Mgmt, Asset Optimization, Bundle Splitting, Responsive Design, Git Workflow).
- **Styling:** Sharp architectural cards (`bg-zinc-950/40`, border `1px solid rgba(255,255,255,0.08)`), hover highlights to `border-white/20`.

---

## 6. Journey Section (Chronological Milestones)

- **Owning Component:** [`src/components/sections/JourneySection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/JourneySection.tsx)
- **Primary Screenshot:** [`12-journey-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/12-journey-1440x900.png)

### Chronology & Alignment
- **Dimensions:** Width `1280px`, Height `1322px`, Offset Top `6144px`.
- **Header:** `05 // Chronological Milestones` $\to$ `Engineering Journey`.
- **Timeline Rail:** Single vertical continuous line `border-l border-white/[0.12]` running down left margin.
- **Milestone Nodes:**
  - `2025 — Present`: Creative Technologist & Graphics Engineer (Independent Studio Practice).
  - `2024 — 2025`: Frontend Systems Engineer (Creative Engineering Practice).
  - `2023 — 2024`: Interactive Systems & Creative Computing (Self-Directed Research and Exploration).
- **Card Anatomy:** Each entry houses role, calendar badge, organization name, detailed technical description, and tag chips.

---

## 7. Contact Section (Initiate Collaboration)

- **Owning Component:** [`src/components/sections/ContactSection.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/sections/ContactSection.tsx)
- **Primary Screenshot:** [`13-contact-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/13-contact-1440x900.png)

### Layout & Actions
- **Dimensions:** Width `1280px`, Height `953px`, Offset Top `7466px`.
- **Left Column:**
  - Headline: *"Let's build something exceptional."* (`Cinzel`, `48px sm:54px lg:60px`).
  - Availability pill: `Open for select creative engineering and studio collaborations` with pulsing emerald dot.
  - Direct Email: `mohammedatif.dev@gmail.com` with underline and dedicated clipboard `Copy` button.
  - Social Links: `GitHub`, `LinkedIn`, `X / Twitter`.
- **Right Column (Dispatch Form):**
  - Inputs: Name, Email, Message (`bg-zinc-950/60`, border `1px solid rgba(255,255,255,0.10)`).
  - Submit Button: `INITIATE DISPATCH` (`bg-white text-black font-semibold uppercase`, full width `480px`). Triggers pre-populated `mailto:`.

---

## 8. Footer (Inventory Only — Strictly Preserved)

- **Owning Component:** [`src/components/layout/Footer.tsx`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/layout/Footer.tsx)
- **Primary Screenshot:** [`14-footer-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/14-footer-1440x900.png)

```
        ┌────────────────────────────────────────────────────────┐
        │ ATIF  [PORTFOLIO 2026]           GitHub LinkedIn X     │
        │ Engineered with monochrome...    Replay Intro  Back to Top ↑
        │ ────────────────────────────────────────────────────── │
        │ © 2026 Engineered by Mohammed Atif   • Open for select...
        └────────────────────────────────────────────────────────┘
```

### Current Implementation Inventory
- **Dimensions:** Width `1434px` (full bleed), Height `346px`, Offset Top `8419px`.
- **Padding:** `pt-16 px-6 sm:px-12 lg:px-20 pb-28` (`64px` top, `80px` sides, `112px` bottom to clear mobile browser chrome).
- **Background & Border:** `bg-black`, `border-t border-white/[0.08]`.
- **Branding Area:** Name `ATIF` (`font-editorial`, `18px`, tracking `0.10em`, white) + `Portfolio 2026` monospace badge.
- **Copy:** *"Engineered with restrained monochrome discipline, WebGL salt particle dynamics, and editorial typography."*
- **Action Navigation:** Social links (`GitHub`, `LinkedIn`, `X`), `Replay Intro` button, and `Back to Top ↑` smooth-scroll action.
- **Sub-Footer:** Copyright notice + pulsating emerald availability indicator.

> [!IMPORTANT]
> This footer remains **100% untouched and preserved** in accordance with Non-Negotiable Rule 10, pending the separate interactive ASCII redesign.
