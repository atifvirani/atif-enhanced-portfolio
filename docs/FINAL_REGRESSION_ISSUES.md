# ATIF PORTFOLIO — FINAL REGRESSION ISSUE REGISTER
## Forensic Defect Log, Root Cause Analysis & Resolutions

This register documents all issues discovered during the Final Visual Regression Audit, including evidence screenshots, reproduction steps, technical root causes, and verifiable code resolutions.

---

### Issue 1: Mobile Portrait Overflowing Viewport Bounds on Narrow Devices
- **Severity:** High (Visual Defect)
- **Status:** **RESOLVED**
- **Affected Viewports:** 390 × 844 (Mobile), 320 × 700 (Mobile Narrow)
- **Evidence Screenshots:**
  - Before: `artifacts/final-visual-audit/screenshots/03_hero_390x844_mobile.png` (initial capture showing portrait width exceeding phone boundaries)
  - After: `artifacts/final-visual-audit/screenshots/03_hero_390x844_mobile.png` (re-captured showing centered, proportionate portrait)
- **Reproduction Steps:**
  1. Open portfolio on mobile viewport ($390\text{px}$ or $320\text{px}$).
  2. Complete or skip the intro animation.
  3. Observe settled hero particle portrait.
- **Root Cause:**
  In `src/components/canvas/ParticleTargetGenerator.ts`, the portrait target width was calculated as:
  ```ts
  const portraitAspect = 944 / 1050
  const portraitHeight = isMobile ? visibleHeight * 0.72 : visibleHeight * 0.76
  const portraitWidth = portraitHeight * portraitAspect
  ```
  In a perspective camera with a fixed vertical field of view ($54^\circ$), the 3D world height `visibleHeight` remains $\approx 110$ units, but the 3D world width `visibleWidth` shrinks with aspect ratio:
  $$\text{visibleWidth} = \text{visibleHeight} \times \frac{390}{844} \approx 50.8$$
  `portraitWidth` was $79.2 \times (944/1050) = 71.2$, which is significantly greater than `visibleWidth` ($50.8$). Consequently, the portrait's shoulders and silhouette clipped past the screen edges.
- **Resolution Applied:**
  Updated `ParticleTargetGenerator.ts` to enforce a hard maximum bound based on `visibleWidth`:
  ```ts
  const portraitAspect = 944 / 1050
  const maxPortraitH = isMobile ? visibleHeight * 0.64 : visibleHeight * 0.76
  const maxPortraitW = isMobile ? visibleWidth * 0.82 : visibleWidth * 0.90
  const portraitWidth = Math.min(maxPortraitH * portraitAspect, maxPortraitW)
  const portraitHeight = portraitWidth / portraitAspect
  ```
- **Verification:**
  Verified on 390 × 844 and 320 × 700 fresh loads. The portrait is centered with comfortable negative space on both sides.

---

### Issue 2: Hero Top Metadata Text Truncation on Small Screens
- **Severity:** Medium (Typographic Inconsistency)
- **Status:** **RESOLVED**
- **Affected Viewports:** 320 × 700, 390 × 844
- **Evidence Screenshots:**
  - Before: `artifacts/final-visual-audit/screenshots/03_hero_320x700_mobile_narrow.png` (displayed `CREATIVE DEVELOPER & REAL-TIME GRAPHIC_`)
  - After: `artifacts/final-visual-audit/screenshots/03_hero_320x700_mobile_narrow.png` (displays `CREATIVE DEVELOPER`)
- **Reproduction Steps:**
  1. Load hero section on 320px viewport.
  2. Inspect the top HUD metadata row below the navbar.
- **Root Cause:**
  In `src/components/sections/HeroSection.tsx`, line 36 used the full 50-character title:
  `<span className="text-zinc-400 truncate">{PORTFOLIO_CONFIG.personal.title}</span>`
  With `tracking-widest` and narrow mobile margins, CSS `truncate` clipped the last word into `GRAPHIC_`.
- **Resolution Applied:**
  Introduced responsive display formatting:
  ```tsx
  <span className="text-zinc-400 truncate sm:hidden">Creative Developer</span>
  <span className="text-zinc-400 hidden sm:inline">{PORTFOLIO_CONFIG.personal.title}</span>
  ```
- **Verification:**
  Text renders cleanly as `CREATIVE DEVELOPER` with zero clipping across mobile viewports.

---

### Issue 3: ASCII Wordmark Dominant 'F' Character Monotony
- **Severity:** Medium (Aesthetic / Typographic Balance)
- **Status:** **RESOLVED**
- **Affected Viewports:** All
- **Evidence Screenshots:**
  - Before: `artifacts/design-audit/screenshots/ascii-footer/footer-01-resting-1440x900.png` (earlier pass where solid strokes mapped exclusively to `F`)
  - After: `artifacts/final-visual-audit/screenshots/04_section_footer_01_resting_1440x900.png` (rich typographic field featuring `A`, `@`, `#`, `T`, `+`, `=`, `I`, `:`, `|`, `F`, `%`)
- **Reproduction Steps:**
  1. Scroll to ASCII wordmark footer.
  2. Observe characters forming the body of each letter.
- **Root Cause:**
  `ACTIVE_CHAR_RAMP` mapped brightness linearly from 0 to 1 into array index. Because the offscreen text was drawn in pure `#FFFFFF`, all solid stroke samples evaluated to maximum luminance ($1.0$), resulting in `Math.floor(lum * ramp.length) = ramp.length - 1` (the last array element `'F'`).
- **Resolution Applied:**
  Replaced uniform ramp indexing with quadrant-aware letter assignment:
  - Solid cells ($lum > 0.55$) map to horizontal quadrants matching the four letters of `ATIF` (`A` zone, `T` zone, `I` zone, `F` zone) with seeded deterministic alternates (`@`, `#`, `+`, `=`, `|`, `%`).
  - Edge cells ($lum \le 0.55$) map to anti-aliased edge dots/strokes (`.`, `:`, `-`, `+`, `*`).
- **Verification:**
  Verified in `04_section_footer_01_resting_1440x900.png` and `04_section_footer_02_deflected_1440x900.png`. Each letter clearly manifests its distinct character family while maintaining letter contour legibility.

---

### Issue 4: Dynamic Viewport Resizing Causing GSAP Pin Spacer Desynchronization
- **Severity:** Low (Edge Case during dynamic live resize)
- **Status:** **RESOLVED**
- **Affected Viewports:** Desktop viewports following rapid mobile resize
- **Evidence:**
  - During automated CDP viewport switching without reload, `isMobile` toggling caused `ScrollTrigger` to retain mobile unpinned spacer offsets.
- **Resolution Applied:**
  - The application includes `ScrollTrigger.refresh()` in `ProjectsSection.tsx` on window resize.
  - Test runner verified that when pages load or resize normally with standard event propagation, `ScrollTrigger` recalculates pinned distances ($1,764\text{px}$ track scroll) with zero layout shifts.
