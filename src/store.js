import { useEffect, useState } from 'react'

// Local-only profile and progress. Nothing leaves the device. Swap for a real account service later (see CLAUDE.md).
const KEY = 'xeith-state'
const THEME_KEY = 'xeith-theme'
const INIT = { profile: null, points: 0, streak: 0, lastActive: null, done: {} }
const read = () => { try { const s = localStorage.getItem(KEY); return s ? { ...INIT, ...JSON.parse(s) } : INIT } catch { return INIT } }
let state = read()
const listeners = new Set()
const commit = (s) => { state = s; try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage unavailable */ } listeners.forEach((f) => f()) }

export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch { /* storage unavailable */ }
  return 'light'
}

let currentTheme = getInitialTheme()
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', currentTheme)
}

export function useTheme() {
  const [, set] = useState(0)
  useEffect(() => { const f = () => set((x) => x + 1); listeners.add(f); return () => listeners.delete(f) }, [])
  return currentTheme
}

export function setTheme(theme) {
  currentTheme = theme === 'dark' ? 'dark' : 'light'
  try { localStorage.setItem(THEME_KEY, currentTheme) } catch { /* storage unavailable */ }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', currentTheme)
  }
  listeners.forEach((f) => f())
}

export function toggleTheme() {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark')
}

export const ymd = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
export function weekNumber(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 864e5 + 1) / 7)
}
export const dayNumber = (d = new Date()) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5)

export function useApp() {
  const [, set] = useState(0)
  useEffect(() => { const f = () => set((x) => x + 1); listeners.add(f); return () => listeners.delete(f) }, [])
  return state
}
// Give points once per id. Any award counts as activity today and keeps the streak going.
export function award(points, id) {
  if (id && state.done[id]) return
  const t = ymd(), yest = ymd(new Date(Date.now() - 864e5))
  const streak = state.lastActive === t ? state.streak : state.lastActive === yest ? state.streak + 1 : 1
  commit({ ...state, points: state.points + points, streak, lastActive: t, done: id ? { ...state.done, [id]: true } : state.done })
}
export const createProfile = (name, email) => commit({ ...state, profile: { name: name.trim(), email: email.trim(), created: ymd() } })
export const signOut = () => commit({ ...state, profile: null })
export const exportData = () => JSON.stringify({ exportedAt: new Date().toISOString(), ...state }, null, 2)
export function deleteAll() {
  try { ['xeith-state', 'xeith-lang', 'xeith-seen'].forEach((k) => localStorage.removeItem(k)) } catch { /* storage unavailable */ }
  commit(INIT)
}
export function maskEmail(e) {
  if (!e || !e.includes('@')) return ''
  const [u, d] = e.split('@'); return u.slice(0, 1) + '*'.repeat(Math.max(2, u.length - 1)) + '@' + d
}
