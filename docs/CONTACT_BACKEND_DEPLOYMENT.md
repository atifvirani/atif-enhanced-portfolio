# ATIF PORTFOLIO — CONTACT BACKEND & RENDER DEPLOYMENT GUIDE

This guide details instructions for deploying the Express + SQLite + Nodemailer backend to **Render**, configuring Gmail SMTP with App Passwords, and establishing durable storage for the database.

---

## 1. Backend Architecture & Endpoints

- **Root Directory:** `server/`
- **Runtime:** Node.js (v18+)
- **Main Entry:** `server/src/index.js`
- **Database:** SQLite in WAL mode via `better-sqlite3` (`server/data/portfolio.db`)
- **Key Endpoints:**
  - `GET /api/health` — Service health check & uptime monitor
  - `POST /api/contact` — Secure contact submission with spam protection & strict validation
  - `GET /api/projects` — Public projects endpoint
  - `GET /api/content` — Public dynamic site content
  - `POST /api/auth/setup` — Initial administrator setup
  - `POST /api/auth/login` — Administrator authentication
  - `GET /api/auth/me` — Session verification
  - `POST /api/admin/projects` — Create project
  - `PUT /api/admin/projects/:id` — Update project
  - `DELETE /api/admin/projects/:id` — Delete project
  - `PUT /api/admin/projects/reorder` — Reorder projects
  - `PUT /api/admin/content/:key` — Update profile/content

---

## 2. Setting Up Gmail App Password for SMTP

To send emails via Gmail through Nodemailer, you must use a **Gmail App Password**. Never use your standard Google account password.

### Step-by-Step Gmail Configuration:
1. Log into your Google Account: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Navigate to **Security** in the left sidebar.
3. Ensure **2-Step Verification** is turned ON.
4. Under "How you sign in to Google", search for or click **App Passwords** ([https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
5. In the App name field, enter: `Atif Portfolio Backend`.
6. Click **Create**.
7. Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`).
8. Copy this 16-character string without spaces. This is your `EMAIL_PASS`.

---

## 3. Deploying the Backend on Render

### Step 1: Create a New Web Service on Render
1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your portfolio GitHub repository: `https://github.com/atifvirani/atif-enhanced-portfolio`.

### Step 2: Configure Service Settings
- **Name:** `atif-portfolio-backend`
- **Region:** Choose closest to your target audience (e.g., Singapore, Frankfurt, or Oregon)
- **Root Directory:** `server`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free` (or `Starter` for persistent disk)

### Step 3: Configure Environment Variables
In the Render dashboard under the **Environment** tab, add the following variables:

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` (Render sets automatically) | Express server listening port |
| `FRONTEND_ORIGIN` | `https://your-portfolio-domain.com` | Your live frontend URL (Netlify / Vercel) |
| `JWT_SECRET` | *(32+ character random string)* | Secret key for signing admin session tokens |
| `EMAIL_SERVICE` | `gmail` | Nodemailer service provider |
| `EMAIL_USER` | `your.email@gmail.com` | Your Gmail address used for outbound SMTP |
| `EMAIL_PASS` | `abcdefghijklmnop` | Your 16-character Gmail App Password |
| `RECEIVER_EMAIL` | `your.inbox@gmail.com` | Destination inbox to receive contact submissions |
| `DATA_DIR` | `/var/data` *(if using Disk)* | Directory where `portfolio.db` is saved |

> [!TIP]
> Generate a strong JWT Secret in terminal using:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 4: Durable Storage & Persistent Disk on Render
On Render's Free tier, the filesystem is ephemeral on redeployments. To maintain database changes durably across redeployments:
1. Use a **Starter** instance type ($7/month).
2. Under the **Disks** tab in Render, click **Add Disk**.
3. Mount Path: `/var/data`.
4. Name: `portfolio-data` (1 GB).
5. Set `DATA_DIR=/var/data` in Environment Variables.
*Note: If deploying on the Free tier without a disk, the database will re-initialize with verified seed data if the container resets.*

---

## 4. Connecting Frontend to the Render Backend

Once Render deploys your backend, it will assign you a public URL (e.g. `https://atif-portfolio-backend.onrender.com`).

Configure your hosting provider (Netlify / Vercel) environment variables:
```bash
VITE_API_URL=https://atif-portfolio-backend.onrender.com/api
```
The frontend API client (`src/services/api.ts`) automatically uses `import.meta.env.VITE_API_URL` to route requests to your Render backend.

---

## 5. Contact Backend Behavior & Testing

### Strict Verification Rule
When `EMAIL_USER` or `EMAIL_PASS` are unconfigured:
- The server responds with **HTTP 503**:
  `{ error: "Contact service is not configured on the server...", delivered: false }`
- It **never** disguises an unsent message as delivered.
- For automated unit tests only, setting `ENABLE_TEST_CONTACT_LOG=true` allows test transport simulation without SMTP credentials.

### Health Check Endpoint
```bash
curl -i https://atif-portfolio-backend.onrender.com/api/health
```
Expected response:
```json
{
  "status": "ok",
  "uptime": 14.2,
  "timestamp": "2026-10-28T12:45:00.000Z"
}
```
