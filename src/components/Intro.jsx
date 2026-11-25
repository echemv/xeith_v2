import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { INTRO_VIDEO } from '../config'

// Opening animation. Plays once per browser session. Set INTRO_VIDEO in config.js when the XEITH animation is ready.
export default function Intro({ onDone }) {
  const { t } = useTranslation()
  useEffect(() => {
    if (INTRO_VIDEO) return undefined
    const id = setTimeout(onDone, 2600)
    return () => clearTimeout(id)
  }, [onDone])
  return (
    <div className="intro">
      {INTRO_VIDEO
        ? <video src={INTRO_VIDEO} autoPlay muted playsInline onEnded={onDone} onError={onDone} />
        : <div className="wordmark" aria-label="XEITH">{'XEITH'.split('').map((c, i) => <span key={i} aria-hidden="true" style={{ animationDelay: i * 0.18 + 's' }}>{c}</span>)}</div>}
      <button className="skip" onClick={onDone}>{t('Skip')}</button>
    </div>
  )
}
