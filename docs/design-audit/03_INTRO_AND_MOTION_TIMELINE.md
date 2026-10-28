# Intro Animation & Motion Timeline Audit

**Lead Motion-Design Engineer & WebGL Auditor**  
**Audit Date:** October 26, 2026  
**Implementation Source:** [`src/components/intro/IntroTimeline.ts`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/intro/IntroTimeline.ts) & [`src/components/canvas/CinematicParticleEngine.ts`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/src/components/canvas/CinematicParticleEngine.ts)  
**Primary Screenshot Evidence:** [`artifacts/design-audit/screenshots/`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/)  

---

## 1. Verified Master Motion Timeline

The cinematic intro sequence executes as a single, frame-perfect continuous GSAP timeline controlling GPU shader uniforms (`uProgress`, `uDispersal`, `uLetterStep`, `uOpacity`, `uRingProgress`, `uRingOpacity`).

### Motion Timeline Table (Directly Verified via GSAP & Source Telemetry)

| Stage ID | Stage Name | Trigger | Start Condition | End Condition | Duration | Easing | Visual Result | Implementation Method | Screenshot Reference |
|:---|:---|:---|:---|:---|---:|:---|:---|:---|:---|
| **ST-01A** | Ring Fade In | Page load / Engine init | `ringOpacity = 0` | `ringOpacity = 1.0` | `0.18s` | `power2.out` | Sleek glowing circular ring emerges in center | GSAP `tl.to(proxy, { ringOpacity: 1 })` | [`01-intro-ring-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/01-intro-ring-1440x900.png) |
| **ST-01B** | Ring Trace | Concurrent with ST-01A | `ringProgress = 0` | `ringProgress = 1.0` | `0.72s` | `power1.inOut` | Circular arc sweeps $360^\circ$ around origin | Shader `atan(-vPosition.x, vPosition.y)` threshold | [`01-intro-ring-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/01-intro-ring-1440x900.png) |
| **ST-01C** | Ring Tension Hold | Ring completion | Ring closed | Detonation trigger | `0.15s` | `linear` | Solid glowing circle holds; tension pause | GSAP empty delay `tl.to({}, { duration: 0.15 })` | [`01-intro-ring-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/01-intro-ring-1440x900.png) |
| **ST-02A** | Center Detonation | $t = 1.05\text{s}$ | In-place ring | Full-screen scatter | `0.22s` | `power3.out` | Ring shatters; fine grains burst outward across entire display | `engine.triggerCenterBurst()`, `uDispersal: 0 -> 0.75` | [`02-intro-impact-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/02-intro-impact-1440x900.png) |
| **ST-02B** | Dispersion Settle | Concurrent with ST-02A | Max scatter | Near-zero dispersal | `0.45s` | `power2.inOut` | Outward kinetic energy dissipates; particles float | GSAP `uDispersal: 0.75 -> 0.04` | [`02-intro-impact-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/02-intro-impact-1440x900.png) |
| **ST-02C** | Burst Pause | $t = 1.80\text{s}$ | Floating grains | ATIF trigger | `0.25s` | `linear` | Stipple field floats calmly before inward convergence | GSAP empty delay `tl.to({}, { duration: 0.25 })` | [`02-intro-impact-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/02-intro-impact-1440x900.png) |
| **ST-03A** | ATIF Convergence | $t = 2.05\text{s}$ | Ambient grains | Assembled ATIF | `1.75s` | `power2.inOut` | All grains travel smoothly from perimeter into letter glyphs | `engine.morphToAtif()`, `uProgress: 0 -> 1.0` | [`03-atif-formation-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/03-atif-formation-1440x900.png) |
| **ST-03B** | ATIF Focus Hold | $t = 3.80\text{s}$ | ATIF settled | PORTFOLIO trigger | `0.65s` | `linear` | Wordmark ATIF remains in crisp silver focus | GSAP empty delay `tl.to({}, { duration: 0.65 })` | [`03-atif-formation-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/03-atif-formation-1440x900.png) |
| **ST-04A** | PORTFOLIO Flow | $t = 4.45\text{s}$ | ATIF glyphs | Assembled PORTFOLIO | `1.95s` | `power2.inOut` | Continuous flow: particles re-map directly into PORTFOLIO letters | `engine.morphToPortfolio()`, `uProgress: 0 -> 1.0` | [`04-portfolio-formation-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/04-portfolio-formation-1440x900.png) |
| **ST-04B** | Letter Sweep | Concurrent with ST-04A | `uLetterStep = 0` | `uLetterStep = 9.8` | `1.95s` | `power1.inOut` | Progressive left-to-right letter assembly sweep across 9 letters | Uniform `uLetterStep` controls per-letter stagger attribute | [`04-portfolio-formation-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/04-portfolio-formation-1440x900.png) |
| **ST-04C** | Final Letter Lock | $t = 6.40\text{s}$ | `uLetterStep = 9.8` | `uLetterStep = 10.0` | `0.25s` | `power2.out` | Final letter 'O' snaps into lock position | GSAP `uLetterStep: 9.8 -> 10.0` | [`04-portfolio-formation-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/04-portfolio-formation-1440x900.png) |
| **ST-04D** | PORTFOLIO Hold | $t = 6.65\text{s}$ | PORTFOLIO settled | Portrait trigger | `0.65s` | `linear` | Wordmark PORTFOLIO held in sharp stippled focus | GSAP empty delay `tl.to({}, { duration: 0.65 })` | [`04-portfolio-formation-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/04-portfolio-formation-1440x900.png) |
| **ST-05A** | Portrait Sculpting | $t = 7.30\text{s}$ | PORTFOLIO glyphs | 3D Face point cloud | `2.10s` | `power2.inOut` | Direct fluid morph: letters dissolve outward into living 3D face | `engine.morphToPortrait()`, `uProgress: 0 -> 1.0` | [`05-portrait-reconstruction-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/05-portrait-reconstruction-1440x900.png) |
| **ST-05B** | Portrait Parabolic Arc | Concurrent with ST-05A | `uDispersal = 0.24` | `uDispersal = 0` | `2.10s` | `power3.out` | Particles follow parabolic ballistic trajectory into facial anchors | Shader arc: `sin(t * PI) * dispersalMultiplier` | [`05-portrait-reconstruction-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/05-portrait-reconstruction-1440x900.png) |
| **ST-05C** | Portrait Hold | $t = 9.40\text{s}$ | Face sculpted | Intro complete | `1.10s` | `linear` | Completed facial portrait hovers with subtle micro-hover | GSAP empty delay `tl.to({}, { duration: 1.10 })` | [`05-portrait-reconstruction-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/05-portrait-reconstruction-1440x900.png) |
| **ST-06** | Settled Transition | $t = 10.50\text{s}$ | `IntroExperience` active | `PortfolioShell` visible | `0.70s` | `[0.16, 1, 0.3, 1]` | Intro HUD fades out; Navbar, Hero text, and Sections fade in | `setIntroCompleted(true)`, CSS `transition-opacity duration-700` | [`06-final-hero-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/06-final-hero-1440x900.png) |

