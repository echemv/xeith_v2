import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp, award } from '../store'
import data from '../data/caseFiles.json'
import '../styles/challenge-games.css'

const LEVEL_MULT = { beginner: 1, intermediate: 1.5, expert: 2 }
const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' }
const casePoints = (c, firstTry) => Math.round((10 + 5 * firstTry) * (LEVEL_MULT[c.level] || 1))

function CasePlayer({ file, onExit }) {
  const { t } = useTranslation()
  const { done } = useApp()
  const doneId = 'casefile-' + file.id
  // step: -1 = intro, 0..n-1 = decisions, n = summary
  const [step, setStep] = useState(-1)
  const [picked, setPicked] = useState(null)
  const [tried, setTried] = useState([])
  const [firstTry, setFirstTry] = useState(0)
  const [earned, setEarned] = useState(null)
  const total = file.steps.length
  const current = file.steps[step]
  const choice = current && picked !== null ? current.choices[picked] : null

  const choose = (i) => {
    if (picked !== null || tried.includes(i)) return
    setPicked(i)
    if (current.choices[i].good && tried.length === 0) setFirstTry((n) => n + 1)
  }

  const rethink = () => {
    setTried((x) => [...x, picked])
    setPicked(null)
  }

  const next = () => {
    const n = step + 1
    setPicked(null)
    setTried([])
    if (n === total) {
      const pts = casePoints(file, firstTry)
      if (!done[doneId]) { award(pts, doneId); setEarned(pts) }
    }
    setStep(n)
  }

  return (
    <div className="cf-player">
      <div className="cf-top">
        <button className="cg-btn ghost small" onClick={onExit}>{t('All cases')}</button>
        <ol className="cf-progress" aria-label={t('Decision {{n}} of {{total}}', { n: Math.max(0, Math.min(step + 1, total)), total })}>
          {file.steps.map((_, i) => (
            <li key={i} className={`cf-pip ${i < step ? 'is-done' : i === step ? 'is-current' : ''}`} />
          ))}
        </ol>
      </div>

      <div key={step + '-' + tried.length} className="cf-step">
        {step === -1 && (
          <>
            <p className="eyebrow">{t(file.setting)}</p>
            <h3 className="cf-title">{t(file.title)}</h3>
            <p className="cf-text">{t(file.intro)}</p>
            <div className="cg-actions">
              <button className="cg-btn primary" onClick={() => setStep(0)}>{t('Start case')}</button>
            </div>
          </>
        )}

        {current && (
          <>
            <p className="eyebrow">{t('Decision {{n}} of {{total}}', { n: step + 1, total })}</p>
            <p className="cf-prompt">{t(current.prompt)}</p>
            <div className="cf-choices">
              {current.choices.map((c, i) => {
                const state = tried.includes(i) ? 'is-tried' : picked === i ? (c.good ? 'is-good' : 'is-bad') : ''
                return (
                  <button
                    key={i}
                    className={`cf-choice ${state}`}
                    disabled={picked !== null || tried.includes(i)}
                    onClick={() => choose(i)}
                  >
                    <span className="cf-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                    <span>{t(c.text)}</span>
                  </button>
                )
              })}
            </div>
            {choice && (
              <div className={`cg-banner ${choice.good ? 'is-good' : 'is-bad'}`} role="status">
                <b>{choice.good ? t('Good stewardship') : t('Think again')}</b>
                <span>{t(choice.outcome)}</span>
              </div>
            )}
            {choice && (
              <div className="cg-actions">
                {choice.good
                  ? <button className="cg-btn primary" onClick={next}>{step + 1 === total ? t('See summary') : t('Next decision')}</button>
                  : <button className="cg-btn primary" onClick={rethink}>{t('Rethink')}</button>}
              </div>
            )}
          </>
        )}

        {step === total && (
          <>
            <p className="eyebrow">{t('Case closed')}</p>
            <h3 className="cf-title">{t(file.title)}</h3>
            <p className="cf-score">{t('{{n}} of {{total}} right first time', { n: firstTry, total })}</p>
            <div className="cg-banner is-good" role="status">
              <span>{t(file.summary)}</span>
              {earned !== null && <b>{t('+{{n}} points', { n: earned })}</b>}
            </div>
            <div className="cg-actions">
              <button className="cg-btn ghost" onClick={() => { setStep(-1); setFirstTry(0); setEarned(null) }}>{t('Replay')}</button>
              <button className="cg-btn primary" onClick={onExit}>{t('All cases')}</button>
            </div>
          </>
        )}
      </div>

      <p className="cg-source">
        {t('Source')}: <a href={file.source.url} target="_blank" rel="noopener noreferrer">{file.source.name}</a> · {t('Draft, not yet reviewed')}
      </p>
    </div>
  )
}

export default function CaseFiles() {
  const { t } = useTranslation()
  const { done } = useApp()
  const [openId, setOpenId] = useState(null)
  const file = data.cases.find((c) => c.id === openId)

  return (
    <section className="cg-panel" aria-labelledby="cf-title">
      <header className="cg-head">
        <div>
          <p className="eyebrow">{t('Case Files')}</p>
          <h2 id="cf-title" className="cg-title">{t('Stewardship scenarios')}</h2>
          <p className="cg-sub">{t('Three decisions per case. Pick the action a good steward would take.')}</p>
        </div>
        <span className="cg-draft">{t('Draft content')}</span>
      </header>

      {file ? (
        <CasePlayer key={file.id} file={file} onExit={() => setOpenId(null)} />
      ) : (
        <div className="cf-list">
          {data.cases.map((c) => (
            <button key={c.id} className="cf-card" onClick={() => setOpenId(c.id)}>
              <span className="cf-card-setting">{t(c.setting)}</span>
              <b className="cf-card-title">{t(c.title)}</b>
              <span className="cf-card-meta">
                <span className="cg-level">{t(LEVEL_LABEL[c.level])}</span>
                <span>{t('{{n}} decisions', { n: c.steps.length })}</span>
                {done['casefile-' + c.id] && <span className="cg-chip-done">✓ {t('Completed')}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="cg-sub cf-disclaimer">{t('Education only. These cases never diagnose or recommend medicines. Always ask a qualified health worker or vet.')}</p>
    </section>
  )
}
