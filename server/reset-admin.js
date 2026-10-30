import crypto from 'crypto'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data')
const dbPath = process.env.DB_PATH || path.join(dataDir, 'portfolio.db')

const db = new Database(dbPath)

const args = process.argv.slice(2)
const command = args[0]

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

if (command === 'clear') {
  db.exec('DELETE FROM admin_users')
  console.log('✅ Admin accounts cleared! Visiting /admin will now show the Initial Security Setup screen.')
  process.exit(0)
}

if (command === 'set') {
  const username = args[1]
  const password = args[2]

  if (!username || username.length < 3) {
    console.error('❌ Error: Username must be at least 3 characters.')
    process.exit(1)
  }
  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters.')
    process.exit(1)
  }

  const { hash, salt } = hashPassword(password)
  const id = `admin-${crypto.randomUUID()}`

  db.exec('DELETE FROM admin_users')
  db.prepare('INSERT INTO admin_users (id, username, password_hash, salt) VALUES (?, ?, ?, ?)').run(
    id,
    username,
    hash,
    salt
  )

  console.log(`✅ Admin account updated successfully!`)
  console.log(`   Username: ${username}`)
  console.log(`   Password: ${password}`)
  process.exit(0)
}

if (command === 'list') {
  const users = db.prepare('SELECT id, username, created_at FROM admin_users').all()
  console.log('Current Admin Users in Database:', users)
  process.exit(0)
}

console.log(`
Usage:
  node reset-admin.js list
  node reset-admin.js clear               (Re-enables First-Time Setup screen)
  node reset-admin.js set <user> <pass>   (Sets credentials directly)
`)

