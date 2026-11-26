import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGS } from '../i18n'

export default function LanguageDropdown() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const currentCode = i18n.resolvedLanguage || 'en'
  const currentLang = LANGS.find(([code]) => code === currentCode) || LANGS[0]

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  const selectLanguage = (code) => {
    i18n.changeLanguage(code)
    setIsOpen(false)
  }

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="custom-lang-dropdown" ref={menuRef}>
      {/* Stylized Trigger Button */}
      <button
        type="button"
        className={`lang-trigger-btn ${isOpen ? 'is-open' : ''}`}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('Select language')}
        title={t('Select language')}
      >
        <svg
          className="lang-globe-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        <span className="lang-current-label">{currentLang[1]}</span>

        <svg
          className={`lang-chevron-icon ${isOpen ? 'rotate' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Frosted Glass Dropdown Menu */}
      {isOpen && (
        <div className="lang-menu-popover" role="listbox" aria-label={t('Languages')}>
          <div className="lang-menu-header">
            <span>{t('Language')}</span>
          </div>

          <div className="lang-menu-list">
            {LANGS.map(([code, name]) => {
              const isSelected = code === currentCode
              return (
                <button
                  key={code}
                  type="button"
                  className={`lang-menu-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectLanguage(code)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="lang-item-name">{name}</span>
                  {isSelected && (
                    <svg
                      className="lang-check-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
