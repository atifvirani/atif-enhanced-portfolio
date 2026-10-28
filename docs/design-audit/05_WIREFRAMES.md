# Architectural Wireframes & Visual Layout Maps

**Lead UI/UX Auditor & Frontend Architect**  
**Audit Date:** October 26, 2026  
**Method:** Derived strictly from live DOM bounding boxes and computed styles.  

---

## 1. Full-Page Desktop Structural Wireframe (1440 × 900)

```text
========================================================================================
VIEWPORT: 1440px × 900px (Total Rendered Document Height: 8,765px)
========================================================================================

 [TOP: 20px, FIXED Z:50, WIDTH: 353px, HEIGHT: 41px, RADIUS: 9999px, BLUR: 40px]
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                     [Home] [About] [Works] [Skills] [Journey] [Mail] | [Replay] │
 └──────────────────────────────────────────────────────────────────────────────────┘

 Y=0px  ┌──────────────────────────────────────────────────────────────────────────┐
        │ [SECTION 01: HERO] (Height: 836px, Max-W: 1280px)                        │
        │ • CREATIVE DEVELOPER & GRAPHICS...            Three.js + GLSL | Remote   │
        │                                                                          │
        │                           [ THREE.JS 3D ]                                │
        │                         [ STIPPLED PORTRAIT ]                            │
        │                         (34,000 GPU PARTICLES)                           │
        │                                                                          │
        │                                MOHAMMED                                  │
        │                                  ATIF                                    │
        │                                   (○)                                    │
        │                                    |                                     │
 Y=900px├──────────────────────────────────────────────────────────────────────────┤
        │ [SECTION 02: ABOUT / CORE ETHOS] (Height: 1250px, Max-W: 1280px)         │
        │ 02 ─────── ABOUT ME                       Engineering Philosophy         │
        │ "Engineering digital experiences with uncompromising rigor..."           │
        │                                                                          │
        │ ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐      │
        │ │ 01 GRAPHICS       │  │ 02 CHOREOGRAPHY   │  │ 03 ARCHITECTURE   │      │
        │ └───────────────────┘  └───────────────────┘  └───────────────────┘      │
        │ [DISCIPLINE] [LOCATION] [METHODOLOGY] [STATUS]                           │
Y=2150px├──────────────────────────────────────────────────────────────────────────┤
        │ [SECTION 03: PROJECTS GALLERY] (Pinned Height: 2881px, Width: 1434px)     │
        │ 03 ─── ARCHITECTURAL EXHIBIT                         [01 / 04 SCRUB]     │
        │ CURATED ARTIFACTS                                    VIRTUAL ARC 1400PX  │
        │                                                                          │
        │      ┌────────────┐        ┌────────────┐        ┌────────────┐          │
        │     /  CARD 01     \      |   CARD 02   |      /  CARD 03     \         │
        │    /  (Rot -16deg)  \     | (Center 0)  |     /  (Rot +16deg)  \        │
        │   /   (TransZ -135)  \    | (TransZ 0)  |    /   (TransZ -135)  \       │
        │  /                    \   |             |   /                    \      │
Y=5031px├──────────────────────────────────────────────────────────────────────────┤
        │ [SECTION 04: SKILLS / MATRIX] (Height: 1113px, Max-W: 1280px)            │
        │ 04 ─── Technical Capabilities                        Engineering Matrix  │
        │ ┌───────────────────────────────┐   ┌───────────────────────────────┐    │
        │ │ CAP-01: Real-Time 3D & GLSL   │   │ CAP-02: Creative Motion       │    │
        │ │ [Three.js] [WebGL] [GLSL]     │   │ [GSAP] [ScrollTrigger]        │    │
        │ ├───────────────────────────────┤   ├───────────────────────────────┤    │
        │ │ CAP-03: Frontend Architecture │   │ CAP-04: Tooling & Performance │    │
        │ │ [React 19] [TypeScript]       │   │ [GPU Memory] [Vite]           │    │
        │ └───────────────────────────────┘   └───────────────────────────────┘    │
Y=6144px├──────────────────────────────────────────────────────────────────────────┤
        │ [SECTION 05: JOURNEY] (Height: 1322px, Max-W: 1280px)                    │
        │ 05 ─── Chronological Milestones                      Engineering Journey │
        │   |                                                                      │
        │   o── 2025 — Present: Creative Technologist (Independent Studio)         │
        │   |   [Three.js] [GLSL] [GSAP] [TypeScript]                              │
        │   |                                                                      │
        │   o── 2024 — 2025: Frontend Systems Engineer (Creative Practice)         │
        │   |   [React] [Next.js] [Tailwind CSS v4]                                │
        │   |                                                                      │
        │   o── 2023 — 2024: Interactive Systems & Creative Computing              │
Y=7466px├──────────────────────────────────────────────────────────────────────────┤
        │ [SECTION 06: CONTACT] (Height: 953px, Max-W: 1280px)                     │
        │ 06 ─── Initiate Collaboration                                            │
        │ "Let's build something exceptional."    ┌──────────────────────────────┐ │
        │ • Open for select collaborations        │ Name Input                   │ │
        │ mohammedatif.dev@gmail.com [Copy]       │ Email Input                  │ │
        │ [GitHub]  [LinkedIn]  [X / Twitter]     │ Message Input                │ │
        │                                         │ [INITIATE DISPATCH BUTTON]   │ │
        │                                         └──────────────────────────────┘ │
Y=8419px├──────────────────────────────────────────────────────────────────────────┤
        │ [SECTION 07: CURRENT FOOTER] (Height: 346px, Width: 1434px)              │
        │ ATIF [PORTFOLIO 2026]                    GitHub  LinkedIn  X             │
        │ Engineered with monochrome discipline... Replay Intro   Back to Top ↑    │
        │ ──────────────────────────────────────────────────────────────────────── │
        │ © 2026 Engineered by Mohammed Atif       • Open for select...            │
Y=8765px└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mobile Structural Wireframe (390 × 844 & 320 × 700)

```text
========================================================================================
VIEWPORT: 390px × 844px (Mobile Stack)
========================================================================================

  [TOP: 16px, FIXED, WIDTH: 92vw, MAX-W: 340px, HEIGHT: 38px, Z:50]
  ┌─────────────────────────────────────────────────────────────┐
  │   [Home]  [About]  [Works]  [Skills]  [Journey]  [Mail] [↺] │
  └─────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │ [HERO: pt-20 (80px clearance below navbar)]                 │
  │ • CREATIVE DEVELOPER... (Truncated on 320px)                │
  │                                                             │
  │                     [ 3D PORTRAIT ]                         │
  │                  (20,000 GPU Particles)                     │
  │                                                             │
  │                         MOHAMMED                            │
  │                           ATIF                              │
  │                            (○)                              │
  ├─────────────────────────────────────────────────────────────┤
  │ [ABOUT: Single-Column Stack]                                │
  │ 02 // ABOUT ME                                              │
  │ "Engineering digital experiences..."                        │
  │                                                             │
  │ ┌─────────────────────────────────────────────────────────┐ │
  │ │ 01 Real-Time Graphics & GLSL                            │ │
  │ ├─────────────────────────────────────────────────────────┤ │
  │ │ 02 Cinematic Timeline Choreography                      │ │
  │ ├─────────────────────────────────────────────────────────┤ │
  │ │ 03 Production Frontend Architecture                     │ │
  │ └─────────────────────────────────────────────────────────┘ │
  │ 4-Item Metadata (Stacked 2x2 on 390px, 1x4 on 320px)        │
  ├─────────────────────────────────────────────────────────────┤
  │ [PROJECTS: Touch Carousel Fallback (Unpinned)]              │
  │ 03 // ARCHITECTURAL EXHIBIT                                 │
  │ CURATED ARTIFACTS                                           │
  │                                                             │
  │ ┌─────────────────────────┐  ┌─────────────────────────┐    │
  │ │ CARD 01: Salt Particle  │  │ CARD 02: Cinematic TL   │ -> │
  │ │ 32,000 PTL | 60 FPS     │  │ 9.80s INTRO | 0.6s      │    │
  │ └─────────────────────────┘  └─────────────────────────┘    │
  │ (Horizontal swipe with snap points)                         │
  ├─────────────────────────────────────────────────────────────┤
  │ [SKILLS: Single Column Grid]                                │
  │ CAP-01: Real-Time 3D & Graphics                             │
  │ CAP-02: Creative Motion & Timelines                         │
  │ CAP-03: Frontend Engineering                                │
  │ CAP-04: Performance & Tooling                               │
  ├─────────────────────────────────────────────────────────────┤
  │ [JOURNEY: Compact Rail]                                     │
  │ o── 2025 — Present: Creative Technologist                   │
  │ o── 2024 — 2025: Frontend Systems Engineer                  │
  │ o── 2023 — 2024: Interactive Systems                        │
  ├─────────────────────────────────────────────────────────────┤
  │ [CONTACT: Stacked Column]                                   │
  │ "Let's build something exceptional."                        │
  │ • Open for select collaborations                            │
  │ Email + [Copy]                                              │
  │ Form: Name, Email, Message                                  │
  │ [INITIATE DISPATCH] (Full Width 100%)                       │
  ├─────────────────────────────────────────────────────────────┤
  │ [FOOTER: Stacked Column]                                    │
  │ ATIF [PORTFOLIO 2026]                                       │
  │ Social links wrapped vertically                             │
  │ © 2026 Mohammed Atif                                        │
  └─────────────────────────────────────────────────────────────┘
