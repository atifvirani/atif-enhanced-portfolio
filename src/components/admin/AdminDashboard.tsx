import { useState, useEffect, type FormEvent } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  LogOut,
  RefreshCw,
  Check,
  AlertCircle,
  FolderGit2,
  User,
  Sparkles,
  Layers,
  Save,
  Loader2,
} from 'lucide-react'
import type { ProjectData } from '../../config/portfolioConfig'
import { PORTFOLIO_CONFIG } from '../../config/portfolioConfig'
import { api } from '../../services/api'
import { ProjectModal } from './ProjectModal'

interface AdminDashboardProps {
  token: string
  username: string
  onLogout: () => void
}

export function AdminDashboard({ token, username, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'profile' | 'skills'>('projects')
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [savingContent, setSavingContent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    title: PORTFOLIO_CONFIG.personal.title,
    location: PORTFOLIO_CONFIG.personal.location,
    responsibility: PORTFOLIO_CONFIG.personal.responsibility,
    education: PORTFOLIO_CONFIG.personal.education,
    bio1: PORTFOLIO_CONFIG.personal.bio[0] || '',
    bio2: PORTFOLIO_CONFIG.personal.bio[1] || '',
  })

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null)

  // Delete Confirmation State
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3500)
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const [projData, contentData] = await Promise.all([
        api.getProjects(),
        api.getContent(),
      ])

      const sorted = [...projData].sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1))
      setProjects(sorted)

      if (contentData.profile) {
        const p = contentData.profile
        setProfileForm({
          title: p.title || PORTFOLIO_CONFIG.personal.title,
          location: p.location || PORTFOLIO_CONFIG.personal.location,
          responsibility: p.responsibility || PORTFOLIO_CONFIG.personal.responsibility,
          education: p.education || PORTFOLIO_CONFIG.personal.education,
          bio1: Array.isArray(p.bio) ? p.bio[0] || '' : '',
          bio2: Array.isArray(p.bio) ? p.bio[1] || '' : '',
        })
      }
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load data from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleOpenAdd = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (project: ProjectData) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleSaveProject = async (projectData: Partial<ProjectData>) => {
    if (editingProject) {
      await api.updateProject(token, editingProject.id, projectData)
      showNotification(`Updated project "${projectData.title}".`)
    } else {
      await api.createProject(token, {
        ...projectData,
        displayOrder: projects.length + 1,
      })
      showNotification(`Created project "${projectData.title}".`)
    }
    await loadAll()
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    setIsDeleting(true)
    try {
      await api.deleteProject(token, projectToDelete.id)
      showNotification(`Deleted project "${projectToDelete.title}".`)
      setProjectToDelete(null)
      await loadAll()
    } catch (err: any) {
      setError(err.message || 'Failed to delete project.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= projects.length) return

    const newProjects = [...projects]
    const temp = newProjects[index]
    newProjects[index] = newProjects[targetIndex]
    newProjects[targetIndex] = temp

    const reorderPayload = newProjects.map((p, i) => ({
      id: p.id,
      display_order: i + 1,
    }))

    setProjects(newProjects)

    try {
      await api.reorderProjects(token, reorderPayload)
      showNotification('Project display order updated.')
    } catch (err: any) {
      setError(err.message || 'Failed to persist new project order.')
      await loadAll()
    }
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSavingContent(true)
    try {
      await api.updateContent(token, 'profile', {
        name: 'Atif',
        fullName: 'Mohammed Atif',
        title: profileForm.title,
        location: profileForm.location,
        responsibility: profileForm.responsibility,
        education: profileForm.education,
        bio: [profileForm.bio1, profileForm.bio2].filter(Boolean),
      })
      showNotification('Personal profile & bio successfully updated in database.')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSavingContent(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              ATIF PORTFOLIO CMS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs text-zinc-500 font-mono-code hidden sm:inline">
              Session: @{username}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-code text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/30 text-xs font-mono-code text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Banner Notifications */}
        {notification && (
          <div className="p-4 border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-mono-code flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
        {error && (
          <div className="p-4 border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-mono-code flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 font-mono-code text-xs">
          <button
            onClick={() => setActiveTab('projects')}
            className={`inline-flex items-center gap-2 px-4 py-2 border transition-colors ${
              activeTab === 'projects'
                ? 'border-white bg-white text-black font-semibold'
                : 'border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-4 py-2 border transition-colors ${
              activeTab === 'profile'
                ? 'border-white bg-white text-black font-semibold'
                : 'border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Bio</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`inline-flex items-center gap-2 px-4 py-2 border transition-colors ${
              activeTab === 'skills'
                ? 'border-white bg-white text-black font-semibold'
                : 'border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Skills</span>
          </button>
        </div>

        {/* TAB 1: CURATED PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <span className="font-mono-code text-xs uppercase tracking-widest text-zinc-500">
                  Content Architecture
                </span>
                <h1 className="font-serif-luxury text-3xl sm:text-4xl font-medium tracking-tight text-white mt-1">
                  Curated Projects Manager
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage live projects displayed in the 3D curved gallery and mobile showcase.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadAll}
                  className="p-2 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Refresh project list"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-white text-black text-xs font-mono-code font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-zinc-500 font-mono-code text-xs">
                Loading verified projects from database...
              </div>
            ) : projects.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/10 p-8 space-y-3">
                <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400">No projects currently registered in the database.</p>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 border border-white/20 text-xs font-mono-code text-white hover:bg-white hover:text-black transition-colors"
                >
                  Create First Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="p-5 border border-white/10 bg-zinc-950/60 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/25 transition-colors"
                  >
                    {/* Left Info */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="font-mono-code text-xs font-semibold text-white">
                          № 0{index + 1}
                        </span>
                        <span className="w-3 h-[1px] bg-zinc-700" />
                        <span className="font-mono-code text-[10px] uppercase tracking-wider text-zinc-400">
                          {project.category}
                        </span>
                        <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 border border-white/10 text-zinc-400">
                          {project.status}
                        </span>
                        <span className="font-mono-code text-xs text-zinc-500">{project.year}</span>
                      </div>

                      <div>
                        <h3 className="font-editorial text-lg font-bold text-white tracking-wide">
                          {project.title}
                        </h3>
                        {project.subtitle && (
                          <p className="font-mono-code text-xs text-zinc-400">{project.subtitle}</p>
                        )}
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Tech stack badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="font-mono-code text-[9px] uppercase tracking-wider px-2 py-0.5 bg-white/[0.04] border border-white/10 text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Links */}
                      <div className="flex items-center gap-4 pt-1 font-mono-code text-[11px]">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-white inline-flex items-center gap-1"
                          >
                            <span>Repository</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-white inline-flex items-center gap-1"
                          >
                            <span>Live Deployment</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Actions: Reorder, Edit, Delete */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-2 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === projects.length - 1}
                        className="p-2 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:border-white/30 text-xs font-mono-code text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-2 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE & BIO */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-6">
              <span className="font-mono-code text-xs uppercase tracking-widest text-zinc-500">
                Identity & Positioning
              </span>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-medium tracking-tight text-white mt-1">
                Profile & Bio Manager
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Update professional responsibilities, academic details, and personal biography.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="max-w-3xl space-y-5">
              <div className="space-y-1">
                <label className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400">
                  Primary Positioning / Title
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono-code focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono-code focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400">
                    Professional Responsibility
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.responsibility}
                    onChange={(e) => setProfileForm({ ...profileForm, responsibility: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono-code focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400">
                  Academic Focus
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.education}
                  onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono-code focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400">
                  Bio Statement (Paragraph 1)
                </label>
                <textarea
                  required
                  rows={3}
                  value={profileForm.bio1}
                  onChange={(e) => setProfileForm({ ...profileForm, bio1: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono-code focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono-code text-[11px] uppercase tracking-widest text-zinc-400">
                  Engineering Philosophy (Paragraph 2)
                </label>
                <textarea
                  required
                  rows={3}
                  value={profileForm.bio2}
                  onChange={(e) => setProfileForm({ ...profileForm, bio2: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 px-4 py-2.5 text-xs text-white font-mono-code focus:outline-none focus:border-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingContent}
                className="px-6 py-3 bg-white text-black font-semibold text-xs font-mono-code uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingContent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile to Database</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: VERIFIED SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-6">
              <span className="font-mono-code text-xs uppercase tracking-widest text-zinc-500">
                Technical Capabilities
              </span>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-medium tracking-tight text-white mt-1">
                Verified Technical Matrix
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Current active competencies categorized without fake metrics or inflated percentages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PORTFOLIO_CONFIG.skills.map((group) => (
                <div key={group.category} className="p-6 border border-white/10 bg-zinc-950/60 space-y-3">
                  <h3 className="font-mono-code text-sm font-semibold text-white uppercase tracking-wider">
                    {group.category}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">{group.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="font-mono-code text-[10px] uppercase tracking-wider px-2 py-0.5 border border-white/10 text-zinc-300 bg-black/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Project Add/Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        project={editingProject}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
      />

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-rose-500/30 p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif-luxury text-xl font-medium text-white">
              Confirm Deletion
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Are you sure you want to delete <strong className="text-white">{projectToDelete.title}</strong>? This action will remove the project from the public gallery and database.
            </p>
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3 font-mono-code text-xs">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
