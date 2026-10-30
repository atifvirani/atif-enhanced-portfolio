import { useState, useEffect } from 'react'
import type { ProjectData } from '../config/portfolioConfig'
import { PORTFOLIO_CONFIG } from '../config/portfolioConfig'
import { api } from '../services/api'

export function useProjects() {
  const [projects, setProjects] = useState<ProjectData[]>(PORTFOLIO_CONFIG.projects)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reloadProjects = async () => {
    setIsLoading(true)
    try {
      const data = await api.getProjects()
      setProjects(data)
      setError(null)
    } catch (err: any) {
      console.warn('[useProjects] Failed to fetch live projects, using fallback config:', err)
      setError(err.message || 'Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    reloadProjects()
  }, [])

  return { projects, isLoading, error, reloadProjects }
}
