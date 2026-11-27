// Cloudflare Pages Function: /api/account
// User account management, leaderboards, social features
// Requires D1 database binding: DB

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })
const ALLOWED_LANGS = ['en', 'pid', 'ha', 'yo', 'ig']

function getAllowedOrigin(request, env) {
  if (!request) return null
  const origin = request.headers.get('Origin')
  if (!origin) return null
  try {
    const reqOrigin = new URL(request.url).origin
    if (origin === reqOrigin) return origin
  } catch {}
  if (env?.ALLOWED_ORIGIN && origin === env.ALLOWED_ORIGIN) return origin
  if (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') return origin
  return null
}

function addCors(res, request, env) {
  const allowedOrigin = getAllowedOrigin(request, env)
  if (allowedOrigin) {
    res.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    res.headers.set('Vary', 'Origin')
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function onRequestOptions({ request, env } = {}) {
  return addCors(new Response(null, { status: 204 }), request, env)
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const enc = new TextEncoder()
  const bufA = enc.encode(a)
  const bufB = enc.encode(b)
  if (bufA.byteLength !== bufB.byteLength) return false
  if (crypto?.subtle?.timingSafeEqual) {
    return crypto.subtle.timingSafeEqual(bufA, bufB)
  }
  let diff = 0
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i]
  return diff === 0
}

// Helper: SHA-256 hex digest
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, '0')).join('')
}

// Helper: PBKDF2 password hashing ("saltHex:hashHex")
async function hashPassword(password, saltHex) {
  const salt = saltHex
    ? new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)))
    : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256)
  const sHex = Array.from(salt).map(x => x.toString(16).padStart(2, '0')).join('')
  const hHex = Array.from(new Uint8Array(bits)).map(x => x.toString(16).padStart(2, '0')).join('')
  return `${sHex}:${hHex}`
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [saltHex] = stored.split(':')
  const candidate = await hashPassword(password, saltHex)
  return timingSafeEqualStr(candidate, stored)
}

// Session token generation & verification (32-byte crypto random token, SHA-256 stored)
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

// Helper: D1-backed sliding/fixed window rate limiter
async function checkRateLimit(env, bucketKey, maxCount, windowSec = 60) {
  if (!env.DB) return true
  const nowSec = Math.floor(Date.now() / 1000)
  const windowSlot = Math.floor(nowSec / windowSec)
  const key = `${bucketKey}:${windowSlot}`
  try {
    await env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 1, expires_at INTEGER NOT NULL)'
    ).run()
    await env.DB.prepare(
      'INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1'
    ).bind(key, nowSec + windowSec * 2).run()
    const row = await env.DB.prepare('SELECT count FROM rate_limits WHERE key = ?').bind(key).first()
    return !row || row.count <= maxCount
  } catch {
    return true
  }
}

