import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGS } from '../i18n'
import { WELCOME_INTERVAL_MS } from '../config'

const POS = [[8, 16], [68, 8], [80, 46], [58, 76], [10, 68], [36, 86]] // bubble positions, in percent

// First-visit screen: the headline cycles through the languages; tap a bubble to choose one.
export default function Welcome({ onDone }) {
  const { t, i18n } = useTranslation()
  const _use = t
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % LANGS.length), WELCOME_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])
  const phrase = i18n.getFixedT(LANGS[i][0])('Learn AMR in a language you understand')
  const pick = (c) => { i18n.changeLanguage(c); onDone() }
  return (
    <div className="welcome">
      {LANGS.map(([c, n], k) => (
        <button key={c} className="bubble" style={{ left: POS[k][0] + '%', top: POS[k][1] + '%', animationDelay: k * 0.7 + 's' }} onClick={() => pick(c)}>{n}</button>
      ))}
      <div className="welcome-mid">
        <h1 key={i} aria-label={phrase}>{[...phrase].map((ch, k) => <span key={k} aria-hidden="true" style={{ animationDelay: k * 16 + 'ms' }}>{ch === ' ' ? '\u00a0' : ch}</span>)}</h1>
        <p className="muted">{t('Choose your language')}</p>
        <button className="btn" onClick={() => pick('en')}>Continue in English</button>
      </div>
    </div>
  )
}
