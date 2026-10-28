export interface JourneyMilestone {
  year: string
  role: string
  organization: string
  description: string
  technologies: string[]
  isPlaceholder?: boolean
}

export const PORTFOLIO_CONFIG = {
  personal: {
    name: 'Atif',
    fullName: 'Mohammed Atif',
    title: 'Creative Developer & Real-Time Graphics Engineer',
    tagline: 'Engineering the intersection of code, motion, and real-time 3D.',
    bio: [
      'I am Mohammed Atif — a creative developer who treats code as an architectural medium. I build immersive digital experiences that feel cinematic, tactile, and mathematically grounded.',
      'My practice sits at the intersection of GPU shader engineering, procedural particle physics, and cinematic motion design. Every experience I build is mathematically rigorous — from custom GLSL vertex shaders that sculpt particle forms to GSAP timelines that choreograph each transition with frame-perfect precision.',
    ],
    location: 'Global Remote',
    timezone: 'UTC+5:30',
    email: 'mohammedatif.dev@gmail.com',
    portraitUrl: '/images/atif-particle-reference.png',
    availability: 'Open for select creative engineering and studio collaborations',
  },
  socials: [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'X / Twitter', href: 'https://twitter.com' },
  ],
  journey: [
    {
      year: '2025 — Present',
      role: 'Creative Technologist & Graphics Engineer',
      organization: 'Independent Studio Practice',
      description:
        'Building signature WebGL particle engines, procedural GLSL shader systems, and cinematic UI choreography for high-end digital products and creative studios worldwide.',
      technologies: ['Three.js', 'GLSL', 'TypeScript', 'GSAP', 'React 19'],
      isPlaceholder: false,
    },
    {
      year: '2024 — 2025',
      role: 'Frontend Systems Engineer',
      organization: 'Creative Engineering Practice',
      description:
        'Architecting robust component systems, mathematical typography scales, and performance-critical interactive web applications with frame-perfect animation budgets.',
      technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vite', 'Framer Motion'],
      isPlaceholder: false,
    },
    {
      year: '2023 — 2024',
      role: 'Interactive Systems & Creative Computing',
      organization: 'Self-Directed Research and Exploration',
      description:
        'Deep study into computational geometry, real-time WebGL rendering pipelines, timeline orchestration, and spatial web experiences — laying the foundation for GPU-accelerated creative engineering.',
      technologies: ['Canvas API', 'WebGL', 'JavaScript ESNext', 'Three.js', 'GSAP'],
      isPlaceholder: false,
    },
  ] as JourneyMilestone[],
  projects: [
    {
      id: 'proj-01',
      title: 'Real-Time Salt Particle Simulation',
      subtitle: 'Custom WebGL & GLSL visual pipeline',
      category: 'Creative Computing',
      year: '2026',
      description:
        'GPU-accelerated particle system with custom buffer geometries, multi-stage typography and portrait morphing, and continuous fluid GPU simulations — 32,000+ silver particles at locked 60 FPS.',
      techStack: ['Three.js', 'WebGL', 'GLSL', 'TypeScript', 'GSAP'],
      status: 'Selected Work' as const,
      githubUrl: 'https://github.com',
    },
    {
      id: 'proj-02',
      title: 'Cinematic Timeline & Motion Choreography',
      subtitle: 'Sequential choreography framework',
      category: 'Motion Engineering',
      year: '2025',
      description:
        'Precision animation framework orchestrating multi-phase timeline sequences, scroll-bound spatial morphs, and fluid interactive choreography with mathematically tuned easing curves.',
      techStack: ['GSAP', 'Framer Motion', 'React 19', 'TypeScript'],
      status: 'Production' as const,
      githubUrl: 'https://github.com',
    },
    {
      id: 'proj-03',
      title: 'Spotlight Dock & Editorial Design System',
      subtitle: 'Monochrome typographical architecture',
      category: 'Design Systems',
      year: '2025',
      description:
        'Tactile navigation dock with real-time dynamic spotlight cone, strict typographic scale, mathematical spacing, and zero external UI kit dependencies.',
      techStack: ['React', 'Tailwind CSS v4', 'CSS Variables', 'Motion'],
      status: 'Selected Work' as const,
      githubUrl: 'https://github.com',
    },
    {
      id: 'proj-04',
      title: 'Spatial Canvas & Dynamic Shader Mesh',
      subtitle: 'Interactive real-time 3D environment',
      category: 'Graphics Engineering',
      year: '2024',
      description:
        'Interactive vertex displacement shaders reacting to mouse velocity and device orientation with 60 FPS performance budgets across all devices.',
      techStack: ['Three.js', 'GLSL', 'Vite', 'TypeScript'],
      status: 'Exploration' as const,
      githubUrl: 'https://github.com',
    },
  ],
  skills: [
    {
      category: 'Real-Time 3D & Graphics',
      description: 'Hardware-accelerated rendering, procedural visuals, and custom shader pipelines.',
      skills: ['Three.js', 'WebGL', 'GLSL Shaders', 'Particle Systems', 'Buffer Geometry', 'Math & Vectors'],
    },
    {
      category: 'Creative Motion & Timelines',
      description: 'Cinematic timelines, scroll triggers, and fluid choreography with physical precision.',
      skills: ['GSAP Core', 'ScrollTrigger', 'Framer Motion', 'Micro-interactions', 'Spring Physics', 'Easing Curves'],
    },
    {
      category: 'Frontend Engineering',
      description: 'Robust component architecture with strict type safety and clean system design.',
      skills: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'State Machines', 'Clean Architecture'],
    },
    {
      category: 'Performance & Tooling',
      description: 'Sub-second loading, 60fps rendering, and optimized GPU memory management.',
      skills: ['GPU Memory Mgmt', 'Asset Optimization', 'Bundle Splitting', 'Responsive Design', 'Git Workflow'],
    },
  ],
}
