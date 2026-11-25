import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp, createProfile, signOut, exportData, deleteAll, maskEmail } from '../store'

const API_BASE = '/api/account'

export default function Account() {
  const { t, i18n } = useTranslation()
  const { profile, points, streak, done } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
    if (authToken) {
      loadCloudProfile()
      loadLeaderboard('global')
      loadLeaderboard('weekly')
      loadLeaderboard('streak')
      loadFriends()
      loadPhotos()
    }
  }, [authToken, loadCloudProfile, loadLeaderboard, loadFriends, loadPhotos])

  const handleCloudRegister = async () => {
    if (!name.trim()) return
    try {
      setLoading(true)
      const userId = crypto.randomUUID()
      const avatarSeed = crypto.randomUUID()
      await api('/register', {
        method: 'POST',
        body: JSON.stringify({ userId, displayName: name.trim(), email, language: i18n.language, avatarSeed })
      })
      setAuthToken(userId)
      setCloudUser({ id: userId, displayName: name.trim(), avatarSeed, language: i18n.language })
      setName('')
      setEmail('')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleCloudSignOut = () => {
    setAuthToken(null)
    setCloudUser(null)
    setCloudStats(null)
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
          {!profile && !cloudUser ? (
            <section className="card glass">
              <h3>{t('Create your local profile')}</h3>
              <p className="muted">{t('Everything stays on this device. Link to cloud later for leaderboards and friends.')}</p>
              <label htmlFor="n">{t('Display name')}</label>
              <input id="n" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder={t('Your name')} />
              <label htmlFor="e">{t('Email (optional)')}</label>
              <input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('For account recovery')} />
              <div className="row">
                <button className="btn" disabled={!name.trim() || loading} onClick={() => createProfile(name, email)}>
                  {t('Create local profile')}
                </button>
                <button className="btn" disabled={!name.trim() || loading} onClick={handleCloudRegister}>
                  {t('Create & link to cloud')}
                </button>
              </div>
            </section>
          ) : (
            <>
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
            </>
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
          {authToken ? (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button className={`btn ${leaderboard.global.length > 0 ? '' : 'ghost'}`} onClick={() => loadLeaderboard('global')}>{t('Global')}</button>
                <button className={`btn ${leaderboard.weekly.length > 0 ? '' : 'ghost'}`} onClick={() => loadLeaderboard('weekly')}>{t('This Week')}</button>
                <button className={`btn ${leaderboard.streak.length > 0 ? '' : 'ghost'}`} onClick={() => loadLeaderboard('streak')}>{t('Streaks')}</button>
              </div>

              {leaderboard.global.length > 0 && (
                <section className="card glass">
                  <h3>{t('Global Leaderboard')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 8px' }}>#{t('Rank')}</th>
                          <th style={{ padding: '12px 8px' }}>{t('Player')}</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>⭐ {t('Points')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.global.slice(0, 50).map((entry, i) => (
                          <tr key={entry.user_id} style={{ borderBottom: '1px solid var(--line)', background: entry.user_id === cloudUser?.id ? 'rgba(214,168,75,0.1)' : undefined }}>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: i < 3 ? 'var(--amber)' : 'var(--navy)' }}>{entry.rank}</td>
                            <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                {entry.display_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span style={{ fontWeight: entry.user_id === cloudUser?.id ? 700 : 500 }}>{entry.display_name}{entry.user_id === cloudUser?.id ? ` ${t('(You)')}` : ''}</span>
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{entry.points}</td>
                          </tr>
                        ))}
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
                <section className="card glass" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</p>
                  <h3>{t('No leaderboard data yet')}</h3>
                  <p className="muted">{t('Be the first to climb the ranks! Complete challenges and games to earn points.')}</p>
                </section>
              )}
            </>
          ) : (
            <section className="card glass" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</p>
              <h3>{t('Leaderboards require cloud account')}</h3>
              <p className="muted" style={{ marginBottom: '20px' }}>{t('Link your account to compete globally, weekly, and for longest streaks.')}</p>
              <button className="btn" onClick={() => setTab('profile')}>{t('Go to Profile to Link')}</button>
            </section>
          )}
        </>
      )}

      {/* ACHIEVEMENTS TAB */}
      {tab === 'achievements' && (
        <>
          {authToken ? (
            achievements.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {['learning', 'streak', 'game', 'photo', 'social'].map(cat => (
                    <button key={cat} className="btn ghost" style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{t(cat)}</button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                  {achievements.map(a => (
                    <div key={a.id} className={`card glass ${a.unlocked_at ? '' : 'locked'}`} style={{ textAlign: 'center', padding: '20px 12px', opacity: a.unlocked_at ? 1 : 0.5, transition: 'all 0.2s', border: a.unlocked_at ? '2px solid var(--amber)' : '1px solid var(--line)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{a.icon}</div>
                      <div style={{ fontWeight: 600, marginBottom: '4px', minHeight: '2.5em' }}>{t(a.name)}</div>
                      <div className="muted" style={{ fontSize: '0.75rem', marginBottom: '8px', minHeight: '2.5em' }}>{t(a.description)}</div>
                      <div style={{ color: a.unlocked_at ? 'var(--amber)' : 'var(--muted)', fontWeight: 700 }}>
                        {a.unlocked_at ? `✅ ${t('Unlocked')} ${new Date(a.unlocked_at * 1000).toLocaleDateString()}` : `🔒 ${t('Locked')}`}
                      </div>
                      <div style={{ color: 'var(--amber)', fontSize: '0.8rem', marginTop: '4px' }}>+{a.points_reward} {t('pts')}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <section className="card glass" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🏅</p>
                <h3>{t('No achievements yet')}</h3>
                <p className="muted">{t('Complete lessons, challenges, and games to unlock achievements.')}</p>
              </section>
            )
          ) : (
            <section className="card glass" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '3rem', marginBottom: '16px' }}>🏅</p>
              <h3>{t('Achievements require cloud account')}</h3>
              <p className="muted" style={{ marginBottom: '20px' }}>{t('Link your account to track and unlock achievements across devices.')}</p>
              <button className="btn" onClick={() => setTab('profile')}>{t('Go to Profile to Link')}</button>
            </section>
          )}
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