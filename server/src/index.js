import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { db, initDb } from './db.js'
import { hasAdmin, createAdmin, loginAdmin, requireAuth } from './auth.js'
import { handleContactSubmission } from './contact.js'

dotenv.config()

// Initialize database schema and initial real data
initDb()

const app = express()
const PORT = process.env.PORT || 5000

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      callback(new Error('Blocked by CORS policy'))
    },
    credentials: true,
  })
)

// Request body limits
app.use(express.json({ limit: '100kb' }))

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// Public: Get all projects (ordered)
app.get('/api/projects', (_req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT id, title, subtitle, category, year, description,
               tech_stack, status, github_url, live_url, thumbnail,
               featured, display_order
        FROM projects
        ORDER BY display_order ASC, created_at DESC
      `)
      .all()

    const projects = rows.map((r) => ({
      ...r,
      tech_stack: typeof r.tech_stack === 'string' ? JSON.parse(r.tech_stack || '[]') : r.tech_stack,
      featured: Boolean(r.featured),
    }))

    res.json({ projects })
  } catch (error) {
    console.error('[API] Error querying projects:', error)
    res.status(500).json({ error: 'Failed to retrieve projects' })
  }
})

// Public: Get site content (profile, socials, etc.)
app.get('/api/content', (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, content_json FROM site_content').all()
    const content = {}
    for (const r of rows) {
      try {
        content[r.key] = JSON.parse(r.content_json)
      } catch {
        content[r.key] = r.content_json
      }
    }
    res.json({ content })
  } catch (error) {
    console.error('[API] Error querying site_content:', error)
    res.status(500).json({ error: 'Failed to retrieve site content' })
  }
})

// Admin: Update site content key
app.put('/api/admin/content/:key', requireAuth, (req, res) => {
  try {
    const { key } = req.params
    const { data } = req.body
    if (data === undefined) {
      return res.status(400).json({ error: 'Missing content data payload' })
    }

    const jsonStr = JSON.stringify(data)
    db.prepare(`
      INSERT INTO site_content (key, content_json, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        content_json = excluded.content_json,
        updated_at = datetime('now')
    `).run(key, jsonStr)

    res.json({ success: true, message: `Updated content for ${key}` })
  } catch (error) {
    console.error(`[API] Error updating content for ${req.params.key}:`, error)
    res.status(500).json({ error: error.message || 'Failed to update content' })
  }
})

// Public: Contact form submission
app.post('/api/contact', handleContactSubmission)

// Auth: Status (checks if initial admin setup is required)
app.get('/api/auth/status', (_req, res) => {
  res.json({ hasAdmin: hasAdmin() })
})

// Auth: Initial First-Admin Setup
app.post('/api/auth/setup', (req, res) => {
  try {
    const { username, password } = req.body || {}
    const result = createAdmin(username, password)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Auth: Sign In
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {}
    const result = loginAdmin(username, password)
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

// Auth: Verify current session
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// Admin: Create Project
app.post('/api/admin/projects', requireAuth, (req, res) => {
  try {
    const {
      title,
      subtitle = '',
      category,
      year,
      description,
      tech_stack = [],
      status = 'Active',
      github_url = '',
      live_url = '',
      thumbnail = '',
      featured = true,
      display_order = 1,
    } = req.body || {}

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required.' })
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Project description is required.' })
    }

    const id = `proj-${crypto.randomUUID().slice(0, 8)}`
    const techStackJson = JSON.stringify(Array.isArray(tech_stack) ? tech_stack : [tech_stack])

    db.prepare(`
      INSERT INTO projects (
        id, title, subtitle, category, year, description,
        tech_stack, status, github_url, live_url, thumbnail,
        featured, display_order
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id,
      title.trim(),
      subtitle.trim(),
      (category || 'Web Application').trim(),
      (year || new Date().getFullYear().toString()).trim(),
      description.trim(),
      techStackJson,
      status.trim(),
      (github_url || '').trim(),
      (live_url || '').trim(),
      (thumbnail || '').trim(),
      featured ? 1 : 0,
      Number(display_order) || 1
    )

    res.status(201).json({
      success: true,
      project: {
        id,
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        year,
        description: description.trim(),
        tech_stack: Array.isArray(tech_stack) ? tech_stack : [tech_stack],
        status,
        github_url,
        live_url,
        thumbnail,
        featured: Boolean(featured),
        display_order: Number(display_order) || 1,
      },
    })
  } catch (error) {
    console.error('[API] Error creating project:', error)
    res.status(500).json({ error: error.message || 'Failed to create project.' })
  }
})

// Admin: Update Project
app.put('/api/admin/projects/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      subtitle = '',
      category,
      year,
      description,
      tech_stack = [],
      status = 'Active',
      github_url = '',
      live_url = '',
      thumbnail = '',
      featured = true,
      display_order = 1,
    } = req.body || {}

    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id)
    if (!existing) {
      return res.status(404).json({ error: 'Project not found.' })
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required.' })
    }

    const techStackJson = JSON.stringify(Array.isArray(tech_stack) ? tech_stack : [tech_stack])

    db.prepare(`
      UPDATE projects SET
        title = ?,
        subtitle = ?,
        category = ?,
        year = ?,
        description = ?,
        tech_stack = ?,
        status = ?,
        github_url = ?,
        live_url = ?,
        thumbnail = ?,
        featured = ?,
        display_order = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title.trim(),
      subtitle.trim(),
      category.trim(),
      year.trim(),
      description.trim(),
      techStackJson,
      status.trim(),
      (github_url || '').trim(),
      (live_url || '').trim(),
      (thumbnail || '').trim(),
      featured ? 1 : 0,
      Number(display_order) || 1,
      id
    )

    res.json({ success: true, message: 'Project updated successfully.' })
  } catch (error) {
    console.error('[API] Error updating project:', error)
    res.status(500).json({ error: error.message || 'Failed to update project.' })
  }
})

// Admin: Delete Project
app.delete('/api/admin/projects/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found.' })
    }

    res.json({ success: true, message: 'Project deleted successfully.' })
  } catch (error) {
    console.error('[API] Error deleting project:', error)
    res.status(500).json({ error: 'Failed to delete project.' })
  }
})

// Admin: Reorder Projects
app.put('/api/admin/projects/reorder', requireAuth, (req, res) => {
  try {
    const { items } = req.body || {} // Array of { id, display_order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array.' })
    }

    const updateStmt = db.prepare('UPDATE projects SET display_order = ? WHERE id = ?')
    const reorderTx = db.transaction((orderItems) => {
      for (const item of orderItems) {
        if (item.id && typeof item.display_order === 'number') {
          updateStmt.run(item.display_order, item.id)
        }
      }
    })

    reorderTx(items)
    res.json({ success: true, message: 'Project ordering updated successfully.' })
  } catch (error) {
    console.error('[API] Error reordering projects:', error)
    res.status(500).json({ error: 'Failed to reorder projects.' })
  }
})

// 404 handler for unmatched API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    error: 'API_ENDPOINT_NOT_FOUND',
    message: 'The requested API route does not exist in the portfolio server matrix.',
    status: 404,
  })
})

// Serve frontend SPA if client dist folder exists (supports single fullstack deployment)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDistPath = path.resolve(__dirname, '../../dist')
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(clientDistPath, 'index.html'))
  })
}

// Global Express error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]:', err)
  res.status(err.status || 500).json({
    error: 'INTERNAL_SERVER_EXCEPTION',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`[Atif Portfolio Server] Running on http://localhost:${PORT}`)
})
