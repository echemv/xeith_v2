import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LANGS } from '../i18n'
import Mascot from './Mascot'
import Sidebar from './Sidebar'
import PageLoader from './PageLoader'
import LanguageDropdown from './LanguageDropdown'

const PILL_NAV = [
  ['/', 'Home'],
  ['/learn', 'Classroom'],
  ['/play', 'Lab'],
  ['/challenges', 'Challenges'],
  ['/map', 'Map'],
  ['/chat', 'Ask AI'],
  ['/account', 'Account']
]

const PIN_STORAGE_KEY = 'xeith-sidebar-pinned'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const { pathname } = useLocation()
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

              <NavLink to="/account" className="header-avatar-btn" title={t('Account')} aria-label={t('Account')}>
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
              XEITH · Education about antimicrobial resistance, not medical advice. Translations and content are drafts awaiting clinician review.
            </p>
          </div>
        </footer>

        {pathname !== '/chat' && <Mascot />}
      </div>
    </div>
  )
}
