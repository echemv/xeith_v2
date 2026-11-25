import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LANGS } from '../i18n'
import Mascot from './Mascot'

const ITEMS = [['/', 'Home'], ['/learn', 'The AMR Classroom'], ['/play', 'The AMR Lab'], ['/challenges', 'Challenges'], ['/map', 'Map'], ['/chat', 'Ask XEITH'], ['/account', 'My XEITH']]

export default function Layout() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage
  const { pathname } = useLocation()
  return (
    <>
      <header className="top">
        <div className="wrap topin">
          <NavLink to="/" className="logo">XEITH</NavLink>
          <select className="langsel" aria-label={t('Language')} value={lang} onChange={(e) => i18n.changeLanguage(e.target.value)}>
            {LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
          </select>
          <nav aria-label={t('Main')}>{ITEMS.map(([to, k]) => <NavLink key={to} to={to} end={to === '/'}>{t(k)}</NavLink>)}</nav>
        </div>
      </header>
      {lang !== 'en' && <div className="draft"><div className="wrap">{t('Draft translation: not yet reviewed by native speakers or clinicians.')}</div></div>}
      <main className="wrap"><Outlet /></main>
      <footer className="foot"><div className="wrap">XEITH · Education about antimicrobial resistance, not medical advice. Translations and content are drafts awaiting review.</div></footer>
      {pathname !== '/chat' && <Mascot />}
    </>
  )
}
