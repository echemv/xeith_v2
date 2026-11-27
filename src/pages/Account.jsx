import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp, createProfile, restoreCloudState, signOut, exportData, deleteAll, maskEmail } from '../store'
import { PlayerHeroCard, AchievementCardsGrid } from '../components/PlayerAchievementCards'
import { getRankByPoints } from '../data/achievements'

const API_BASE = '/api/account'

export default function Account() {
  const { t, i18n } = useTranslation()
  const { profile, points, streak, done } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('profile')
  const [cloudUser, setCloudUser] = useState(null)
  const [cloudStats, setCloudStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [leaderboard, setLeaderboard] = useState({ global: [], weekly: [], streak: [] })
  const [friends, setFriends] = useState({ followers: [], following: [], activity: [] })
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showRecoveryLogin, setShowRecoveryLogin] = useState(false)
  const [achFilter, setAchFilter] = useState('all')
  const [userRecoveryCode, setUserRecoveryCode] = useState(() => {
    try { return localStorage.getItem('xeith-recovery-code') || '' } catch { return '' }
  })

  // Auth token (stored in localStorage for cloud mode)
  const [authToken, setAuthToken] = useState(() => {
    try { return localStorage.getItem('xeith-auth') } catch { return null }
  })

  useEffect(() => {
    if (authToken) localStorage.setItem('xeith-auth', authToken)
    else localStorage.removeItem('xeith-auth')
  }, [authToken])

  const api = useCallback(async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (authToken) headers.Authorization = `Bearer ${authToken}`

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }, [authToken])

  const loadCloudProfile = useCallback(async () => {
    if (!authToken) return
    try {
      setLoading(true)
      const profileData = await api('/profile')
      setCloudUser(profileData.user)
      setCloudStats(profileData.stats)
      setAchievements(profileData.achievements || [])
    } catch (e) {
      if (e.message.includes('Unauthorized')) {
        setAuthToken(null)
        setCloudUser(null)
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }, [authToken, api])

  const loadLeaderboard = useCallback(async (type = 'global') => {
    try {
      const data = await api(`/leaderboard/${type}`)
      setLeaderboard(prev => ({ ...prev, [type]: data.leaderboard || [] }))
    } catch (e) { console.error('Leaderboard load failed:', e) }
  }, [api])

  const loadFriends = useCallback(async () => {
    try {
      const [followers, following, activity] = await Promise.all([
        api('/friends/followers'),
        api('/friends/following'),
        api('/friends/activity')
      ])
      setFriends({ followers: followers.followers || [], following: following.following || [], activity: activity.activities || [] })
    } catch (e) { console.error('Friends load failed:', e) }
  }, [api])

  const loadPhotos = useCallback(async () => {
    try {
      const data = await api('/photos')
      setPhotos(data.photos || [])
    } catch (e) { console.error('Photos load failed:', e) }
  }, [api])

  useEffect(() => {
    loadLeaderboard('global')
    loadLeaderboard('weekly')
    loadLeaderboard('streak')
    if (authToken) {
      loadCloudProfile()
      loadFriends()
      loadPhotos()
    }
  }, [authToken, loadCloudProfile, loadLeaderboard, loadFriends, loadPhotos])

  const handleCloudRegister = async () => {
    const displayName = (name || profile?.name || '').trim()
    const cleanEmail = (email || profile?.email || '').trim()
    if (!displayName) return
    if (!cleanEmail || password.length < 6) {
      setError(t('Please enter an email and a password (at least 6 characters) to link a cloud account.'))
      return
    }
    try {
      setError(null)
      setLoading(true)
      const avatarSeed = crypto.randomUUID()
      const data = await api('/register', {
        method: 'POST',
        body: JSON.stringify({ displayName, email: cleanEmail, password, language: i18n.language, avatarSeed })
      })
      if (data.token) setAuthToken(data.token)
      if (data.recoveryCode) {
        setUserRecoveryCode(data.recoveryCode)
        try { localStorage.setItem('xeith-recovery-code', data.recoveryCode) } catch {}
      }
      setCloudUser(data.user || { id: data.userId, displayName, avatarSeed, language: i18n.language })
      setName('')
      setEmail('')
      setPassword('')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleCloudLogin = async (useRecovery = false) => {
    const payload = useRecovery
      ? { recoveryCode: recoveryCode.trim() }
      : { email: loginEmail.trim(), password: loginPassword }
    if (useRecovery && !payload.recoveryCode) return
    if (!useRecovery && (!payload.email || !payload.password)) return
    try {
      setError(null)
      setLoading(true)
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (data.token) setAuthToken(data.token)
      setCloudUser(data.user)
      setCloudStats(data.stats || {})
      restoreCloudState({
        displayName: data.user.displayName,
        points: data.stats?.points || 0,
        streak: data.stats?.streak || 0
      })
      if (useRecovery && payload.recoveryCode) {
        setUserRecoveryCode(payload.recoveryCode)
        try { localStorage.setItem('xeith-recovery-code', payload.recoveryCode) } catch {}
      }
      setRecoveryCode('')
      setLoginEmail('')
      setLoginPassword('')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const copyRecoveryCode = async () => {
    const code = userRecoveryCode || cloudUser?.id
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch { /* ignore */ }
  }

  const handleCloudSignOut = () => {
    setAuthToken(null)
    setCloudUser(null)
    setCloudStats(null)
    setUserRecoveryCode('')
    try { localStorage.removeItem('xeith-recovery-code') } catch {}
    setAchievements([])
    setLeaderboard({ global: [], weekly: [], streak: [] })
    setFriends({ followers: [], following: [], activity: [] })
    setPhotos([])
  }

  const handleFollow = async (targetId) => {
    try {
      await api('/friends/follow', { method: 'POST', body: JSON.stringify({ targetId }) })
      loadFriends()
      loadCloudProfile()
    } catch (e) { setError(e.message) }
  }

  const handleUnfollow = async (targetId) => {
    try {
      await api('/friends/unfollow', { method: 'POST', body: JSON.stringify({ targetId }) })
      loadFriends()
      loadCloudProfile()
    } catch (e) { setError(e.message) }
  }

  const handleSync = async () => {
    try {
      setLoading(true)
      await api('/sync', {
        method: 'POST',
        body: JSON.stringify({
          points, streak, done,
          lessonsCompleted: Object.keys(done).filter(k => k.startsWith('lesson-')).length,
          challengesCompleted: Object.keys(done).filter(k => k.startsWith('daily-') || k.startsWith('week-')).length,
          gamesPlayed: Object.keys(done).filter(k => k.startsWith('game-')).length,
          gamesWon: Object.keys(done).filter(k => k.startsWith('game-') && done[k]).length,
          photosSubmitted: 0,
          factsLearned: Object.keys(done).filter(k => k.startsWith('lesson-')).length
        })
      })
      loadCloudProfile()
      loadLeaderboard('global')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const download = () => {
    const data = {
      local: exportData(),
      cloud: cloudUser ? { profile: cloudUser, stats: cloudStats, achievements } : null,
      exportedAt: new Date().toISOString()
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `xeith-my-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate local stats
  const lessonsDone = Object.keys(done).filter(k => k.startsWith('lesson-')).length
  const challengesDone = Object.keys(done).filter(k => k.startsWith('daily-') || k.startsWith('week-')).length
  const gamesDone = Object.keys(done).filter(k => k.startsWith('game-')).length

  const tabs = [
    { id: 'profile', label: t('My XEITH'), icon: '👤' },
    { id: 'leaderboard', label: t('Leaderboards'), icon: '🏆' },
    { id: 'achievements', label: t('Achievements'), icon: '🏅' },
    { id: 'friends', label: t('Friends'), icon: '👥' },
    { id: 'photos', label: t('Photo Challenges'), icon: '📸' },
    { id: 'data', label: t('Data & Privacy'), icon: '🔒' }
  ]

  return (
    <>
      <h1>{t('My XEITH')}</h1>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? '' : 'ghost'}`}
            onClick={() => setTab(t.id)}
            style={{ fontSize: '0.85rem', padding: '8px 12px' }}
          >
            <span style={{ marginRight: '6px' }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="warn" style={{ marginBottom: '16px' }}>
          <span className="warn-icon">⚠</span>
          <div><p>{error}</p></div>
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === 'profile' && (
        <>
          <div style={{ marginBottom: '18px' }}>
            <PlayerHeroCard
              displayName={cloudUser?.displayName || profile?.name || t('XEITH Steward')}
              points={Math.max(points, cloudStats?.points || 0)}
              streak={Math.max(streak, cloudStats?.streak || 0)}
              done={done}
              cloudStats={cloudStats}
            />
          </div>
          {!profile && !cloudUser ? (
            <div className="account-split-grid">
            <section className="card glass">
              <div>
                <p className="eyebrow">{t('New here')}</p>
                <h3>{t('Local Profile & Cloud Sign-Up')}</h3>
                <p className="muted">{t('Keep data on this device only, or link to the cloud for leaderboards, streaks, and friends.')}</p>
                <label htmlFor="n">{t('Display name')}</label>
                <input id="n" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder={t('Your name')} />
                <label htmlFor="e">{t('Email (required for cloud)')}</label>
                <input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('For cross-device sign-in')} />
                <label htmlFor="pw">{t('Password (required for cloud, min 6 chars)')}</label>
                <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
              </div>
              <div className="row" style={{ marginTop: '12px' }}>
                <button className="btn ghost" disabled={!name.trim() || loading} onClick={() => createProfile(name, email)}>
                  {t('Create local profile')}
                </button>
                <button className="btn" disabled={!name.trim() || !email.trim() || password.length < 6 || loading} onClick={handleCloudRegister}>
                  {t('Create & link to cloud')}
                </button>
              </div>
            </section>
            <section className="card glass">
              <div>
                <p className="eyebrow">{t('Returning')}</p>
                <h3>{t('Cloud Account Sign-In')}</h3>
                <p className="muted">{t('Sign in with your email and password to restore your points, streak, and friends on any device.')}</p>

                <label htmlFor="le">{t('Email')}</label>
                <input id="le" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                <label htmlFor="lpw">{t('Password')}</label>
                <input id="lpw" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••" />
                <div className="row" style={{ marginTop: '12px' }}>
                  <button className="btn" disabled={!loginEmail.trim() || !loginPassword || loading} onClick={() => handleCloudLogin(false)}>
                    {t('Sign in & restore data')}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                  onClick={() => setShowRecoveryLogin((v) => !v)}
                >
                  {showRecoveryLogin ? t('Hide Recovery Code sign-in') : t('Or sign in with a Recovery Code')}
                </button>
                {showRecoveryLogin && (
                  <div style={{ marginTop: '10px' }}>
                    <label htmlFor="rc">{t('Recovery Code')}</label>
                    <input id="rc" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                    <div className="row">
                      <button className="btn" disabled={!recoveryCode.trim() || loading} onClick={() => handleCloudLogin(true)}>
                        {t('Sign in with Recovery Code')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
            </div>
          ) : (
            <div className="account-split-grid">
              {/* Local profile section */}
              {profile && !cloudUser && (
                <section className="card glass">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--g-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      {profile.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>{profile.name}</h3>
                      {profile.email && <p className="muted">{maskEmail(profile.email)}</p>}
                      <p className="muted">{t('Local only · Created {{date}}', { date: new Date(profile.created * 864e5).toLocaleDateString() })}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div className="stat"><b>{points}</b><span>{t('Points')}</span></div>
                    <div className="stat"><b>{streak}</b><span>{t('Streak')}</span></div>
                    <div className="stat"><b>{lessonsDone + challengesDone + gamesDone}</b><span>{t('Completed')}</span></div>
                  </div>
                  <div className="row" style={{ marginTop: '16px' }}>
                    <button className="btn" onClick={handleCloudRegister} disabled={loading}>{t('Link to cloud for leaderboards')}</button>
                    <button className="btn ghost" onClick={signOut}>{t('Sign out')}</button>
                  </div>
                </section>
              )}

              {/* Cloud profile section */}
              {cloudUser && (
                <section className="card glass">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: 700 }}>
                      {cloudUser.displayName[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 4px' }}>{cloudUser.displayName}</h3>
                      <p className="muted" style={{ margin: 0 }}>{t('Cloud account · Synced across devices')}</p>
                    </div>
                    {!authToken && (
                      <button className="btn" onClick={handleCloudRegister} disabled={loading}>{t('Link account')}</button>
                    )}
                  </div>

                  {cloudStats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
                      <div className="stat"><b>{cloudStats.points || 0}</b><span>{t('Points')}</span></div>
                      <div className="stat"><b>{cloudStats.streak || 0}</b><span>{t('Streak')}</span></div>
                      <div className="stat"><b>{cloudStats.longestStreak || 0}</b><span>{t('Best Streak')}</span></div>
                      <div className="stat"><b>{cloudStats.challengesCompleted || 0}</b><span>{t('Challenges')}</span></div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
                    <div className="stat"><b>{cloudStats?.lessonsCompleted || 0}</b><span>{t('Lessons')}</span></div>
                    <div className="stat"><b>{cloudStats?.gamesWon || 0}</b><span>{t('Games Won')}</span></div>
                    <div className="stat"><b>{cloudStats?.photosSubmitted || 0}</b><span>{t('Photos')}</span></div>
                  </div>

                  <div className="row">
                    <button className="btn" onClick={handleSync} disabled={loading}>{t('Sync local progress')}</button>
                    <button className="btn ghost" onClick={handleCloudSignOut}>{t('Sign out')}</button>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'var(--g-soft)', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>{t('Your Recovery Code')}</strong>
                        <span className="muted" style={{ fontSize: '0.78rem' }}>{t('Save this code to sign in and restore your data on any device.')}</span>
                      </div>
                      <button className="btn ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={copyRecoveryCode}>
                        {copiedCode ? '✓ ' + t('Copied') : t('Copy Code')}
                      </button>
                    </div>
                    {userRecoveryCode ? (
                      <code style={{ display: 'block', marginTop: '8px', fontSize: '0.82rem', wordBreak: 'break-all', opacity: 0.9 }}>
                        {userRecoveryCode}
                      </code>
                    ) : (
                      <span className="muted" style={{ display: 'block', marginTop: '8px', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        {t('Available upon registration or recovery login')}
                      </span>
                    )}
                  </div>
                </section>
              )}

              {/* Local stats when cloud linked */}
              {profile && cloudUser && (
                <section className="card glass">
                  <h3>{t('Local progress (not yet synced)')}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div className="stat"><b>{points}</b><span>{t('Points')}</span></div>
                    <div className="stat"><b>{streak}</b><span>{t('Streak')}</span></div>
                    <div className="stat"><b>{lessonsDone}</b><span>{t('Lessons')}</span></div>
                    <div className="stat"><b>{challengesDone + gamesDone}</b><span>{t('Challenges + Games')}</span></div>
                  </div>
                  <button className="btn" onClick={handleSync} disabled={loading} style={{ marginTop: '12px', width: '100%' }}>{t('Sync to cloud now')}</button>
                </section>
              )}
            </div>
          )}

          {/* Achievements preview on profile tab */}
          {cloudUser && achievements.length > 0 && (
            <section className="card glass" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3>{t('Recent Achievements')}</h3>
                <button className="btn ghost" onClick={() => setTab('achievements')} style={{ fontSize: '0.8rem' }}>{t('View all')}</button>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {achievements.slice(0, 5).map(a => (
                  <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', minWidth: '80px' }}>
                    <span style={{ fontSize: '2rem' }}>{a.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>{t(a.name)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--amber)' }}>+{a.points_reward}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* LEADERBOARD TAB */}
      {tab === 'leaderboard' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <PlayerHeroCard
              displayName={cloudUser?.displayName || profile?.name || t('XEITH Steward')}
              points={Math.max(points, cloudStats?.points || 0)}
              streak={Math.max(streak, cloudStats?.streak || 0)}
              done={done}
              cloudStats={cloudStats}
              compact
            />
          </div>
          {!authToken && (
            <section className="card glass" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px' }}>☁️ {t('Playing in Local Mode')}</h4>
                <p className="muted" style={{ margin: 0, fontSize: '0.84rem' }}>
                  {t('Your local score ({{pts}} pts) is shown below. Link a free cloud account in My XEITH to publish your Player Card to the live global rankings!', { pts: points })}
                </p>
              </div>
              <button className="btn primary" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => setTab('profile')}>
                {t('Link Cloud Account →')}
              </button>
            </section>
          )}
          {true && (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button className={`btn ${leaderboard.global.length > 0 ? '' : 'ghost'}`} onClick={() => loadLeaderboard('global')}>{t('Global')}</button>
                <button className={`btn ${leaderboard.weekly.length > 0 ? '' : 'ghost'}`} onClick={() => loadLeaderboard('weekly')}>{t('This Week')}</button>
                <button className={`btn ${leaderboard.streak.length > 0 ? '' : 'ghost'}`} onClick={() => loadLeaderboard('streak')}>{t('Streaks')}</button>
                {authToken && (
                  <button className="btn ghost" onClick={handleSync} disabled={loading} style={{ marginLeft: 'auto' }}>
                    🔄 {t('Sync My Latest Score')}
                  </button>
                )}
              </div>

              {leaderboard.global.length > 0 && (
                <section className="card glass">
                  <h3>{t('Global Leaderboard')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 8px' }}>#{t('Rank')}</th>
                          <th style={{ padding: '12px 8px' }}>{t('Player & Pathway Card')}</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>⭐ {t('Points')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.global.slice(0, 50).map((entry, i) => {
                          const entryRank = getRankByPoints(entry.points || 0)
                          return (
                            <tr key={entry.user_id} style={{ borderBottom: '1px solid var(--line)', background: entry.user_id === cloudUser?.id ? 'rgba(214,168,75,0.1)' : undefined }}>
                              <td style={{ padding: '12px 8px', fontWeight: 700, color: i < 3 ? 'var(--amber)' : 'var(--navy)' }}>
                                {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : entry.rank}
                              </td>
                              <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: entryRank.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                  {entry.display_name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontWeight: entry.user_id === cloudUser?.id ? 700 : 600 }}>
                                    {entry.display_name}{entry.user_id === cloudUser?.id ? ` ${t('(You)')}` : ''}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: entryRank.accent }}>
                                    {entryRank.icon} {t(entryRank.title)} · {t(entryRank.badge)}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>{entry.points}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {leaderboard.weekly.length > 0 && (
                <section className="card glass" style={{ marginTop: '16px' }}>
                  <h3>{t('Weekly Leaderboard')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 8px' }}>#{t('Rank')}</th>
                          <th style={{ padding: '12px 8px' }}>{t('Player')}</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>⭐ {t('Weekly Points')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.weekly.slice(0, 50).map((entry, i) => (
                          <tr key={entry.user_id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: i < 3 ? 'var(--amber)' : 'var(--navy)' }}>{entry.rank}</td>
                            <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--g-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                {entry.display_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span>{entry.display_name}</span>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{entry.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {leaderboard.streak.length > 0 && (
                <section className="card glass" style={{ marginTop: '16px' }}>
                  <h3>{t('Longest Streaks')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 8px' }}>#{t('Rank')}</th>
                          <th style={{ padding: '12px 8px' }}>{t('Player')}</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>🔥 {t('Streak')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.streak.slice(0, 50).map((entry, i) => (
                          <tr key={entry.user_id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: i < 3 ? 'var(--amber)' : 'var(--navy)' }}>{entry.rank}</td>
                            <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--g-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                {entry.display_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span>{entry.display_name}</span>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{entry.streak} {t('days')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {(leaderboard.global.length === 0 && leaderboard.weekly.length === 0 && leaderboard.streak.length === 0) && (
                <section className="card glass" style={{ padding: '24px 20px' }}>
                  <h3>{t('Your Current Standing (Local Preview)')}</h3>
                  <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>
                    {t('Showing your active stewardship profile. Sync to the cloud to compete with other players across Nigeria!')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', background: 'rgba(214,168,75,0.12)', border: '1px solid rgba(214,168,75,0.35)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--amber)' }}>🥇 1</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{cloudUser?.displayName || profile?.name || t('XEITH Steward')} ({t('You')})</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 700 }}>
                          {getRankByPoints(points).icon} {t(getRankByPoints(points).title)} · {t(getRankByPoints(points).badge)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800 }}>⭐ {Math.max(points, cloudStats?.points || 0)} {t('pts')}</div>
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {/* ACHIEVEMENTS TAB */}
      {tab === 'achievements' && (
        <>
          <div style={{ marginBottom: '18px' }}>
            <PlayerHeroCard
              displayName={cloudUser?.displayName || profile?.name || t('XEITH Steward')}
              points={Math.max(points, cloudStats?.points || 0)}
              streak={Math.max(streak, cloudStats?.streak || 0)}
              done={done}
              cloudStats={cloudStats}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              ['all', '🏅 ' + t('All Cards')],
              ['challenges', '🔥 ' + t('Challenges')],
              ['learning', '📚 ' + t('Classroom')],
              ['game', '🎮 ' + t('AMR Lab')],
              ['streak', '⚡ ' + t('Streaks')]
            ].map(([catId, label]) => (
              <button
                key={catId}
                className={`btn ${achFilter === catId ? '' : 'ghost'}`}
                onClick={() => setAchFilter(catId)}
                style={{ fontSize: '0.82rem', padding: '7px 14px' }}
              >
                {label}
              </button>
            ))}
          </div>

          <AchievementCardsGrid
            done={done}
            points={Math.max(points, cloudStats?.points || 0)}
            streak={Math.max(streak, cloudStats?.streak || 0)}
            cloudStats={cloudStats}
            playerName={cloudUser?.displayName || profile?.name || ''}
            filterCategory={achFilter}
          />
        </>
      )}

      {/* FRIENDS TAB */}
      {tab === 'friends' && (
        <>
          {authToken ? (
            <>
              <section className="card glass">
                <h3>{t('Your Network')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
                  <div className="stat"><b>{friends.followers.length}</b><span>{t('Followers')}</span></div>
                  <div className="stat"><b>{friends.following.length}</b><span>{t('Following')}</span></div>
                </div>
                <div className="row">
                  <button className="btn" onClick={loadFriends} disabled={loading}>{t('Refresh')}</button>
                </div>
              </section>

              {friends.following.length > 0 && (
                <section className="card glass" style={{ marginTop: '16px' }}>
                  <h3>{t('Following')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {friends.following.slice(0, 10).map(f => (
                      <div key={f.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                          {f.display_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{f.display_name}</div>
                          <div className="muted" style={{ fontSize: '0.8rem' }}>{t('Followed')} {new Date(f.created_at * 1000).toLocaleDateString()}</div>
                        </div>
                        <button className="btn ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleUnfollow(f.id)}>{t('Unfollow')}</button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {friends.followers.length > 0 && (
                <section className="card glass" style={{ marginTop: '16px' }}>
                  <h3>{t('Followers')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {friends.followers.slice(0, 10).map(f => (
                      <div key={f.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--g-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                          {f.display_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{f.display_name}</div>
                          <div className="muted" style={{ fontSize: '0.8rem' }}>{t('Followed you')} {new Date(f.created_at * 1000).toLocaleDateString()}</div>
                        </div>
                        <button className="btn" style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'var(--g-sky)' }} onClick={() => handleFollow(f.id)}>{t('Follow back')}</button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {friends.activity.length > 0 && (
                <section className="card glass" style={{ marginTop: '16px' }}>
                  <h3>{t('Friends Activity')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {friends.activity.slice(0, 15).map(a => (
                      <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--g-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: 700 }}>
                          {a.display_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{a.display_name}</div>
                          <div className="muted" style={{ fontSize: '0.8rem' }}>
                            {(() => {
                              const typeLabels = {
                                lesson_complete: t('completed a lesson'),
                                challenge_complete: t('completed a challenge'),
                                game_win: t('won a game'),
                                achievement_unlock: t('unlocked an achievement'),
                                photo_submit: t('submitted a photo'),
                                streak_milestone: t('reached a streak milestone')
                              }
                              return typeLabels[a.type] || a.type
                            })()}
                            <span style={{ margin: '0 8px' }}>·</span>
                            {new Date(a.created_at * 1000).toLocaleString()}
                          </div>
                          {a.points > 0 && <span style={{ color: 'var(--amber)', fontWeight: 700 }}>+{a.points}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(friends.following.length === 0 && friends.followers.length === 0 && friends.activity.length === 0) && (
                <section className="card glass" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '16px' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</p>
                  <h3>{t('No friends yet')}</h3>
                  <p className="muted" style={{ marginBottom: '20px' }}>{t('Follow other learners to see their activity and compete on leaderboards.')}</p>
                </section>
              )}
            </>
          ) : (
            <section className="card glass" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</p>
              <h3>{t('Friends require cloud account')}</h3>
              <p className="muted" style={{ marginBottom: '20px' }}>{t('Link your account to follow friends, see their activity, and build your network.')}</p>
              <button className="btn" onClick={() => setTab('profile')}>{t('Go to Profile to Link')}</button>
            </section>
          )}
        </>
      )}

      {/* PHOTOS TAB */}
      {tab === 'photos' && (
        <>
          {authToken ? (
            <>
              <section className="card glass">
                <h3>{t('Your Photo Submissions')}</h3>
                {photos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                    {photos.map(p => (
                      <div key={p.id} className="card" style={{ textAlign: 'center', padding: '12px' }}>
                        <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '12px', background: 'var(--g-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden', marginBottom: '8px' }}>
                          {p.image_url.startsWith('data:') || p.image_url.startsWith('http') ? (
                            <img src={p.image_url} alt={t('Submission')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            '📷'
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                          {p.status === 'approved' ? '✅' : p.status === 'rejected' ? '❌' : '⏳'}
                          {t(p.status)}
                        </div>
                        <div className="muted" style={{ fontSize: '0.75rem' }}>{p.challenge_date}</div>
                        {p.caption && <div className="muted" style={{ fontSize: '0.7rem', marginTop: '4px' }}>"{p.caption}"</div>}
                        {p.points_awarded > 0 && <div style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.8rem', marginTop: '4px' }}>+{p.points_awarded} pts</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted" style={{ textAlign: 'center', padding: '20px' }}>{t('No photo submissions yet. Complete daily photo challenges to add some!')}</p>
                )}
              </section>

              <section className="card glass" style={{ marginTop: '16px' }}>
                <h3>{t('How Photo Challenges Work')}</h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2 }}>
                  <li>{t('Daily photo challenge prompts appear in the Challenges section')}</li>
                  <li>{t('Take a real photo matching the prompt (handwashing, clean water, etc.)')}</li>
                  <li>{t('Submit for review — approved photos earn bonus points')}</li>
                  <li>{t('Approved photos may be featured (anonymously) for community learning')}</li>
                  <li>{t('Photos are stored securely and never shared without consent')}</li>
                </ul>
              </section>
            </>
          ) : (
            <section className="card glass" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px' }}>📸</p>
              <h3>{t('Photo Challenges require cloud account')}</h3>
              <p className="muted" style={{ marginBottom: '20px' }}>{t('Link your account to submit and track photo challenge submissions.')}</p>
              <button className="btn" onClick={() => setTab('profile')}>{t('Go to Profile to Link')}</button>
            </section>
          )}
        </>
      )}

      {/* DATA & PRIVACY TAB */}
      {tab === 'data' && (
        <>
          <section className="card glass">
            <h3>{t('Your Data')}</h3>
            <p>{t('You can download everything stored about you, or delete it all. Deleting removes your profile, points, streak and language choice from this device.')}</p>
            <div className="row">
              <button className="btn" onClick={download}>{t('Download my data (JSON)')}</button>
              <button className="btn ghost" onClick={() => setShowDeleteConfirm(true)}>{t('Delete my local data')}</button>
            </div>
          </section>

          {cloudUser && (
            <section className="card glass" style={{ marginTop: '16px', border: '2px solid var(--coral)' }}>
              <h3 style={{ color: 'var(--coral)' }}>⚠️ {t('Cloud Account Data')}</h3>
              <p>{t('Your cloud account stores additional data: profile, leaderboard position, friends, achievements, photo submissions, and activity feed.')}</p>
              <p className="muted">{t('To delete cloud data, contact support or use the account deletion option in the cloud dashboard (coming soon).')}</p>
              <button className="btn" style={{ background: 'var(--g-coral)' }} onClick={() => { if (confirm(t('Delete cloud account? This cannot be undone.'))) alert(t('Cloud deletion coming soon. Contact support for now.')) }}>{t('Request cloud account deletion')}</button>
            </section>
          )}

          <section className="card glass" style={{ marginTop: '16px' }}>
            <h3>{t('Privacy Notes')}</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2 }}>
              <li>{t('Local data never leaves your device unless you link a cloud account')}</li>
              <li>{t('Cloud data is encrypted in transit and at rest')}</li>
              <li>{t('We comply with Nigeria Data Protection Act 2023 and GDPR principles')}</li>
              <li>{t('No medical data is collected — this is an educational app only')}</li>
              <li>{t('Photo submissions are reviewed by humans before any public display')}</li>
              <li>{t('You can export or delete your data at any time')}</li>
            </ul>
          </section>

          <section className="card glass" style={{ marginTop: '16px' }}>
            <h3>{t('About XEITH')}</h3>
            <p className="muted">{t('Version 0.2.0 · Built for Code Against Resistance · Babcock University AMR Club')}</p>
            <p className="muted">{t('Education about antimicrobial resistance, not medical advice.')}</p>
          </section>
        </>
      )}

      {showDeleteConfirm && (
        <div className="card glass" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h3>{t('Delete all local data?')}</h3>
            <p className="muted">{t('This removes your profile, points, streak, language choice, and challenge progress from this device. Cloud data (if linked) is not affected.')}</p>
            <div className="row" style={{ justifyContent: 'center', marginTop: '20px' }}>
              <button className="btn" onClick={() => { deleteAll(); setShowDeleteConfirm(false); }}>{t('Yes, delete everything')}</button>
              <button className="btn ghost" onClick={() => setShowDeleteConfirm(false)}>{t('Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}