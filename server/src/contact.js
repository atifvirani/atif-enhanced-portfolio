import nodemailer from 'nodemailer'

// In-memory sliding rate limiter: IP -> Array of timestamps
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5

// Helper to sanitize/escape HTML entities
function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// IP-based rate limiting check
function checkRateLimit(ip) {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  recent.push(now)
  rateLimitMap.set(ip, recent)
  return true
}

// Email format regex (RFC 5322 compatible simplification)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

let cachedTransporter = null

function getTransporter(emailUser, emailPass) {
  if (cachedTransporter) return cachedTransporter

  const transportConfig = process.env.EMAIL_HOST
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true' || Number(process.env.EMAIL_PORT) === 465,
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
        connectionTimeout: 10000,
        greetingTimeout: 6000,
        socketTimeout: 15000,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      }
    : {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      }

  cachedTransporter = nodemailer.createTransport(transportConfig)
  return cachedTransporter
}

export async function handleContactSubmission(req, res) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'

  // 1. Check rate limit
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait 15 minutes before sending another inquiry.',
    })
  }

  const { name, email, message, website } = req.body || {}

  // 2. Honeypot check: `website` is a hidden field for bots
  if (website) {
    // Silently drop bot submissions to prevent email flooding
    console.warn(`[AntiSpam] Bot caught via honeypot field from IP: ${clientIp}`)
    return res.status(200).json({ success: true, message: 'Message received.' })
  }

  // 3. Server-side validation
  const trimmedName = (name || '').trim()
  const trimmedEmail = (email || '').trim().toLowerCase()
  const trimmedMessage = (message || '').trim()

  if (!trimmedName) {
    return res.status(400).json({ error: 'Name is required.' })
  }
  if (trimmedName.length > 100) {
    return res.status(400).json({ error: 'Name cannot exceed 100 characters.' })
  }

  if (!trimmedEmail) {
    return res.status(400).json({ error: 'Email address is required.' })
  }
  if (trimmedEmail.length > 150 || !EMAIL_REGEX.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' })
  }

  if (!trimmedMessage) {
    return res.status(400).json({ error: 'Message content is required.' })
  }
  if (trimmedMessage.length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters long.' })
  }
  if (trimmedMessage.length > 5000) {
    return res.status(400).json({ error: 'Message cannot exceed 5000 characters.' })
  }

  // 4. Nodemailer delivery
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  const receiverEmail = process.env.RECEIVER_EMAIL || emailUser

  // Strict check: Never disguise an unsent message as delivered if credentials are not configured
  if (!emailUser || !emailPass) {
    // Check if test transport is explicitly enabled for unit/integration tests
    if (process.env.ENABLE_TEST_CONTACT_LOG === 'true') {
      console.log(`[Contact Backend] [EXPLICIT TEST MODE] Inquiry logged (live email dispatch disabled): from ${trimmedName} <${trimmedEmail}>`)
      return res.status(200).json({
        success: true,
        message: 'Inquiry received in explicit development test mode (email dispatch disabled).',
        testMode: true,
      })
    }

    console.warn('[Contact Backend] Contact submission rejected: EMAIL_USER and EMAIL_PASS are not configured in environment.')
    return res.status(503).json({
      error: 'Contact service is not configured on the server (SMTP delivery credentials not set). Please reach out directly on GitHub (https://github.com/atifvirani).',
      delivered: false,
    })
  }

  try {
    const transporter = getTransporter(emailUser, emailPass)

    const safeName = escapeHtml(trimmedName)
    const safeEmail = escapeHtml(trimmedEmail)
    const safeMessage = escapeHtml(trimmedMessage).replace(/\n/g, '<br />')
    const fromAddress = process.env.EMAIL_FROM || emailUser

    const mailOptions = {
      from: `"Atif Portfolio Contact" <${fromAddress}>`,
      replyTo: `"${trimmedName}" <${trimmedEmail}>`,
      to: receiverEmail,
      subject: `[Portfolio Inquiry] from ${trimmedName}`,
      text: `New Portfolio Message\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}\n\n---\nSent from Atif Portfolio Contact Engine`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #222; border-radius: 8px; background: #0a0a0a; color: #eee;">
          <div style="border-bottom: 1px solid #333; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #fff; font-size: 20px; font-weight: 600; letter-spacing: -0.02em;">New Portfolio Inquiry</h2>
            <p style="margin: 4px 0 0; color: #888; font-size: 13px;">Received via personal portfolio contact form</p>
          </div>
          <div style="margin-bottom: 16px;">
            <span style="display: block; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Sender Details</span>
            <div style="font-size: 15px; color: #fff; font-weight: 500;">${safeName}</div>
            <div style="font-size: 14px; color: #aaa;">${safeEmail}</div>
          </div>
          <div style="margin-bottom: 24px;">
            <span style="display: block; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Message</span>
            <div style="font-size: 14px; line-height: 1.6; color: #ddd; background: #141414; padding: 16px; border-radius: 6px; border: 1px solid #282828;">
              ${safeMessage}
            </div>
          </div>
          <div style="border-top: 1px solid #222; padding-top: 12px; font-size: 12px; color: #666; text-align: right;">
            Atif Portfolio &bull; Verified Transmission
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[Contact Backend] Email successfully dispatched for inquiry from ${trimmedEmail}`)

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. I will get back to you shortly.',
    })
  } catch (error) {
    cachedTransporter = null // reset cached transporter on connection failure
    console.error('[Contact Backend] Failed to dispatch email:', error.message)
    if (error.response) console.error('[Contact Backend] SMTP Response:', error.response)

    return res.status(500).json({
      error: error.message || 'Failed to deliver message due to an internal mail service error. Please try reaching out directly via GitHub.',
    })
  }
}
