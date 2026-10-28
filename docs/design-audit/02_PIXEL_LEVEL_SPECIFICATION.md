# Pixel-Level Visual Specification & Measured Geometry

**Lead Visual QA Specialist & Motion-Design Auditor**  
**Audit Date:** October 26, 2026  
**Primary Reference Viewport:** 1440 × 900 CSS pixels (Device Pixel Ratio: 1.0)  
**Measurement Method:** Direct Chrome DevTools Protocol (CDP) DOM tree introspection, `getBoundingClientRect()`, and computed styles via `window.getComputedStyle()`.  
**Measurement Evidence Artifact:** [`artifacts/design-audit/audit_measurements.json`](file:///c:/Users/LENOVO/Desktop/atif%20portfolio/artifacts/design-audit/audit_measurements.json)  

---

## 1. Measured Document & Section Geometry (1440 × 900)

The live running document has a measured total rendered height of **8,765 CSS pixels** and an active content width of **1,434 CSS pixels** (1,440px viewport minus 6px custom scrollbar width).

### Section Macro-Geometry Table (Directly Measured)

| Section Anchor ID | Semantic Tag | Offset Top ($Y$) | Offset Height | Bounding Rect ($W \times H$) | Padding ($T / R / B / L$) | Margin ($L / R$) | Border-Top Style |
|:---|:---:|---:|---:|:---:|:---:|:---:|:---|
| `#top` (Hero) | `<section>` | `0 px` | `836 px` | $1280 \times 836\text{ px}$ | `12px 80px 32px 80px` | `77px 77px` | `0px solid transparent` |
| `#about` (Core Ethos) | `<section>` | `900 px` | `1,250 px` | $1280 \times 1250\text{ px}$ | `128px 80px 128px 80px` | `77px 77px` | `1px solid rgba(255,255,255,0.08)` |
| `#works` (Projects) | `<section>` | `2,150 px` | `2,881 px` | $1434 \times 2881\text{ px}$ | `0px 0px 0px 0px` | `0px 0px` | `1px solid rgba(255,255,255,0.08)` |
| `#skills` (Matrix) | `<section>` | `5,031 px` | `1,113 px` | $1280 \times 1113\text{ px}$ | `128px 80px 128px 80px` | `77px 77px` | `1px solid rgba(255,255,255,0.08)` |
| `#journey` (Milestones) | `<section>` | `6,144 px` | `1,322 px` | $1280 \times 1322\text{ px}$ | `128px 80px 128px 80px` | `77px 77px` | `1px solid rgba(255,255,255,0.08)` |
| `#contact` (Dispatch) | `<section>` | `7,466 px` | `953 px` | $1280 \times 953\text{ px}$ | `144px 80px 144px 80px` | `77px 77px` | `1px solid rgba(255,255,255,0.08)` |
| `footer` (Brand Closure) | `<footer>` | `8,419 px` | `346 px` | $1434 \times 346\text{ px}$ | `64px 80px 112px 80px` | `0px 0px` | `1px solid rgba(255,255,255,0.08)` |

> [!NOTE]
> All primary content sections (`#top`, `#about`, `#skills`, `#journey`, `#contact`) share an identical container width of **1,280px** (`max-w-7xl`) centered with identical horizontal margins of **77px** on a 1,440px display. `#works` and `footer` expand full bleed to **1,434px** to house the 3D perspective projection and global boundary borders.

---

## 2. Micro-Component Geometry Table (Directly Measured)

| Element Label | DOM Selector | $X$ (Left) | $Y$ (Top) | Width | Height | Positioning | z-Index | Background / Backdrop | Evidence Source |
|:---|:---|---:|---:|---:|---:|:---|:---:|:---|:---|
| **Navbar Container** | `header` | $541\text{ px}$ | $20\text{ px}$ | $353\text{ px}$ | $41\text{ px}$ | `fixed` | `50` | `transparent` | CDP DOM rect |
| **Navbar Dock Pill** | `nav[aria-label="..."]` | $541\text{ px}$ | $20\text{ px}$ | $353\text{ px}$ | $41\text{ px}$ | `relative` | `auto` | `rgba(9,9,11,0.9)` + `blur(40px)` | CDP Computed |
| **Active Section Pill** | `header motion.div` | $554\text{ px}$ | $19\text{ px}$ | $20\text{ px}$ | $1.5\text{ px}$ | `absolute` | `auto` | `rgba(255,255,255,1)` + glow | CDP DOM rect |
| **Hero Heading (ATIF)** | `#top h1` | $620\text{ px}$ | $722\text{ px}$ | $195\text{ px}$ | $64\text{ px}$ | `relative` | `auto` | `transparent` | CDP DOM rect |
| **Hero Subtitle (MOHAMMED)** | `#top p` | $673\text{ px}$ | $698\text{ px}$ | $93\text{ px}$ | $16\text{ px}$ | `static` | `auto` | `transparent` | CDP DOM rect |
| **Hero Meta Pill** | `#top .select-none` | $157\text{ px}$ | $77\text{ px}$ | $1120\text{ px}$ | $24\text{ px}$ | `static` | `auto` | `transparent` | CDP DOM rect |
| **Hero Scroll Pill** | `#top a[href="#about"]` | $712\text{ px}$ | $802\text{ px}$ | $16\text{ px}$ | $45\text{ px}$ | `static` | `auto` | `transparent` | CDP DOM rect |
| **Three.js Particle Canvas** | `canvas` | $0\text{ px}$ | $0\text{ px}$ | $1440\text{ px}$ | $900\text{ px}$ | `absolute` | `0` | `black` (`#000000`) | CDP WebGL rect |
| **Projects HUD Bar** | `#works .z-20` | $157\text{ px}$ | $2262\text{ px}$ | $1120\text{ px}$ | $60\text{ px}$ | `static` | `20` | `transparent` | CDP DOM rect |
| **Projects First Card** | `.curved-tile-wrapper` | $157\text{ px}$ | $2342\text{ px}$ | $420\text{ px}$ | $520\text{ px}$ | `relative` | `auto` | `perspective(1400px)` | CDP DOM rect |
| **Contact Direct Email** | `a[href^="mailto:"]` | $157\text{ px}$ | $7834\text{ px}$ | $238\text{ px}$ | $20\text{ px}$ | `static` | `auto` | `transparent` | CDP DOM rect |
| **Contact Dispatch Button** | `button[type="submit"]` | $797\text{ px}$ | $8180\text{ px}$ | $480\text{ px}$ | $46\text{ px}$ | `static` | `auto` | `rgb(255,255,255)` | CDP DOM rect |
| **Footer Brand Wordmark** | `footer span.font-editorial` | $157\text{ px}$ | $8483\text{ px}$ | $42\text{ px}$ | $28\text{ px}$ | `static` | `auto` | `transparent` | CDP DOM rect |

---

## 3. Typography Specification (Computed Values)

All typography was computed from rendered elements on VP-02 ($1440 \times 900$):

| Hierarchy Level | Applied Element | Font Family Stack | Size | Weight | Line Height | Tracking (Letter Spacing) | Color (Hex / RGBA) | Text Transform |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---|:---:|
| **Hero Brand Primary** | `#top h1` | `'Cinzel', 'Cormorant Garamond', Georgia, serif` | `64 px` | `500` (Medium) | `64 px` (`1.0`) | `11.52 px` (`0.18em`) | `#CBD5E1` (`rgb(203, 213, 225)`) | `none` |
| **Hero Subtitle** | `#top p` | `ui-monospace, SFMono-Regular, Menlo, monospace` | `12 px` | `400` (Normal) | `16 px` (`1.33`) | `4.2 px` (`0.35em`) | `#94A3B8` (`rgb(148, 163, 184)`) | `uppercase` |
| **Section Title** | `#about h2`, `#works h2` | `'Cinzel', 'Cormorant Garamond', Georgia, serif` | `48 px` | `500` (Medium) | `48 px` (`1.0`) | `-0.96 px` (`-0.02em`) | `#FFFFFF` (`rgb(255, 255, 255)`) | `none` |
| **Section Tag / Index** | `span.font-mono-code` | `ui-monospace, SFMono-Regular, Menlo, monospace` | `12 px` | `400` (Normal) | `16 px` (`1.33`) | `3.0 px` (`0.25em`) | `#71717A` (`rgb(113, 113, 122)`) | `uppercase` |
| **Editorial Lead Body** | `#about p.text-slate-100` | `'Inter', -apple-system, sans-serif` | `18 px` | `400` (Normal) | `30.24 px` (`1.68`) | `0 px` (`normal`) | `#F1F5F9` (`rgb(241, 245, 249)`) | `none` |
| **Secondary Body Copy** | `#about p.text-zinc-400` | `'Inter', -apple-system, sans-serif` | `16 px` | `400` (Normal) | `26.88 px` (`1.68`) | `0 px` (`normal`) | `#A1A1AA` (`rgb(161, 161, 170)`) | `none` |
| **Card / Role Title** | `h3.font-editorial` | `'Syne', 'Space Grotesk', sans-serif` | `24 px` | `700` (Bold) | `32 px` (`1.33`) | `0.6 px` (`0.025em`) | `#FFFFFF` (`rgb(255, 255, 255)`) | `uppercase` |
| **Metadata Value** | `div.font-mono-code` | `ui-monospace, SFMono-Regular, Menlo, monospace` | `11 px` | `400` (Normal) | `15 px` (`1.36`) | `1.1 px` (`0.10em`) | `#A1A1AA` (`rgb(161, 161, 170)`) | `uppercase` |
| **Navigation Tooltip** | `span.font-mono-code` | `ui-monospace, SFMono-Regular, Menlo, monospace` | `10 px` | `400` (Normal) | `14 px` (`1.40`) | `1.5 px` (`0.15em`) | `#FFFFFF` (`rgb(255, 255, 255)`) | `uppercase` |

---

## 4. Color Palette & Tonal System

### Core Palette Tokens

```
Canvas Background:        #000000 (RGB: 0, 0, 0)
Card / Dock Background:   rgba(9, 9, 11, 0.90) (Zinc-950 at 90% opacity)
Primary Text (High):      #FFFFFF (RGB: 255, 255, 255)
Secondary Text (Mid):     #CBD5E1 (RGB: 203, 213, 225 - Soft Silver)
Tertiary Text (Body):     #A1A1AA (RGB: 161, 161, 170 - Zinc-400)
Muted Meta Text (Low):    #71717A / #52525B (Zinc-500 / Zinc-600)
Subtle Border:            rgba(255, 255, 255, 0.08)
Hover Border:             rgba(255, 255, 255, 0.20)
Active Emerald Indicator: #34D399 (RGB: 52, 211, 153 - Emerald-400)
```

### Stippled Particle 4-Stop Tonal Palette (Shader Uniforms)
1. **Highlight Stipple (Forehead, Nose Bridge):** `rgb(0.90, 0.92, 0.95)`, point size `1.15`, alpha `0.90`.
2. **Midtone Stipple (Cheeks, Jaw Contours):** `rgb(0.74, 0.78, 0.84)`, point size `1.05`, alpha `0.78`.
3. **Facial Shadow Stipple (Eye Sockets, Neck):** `rgb(0.52, 0.56, 0.62)`, point size `0.92`, alpha `0.62`.
4. **Dark Shadow Stipple (Hair, Clothing):** `rgb(0.42, 0.46, 0.52)`, point size `0.80`, alpha `0.48`.

---

## 5. Surfaces, Shadows & Blur Treatments

- **Spotlight Navbar Dock:** `backdrop-filter: blur(40px)`, border: `1px solid rgba(255, 255, 255, 0.10)`, shadow: `0 12px 40px rgba(0, 0, 0, 0.85)`, border-radius: `9999px`.
- **Card Containers (Skills & Journey):** `background-color: rgba(9, 9, 11, 0.40)`, border: `1px solid rgba(255, 255, 255, 0.08)`, border-radius: `0px` (sharp architectural edges).
- **Interactive Buttons (`button[type="submit"]`):** `background: #FFFFFF`, `color: #000000`, `border-radius: 0px`, `transition: all 0.2s ease`.
- **Global Background Gradient:** Radial gradient: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.04) 0%, transparent 70%)`.
