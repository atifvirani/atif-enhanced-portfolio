import { useState, useEffect, type FormEvent } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import type { ProjectData } from '../../config/portfolioConfig'

interface ProjectModalProps {
  isOpen: boolean
  project: ProjectData | null // null for new project
  onClose: () => void
  onSave: (projectData: Partial<ProjectData>) => Promise<void>
}

export function ProjectModal({ isOpen, project, onClose, onSave }: ProjectModalProps) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [category, setCategory] = useState('Full-Stack Platform')
  const [year, setYear] = useState('2025')
  const [description, setDescription] = useState('')
  const [techStackInput, setTechStackInput] = useState('')
  const [status, setStatus] = useState<ProjectData['status']>('Production')
  const [githubUrl, setGithubUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [displayOrder, setDisplayOrder] = useState(1)
  const [featured, setFeatured] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (project) {
      setTitle(project.title || '')
      setSubtitle(project.subtitle || '')
      setCategory(project.category || 'Full-Stack Platform')
      setYear(project.year || new Date().getFullYear().toString())
      setDescription(project.description || '')
      setTechStackInput(Array.isArray(project.techStack) ? project.techStack.join(', ') : '')
      setStatus(project.status || 'Production')
      setGithubUrl(project.githubUrl || '')
      setLiveUrl(project.liveUrl || '')
      setThumbnail(project.thumbnail || '')
      setDisplayOrder(project.displayOrder || 1)
      setFeatured(project.featured ?? true)
    } else {
      setTitle('')
      setSubtitle('')
      setCategory('Full-Stack Platform')
      setYear(new Date().getFullYear().toString())
      setDescription('')
      setTechStackInput('')
      setStatus('Production')
      setGithubUrl('')
      setLiveUrl('')
      setThumbnail('')
      setDisplayOrder(1)
      setFeatured(true)
    }
    setError(null)
  }, [project, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Project title is required.')
      return
    }
    if (!description.trim()) {
      setError('Project description is required.')
      return
    }

    // Parse tech stack tags
    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setLoading(true)
    try {
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim(),
        category: category.trim(),
        year: year.trim(),
        description: description.trim(),
        techStack,
        status,
        githubUrl: githubUrl.trim() || undefined,
        liveUrl: liveUrl.trim() || undefined,
        thumbnail: thumbnail.trim() || undefined,
        displayOrder: Number(displayOrder) || 1,
        featured,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/15 p-6 sm:p-8 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <span className="font-mono-code text-[10px] uppercase tracking-widest text-zinc-500">
              Project Configuration
            </span>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-medium text-white">
              {project ? `Edit: ${project.title}` : 'Add New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3.5 border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-mono-code flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NEXORA SEARCH"
                className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Private Meta-Search Platform"
                className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Full-Stack Platform"
                className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                Year
              </label>
              <input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectData['status'])}
                className="w-full bg-zinc-900 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono-code"
              >
                <option value="Production">Production</option>
                <option value="Product MVP">Product MVP</option>
                <option value="Concept Demo">Concept Demo</option>
                <option value="Selected Work">Selected Work</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive architectural summary and verified technical details..."
              className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="React 19, TypeScript, Docker, SearXNG, Supabase"
              className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/atifvirani/..."
                className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                Live Deployment URL
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="block font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
                Thumbnail Image URL (optional)
              </label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="/images/projects/preview.png or https://..."
                className="w-full bg-black/60 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white font-mono-code"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <div className="flex items-center gap-2">
                <input
                  id="featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-zinc-900 text-white focus:ring-0"
                />
                <label htmlFor="featured" className="font-mono-code text-xs text-zinc-300 cursor-pointer">
                  Featured in Gallery
                </label>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-white/10 text-xs font-mono-code text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-white text-black text-xs font-mono-code font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
