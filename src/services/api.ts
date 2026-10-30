import { PORTFOLIO_CONFIG } from '../config/portfolioConfig'
import type { ProjectData } from '../config/portfolioConfig'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

export interface ApiProject {
  id: string
  title: string
  subtitle?: string
  category: string
  year: string
  description: string
  tech_stack: string[]
  status: string
  github_url?: string
  live_url?: string
  thumbnail?: string
  featured?: boolean
  display_order?: number
}

// Convert ApiProject to ProjectData format for components
export function mapApiProjectToData(p: ApiProject): ProjectData {
  return {
    id: p.id,
    title: p.title,
    subtitle: p.subtitle || '',
    category: p.category,
    year: p.year,
    description: p.description,
    techStack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
    status: (p.status as ProjectData['status']) || 'Production',
    githubUrl: p.github_url || undefined,
    liveUrl: p.live_url || undefined,
    thumbnail: p.thumbnail || undefined,
    featured: Boolean(p.featured),
    displayOrder: p.display_order || 1,
  }
}

// Convert ProjectData to ApiProject format for backend
export function mapDataToApiProject(p: Partial<ProjectData>): Record<string, unknown> {
  return {
    title: p.title,
    subtitle: p.subtitle,
    category: p.category,
    year: p.year,
    description: p.description,
    tech_stack: p.techStack,
    status: p.status,
    github_url: p.githubUrl,
    live_url: p.liveUrl,
    thumbnail: p.thumbnail,
    featured: p.featured,
    display_order: p.displayOrder,
  }
}

export const api = {
  // Public: Get projects (with fallback to local verified config)
  async getProjects(): Promise<ProjectData[]> {
    try {
      const res = await fetch(`${API_BASE}/projects`)
      if (!res.ok) {
        throw new Error(`Failed to fetch projects: ${res.statusText}`)
      }
      const data = await res.json()
      if (Array.isArray(data.projects) && data.projects.length > 0) {
        return data.projects.map(mapApiProjectToData)
      }
      return PORTFOLIO_CONFIG.projects
    } catch (err) {
      console.warn('[API Client] Backend unreachable, using verified local seed data:', err)
      return PORTFOLIO_CONFIG.projects
    }
  },

  // Public: Get dynamic site content
  async getContent(): Promise<Record<string, any>> {
    try {
      const res = await fetch(`${API_BASE}/content`)
      if (!res.ok) throw new Error('Failed to fetch site content')
      const data = await res.json()
      return data.content || {}
    } catch {
      return {}
    }
  },

  // Admin: Update dynamic site content key
  async updateContent(token: string, key: string, data: any): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/content/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    })
    const resData = await res.json()
    if (!res.ok) throw new Error(resData.error || `Failed to update ${key}`)
  },

  // Public: Contact form submission
  async submitContact(payload: { name: string; email: string; message: string; website?: string }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit contact message' }
      }
      return { success: true, message: data.message }
    } catch {
      return {
        success: false,
        error: 'Network error: could not connect to contact server. Please reach out directly on GitHub.',
      }
    }
  },

  // Auth: Status check
  async getAuthStatus(): Promise<{ hasAdmin: boolean }> {
    const res = await fetch(`${API_BASE}/auth/status`)
    if (!res.ok) throw new Error('Could not check auth status')
    return res.json()
  },

  // Auth: First-admin setup
  async setupAdmin(username: string, password: string): Promise<{ token: string; username: string }> {
    const res = await fetch(`${API_BASE}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Setup failed')
    return data
  },

  // Auth: Login
  async login(username: string, password: string): Promise<{ token: string; username: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    return data
  },

  // Auth: Verify token
  async verifySession(token: string): Promise<{ user: { id: string; username: string } }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Invalid session')
    return data
  },

  // Admin: Create Project
  async createProject(token: string, project: Partial<ProjectData>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mapDataToApiProject(project)),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create project')
  },

  // Admin: Update Project
  async updateProject(token: string, id: string, project: Partial<ProjectData>): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mapDataToApiProject(project)),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update project')
  },

  // Admin: Delete Project
  async deleteProject(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete project')
  },

  // Admin: Reorder Projects
  async reorderProjects(token: string, items: { id: string; display_order: number }[]): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/projects/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to reorder projects')
  },
}
