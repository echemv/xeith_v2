// Cloudflare Pages Function: /api/account
// User account management, leaderboards, social features
// Requires D1 database binding: DB

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

function addCors(res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

export async function onRequestOptions() {
  return addCors(new Response(null, { status: 204 }))
}

// Helper: get user from auth header (simplified - in production use proper JWT)
async function getUser(request, env) {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const userId = auth.slice(7)
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  return user
}

// GET /api/account/profile - Get current user profile with stats
export async function onRequestGet({ request, env, params }) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/account', '') || '/'

  // Add CORS to all responses
  const baseRes = async (res) => addCors(res)

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

    // Leaderboards
    if (path === '/leaderboard/global') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
      const offset = parseInt(url.searchParams.get('offset') || '0')

      const board = await env.DB.prepare(`
        SELECT rank, user_id, points, display_name, avatar_seed
        FROM leaderboard_global
        ORDER BY rank
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all()

      // Get current user's rank if authenticated
      const user = await getUser(request, env)
      let myRank = null
      if (user) {
        const myEntry = await env.DB.prepare('SELECT rank FROM leaderboard_global WHERE user_id = ?').bind(user.id).first()
        myRank = myEntry?.rank || null
      }

      return baseRes(json({ leaderboard: board.results || [], myRank }))
    }

    if (path === '/leaderboard/weekly') {
      const week = parseInt(url.searchParams.get('week')) || new Date().getISOWeek()
      const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear()
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

      const board = await env.DB.prepare(`
        SELECT rank, user_id, points, display_name, avatar_seed
        FROM leaderboard_weekly
        WHERE week = ? AND year = ?
        ORDER BY rank
        LIMIT ?
      `).bind(week, year, limit).all()

      return baseRes(json({ leaderboard: board.results || [], week, year }))
    }

    if (path === '/leaderboard/streak') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

      const board = await env.DB.prepare(`
        SELECT rank, user_id, streak, display_name, avatar_seed
        FROM leaderboard_streak
        ORDER BY rank
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

  const baseRes = async (res) => addCors(res)

  if (!env.DB) {
    return baseRes(json({ error: 'Database not connected yet. Please bind Cloudflare D1 (DB) in wrangler.toml or Dashboard.' }, 503))
  }

  try {
    const user = await getUser(request, env)
    if (!user && path !== '/register') {
      return baseRes(json({ error: 'Unauthorized' }, 401))
    }

    const body = await request.json().catch(() => ({}))

    // Register new user (link anonymous local account to cloud)
    if (path === '/register') {
      const { userId, displayName, email, language = 'en', avatarSeed } = body
      if (!userId || !displayName) {
        return baseRes(json({ error: 'Missing required fields' }, 400))
      }

      // Check if user exists
      const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first()
      if (existing) {
        return baseRes(json({ error: 'User already exists' }, 409))
      }

      const now = Math.floor(Date.now() / 1000)
      const emailHash = email ? await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase())).then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')) : null

      await env.DB.prepare(`
        INSERT INTO users (id, display_name, email_hash, avatar_seed, language, created_at, updated_at, is_anonymous, consent_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1)
      `).bind(userId, displayName.trim(), emailHash, avatarSeed || crypto.randomUUID(), language, now, now).run()

      // Initialize stats
      await env.DB.prepare(`
        INSERT INTO user_stats (user_id, points, streak, longest_streak, lessons_completed, challenges_completed, games_played, games_won, photos_submitted, facts_learned, updated_at)
        VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?)
      `).bind(userId, now).run()

      return baseRes(json({ success: true, userId }))
    }

    // Update profile
    if (path === '/profile') {
      const { displayName, language, avatarSeed } = body
      const updates = []
      const params = []

      if (displayName !== undefined) {
        updates.push('display_name = ?')
        params.push(displayName.trim())
      }
      if (language !== undefined) {
        updates.push('language = ?')
        params.push(language)
      }
      if (avatarSeed !== undefined) {
        updates.push('avatar_seed = ?')
        params.push(avatarSeed)
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
      if (!challengeDate || !imageUrl) {
        return baseRes(json({ error: 'Missing required fields' }, 400))
      }

      const submissionId = crypto.randomUUID()
      const now = Math.floor(Date.now() / 1000)

      await env.DB.prepare(`
        INSERT INTO photo_submissions (id, user_id, challenge_date, challenge_type, image_url, caption, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).bind(submissionId, user.id, challengeDate, challengeType || 'PHOTO_CHALLENGE', imageUrl, caption || '', now).run()

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
      const { challengeId, challengeType, pointsEarned } = body
      if (!challengeId || !challengeType || pointsEarned === undefined) {
        return baseRes(json({ error: 'Missing required fields' }, 400))
      }

      const existing = await env.DB.prepare('SELECT 1 FROM challenge_completions WHERE user_id = ? AND challenge_id = ?').bind(user.id, challengeId).first()
      if (existing) {
        return baseRes(json({ error: 'Already completed' }, 409))
      }

      const now = Math.floor(Date.now() / 1000)
      await env.DB.prepare(`
        INSERT INTO challenge_completions (user_id, challenge_id, challenge_type, completed_at, points_earned)
        VALUES (?, ?, ?, ?, ?)
      `).bind(user.id, challengeId, challengeType, now, pointsEarned).run()

      // Update stats
      await env.DB.prepare(`
        UPDATE user_stats SET
          points = points + ?,
          challenges_completed = challenges_completed + 1,
          updated_at = ?
        WHERE user_id = ?
      `).bind(pointsEarned, now, user.id).run()

      // Check streak
      const yesterday = Math.floor((Date.now() - 864e5) / 1000)
      const lastActive = await env.DB.prepare('SELECT lastActive FROM users WHERE id = ?').bind(user.id).first()
      // This is simplified - real implementation would track daily activity

      return baseRes(json({ success: true, pointsEarned }))
    }

    // Sync local data to cloud
    if (path === '/sync') {
      const { points, streak, done, lessonsCompleted, challengesCompleted, gamesPlayed, gamesWon, photosSubmitted, factsLearned } = body
      const now = Math.floor(Date.now() / 1000)

      await env.DB.prepare(`
        UPDATE user_stats SET
          points = MAX(points, ?),
          streak = MAX(streak, ?),
          lessons_completed = MAX(lessons_completed, ?),
          challenges_completed = MAX(challenges_completed, ?),
          games_played = MAX(games_played, ?),
          games_won = MAX(games_won, ?),
          photos_submitted = MAX(photos_submitted, ?),
          facts_learned = MAX(facts_learned, ?),
          updated_at = ?
        WHERE user_id = ?
      `).bind(points || 0, streak || 0, lessonsCompleted || 0, challengesCompleted || 0, gamesPlayed || 0, gamesWon || 0, photosSubmitted || 0, factsLearned || 0, now, user.id).run()

      // Sync challenge completions
      if (done && typeof done === 'object') {
        for (const [challengeId, completed] of Object.entries(done)) {
          if (completed) {
            const [type, id] = challengeId.split('-', 2)
            if (type && id) {
              await env.DB.prepare(`
                INSERT OR IGNORE INTO challenge_completions (user_id, challenge_id, challenge_type, completed_at, points_earned)
                VALUES (?, ?, ?, ?, 0)
              `).bind(user.id, challengeId, type === 'daily' ? 'daily' : 'weekly', now).run()
            }
          }
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

  const baseRes = async (res) => addCors(res)

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