---

## 2. Technical Motion Investigations

### A. Animation Ordering & Particle Continuity
- **Observation:** Zero abrupt scene cuts or full-canvas opacity dips are present between ATIF, PORTFOLIO, and the Portrait.
- **Implementation Mechanism:** In `CinematicParticleEngine.ts` (`setTargetState`), existing positions are captured via `currentPositions[i] = currentPositions[i] + (prevTarget[i] - currentPositions[i]) * progress`. The new target buffer is loaded into `aTargetPos`, and `uProgress` is reset from `0.0` to `1.0`. The GPU shader computes `mix(position, aTargetPos, t)` where `t = smoothstep(0.0, 1.0, staggered)`.
- **Verdict:** True continuous particle morphing with continuous vector momentum.

### B. Canvas Dimensions, DPR & Scaling
- **Measurement:** 
  - On standard desktop ($1440 \times 900$), `devicePixelRatio = 1.0`, canvas buffer is exactly $1440 \times 900$.
  - On Retina / high-density displays (e.g., $768 \times 1024$ at DPR 2.0), the engine clamps DPR via `Math.min(window.devicePixelRatio || 1, 2)`. Drawing buffer is $1536 \times 2048$, preventing memory bloat while preserving sharp stipple definition.
- **Point Sizing Formula:** `gl_PointSize = clamp(grain * uDpr * (110.0 / -mvPosition.z), 1.8, 3.8)` in vertex shader ensures particles scale naturally with perspective depth.

### C. Scroll & Navigation Blocking
- **Direct Observation:** During the intro sequence ($0.00\text{s} - 10.50\text{s}$), the overlay is mounted with `pointer-events-none` on the backdrop, while the top bar (`Skip Intro` button) has `pointer-events-auto`. The main `PortfolioShell` has `opacity: 0; pointer-events-none`.
- **Finding:** Users cannot accidentally scroll away or click section links until the intro settles or is skipped via `ESC` / click.

### D. Replay Behavior & State Sanitization
- **Reproduction:** Triggering `Replay Intro` from either the navbar button or the footer:
  1. Instantly resets window scroll via `window.scrollTo({ top: 0, behavior: 'instant' })`.
  2. Disposes of existing `ScrollParticleController` instances (`controller.destroy()`).
  3. Transitions `PortfolioShell` out rapidly ($150\text{ms}$ `ease-in`).
  4. Creates a fresh `IntroTimeline` instance and invokes `tl.start()`.
- **Evidence:** Tested and verified in [`15-replay-behavior-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/15-replay-behavior-1440x900.png). Zero ghost text or lingering hero opacity was observed.

### E. Reduced Motion Mode (`prefers-reduced-motion: reduce`)
- **Direct Measurement:** Emulated in Chrome via `Emulation.setEmulatedMedia { prefers-reduced-motion: reduce }`.
- **Observed Behavior:**
  - `IntroExperience` detects `mediaQuery.matches` during `init()`.
  - Immediately executes `engine.setSettledState()`, locking particles to the completed 3D portrait.
  - Calls `handleFinish()`, mounting `PortfolioShell` without playing the 10.5-second sequence.
  - Shuts down mouse repulsion physics (`uMouse.set(9999, 9999)`).
- **Evidence:** Captured in [`reduced-motion-settled-1440x900.png`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/screenshots/reduced-motion-settled-1440x900.png).

### F. Resource Cleanup & Memory Safety
- When components unmount or intro resets:
  - `cancelAnimationFrame(this.animationFrameId)` terminates the WebGL render loop.
  - Event listeners (`mousemove`, `mouseleave`, `touchmove`, `touchend`, `resize`) are removed.
  - Three.js buffers (`this.geometry.dispose()`, `this.shaderMaterial.dispose()`) are explicitly freed.
