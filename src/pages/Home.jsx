import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { FACTS } from '../data/facts'
import { dayNumber } from '../store'

const SECTIONS = [
  ['/learn', '📚', tx('The AMR Classroom'), tx('Step-by-step lessons on what AMR is and how to help stop it.')],
  ['/play', '🎮', tx('The AMR Lab'), tx('Be the antibiotic and take on Big B, the resistant bacterium.')],
  ['/challenges', '🔥', tx('Challenges'), tx('Daily and weekly questions. Earn points and build a streak.')],
  ['/map', '🗺️', tx('Map'), tx('Explore AMR information across Nigeria, with sources.')],
  ['/chat', '💬', tx('Ask XEITH'), tx('Chat with the AI assistant about AMR.')],
  ['/account', '👤', tx('My XEITH'), tx('Your points, streak and data controls.')],
]

export default function Home() {
  const { t } = useTranslation()
  const fact = FACTS[dayNumber() % FACTS.length]
  return (
    <>
      <div className="banner"><h1>{t('Your one-stop guide to understanding antimicrobial resistance')}</h1></div>
      <div className="grid">
        {SECTIONS.map(([to, icon, title, desc]) => (
          <Link key={to} to={to} className="tile">
            <span className="tile-icon" aria-hidden="true">{icon}</span>
            <b>{t(title)}</b>
            <span>{t(desc)}</span>
          </Link>
        ))}
      </div>
      <section className="card">
        <p className="eyebrow">{t('Fact of the day')}</p>
        <p className="fact">{t(fact.t)}</p>
        {fact.src && <p className="muted"><a href={fact.src.url} target="_blank" rel="noopener noreferrer">{fact.src.label}</a></p>}
      </section>
      <div className="warn" role="note">
        <span className="warn-icon" aria-hidden="true">!</span>
        <div><p><b>{t('Feeling better? Don’t stop or change your medicine on your own. Ask your prescriber or pharmacist first. They will tell you whether it is safe to stop.')}</b></p><p>{t('Don’t save leftover antibiotics for later or share them with others.')}</p></div>
      </div>
    </>
  )
}
