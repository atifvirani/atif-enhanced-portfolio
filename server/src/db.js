import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'portfolio.db')
export const db = new Database(dbPath)

// Enable WAL mode for high concurrency, durability, and performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Initialize database schema and verified seed content
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      category TEXT NOT NULL,
      year TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      status TEXT NOT NULL,
      github_url TEXT,
      live_url TEXT,
      thumbnail TEXT,
      featured INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      content_json TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // 1. Seed projects if table is empty (never overwrite administrator modifications)
  const countRow = db.prepare('SELECT COUNT(*) as count FROM projects').get()
  if (countRow.count === 0) {
    const seedProjects = [
      {
        id: 'proj-nexora',
        title: 'NEXORA SEARCH',
        subtitle: 'Private Meta-Search Platform',
        category: 'Full-Stack Platform',
        year: '2025',
        description:
          'A personal meta-search platform intended to unify web, image, video, news, and technical documentation discovery in one research-oriented interface. Powered by a Dockerized SearXNG backend, Supabase authentication with Row-Level Security, and a responsive React 19 interface.',
        tech_stack: JSON.stringify(['React 19', 'TypeScript', 'Docker', 'SearXNG', 'Supabase', 'Tailwind CSS', 'REST APIs']),
        status: 'Production',
        github_url: 'https://github.com/atifvirani/NEXORA-SEARCH',
        live_url: 'https://nexorabyatif.netlify.app/',
        thumbnail: '',
        featured: 1,
        display_order: 1,
      },
      {
        id: 'proj-mypocket',
        title: 'MyPocket',
        subtitle: 'Mobile-First AI Finance & Expense Tracker',
        category: 'Product Engineering',
        year: '2025',
        description:
          'A mobile-first personal finance application concept focused on expense tracking and easier transaction capture. Features multi-input capture with manual entry, receipt OCR scanning, voice transcription, and Supabase data persistence.',
        tech_stack: JSON.stringify(['React', 'TypeScript', 'Supabase', 'Capacitor', 'PostgreSQL', 'Gemini AI']),
        status: 'Product MVP',
        github_url: 'https://github.com/atifvirani/Mypocket',
        live_url: '',
        thumbnail: '',
        featured: 1,
        display_order: 2,
      },
      {
        id: 'proj-duosync',
        title: 'DuoSync Booth',
        subtitle: 'Interactive Dual-Pose Photo Strip Concept',
        category: 'Creative Computing',
        year: '2024',
        description:
          'A creative web application concept for pairs to capture and match poses and compose memorable moments into a photo-strip experience using client-side Canvas API rendering.',
        tech_stack: JSON.stringify(['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Responsive Design']),
        status: 'Concept Demo',
        github_url: 'https://github.com/atifvirani/DuoSync',
        live_url: '',
        thumbnail: '',
        featured: 1,
        display_order: 3,
      },
    ]

    const insertStmt = db.prepare(`
      INSERT INTO projects (
        id, title, subtitle, category, year, description,
        tech_stack, status, github_url, live_url, thumbnail,
        featured, display_order
      ) VALUES (
        @id, @title, @subtitle, @category, @year, @description,
        @tech_stack, @status, @github_url, @live_url, @thumbnail,
        @featured, @display_order
      )
    `)

    const insertMany = db.transaction((projects) => {
      for (const p of projects) {
        insertStmt.run(p)
      }
    })

    insertMany(seedProjects)
    console.log('[DB] Initialized schema and seeded 3 verified real projects.')
  }

  // 2. Seed site_content if empty
  const contentCount = db.prepare('SELECT COUNT(*) as count FROM site_content').get()
  if (contentCount.count === 0) {
    const initialContent = [
      {
        key: 'profile',
        content_json: JSON.stringify({
          name: 'Atif',
          fullName: 'Mohammed Atif',
          title: 'Full-Stack Software Developer · UI/UX Designer · AI Systems Builder',
          tagline: 'Building real software products, local-first architectures, and custom agentic AI systems.',
          location: 'Cuttack, Odisha, India',
          timezone: 'UTC+5:30',
          responsibility: 'CTO and Lead Architect at BaseCamp Education in Cuttack',
          education: 'Stewart Science Higher Secondary School, Class 12 (PCMB + IT). Dedicated preparation for the JEE Main examination.',
          bio: [
            'I am Mohammed Atif — a full-stack software developer, UI/UX designer, and AI systems builder based in Cuttack, Odisha, India. Currently serving as CTO and Lead Architect at BaseCamp Education in Cuttack.',
            'My engineering focus centers on building real software products rather than static demonstrations: local-first and offline-first architectures, self-hosted environments, custom agentic AI orchestration, and tactile, high-performance user interfaces.',
          ],
        }),
      },
      {
        key: 'socials',
        content_json: JSON.stringify([
          { label: 'GitHub', href: 'https://github.com/atifvirani', confirmed: true },
        ]),
      },
    ]

    const insertContent = db.prepare('INSERT INTO site_content (key, content_json) VALUES (?, ?)')
    for (const c of initialContent) {
      insertContent.run(c.key, c.content_json)
    }
    console.log('[DB] Seeded verified initial site_content.')
  }
}
