# Responsive Layout & Cross-Viewport Audit

**Lead UI/UX Auditor & Frontend Architect**  
**Audit Date:** October 26, 2026  
**Tested Viewports:** 6 Viewports (1920×1080 down to 320×700)  
**Primary Screenshot References:** [`artifacts/design-audit/screenshots/`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/)  

---

## 1. Cross-Viewport Comparison Matrix

| Metric / Dimension | VP-01: 1920×1080 (Large Desktop) | VP-02: 1440×900 (Standard Desktop) | VP-03: 1366×768 (Compact Laptop) | VP-04: 768×1024 (Tablet Portrait) | VP-05: 390×844 (Modern Mobile) | VP-06: 320×700 (Narrow Mobile) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Device Pixel Ratio (DPR)** | `1.0` | `1.0` | `1.0` | `2.0` | `3.0` | `2.0` |
| **Document Scroll Width** | `1914 px` | `1434 px` | `1360 px` | `768 px` | `390 px` | `320 px` |
| **Horizontal Overflow ($X$)** | **None (0px)** | **None (0px)** | **None (0px)** | **None (0px)** | **None (0px)** | **None (0px)** |
| **Navbar Width / Max-W** | `353 px` | `353 px` | `353 px` | `330 px` | `316 px` (max `94vw`) | `298 px` (max `94vw`) |
| **Hero Top Padding** | `12 px` (`md:pt-3`) | `12 px` (`md:pt-3`) | `12 px` (`md:pt-3`) | `80 px` (`sm:pt-20`) | `64 px` (`pt-16`) | `64 px` (`pt-16`) |
| **Hero Navbar Clearance** | `36 px` buffer | `36 px` buffer | `36 px` buffer | `28 px` buffer | `22 px` buffer | `18 px` buffer |
| **Hero Heading (`ATIF`) Size** | `64 px` (`4rem`) | `64 px` (`4rem`) | `60 px` (`md:text-6xl`)| `48 px` (`sm:text-5xl`)| `30 px` (`text-3xl`) | `28 px` (scaled) |
| **Particle System Count** | `34,000` | `34,000` | `34,000` | `20,000` (Mobile mode)| `20,000` | `20,000` |
| **Gallery Mode** | GSAP 3D Pin ($R=1400$) | GSAP 3D Pin ($R=1400$) | GSAP 3D Pin ($R=1400$) | Horizontal Touch Carousel | Touch Carousel | Touch Carousel |
| **Skills Grid Layout** | 2-Column Grid | 2-Column Grid | 2-Column Grid | Single Column | Single Column | Single Column |
| **Journey Layout** | Hairline Rail Left | Hairline Rail Left | Hairline Rail Left | Compact Rail Left | Compact Rail Left | Compact Rail Left |
| **Contact Form Layout** | 2-Column (6 / 6) | 2-Column (6 / 6) | 2-Column (6 / 6) | Stacked Single Column | Stacked Single Column | Stacked Single Column |

---

## 2. Detailed Viewport Analyses

### VP-01: Ultra-Wide Desktop (1920 × 1080)
- **Primary Screenshots:** [`1920x1080-01-hero.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/1920x1080-01-hero.png) through [`1920x1080-07-footer.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/1920x1080-07-footer.png)
- **Observations:**
  - Content container (`max-w-7xl`, `1280px`) centers cleanly with generous $320\text{px}$ side margins.
  - The Three.js particle canvas seamlessly expands edge-to-edge ($1920 \times 1080$ buffer); ambient dust grains fill the peripheral boundaries without abrupt cutoffs.
  - In the projects section, the 3D cylindrical curve displays its full focal depth; outer cards recede smoothly into darkness at the display borders.

### VP-02: Standard Desktop (1440 × 900)
- **Primary Screenshots:** [`06-final-hero-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/06-final-hero-1440x900.png) through [`14-footer-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/14-footer-1440x900.png)
- **Observations:**
  - Master reference resolution. All spacing, typography scale factors, and visual balances are calibrated directly to this aspect ratio.
  - Negative space around the 3D particle face ($480\text{px} \times 560\text{px}$) is balanced against the floating navbar above and `MOHAMMED ATIF` below.

### VP-03: Compact Desktop / Laptop (1366 × 768)
- **Primary Screenshots:** [`1366x768-01-hero.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/1366x768-01-hero.png) through [`1366x768-07-footer.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/1366x768-07-footer.png)
- **Observations:**
  - Tests vertical compression on standard $16:9$ laptops.
  - The hero section height adjusts to $704\text{px}$ (`calc(100vh - 4rem)`). The lower torso fade-out in `ParticleTargetGenerator.ts` (`fade = pow(1 - (y - 0.74)/0.24, 1.35)`) dissolves the chest into pure black before reaching the subtitle `MOHAMMED`, preventing particle overlap on lower-height laptop screens.

### VP-04: Tablet Portrait (768 × 1024)
- **Primary Screenshots:** [`768x1024-01-hero.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/768x1024-01-hero.png) through [`768x1024-07-footer.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/768x1024-07-footer.png)
- **Observations:**
  - Breakpoint threshold ($< 1024\text{px}$): Switches `ProjectsSection` from pinned 3D cylindrical transform to horizontal touch swipe with snap points (`snap-x snap-mandatory`).
  - Particle engine reduces budget to $20,000$ points and increases point size to $1.85$ to maintain stipple density across portrait aspect ratios.
  - Skills section transitions from 2 columns to a structured 1-column stack.

### VP-05: Modern Mobile (390 × 844)
- **Primary Screenshots:** [`390x844-01-hero.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/390x844-01-hero.png) through [`390x844-07-footer.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/390x844-07-footer.png)
- **Observations:**
  - The top metadata row (`• CREATIVE DEVELOPER & REAL-TIME GRAPHICS ENGINEER`) sits at $Y = 82\text{px}$, comfortably clearing the $41\text{px}$ high navbar dock positioned at $Y = 16\text{px}$.
  - `ATIF` typography scales down to `text-3xl` ($30\text{px}$), keeping the entire hero unit within the single initial screen fold.
  - Contact dispatch form spans full width ($100\%$), with inputs providing clear $46\text{px}$ touch target heights.

### VP-06: Narrow Mobile Stress Test (320 × 700)
- **Primary Screenshots:** [`320x700-01-hero.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/320x700-01-hero.png) through [`320x700-07-footer.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/320x700-07-footer.png)
- **Observations:**
  - **Zero Horizontal Overflow:** Body scroll width measured at exactly **320px**. No horizontal scrollbar or unintended layout expansion occurs.
  - Navbar icons adapt gracefully (`max-w-[94vw]`, reduced padding `px-2 py-1`), maintaining touch tap accessibility without overlapping screen edges.
  - Hero metadata row utilizes `truncate` class on ultra-narrow displays to gracefully clip secondary titles without pushing elements down or breaking baseline alignment.