async function createSession(userId, env) {
  const rawBytes = crypto.getRandomValues(new Uint8Array(32))
  const token = Array.from(rawBytes).map(x => x.toString(16).padStart(2, '0')).join('')
  const tokenHash = await sha256(token)
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + SESSION_TTL_SECONDS
  await env.DB.prepare(
    'INSERT INTO user_sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(tokenHash, userId, now, expiresAt).run()
  return token
}

async function getUser(request, env) {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  if (!token) return null
  const tokenHash = await sha256(token)
  const now = Math.floor(Date.now() / 1000)

  // Look up valid session
  const session = await env.DB.prepare(
    'SELECT user_id, expires_at FROM user_sessions WHERE token_hash = ? AND expires_at > ?'
  ).bind(tokenHash, now).first()

  if (!session) return null
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first()
  return user
}

// GET /api/account/profile - Get current user profile with stats
export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/account', '') || '/'

  // Add CORS to all responses
  const baseRes = async (res) => addCors(res, request, env)

  if (!env.DB) {
    return baseRes(json({ error: 'Database not connected yet. Please bind Cloudflare D1 (DB) in wrangler.toml or Dashboard.' }, 503))
  }

  try {
    // Profile endpoint
    if (path === '/' || path === '/profile') {
      const user = await getUser(request, env)
      if (!user) return baseRes(json({ error: 'Unauthorized' }, 401))

      const stats = await env.DB.prepare('SELECT * FROM user_stats WHERE user_id = ?').bind(user.id).first()
      const achievements = await env.DB.prepare(`
        SELECT a.*, ua.unlocked_at
        FROM achievements a
        JOIN user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = ?
        ORDER BY ua.unlocked_at DESC
      `).bind(user.id).all()

      const followerCount = await env.DB.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').bind(user.id).first()
      const followingCount = await env.DB.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').bind(user.id).first()

      return baseRes(json({
        user: {
          id: user.id,
          displayName: user.display_name,
          avatarSeed: user.avatar_seed,
          language: user.language,
          createdAt: user.created_at,
          isAnonymous: user.is_anonymous === 1
        },
        stats: stats || { points: 0, streak: 0, longestStreak: 0, lessonsCompleted: 0, challengesCompleted: 0, gamesPlayed: 0, gamesWon: 0, photosSubmitted: 0, factsLearned: 0 },
        achievements: achievements.results || [],
        followers: followerCount?.c || 0,
        following: followingCount?.c || 0
      }))
    }

    // Leaderboards (live dynamic ranking from user_stats + users)
    if (path === '/leaderboard/global') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
      const offset = parseInt(url.searchParams.get('offset') || '0')

      const board = await env.DB.prepare(`
        SELECT
          ROW_NUMBER() OVER (ORDER BY s.points DESC, s.updated_at ASC) AS rank,
          u.id AS user_id,
          s.points AS points,
          u.display_name AS display_name,
          u.avatar_seed AS avatar_seed
        FROM user_stats s
        JOIN users u ON u.id = s.user_id
        ORDER BY s.points DESC, s.updated_at ASC
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all()

      // Get current user's rank if authenticated
      const user = await getUser(request, env)
      let myRank = null
      if (user) {
        const myEntry = (board.results || []).find((r) => r.user_id === user.id)
        if (myEntry) {
          myRank = myEntry.rank
        } else {
          const rankRow = await env.DB.prepare(`
            SELECT COUNT(*) + 1 AS rank
            FROM user_stats
            WHERE points > COALESCE((SELECT points FROM user_stats WHERE user_id = ?), 0)
          `).bind(user.id).first()
          myRank = rankRow?.rank || null
        }
      }

      return baseRes(json({ leaderboard: board.results || [], myRank }))
    }

    if (path === '/leaderboard/weekly') {
      const week = parseInt(url.searchParams.get('week')) || new Date().getISOWeek()
      const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear()
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
      const weekStartSec = Math.floor(Date.now() / 1000) - 7 * 86400

      let board = await env.DB.prepare(`
        SELECT
          ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(c.points_earned), s.points) DESC) AS rank,
          u.id AS user_id,
          COALESCE(SUM(c.points_earned), s.points) AS points,
          u.display_name AS display_name,
          u.avatar_seed AS avatar_seed
        FROM user_stats s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN challenge_completions c ON c.user_id = u.id AND c.completed_at >= ?
        GROUP BY u.id
        ORDER BY points DESC
        LIMIT ?
      `).bind(weekStartSec, limit).all()

      return baseRes(json({ leaderboard: board.results || [], week, year }))
    }

    if (path === '/leaderboard/streak') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

      const board = await env.DB.prepare(`
        SELECT
          ROW_NUMBER() OVER (ORDER BY MAX(s.streak, s.longest_streak) DESC, s.points DESC) AS rank,
          u.id AS user_id,
          MAX(s.streak, s.longest_streak) AS streak,
          u.display_name AS display_name,
          u.avatar_seed AS avatar_seed
        FROM user_stats s
        JOIN users u ON u.id = s.user_id
        ORDER BY streak DESC, s.points DESC
        LIMIT ?
      `).bind(limit).all()

      return baseRes(json({ leaderboard: board.results || [] }))
    }

    // Friends/Social
    if (path === '/friends/followers') {
      const user = await getUser(request, env)
      if (!user) return baseRes(json({ error: 'Unauthorized' }, 401))

      const followers = await env.DB.prepare(`
        SELECT u.id, u.display_name, u.avatar_seed, f.created_at
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
        ORDER BY f.created_at DESC
        LIMIT 50
      `).bind(user.id).all()

      return baseRes(json({ followers: followers.results || [] }))
    }

    if (path === '/friends/following') {
      const user = await getUser(request, env)
      if (!user) return baseRes(json({ error: 'Unauthorized' }, 401))

      const following = await env.DB.prepare(`
        SELECT u.id, u.display_name, u.avatar_seed, f.created_at
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
        ORDER BY f.created_at DESC
        LIMIT 50
      `).bind(user.id).all()

      return baseRes(json({ following: following.results || [] }))
    }

    if (path === '/friends/activity') {
      const user = await getUser(request, env)
      if (!user) return baseRes(json({ error: 'Unauthorized' }, 401))

      // Get activity from followed users
      const activities = await env.DB.prepare(`
        SELECT a.*, u.display_name, u.avatar_seed
        FROM activities a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id IN (
          SELECT following_id FROM follows WHERE follower_id = ?
        )
        ORDER BY a.created_at DESC
        LIMIT 30
      `).bind(user.id).all()

      return baseRes(json({ activities: activities.results || [] }))
    }

    // Photo submissions
    if (path === '/photos') {
      const user = await getUser(request, env)
      if (!user) return baseRes(json({ error: 'Unauthorized' }, 401))

      const photos = await env.DB.prepare(`
        SELECT * FROM photo_submissions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `).bind(user.id).all()

      return baseRes(json({ photos: photos.results || [] }))
    }

    // Achievements catalog
    if (path === '/achievements') {
      const achievements = await env.DB.prepare('SELECT * FROM achievements ORDER BY category, points_reward').all()
      return baseRes(json({ achievements: achievements.results || [] }))
    }

    // Public profile (for viewing other users)
    if (path.startsWith('/public/')) {
      const targetId = path.split('/public/')[1]
      const target = await env.DB.prepare('SELECT id, display_name, avatar_seed, created_at FROM users WHERE id = ?').bind(targetId).first()
      if (!target) return baseRes(json({ error: 'Not found' }, 404))

      const stats = await env.DB.prepare('SELECT * FROM user_stats WHERE user_id = ?').bind(targetId).first()
      const achievements = await env.DB.prepare(`
        SELECT a.*, ua.unlocked_at
        FROM achievements a
        JOIN user_achievements ua ON a.id = ua.achievement_id
        WHERE ua.user_id = ?
        ORDER BY ua.unlocked_at DESC
        LIMIT 10
      `).bind(targetId).all()

      const followerCount = await env.DB.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id = ?').bind(targetId).first()
      const followingCount = await env.DB.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?').bind(targetId).first()

      let isFollowing = false
      const user = await getUser(request, env)
      if (user) {
        const follow = await env.DB.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').bind(user.id, targetId).first()
        isFollowing = !!follow
      }

      return baseRes(json({
        user: {
          id: target.id,
          displayName: target.display_name,
          avatarSeed: target.avatar_seed,
          createdAt: target.created_at
        },
        stats: stats || {},
        achievements: achievements.results || [],
        followers: followerCount?.c || 0,
        following: followingCount?.c || 0,
        isFollowing
      }))
    }

    return baseRes(json({ error: 'Not found' }, 404))

  } catch (e) {
    console.error('Account GET error:', e)
    return baseRes(json({ error: 'Internal error' }, 500))
  }
}

// POST /api/account - Create/update profile, social actions
export async function onRequestPost({ request, env, params }) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/account', '') || '/'

  const baseRes = async (res) => addCors(res, request, env)

  if (!env.DB) {
    return baseRes(json({ error: 'Database not connected yet. Please bind Cloudflare D1 (DB) in wrangler.toml or Dashboard.' }, 503))
  }

  try {
    const user = await getUser(request, env)
    const publicPaths = ['/register', '/login', '/send-code', '/verify-code']
    if (!user && !publicPaths.includes(path)) {
      return baseRes(json({ error: 'Unauthorized' }, 401))
    }

    const body = await request.json().catch(() => ({}))
    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown'

    // Send 6-digit email sign-in code
    if (path === '/send-code') {
      if (!(await checkRateLimit(env, `send-code:ip:${clientIp}`, 5, 60))) {
        return baseRes(json({ error: 'Too many code requests. Please wait a minute.' }, 429))
      }

      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      if (!email || !email.includes('@') || email.length > 254) {
        return baseRes(json({ error: 'Please enter a valid email address' }, 400))
      }
      if (!env.RESEND_API_KEY) {
        return baseRes(json({ error: 'Email sign-in is not configured yet (missing RESEND_API_KEY)' }, 503))
      }

      const emailHash = await sha256(email)
      if (!(await checkRateLimit(env, `send-code:email:${emailHash}`, 1, 60))) {
        return baseRes(json({ error: 'Please wait 60 seconds before requesting another code.' }, 429))
      }
      const found = await env.DB.prepare('SELECT id, display_name FROM users WHERE email_hash = ?').bind(emailHash).first()
      if (!found) {
        // Return generic 200 response to prevent account enumeration
        return baseRes(json({ success: true, message: 'If an account exists for that email, a sign-in code has been sent.' }))
      }

      const code = String((crypto.getRandomValues(new Uint32Array(1))[0] % 900000) + 100000)
      const codeHash = await sha256(`${code}:${emailHash}`)
      const expiresAt = Math.floor(Date.now() / 1000) + 600

      await env.DB.prepare(
        'INSERT OR REPLACE INTO login_codes (email_hash, code_hash, expires_at) VALUES (?, ?, ?)'
      ).bind(emailHash, codeHash, expiresAt).run()

      const safeDisplayName = escapeHtml(found.display_name)
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM || 'XEITH <onboarding@resend.dev>',
          to: [email],
          subject: 'Your XEITH sign-in code',
          text: `Hi ${found.display_name},\n\nYour XEITH sign-in code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
          html: `<p>Hi <strong>${safeDisplayName}</strong>,</p><p>Your XEITH sign-in code is:</p><h2 style="letter-spacing:4px;font-family:monospace;">${escapeHtml(code)}</h2><p>This code expires in 10 minutes.</p>`
        })
      })

      if (!emailRes.ok) {
        const errText = await emailRes.text().catch(() => '')
        console.error('Resend error:', errText)
        return baseRes(json({ error: 'Failed to send email. Check email sender configuration.' }, 502))
      }

      return baseRes(json({ success: true }))
    }

    // Verify 6-digit email sign-in code
    if (path === '/verify-code') {
      if (!(await checkRateLimit(env, `verify-code:ip:${clientIp}`, 10, 60))) {
        return baseRes(json({ error: 'Too many verification attempts. Please wait a minute.' }, 429))
      }

      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const code = typeof body.code === 'string' ? body.code.trim() : ''
      if (!email || !code) {
        return baseRes(json({ error: 'Email and code are required' }, 400))
      }

      const emailHash = await sha256(email)
      const record = await env.DB.prepare(
        'SELECT code_hash, expires_at FROM login_codes WHERE email_hash = ?'
      ).bind(emailHash).first()

      const now = Math.floor(Date.now() / 1000)
      if (!record || record.expires_at < now) {
        return baseRes(json({ error: 'Code expired or not found. Please request a new one.' }, 401))
      }

      const expectedHash = await sha256(`${code}:${emailHash}`)
      if (!timingSafeEqualStr(record.code_hash, expectedHash)) {
        // Invalidate OTP after 5 failed attempts for this email within a 10-minute window
        const allowed = await checkRateLimit(env, `otp-fail:${emailHash}`, 4, 600)
        if (!allowed) {
          await env.DB.prepare('DELETE FROM login_codes WHERE email_hash = ?').bind(emailHash).run()
          return baseRes(json({ error: 'Too many incorrect attempts. Please request a new code.' }, 401))
        }
        return baseRes(json({ error: 'Invalid code' }, 401))
      }

      await env.DB.prepare('DELETE FROM login_codes WHERE email_hash = ?').bind(emailHash).run()

      const found = await env.DB.prepare(
        'SELECT id, display_name, avatar_seed, language FROM users WHERE email_hash = ?'
      ).bind(emailHash).first()
      if (!found) {
        return baseRes(json({ error: 'Account not found' }, 404))
      }

      await env.DB.prepare('UPDATE users SET last_active_at = ? WHERE id = ?').bind(now, found.id).run()
      const stats = await env.DB.prepare('SELECT * FROM user_stats WHERE user_id = ?').bind(found.id).first()
      const token = await createSession(found.id, env)

      return baseRes(json({
        success: true,
        token,
        user: {
          id: found.id,
          displayName: found.display_name,
          avatarSeed: found.avatar_seed,
          language: found.language
        },
        stats: stats || {}
      }))
    }

    // Login / recover existing cloud account via email + password OR secret recovery code
    if (path === '/login') {
      if (!(await checkRateLimit(env, `login:ip:${clientIp}`, 10, 60))) {
        return baseRes(json({ error: 'Too many sign-in attempts. Please wait a minute.' }, 429))
      }

      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const recoveryCode = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim() : ''

      let found = null
      if (email && password) {
        const emailHash = await sha256(email)
        const row = await env.DB.prepare(
          'SELECT id, display_name, avatar_seed, language, password_hash FROM users WHERE email_hash = ?'
        ).bind(emailHash).first()
        if (!row || !(await verifyPassword(password, row.password_hash))) {
          return baseRes(json({ error: 'Invalid email or password' }, 401))
        }
        found = row
      } else if (recoveryCode) {
        // Recovery code is checked against hashed recovery code
        const recoveryHash = await sha256(recoveryCode)
        found = await env.DB.prepare(
          'SELECT id, display_name, avatar_seed, language FROM users WHERE recovery_hash = ?'
        ).bind(recoveryHash).first()
        if (!found) {
          return baseRes(json({ error: 'Invalid or unrecognized recovery code' }, 401))
        }
      } else {
        return baseRes(json({ error: 'Email and password (or recovery code) required' }, 400))
      }

      const now = Math.floor(Date.now() / 1000)
      await env.DB.prepare('UPDATE users SET last_active_at = ? WHERE id = ?').bind(now, found.id).run()
      const stats = await env.DB.prepare('SELECT * FROM user_stats WHERE user_id = ?').bind(found.id).first()
      const token = await createSession(found.id, env)

      return baseRes(json({
        success: true,
        token,
        user: {
          id: found.id,
          displayName: found.display_name,
          avatarSeed: found.avatar_seed,
          language: found.language
        },
        stats: stats || {}
      }))
    }

    // Register new user (link anonymous local account to cloud)
    if (path === '/register') {
      if (!(await checkRateLimit(env, `register:ip:${clientIp}`, 5, 60))) {
        return baseRes(json({ error: 'Too many registration attempts. Please wait a minute.' }, 429))
      }

      const { displayName, email, password, language = 'en', avatarSeed } = body
      if (typeof displayName !== 'string' || !displayName.trim() || displayName.trim().length > 30) {
        return baseRes(json({ error: 'Display name must be between 1 and 30 characters' }, 400))
      }
      if (password !== undefined && (typeof password !== 'string' || password.length < 6 || password.length > 128)) {
        return baseRes(json({ error: 'Password must be between 6 and 128 characters' }, 400))
      }
      const cleanLang = ALLOWED_LANGS.includes(language) ? language : 'en'
      const cleanAvatarSeed = typeof avatarSeed === 'string' && avatarSeed.length <= 64 ? avatarSeed : crypto.randomUUID()

      const userId = crypto.randomUUID()
      const now = Math.floor(Date.now() / 1000)
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
      if (cleanEmail && cleanEmail.length > 254) {
        return baseRes(json({ error: 'Invalid email address' }, 400))
      }
      const emailHash = cleanEmail ? await sha256(cleanEmail) : null

      if (emailHash) {
        const dupEmail = await env.DB.prepare('SELECT id FROM users WHERE email_hash = ?').bind(emailHash).first()
        if (dupEmail) {
          return baseRes(json({ error: 'Unable to complete registration with the provided details' }, 409))
        }
      }

      const passwordHash = password ? await hashPassword(password) : null

      // Generate a secret 16-character hex recovery code separate from user ID
      const recoveryBytes = crypto.getRandomValues(new Uint8Array(12))
      const recoveryCode = Array.from(recoveryBytes).map(x => x.toString(16).padStart(2, '0')).join('')
      const recoveryHash = await sha256(recoveryCode)

      await env.DB.prepare(`
        INSERT INTO users (id, display_name, email_hash, password_hash, recovery_hash, avatar_seed, language, created_at, updated_at, is_anonymous, consent_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
      `).bind(userId, displayName.trim(), emailHash, passwordHash, recoveryHash, cleanAvatarSeed, cleanLang, now, now).run()

      // Initialize stats
      await env.DB.prepare(`
        INSERT INTO user_stats (user_id, points, streak, longest_streak, lessons_completed, challenges_completed, games_played, games_won, photos_submitted, facts_learned, updated_at)
        VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?)
      `).bind(userId, now).run()

      const token = await createSession(userId, env)

      return baseRes(json({
        success: true,
        token,
        userId,
        recoveryCode,
        user: {
          id: userId,
          displayName: displayName.trim(),
          avatarSeed: cleanAvatarSeed,
          language: cleanLang
        }
      }))
    }

    // Update profile
    if (path === '/profile') {
      const { displayName, language, avatarSeed } = body
      const updates = []
      const params = []

      if (displayName !== undefined) {
        if (typeof displayName !== 'string' || !displayName.trim() || displayName.trim().length > 30) {
          return baseRes(json({ error: 'Display name must be between 1 and 30 characters' }, 400))
        }
        updates.push('display_name = ?')
        params.push(displayName.trim())
      }
      if (language !== undefined) {
        if (!ALLOWED_LANGS.includes(language)) {
          return baseRes(json({ error: 'Unsupported language code' }, 400))
        }
        updates.push('language = ?')
        params.push(language)
      }
      if (avatarSeed !== undefined) {
        if (typeof avatarSeed !== 'string' || !avatarSeed.trim() || avatarSeed.length > 64) {
          return baseRes(json({ error: 'Invalid avatar seed' }, 400))
        }
        updates.push('avatar_seed = ?')
        params.push(avatarSeed.trim())
      }

      if (updates.length === 0) {
        return baseRes(json({ error: 'No updates provided' }, 400))
      }

      updates.push('updated_at = ?')
      params.push(Math.floor(Date.now() / 1000))
      params.push(user.id)

      await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run()

      return baseRes(json({ success: true }))
    }

    // Follow user
    if (path === '/friends/follow') {
      const { targetId } = body
      if (!targetId || targetId === user.id) {
        return baseRes(json({ error: 'Invalid target' }, 400))
      }

      const target = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(targetId).first()
      if (!target) {
        return baseRes(json({ error: 'User not found' }, 404))
      }

      const now = Math.floor(Date.now() / 1000)
      await env.DB.prepare(`
        INSERT OR IGNORE INTO follows (follower_id, following_id, created_at)
        VALUES (?, ?, ?)
      `).bind(user.id, targetId, now).run()

      // Create activity
      await env.DB.prepare(`
        INSERT INTO activities (id, user_id, type, data, points, created_at)
        VALUES (?, ?, 'follow', ?, 0, ?)
      `).bind(crypto.randomUUID(), user.id, JSON.stringify({ targetId }), now).run()

      return baseRes(json({ success: true, following: true }))
    }

    // Unfollow user
    if (path === '/friends/unfollow') {
      const { targetId } = body
      if (!targetId) {
        return baseRes(json({ error: 'Missing targetId' }, 400))
      }

      await env.DB.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').bind(user.id, targetId).run()

      return baseRes(json({ success: true, following: false }))
    }

    // Submit photo challenge
    if (path === '/photos/submit') {
      const { challengeDate, challengeType, imageUrl, caption } = body
      if (
        typeof challengeDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(challengeDate) ||
        typeof imageUrl !== 'string' ||
        !imageUrl.trim() ||
        imageUrl.length > 500000
      ) {
        return baseRes(json({ error: 'Invalid challengeDate or imageUrl' }, 400))
      }

      const trimmedUrl = imageUrl.trim()
      const isHttpsUrl = /^https:\/\/[^\s<>"']{4,2048}$/i.test(trimmedUrl)
      const isSafeDataImage = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmedUrl)
      if (!isHttpsUrl && !isSafeDataImage) {
        return baseRes(json({ error: 'imageUrl must be an HTTPS URL or valid JPEG/PNG/WebP data URI' }, 400))
      }

      const cleanCaption = typeof caption === 'string' ? caption.trim().slice(0, 300) : ''
      const cleanChallengeType = challengeType === 'PHOTO_CHALLENGE' ? 'PHOTO_CHALLENGE' : 'PHOTO_CHALLENGE'

      const submissionId = crypto.randomUUID()
      const now = Math.floor(Date.now() / 1000)

      await env.DB.prepare(`
        INSERT INTO photo_submissions (id, user_id, challenge_date, challenge_type, image_url, caption, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).bind(submissionId, user.id, challengeDate, cleanChallengeType, trimmedUrl, cleanCaption, now).run()

      // Update stats
      await env.DB.prepare(`
        UPDATE user_stats SET photos_submitted = photos_submitted + 1, updated_at = ?
        WHERE user_id = ?
      `).bind(now, user.id).run()

      // Create activity
      await env.DB.prepare(`
        INSERT INTO activities (id, user_id, type, data, points, created_at)
        VALUES (?, ?, 'photo_submit', ?, 0, ?)
      `).bind(crypto.randomUUID(), user.id, JSON.stringify({ submissionId, challengeDate }), now).run()

      return baseRes(json({ success: true, submissionId }))
    }

    // Record challenge completion (for sync from local)
    if (path === '/challenges/complete') {
      const { challengeId, challengeType } = body
      if (
        typeof challengeId !== 'string' ||
        !/^(daily|week|ladder)-[a-zA-Z0-9_-]{1,64}$/.test(challengeId) ||
        !['daily', 'weekly'].includes(challengeType)
      ) {
        return baseRes(json({ error: 'Invalid challenge completion payload' }, 400))
      }

      // Compute authoritative server-side points by challenge type and ID pattern
      const serverPoints = challengeType === 'daily'
        ? (challengeId.startsWith('daily-challenge-') ? 15 : 5)
        : (challengeId.startsWith('ladder-full-') ? 50 : challengeId.startsWith('ladder-step-') ? 10 : 5)

      const existing = await env.DB.prepare('SELECT 1 FROM challenge_completions WHERE user_id = ? AND challenge_id = ?').bind(user.id, challengeId).first()
      if (existing) {
        return baseRes(json({ error: 'Already completed' }, 409))
      }

      const now = Math.floor(Date.now() / 1000)
      await env.DB.prepare(`
        INSERT INTO challenge_completions (user_id, challenge_id, challenge_type, completed_at, points_earned)
        VALUES (?, ?, ?, ?, ?)
      `).bind(user.id, challengeId, challengeType, now, serverPoints).run()

      // Update stats
      await env.DB.prepare(`
        UPDATE user_stats SET
          points = points + ?,
          challenges_completed = challenges_completed + 1,
          updated_at = ?
        WHERE user_id = ?
      `).bind(serverPoints, now, user.id).run()

      return baseRes(json({ success: true, pointsEarned: serverPoints }))
    }

    // Sync local data to cloud
    if (path === '/sync') {
      const { points, streak, done } = body
      const now = Math.floor(Date.now() / 1000)

      // Validate done entries and compute authoritative upper bounds from verified completion keys
      const validEntries = done && typeof done === 'object' && !Array.isArray(done)
        ? Object.entries(done)
            .filter(([k, v]) => Boolean(v) && typeof k === 'string' && /^(lesson|daily|week|ladder|game|stewardship)-[a-zA-Z0-9_-]{1,64}$/.test(k))
            .slice(0, 500)
        : []

      let verifiedLessons = 0
      let verifiedChallenges = 0
      let verifiedGames = 0
      let maxAllowedPoints = 0

      for (const [key] of validEntries) {
        if (key.startsWith('lesson-')) {
          verifiedLessons++
          maxAllowedPoints += 10
        } else if (key.startsWith('daily-challenge-')) {
          verifiedChallenges++
          maxAllowedPoints += 15
        } else if (key.startsWith('daily-') || key.startsWith('week-')) {
          verifiedChallenges++
          maxAllowedPoints += 5
        } else if (key.startsWith('ladder-full-')) {
          verifiedChallenges++
          maxAllowedPoints += 50
        } else if (key.startsWith('ladder-step-')) {
          verifiedChallenges++
          maxAllowedPoints += 10
        } else if (key.startsWith('game-') || key.startsWith('stewardship-')) {
          verifiedGames++
          if (verifiedGames <= 50) maxAllowedPoints += 200
        }
      }

      const totalVerifiedActivities = verifiedLessons + verifiedChallenges + verifiedGames
      const safePoints = Math.min(Math.max(0, Math.floor(Number(points) || 0)), maxAllowedPoints)
      const safeStreak = Math.min(Math.max(0, Math.floor(Number(streak) || 0)), Math.max(1, totalVerifiedActivities))

      await env.DB.prepare(`
        UPDATE user_stats SET
          points = MAX(points, ?),
          streak = MAX(streak, ?),
          longest_streak = MAX(longest_streak, ?),
          lessons_completed = MAX(lessons_completed, ?),
          challenges_completed = MAX(challenges_completed, ?),
          games_played = MAX(games_played, ?),
          games_won = MAX(games_won, ?),
          facts_learned = MAX(facts_learned, ?),
          updated_at = ?
        WHERE user_id = ?
      `).bind(safePoints, safeStreak, safeStreak, verifiedLessons, verifiedChallenges, verifiedGames, verifiedGames, verifiedLessons, now, user.id).run()

      // Sync challenge completions
      for (const [challengeId] of validEntries) {
        if (challengeId.startsWith('daily-') || challengeId.startsWith('week-') || challengeId.startsWith('ladder-')) {
          const cType = challengeId.startsWith('daily-') ? 'daily' : 'weekly'
          await env.DB.prepare(`
            INSERT OR IGNORE INTO challenge_completions (user_id, challenge_id, challenge_type, completed_at, points_earned)
            VALUES (?, ?, ?, ?, 0)
          `).bind(user.id, challengeId, cType, now).run()
        }
      }

      return baseRes(json({ success: true }))
    }

    return baseRes(json({ error: 'Not found' }, 404))

  } catch (e) {
    console.error('Account POST error:', e)
    return baseRes(json({ error: 'Internal error' }, 500))
  }
}

// DELETE /api/account - Delete account, remove follows
export async function onRequestDelete({ request, env, params }) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/account', '') || '/'

  const baseRes = async (res) => addCors(res, request, env)

  if (!env.DB) {
    return baseRes(json({ error: 'Database not connected yet. Please bind Cloudflare D1 (DB) in wrangler.toml or Dashboard.' }, 503))
  }

  try {
    const user = await getUser(request, env)
    if (!user) return baseRes(json({ error: 'Unauthorized' }, 401))

    if (path === '/profile') {
      // GDPR/NDPA: Delete all user data
      const userId = user.id

      // Delete in order due to foreign keys
      await env.DB.prepare('DELETE FROM user_sessions WHERE user_id = ?').bind(userId).run().catch(() => {})
      await env.DB.prepare('DELETE FROM data_requests WHERE user_id = ?').bind(userId).run().catch(() => {})
      await env.DB.prepare('DELETE FROM user_achievements WHERE user_id = ?').bind(userId).run()
      await env.DB.prepare('DELETE FROM challenge_completions WHERE user_id = ?').bind(userId).run()
      await env.DB.prepare('DELETE FROM photo_submissions WHERE user_id = ?').bind(userId).run()
      await env.DB.prepare('DELETE FROM activities WHERE user_id = ?').bind(userId).run()
      await env.DB.prepare('DELETE FROM follows WHERE follower_id = ? OR following_id = ?').bind(userId, userId).run()
      await env.DB.prepare('DELETE FROM user_stats WHERE user_id = ?').bind(userId).run()
      await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()

      return baseRes(json({ success: true, message: 'Account deleted' }))
    }

    if (path === '/friends/follow') {
      const targetId = url.searchParams.get('targetId')
      if (!targetId) return baseRes(json({ error: 'Missing targetId' }, 400))
      await env.DB.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').bind(user.id, targetId).run()
      return baseRes(json({ success: true }))
    }

    return baseRes(json({ error: 'Not found' }, 404))
  } catch (e) {
    console.error('Account DELETE error:', e)
    return baseRes(json({ error: 'Internal error' }, 500))
  }
}

// Helper: ISO week number
Date.prototype.getISOWeek = function() {
  const date = new Date(this.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}