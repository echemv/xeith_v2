import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Mascot from './Mascot'
import Sidebar from './Sidebar'
import PageLoader from './PageLoader'
import LanguageDropdown from './LanguageDropdown'
import { useTheme, toggleTheme } from '../store'

const PILL_NAV = [
  ['/', 'Home'],
  ['/learn', 'Classroom'],
  ['/play', 'Lab'],
  ['/challenges', 'Challenges'],
  ['/map', 'Map'],
  ['/chat', 'Ask XEITH'],
  ['/account', 'My XEITH']
]

const PIN_STORAGE_KEY = 'xeith-sidebar-pinned'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const { pathname } = useLocation()
  const theme = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem(PIN_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev
      try {
        localStorage.setItem(PIN_STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }

  // Keep the browser chrome colour in step with the active theme's --bg token
  useEffect(() => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta && bg) meta.setAttribute('content', bg)
  }, [theme])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`app-shell ${isPinned ? 'sidebar-pinned' : 'sidebar-floating'}`}>
      {/* Route & Page Loading Indicator */}
      <PageLoader />

      {/* Left Navigation Rail (Floating by default, lockable to side) */}
      <Sidebar isPinned={isPinned} onTogglePin={togglePin} />

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Top Header with Nixtio floating glassmorphic scroll effect */}
        <header className={`top-header ${scrolled ? 'is-scrolled' : ''}`}>
          <div className="top-header-inner">
            <div className="header-brand-wrap">
              <NavLink to="/" className="logo-text" aria-label="XEITH AMR Home">
                <img src="/logo-full.png" alt="XEITH AMR" className="logo-full-img" />
              </NavLink>
            </div>

            {/* Segmented Capsule Nav Tabs (from Dashboard UI reference) */}
            <nav className="pill-nav" aria-label={t('Sections')}>
              {PILL_NAV.map(([to, k]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `pill-nav-item ${isActive ? 'active' : ''}`}
                >
                  {t(k)}
                </NavLink>
              ))}
            </nav>

            {/* Header Right Actions: Stylized Language Switcher & Profile link */}
            <div className="header-actions">
              <LanguageDropdown />

              {/* Mobile only: the rail's theme pill is hidden behind the bottom tab bar */}
              <button
                type="button"
                className="header-theme-btn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('Switch to Light theme') : t('Switch to Dark theme')}
                title={theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>

              <NavLink to="/account" className="header-avatar-btn" title={t('My XEITH')} aria-label={t('My XEITH')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </NavLink>
            </div>
          </div>
        </header>

        <main className="content-container">
          <Outlet />
        </main>

        <footer className="foot">
          <div className="wrap foot-inner">
            {lang !== 'en' && (
              <div className="draft-notice-pill" role="note">
                <span className="draft-pill-icon">⚠️</span>
                <span>{t('Draft translation: not yet reviewed by native speakers or clinicians.')}</span>
              </div>
            )}
            <p className="foot-disclaimer">
              XEITH · {t('Education about antimicrobial resistance, not medical advice. Translations and content are drafts awaiting clinician review.')}
            </p>
          </div>
        </footer>

        {pathname !== '/chat' && <Mascot />}
      </div>
    </div>
  )
}