```

---

## 3. Desktop Hero Composition Diagram (Measured Coordinates)

```text
========================================================================================
HERO COMPOSITION — MEASURED DOM COORDINATES (1440 × 900)
========================================================================================

Y=0px
       ┌─────────────────────────────────────────────────────────┐
Y=20px │  NAVBAR DOCK: W:353px, H:41px, Centered X:541px-894px   │
Y=61px └─────────────────────────────────────────────────────────┘
       
Y=77px ┌─────────────────────────────────────────────────────────────────────────┐
       │ • CREATIVE DEVELOPER & GRAPHICS...          Three.js + GLSL | Remote   │
Y=101px└─────────────────────────────────────────────────────────────────────────┘
       
       │                                                                         │
       │                                                                         │
       │                   ┌───────────────────────────────┐                     │
       │                   │    THREE.JS PARTICLE PORTRAIT │                     │
       │                   │       Center: X:720, Y:405    │                     │
       │                   │    Width: ~480px, Height: ~560│                     │
       │                   │    34,000 Silver Stipples     │                     │
       │                   └───────────────────────────────┘                     │
       │                                                                         │
       │                                                                         │
       
Y=698px                       M O H A M M E D  (Y:698px, H:16px, Track: 0.35em)
Y=722px                         A T I F        (Y:722px, H:64px, Cinzel 64px)
Y=786px
Y=802px                            (○)         (Scroll indicator pill)
                                    |
