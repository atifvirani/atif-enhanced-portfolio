# ATIF PORTFOLIO — PRIVATE ADMIN CMS DOCUMENTATION

**Route:** `/admin` (or `/#admin`)  
**Architecture:** React + TypeScript (Client) & Express + SQLite + JWT (Server)  
**Security Level:** Authenticated Session, Scrypt Hashing, Zero Public Registration  
**Status:** FULLY OPERATIONAL & PERSISTENT  

---

## 1. System Architecture

```
+-----------------------------------------------------------+
|                   ATIF PORTFOLIO CLIENT                   |
|                                                           |
|   /           -> Public Portfolio                         |
|   /admin      -> AdminApp State Machine                   |
|                   ├── AdminLogin (Setup / Sign In)        |
|                   └── AdminDashboard (3 Modules):         |
|                       ├── Tab 1: Curated Projects Manager |
|                       ├── Tab 2: Profile & Bio Editor     |
|                       └── Tab 3: Verified Skills View     |
+-----------------------------+-----------------------------+
                              |
                     REST API / JSON (Bearer JWT)
                              |
+-----------------------------v-----------------------------+
|                  EXPRESS BACKEND SERVER                   |
|                                                           |
|   POST /api/auth/setup           -> First-Admin Creation  |
|   POST /api/auth/login           -> Credential Verification|
|   GET  /api/auth/me              -> Session Introspection |
|   GET  /api/projects             -> Public Ordered Read   |
|   GET  /api/content              -> Public Content Read   |
|   PUT  /api/admin/content/:key   -> Update Content (Auth) |
|   POST /api/admin/projects       -> Create Project (Auth) |
|   PUT  /api/admin/projects/:id   -> Update Project (Auth) |
|   DELETE /api/admin/projects/:id -> Delete Project (Auth) |
|   PUT  /api/admin/projects/reorder -> Batch Order (Auth)  |
+-----------------------------+-----------------------------+
                              |
                    better-sqlite3 (WAL Mode)
                              |
+-----------------------------v-----------------------------+
|                   SQLITE DATABASE DISK                    |
|                server/data/portfolio.db                   |
|                                                           |
|   - admin_users (id, username, password_hash, salt)       |
|   - projects (id, title, category, tech_stack, URLs...)   |
|   - site_content (key, content_json, updated_at)          |
+-----------------------------------------------------------+
```

---

## 2. Security & Authentication Flow

### A. First-Time Admin Setup
1. When navigating to `/admin`, the client queries `GET /api/auth/status`.
2. If `hasAdmin === false`, the terminal unlocks the **Initial Security Setup** form.
3. The owner submits a username (min 3 chars) and password (min 8 chars).
4. The server validates that no admin exists, hashes the password with a random 16-byte salt via `crypto.scryptSync(password, salt, 64)`, stores the record in `admin_users`, and locks further setup calls.
5. A signed JSON Web Token (JWT) is returned and persisted in client `localStorage` (`atif_admin_token`).

### B. Subsequent Logins
1. If `hasAdmin === true` and no valid session exists, the terminal renders the **Terminal Access** login form.
2. The user supplies username and password.
3. The server queries the user, recomputes the scrypt hash with the stored salt, and performs a constant-time comparison via `crypto.timingSafeEqual` to prevent timing attacks.
4. On success, a new JWT is issued.

### C. Route & API Protection
- All administrative mutations (`POST`, `PUT`, `DELETE` under `/api/admin/*`) pass through `requireAuth` middleware.
- Unauthenticated requests are immediately rejected with `401 Unauthorized`.
- Tokens expire in 7 days (`JWT_EXPIRES_IN = '7d'`).

---

## 3. How to Manage Content

### A. Tab 1: Curated Projects Manager
- **Add Project:** Click **+ Add Project**. Fill in title, subtitle, category, year, description, tech stack (comma-separated), status, GitHub URL, live URL, and featured toggle.
- **Edit Project:** Click **Edit** on any card. Modifies records in SQLite and immediately updates the public 3D curved gallery.
- **Reorder Projects:** Click **↑ (Move Up)** or **↓ (Move Down)** to change card positions. Automatically persists order via `/api/admin/projects/reorder`.
- **Delete Project:** Click the red **Trash** icon. Prompts a confirmation dialog before permanent deletion.

### B. Tab 2: Profile & Bio Editor
- Edit primary positioning, location (`Cuttack, Odisha, India`), professional role (CTO at BaseCamp Education), academic focus (Class 12 PCMB+IT / JEE Main), and bio paragraphs.
- Click **Save Profile to Database**. Commits changes to the `site_content` table via `PUT /api/admin/content/profile`.

### C. Tab 3: Verified Skills Matrix
- Inspect all categorized skills (Languages & Fundamentals, Frontend & Creative, Backend & Architecture, Mobile & Desktop, AI & Systems).

---

## 4. Resilience & Fallback Architecture

The public portfolio frontend has been designed with **zero-downtime resilience**:
- On load, `useProjects()` attempts to fetch projects from `GET /api/projects`.
- If the backend is running, live database projects are displayed.
- **If the backend server is offline or unreachable**, the frontend catches the network error and automatically falls back to verified static `PORTFOLIO_CONFIG.projects`.
- No spinners hang indefinitely, no errors crash the Three.js particle intro or hero, and the site functions 100% seamlessly.
