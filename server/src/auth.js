import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { db } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'atif-portfolio-dev-secret-key-replace-in-production'
const JWT_EXPIRES_IN = '7d'

// Hash password with salt using native crypto scrypt
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { hash, salt }
}

export function verifyPassword(password, storedHash, salt) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'))
}

// Check if any admin user exists in DB
export function hasAdmin() {
  const row = db.prepare('SELECT COUNT(*) as count FROM admin_users').get()
  return row.count > 0
}

// Create initial admin user (only if none exists)
export function createAdmin(username, password) {
  if (hasAdmin()) {
    throw new Error('An admin user already exists. Setup is locked.')
  }

  const trimmedUsername = (username || '').trim()
  if (!trimmedUsername || trimmedUsername.length < 3) {
    throw new Error('Username must be at least 3 characters.')
  }
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters.')
  }

  const { hash, salt } = hashPassword(password)
  const id = `admin-${crypto.randomUUID()}`

  db.prepare(`
    INSERT INTO admin_users (id, username, password_hash, salt)
    VALUES (?, ?, ?, ?)
  `).run(id, trimmedUsername, hash, salt)

  const token = jwt.sign({ id, username: trimmedUsername }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  return { id, username: trimmedUsername, token }
}

// Verify credentials and return JWT
export function loginAdmin(username, password) {
  const trimmedUsername = (username || '').trim()
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(trimmedUsername)

  if (!user) {
    throw new Error('Invalid username or password.')
  }

  const isValid = verifyPassword(password, user.password_hash, user.salt)
  if (!isValid) {
    throw new Error('Invalid username or password.')
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  return { id: user.id, username: user.username, token }
}

// Express authentication middleware
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization token.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token.' })
  }
}
