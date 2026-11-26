import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme, setTheme } from '../store'

const NAV_ITEMS = [
  {
    to: '/',
    labelKey: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    to: '/learn',
    labelKey: 'The AMR Classroom',
    shortLabel: 'Classroom',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
        <path d="M6 6h10"/>
        <path d="M6 10h10"/>
      </svg>
    )
  },
  {
    to: '/play',
    labelKey: 'The AMR Lab',
    shortLabel: 'Lab',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.31L4.69 17.5A2 2 0 0 0 6.34 20.5h11.32a2 2 0 0 0 1.65-3L14 9.31V2"/>
        <line x1="8.5" y1="2" x2="15.5" y2="2"/>
        <line x1="7" y1="14.5" x2="17" y2="14.5"/>
      </svg>
    )
  },
  {
    to: '/challenges',
    labelKey: 'Challenges',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  {
    to: '/map',
    labelKey: 'Map',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    )
  },
  {
    to: '/chat',
    labelKey: 'Ask XEITH',
    shortLabel: 'Ask AI',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  },
  {
    to: '/account',
    labelKey: 'My XEITH',
    shortLabel: 'Account',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )
  }
]

export default function Sidebar({ isPinned, onTogglePin }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <aside
      className={`nav-rail ${isPinned ? 'is-pinned' : 'is-floating'}`}
      aria-label={t('Primary Navigation')}
    >
      {/* Top Brand Glyph & Pin Toggle */}
      <div className="rail-top-group">
        <NavLink to="/" className="rail-logo" title="XEITH AMR" aria-label="XEITH Home">
          <img src="/logo-icon.png" alt="XEITH" className="rail-logo-img" />
        </NavLink>

        {/* Lock to side toggle button */}
        <button
          type="button"
          onClick={onTogglePin}
          className={`rail-pin-btn ${isPinned ? 'pinned' : ''}`}
          title={isPinned ? t('Unlock to floating bar') : t('Lock to side')}
          aria-label={isPinned ? t('Unlock to floating bar') : t('Lock to side')}
        >
          {isPinned ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
          )}
          <span className="rail-tooltip">{isPinned ? t('Floating bar') : t('Lock to side')}</span>
        </button>
      </div>

      {/* Main navigation icons */}
      <nav className="rail-menu">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            title={t(item.labelKey)}
            aria-label={t(item.labelKey)}
          >
            <span className="rail-icon">{item.icon}</span>
            <span className="rail-tooltip">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Light / Dark Mode Toggle Pill (from Image 1 bottom-left) */}
      <div className="rail-theme-toggle" role="group" aria-label={t('Theme Toggle')}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
          aria-label={t('Switch to Light theme')}
          title={t('Light Mode')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
          aria-label={t('Switch to Dark theme')}
          title={t('Dark Mode')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
