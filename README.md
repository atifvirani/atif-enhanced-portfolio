# Mohammed Atif — Enhanced Particle Portrait Portfolio

> **Engineering the intersection of code, motion, and real-time 3D.**  
> An immersive, GPU-accelerated WebGL portfolio featuring procedural particle physics, signature morphing typography-to-portrait transitions, and comprehensive design audit documentation.

---

## 🌟 Overview

This portfolio showcases the creative engineering practice of **Mohammed Atif**, Creative Developer & Real-Time Graphics Engineer. Built with **React 19**, **Three.js**, **GSAP**, and **Tailwind CSS**, the experience features a custom particle system that dynamically transitions from an initial typographic formation (`ATIF`) into a high-density, real-time particle portrait with interactive mouse dispersal and magnetic recovery.

Includes a complete **10-part Design Audit & Visual QA suite** covering responsive breakpoint fidelity (320px to 1920px), pixel specifications, motion timelines, and regression registers.

---

## 🚀 Key Features

- **3D Particle System & Morphing Targets**:
  - Over 120,000 GPU particles dynamically sampled and rendered via custom shaders in Three.js.
  - Smooth vector interpolation between typographic layout (`ATIF`) and portrait geometry.
  - Interactive physics with cursor dispersal forces, spring-damper returns, and ambient flow noise.
- **Cinematic Timeline Choreography**:
  - Frame-perfect intro orchestration powered by GSAP timelines.
  - Replay intro capability with clean state resets and camera transitions.
- **Responsive Engineering**:
  - Rigorously tested and optimized across mobile (320px, 390px), tablet (768px), laptop (1366px, 1440px), and ultra-wide (1920px).
  - Adaptive particle density and camera projection for mobile touch screens and high-DPI displays.
- **Modular Component Architecture**:
  - Dedicated sections for Hero, About/Bio, Interactive Project Cards, Technical Skills Radar, Journey Milestones, and Contact.
  - Clean separation of WebGL canvas pipeline, state hooks, and UI layers.
- **Complete Visual Design Audit**:
  - Full audit suite located in [`docs/design-audit/`](docs/design-audit/) and [`artifacts/`](artifacts/).
  - Includes executive summaries, pixel-level specs, motion timeline diagrams, responsive audits, and automated screenshot contact sheets.

---

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Graphics & Shaders**: Three.js, WebGL, Custom GLSL shaders
- **Motion & Orchestration**: GSAP (GreenSock), Framer Motion
- **Styling**: Tailwind CSS, PostCSS
- **Icons**: Lucide React
- **Linter & Performance**: Oxlint

---

## 📁 Repository Structure

```
├── artifacts/              # Audit screenshots, contact sheets, and QA captures
├── docs/                   # Visual QA & complete design audit documentation
│   └── design-audit/       # 10 comprehensive audit reports (Executive summary, specs, etc.)
├── public/                 # Static assets, portrait reference masks, favicons
│   └── images/             # Particle reference and isolated portrait masks
├── scratch/                # Automated audit scripts & Playwright/Puppeteer capture harnesses
├── scripts/                # Python scripts for portrait thresholding & feature extraction
├── src/
│   ├── assets/             # Vector icons & branding graphics
│   ├── components/
│   │   ├── canvas/         # Three.js particle canvas, shaders, particle targets
│   │   ├── intro/          # Intro animation overlays & sequence controllers
│   │   ├── layout/         # Navigation, header, footer
│   │   └── sections/       # Hero, About, Projects, Skills, Experience, Contact
│   ├── config/             # Centralized portfolio data & metadata configuration
│   └── types/              # TypeScript interfaces & types
├── index.html
├── package.json
└── vite.config.ts
```

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/atifvirani/atif-enhanced-portfolio.git
   cd atif-enhanced-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview the production build:
   ```bash
   npm run preview
   ```

---

## 📊 Design Audit & Verification

This repository preserves the complete design audit history and visual regression verifications:

- **Executive Summary**: [`docs/design-audit/00_EXECUTIVE_SUMMARY.md`](docs/design-audit/00_EXECUTIVE_SUMMARY.md)
- **Pixel-Level Specification**: [`docs/design-audit/02_PIXEL_LEVEL_SPECIFICATION.md`](docs/design-audit/02_PIXEL_LEVEL_SPECIFICATION.md)
- **Motion & Intro Timeline**: [`docs/design-audit/03_INTRO_AND_MOTION_TIMELINE.md`](docs/design-audit/03_INTRO_AND_MOTION_TIMELINE.md)
- **Responsive Breakpoint Audit**: [`docs/design-audit/06_RESPONSIVE_AUDIT.md`](docs/design-audit/06_RESPONSIVE_AUDIT.md)
- **Complete Unified Audit**: [`docs/design-audit/COMPLETE_AUDIT_REPORT.md`](docs/design-audit/COMPLETE_AUDIT_REPORT.md)
- **Visual Contact Sheet**: Open [`artifacts/design-audit/contact_sheet.html`](artifacts/design-audit/contact_sheet.html) in your browser.

---

## 👤 Author

**Mohammed Atif**
- **Email**: [mohammedatif.dev@gmail.com](mailto:mohammedatif.dev@gmail.com)
- **GitHub**: [@atifvirani](https://github.com/atifvirani)

---

## 📄 License

This project is licensed under the MIT License.