Y=847px
                                                                 [Replay Intro] (Corner)
Y=900px─────────────────────────────────────────────────────────────────────────────────
```

---

## 4. Intro Animation Stage Sequence Diagram

```text
Stage 01: HOLLOW RING (0.00s - 1.05s)
[  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  ]
[                                     ╭───╮                                     ]
[                                     │ O │ (Glowing Ring traces 360 deg)       ]
[                                     ╰───╯                                     ]

Stage 02: DETONATION & DISPERSION (1.05s - 2.05s)
[  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  ]
[        *    ·   ·    *      ·    *       ·    *   ·       *   ·   *          ]
[     ·     *      ·      *   (Burst Center) *      ·      *     ·     *      ]
[        *     ·    *     ·       *     ·        *     ·       *    ·          ]

Stage 03: TYPOGRAPHY CONVERGENCE — ATIF (2.05s - 4.45s)
[  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  ]
[                     *   *     * * * * *   * * *   * * * *                     ]
[                    * * * *        *        *      *                           ]
[                   *       *       *        *      * * *                       ]
[                   *       *       *       * * *   *                           ]

Stage 04: SEAMLESS MORPH — PORTFOLIO (4.45s - 7.30s)
[  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  ]
[         P   O   R   T   F   O   L   I   O   (Letters sweep left to right)     ]

Stage 05: PORTRAIT RECONSTRUCTION (7.30s - 10.50s)
[  · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·  ]
[                             .:'':.                                            ]
[                           :´      `:   (Grains converge into face contours)   ]
[                           :  (.)(.) :                                         ]
[                            `   ∇   ´                                          ]
[                              `---´                                            ]

Stage 06: SETTLED PORTFOLIO SHELL (10.50s+)
[  [Fixed Navbar Dock Top]                                                      ]
[                               [LIVING PORTRAIT]                               ]
[                                   MOHAMMED                                    ]
[                                     ATIF                                      ]
```

---

## 5. Pinned 3D Projects Gallery Scroll Mechanics

```text
SCROLL AXIS (Y: 2150px -> 5031px | Distance: 2881px)
========================================================================================

Scroll Progress = 0.0 (Entry)
Track X = 0px
[CARD 01: FOCAL (Z:0, Scale:1.0)] ─── [CARD 02: (Z:-135, Rot:16deg)] ─── [CARD 03...]

Scroll Progress = 0.30 (Middle Progress)
Track X = -650px
[CARD 01: (Z:-135, Rot:-16deg)] ─── [CARD 02: FOCAL (Z:0, Scale:1.0)] ─── [CARD 03...]

Scroll Progress = 0.75 (Advanced Progress)
Track X = -1620px
[CARD 02: (Z:-135)] ─── [CARD 03: FOCAL (Z:0, Scale:1.0)] ─── [CARD 04: (Z:-135)]

Scroll Progress = 1.0 (Release)
Track reaches end of horizontal scroll; ScrollTrigger unpins; page continues into #skills.
```
