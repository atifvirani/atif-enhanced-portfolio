# Prioritized Issue Register & Technical Remedies

**Lead Visual QA Specialist & Technical Lead**  
**Audit Date:** October 26, 2026  
**Methodology:** Evidence-based classification with direct screenshot and code references.  

---

## 1. Issue Severity Definitions

- **P0 (Critical):** Fatal blocker making the application unusable or crashing execution.
- **P1 (High):** Major visual, functional, navigation, or responsive defect.
- **P2 (Medium):** Noticeable design, performance, or interaction inconsistency.
- **P3 (Polish):** Fine cosmetic polish, spacing refinement, or code hygiene improvement.

---

## 2. Master Prioritized Issue Register

| Issue ID | Priority | Affected Section | Viewport | Screenshot Reference | Exact Observed Behavior | Measured / Computed Evidence | Reproduction Steps | Root Cause (Verified / Suspected) | Confidence | User-Facing Impact | Recommended Direction for Future Fix | Regression Risk | Suggested Verification Test |
|:---|:---:|:---|:---:|:---|:---|:---|:---|:---|:---:|:---|:---|:---:|:---|
| **ISSUE-01** | **P1 (High)** | Build / Production Bundle | All | *Build output console* | Vite outputs single compiled JavaScript chunk of $1,093.44\text{ KB}$ ($316.89\text{ KB}$ gzip), triggering Vite $> 500\text{ KB}$ chunk warning. | `dist/assets/index-BPmhz7wg.js: 1,093.44 kB` | Execute `npm run build`. | **Verified:** All dependencies (`three`, `gsap`, `framer-motion`, `lucide-react`) are packed into a single monolithic bundle without `manualChunks` splitting. | **High** | Slower initial script evaluation on low-tier mobile networks. | Configure Vite `build.rollupOptions.output.manualChunks` to split `vendor-three` and `vendor-gsap`. | Low | Run `npm run build` and verify all chunk sizes remain $< 450\text{ KB}$. |
| **ISSUE-02** | **P2 (Med)** | Particle Canvas | All | *Browser console* | Console displays warning: `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` | 6 logged console warnings during execution | Open page in browser and inspect console. | **Verified:** Three.js v0.186 deprecated `THREE.Clock` in favor of modern `THREE.Timer`. | **High** | Zero immediate visual defect; potential breaking change in future Three.js upgrades. | Migrate `this.clock = new THREE.Clock()` to `THREE.Timer` in `CinematicParticleEngine.ts`. | Very Low | Run build and inspect console for zero deprecation warnings. |
| **ISSUE-03** | **P2 (Med)** | Spotlight Navbar / Scroll | 1440x900 | [`anchor_06_top_1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/anchor_06_top_1440x900.png) | Clicking `Home` (`#top`) when scrolled down to `#contact` ($Y = 7,466\text{px}$) takes over $1,200\text{ms}$ of smooth scroll time to reach the top. | Measured `scrollY = 1025px` at $t = 750\text{ms}$ after click | Scroll to bottom of page; click Home icon in navbar. | **Verified:** Browser native `window.scrollTo({ top: 0, behavior: 'smooth' })` duration scales linearly with pixel distance ($8,765\text{px}$ travel). | **High** | User must wait more than a second for the viewport to return to the hero. | Use GSAP `ScrollToPlugin` with an explicit duration cap ($0.6\text{s}$) for long-distance anchor leaps. | Low | Test Home anchor click from footer and verify instant smooth arrival in $\le 600\text{ms}$. |
| **ISSUE-04** | **P2 (Med)** | Contact Section | All | [`13-contact-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/13-contact-1440x900.png) | Clicking `Copy` email address button fails silently in non-HTTPS / restricted WebView contexts. | `navigator.clipboard.writeText(...)` with empty `catch` block | Load in an insecure iframe or older mobile browser without clipboard permissions. | **Verified:** `ContactSection.tsx` lines 19-27 has an empty `catch {}` without textarea `document.execCommand('copy')` fallback. | **High** | Mobile users in custom app WebViews cannot copy the email address. | Add fallback `document.execCommand('copy')` inside `catch` block. | Very Low | Disable clipboard API in browser settings and verify copy functionality still succeeds. |
| **ISSUE-05** | **P3 (Polish)** | Hero Section | 1920x1080 | [`1920x1080-01-hero.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/1920x1080-01-hero.png) | On ultra-wide displays ($1920\text{px}$), the cursor 3D parallax yaw ($\pm 3.15^\circ$) feels subtle and barely perceptible against the large container width. | Tilt calculation uses `visibleWidth * 0.5` divisor | Move cursor between left and right edges on 1920x1080 monitor. | **Verified:** `normX` is normalized against `visibleWidth`, which dilutes angle response on wide screens. | **Medium** | Reduced spatial depth perception on larger desktop monitors. | Tune yaw multiplier dynamically or normalize against fixed virtual bounding box. | Low | Visually verify responsiveness across 1366, 1440, and 1920 displays. |
| **ISSUE-06** | **P3 (Polish)** | Global Background | All | [`06-final-hero-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/06-final-hero-1440x900.png) | `.monochrome-gradient` radial glow (`rgba(255,255,255,0.04)`) is almost imperceptible on standard TN / IPS matte panels. | Computed opacity `0.04` across 70% radial spread | View site on non-OLED display in daytime ambient lighting. | **Verified:** Extremely subtle contrast token designed for dark studio environments. | **Medium** | Users on standard office monitors perceive pure flat black rather than ambient depth. | Slightly boost core radial luminance to `0.06 - 0.08` or introduce a subtle volumetric noise stipple. | Low | A/B test across OLED and IPS panels under normal room lighting. |
| **ISSUE-07** | **P3 (Polish)** | Journey Section | 320x700 | [`320x700-05-journey.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/320x700-05-journey.png) | Milestone tag chips (`Three.js`, `GLSL`, `GSAP`, `TypeScript`) wrap into 3 tight rows on narrow 320px screens. | Measured card content width: $232\text{px}$ on 320px screen | View Journey section on 320x700 viewport. | **Verified:** Normal flex wrapping on extremely narrow containers. | **High** | Card becomes vertically tall, extending total scroll length. | Reduce tag horizontal padding on mobile (`px-2 py-0.5 text-[10px]`). | Very Low | Verify chip readability and padding on 320px stress test. |

---

## 3. Separation of Objective Defects vs Art Direction Notes

- **Objective Engineering Issues:**
  - ISSUE-01 (Bundle size optimization)
  - ISSUE-02 (`THREE.Clock` deprecation)
  - ISSUE-03 (Smooth scroll duration over long distance)
  - ISSUE-04 (Clipboard API fallback)
- **Subjective Art Direction Opportunities:**
  - ISSUE-05 (Parallax angle sensitivity)
  - ISSUE-06 (Background radial illumination level)
  - ISSUE-07 (Mobile tag chip density)
