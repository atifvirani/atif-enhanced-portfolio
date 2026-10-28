export interface NavigationLink {
  id: string
  label: string
  href: string
}

export interface ProjectEntry {
  id: string
  title: string
  subtitle: string
  category: string
  year: string
  description: string
  techStack: string[]
  status: 'Production' | 'Selected Work' | 'Exploration' | 'Open Source'
  externalLink?: string
  githubLink?: string
}

export interface SkillGroup {
  category: string
  description: string
  skills: string[]
}

export interface ParticleConfig {
  count?: number
  color?: number
  size?: number
  speed?: number
  interactive?: boolean
}
