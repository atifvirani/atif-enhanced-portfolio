export interface JourneyMilestone {
  year: string
  role: string
  organization: string
  description: string
  technologies: string[]
  isPlaceholder?: boolean
}

export interface ProjectData {
  id: string
  title: string
  subtitle: string
  category: string
  year: string
  description: string
  techStack: string[]
  status: 'Production' | 'Selected Work' | 'Product MVP' | 'Concept Demo' | 'Archived'
  githubUrl?: string
  liveUrl?: string
  thumbnail?: string
  featured?: boolean
  displayOrder?: number
}

export interface SkillGroup {
  category: string
  description: string
  skills: string[]
}

export interface SocialLink {
  label: string
  href: string
  confirmed?: boolean
}

export interface PortfolioConfigType {
  personal: {
    name: string
    fullName: string
    title: string
    tagline: string
    bio: string[]
    location: string
    timezone: string
    email?: string
    responsibility: string
    education: string
    portraitUrl: string
    availability: string
  }
  socials: SocialLink[]
  journey: JourneyMilestone[]
  projects: ProjectData[]
  skills: SkillGroup[]
}

export const PORTFOLIO_CONFIG: PortfolioConfigType = {
  personal: {
    name: 'Atif',
    fullName: 'Mohammed Atif',
    title: 'Full-Stack Software Developer · UI/UX Designer · AI Systems Builder',
    tagline: 'Building real software products, local-first architectures, and custom agentic AI systems.',
    bio: [
      'I am Mohammed Atif — a full-stack software developer, UI/UX designer, and AI systems builder based in Cuttack, Odisha, India. Currently serving as CTO and Lead Architect at BaseCamp Education.',
      'My engineering focus centers on building real software products rather than static demonstrations: local-first and offline-first architectures, self-hosted environments, custom agentic AI orchestration, and tactile, high-performance user interfaces.',
    ],
    location: 'Cuttack, Odisha, India',
    timezone: 'UTC+5:30',
    email: 'mohammedatif.dev@gmail.com',
    responsibility: 'CTO & Lead Architect at BaseCamp Education in Cuttack',
    education: 'Stewart Science Higher Secondary School, Class 12 (PCMB + IT). Dedicated preparation for the JEE Main examination.',
    portraitUrl: '/images/atif-particle-reference.png',
    availability: 'Open for Select Collaborations & Technical Architecture',
  },
  socials: [
    { label: 'GitHub', href: 'https://github.com/atifvirani', confirmed: true },
  ],
  journey: [
    {
      year: 'Present',
      role: 'CTO & Lead Architect',
      organization: 'BaseCamp Education (Cuttack)',
      description:
        'Directing digital platform architecture, learning systems engineering, and technology strategy for educational platforms in Cuttack.',
      technologies: ['Full-Stack Systems', 'System Architecture', 'Product Engineering'],
      isPlaceholder: false,
    },
    {
      year: '2024 — 2025',
      role: 'Full-Stack & AI Systems Builder',
      organization: 'Independent Product Development',
      description:
        'Architected and deployed NEXORA SEARCH (meta-search engine with Dockerized SearXNG and Supabase) and developed MyPocket (AI finance tracking with Gemini AI and OCR).',
      technologies: ['React 19', 'TypeScript', 'Docker', 'SearXNG', 'Supabase', 'Gemini AI'],
      isPlaceholder: false,
    },
    {
      year: '2023 — 2024',
      role: 'Higher Secondary Science (PCMB + IT)',
      organization: 'Stewart Science Higher Secondary School',
      description:
        'Completed Class 12 Science curriculum (Physics, Chemistry, Mathematics, Biology, and Information Technology) alongside dedicated preparation for the JEE Main examination. Built DuoSync Booth (Canvas API interactive pose matching).',
      technologies: ['JavaScript', 'HTML5 Canvas', 'Python', 'Web Fundamentals'],
      isPlaceholder: false,
    },
  ],
  projects: [
    {
      id: 'proj-nexora',
      title: 'NEXORA SEARCH',
      subtitle: 'Private Meta-Search Platform',
      category: 'Full-Stack Platform',
      year: '2025',
      description:
        'A personal meta-search platform intended to unify web, image, video, news, and technical documentation discovery in one research-oriented interface. Powered by a Dockerized SearXNG backend, Supabase authentication with Row-Level Security, and a responsive React 19 interface.',
      techStack: ['React 19', 'TypeScript', 'Docker', 'SearXNG', 'Supabase', 'Tailwind CSS', 'REST APIs'],
      status: 'Production',
      githubUrl: 'https://github.com/atifvirani/NEXORA-SEARCH',
      liveUrl: 'https://nexorabyatif.netlify.app/',
      featured: true,
      displayOrder: 1,
    },
    {
      id: 'proj-mypocket',
      title: 'MyPocket',
      subtitle: 'Mobile-First AI Finance & Expense Tracker',
      category: 'Product Engineering',
      year: '2025',
      description:
        'A mobile-first personal finance application concept focused on expense tracking and easier transaction capture. Features multi-input capture with manual entry, receipt OCR scanning, voice transcription, and Supabase data persistence.',
      techStack: ['React', 'TypeScript', 'Supabase', 'Capacitor', 'PostgreSQL', 'Gemini AI'],
      status: 'Product MVP',
      githubUrl: 'https://github.com/atifvirani/Mypocket',
      featured: true,
      displayOrder: 2,
    },
    {
      id: 'proj-duosync',
      title: 'DuoSync Booth',
      subtitle: 'Interactive Dual-Pose Photo Strip Concept',
      category: 'Creative Computing',
      year: '2024',
      description:
        'A creative web application concept for pairs to capture and match poses and compose memorable moments into a photo-strip experience using client-side Canvas API rendering.',
      techStack: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Responsive Design'],
      status: 'Concept Demo',
      githubUrl: 'https://github.com/atifvirani/DuoSync',
      featured: true,
      displayOrder: 3,
    },
  ],
  skills: [
    {
      category: 'Languages & Web Fundamentals',
      description: 'Core programming languages and web standards.',
      skills: ['JavaScript', 'TypeScript', 'Python', 'HTML5', 'CSS3'],
    },
    {
      category: 'Frontend & Creative Development',
      description: 'Component architecture, UI/UX design, motion choreography, and spatial computing.',
      skills: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'React Three Fiber', 'MediaPipe', 'UI/UX Design'],
    },
    {
      category: 'Backend, Data & Architecture',
      description: 'API development, relational & client-side databases, and local-first architecture.',
      skills: ['Node.js', 'Express', 'Supabase', 'PostgreSQL', 'IndexedDB', 'Dexie.js', 'Local-First Systems', 'REST API Development'],
    },
    {
      category: 'Mobile & Desktop',
      description: 'Native mobile packaging and cross-platform desktop application systems.',
      skills: ['Capacitor', 'Electron'],
    },
    {
      category: 'AI, Infrastructure & Systems',
      description: 'Local LLM runtimes, containerization, security environments, and self-hosted automation.',
      skills: ['Ollama', 'Docker', 'Kali Linux', 'Self-Hosted Automation', 'Containerized Relays'],
    },
  ],
}
