import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LESSONS } from '../data/lessons'
import Quiz from '../components/Quiz'
import { award, useApp } from '../store'

export default function Learn() {
  const { t } = useTranslation()
  const { done } = useApp()
  const [open, setOpen] = useState(null)
  const [step, setStep] = useState(0)
  const lesson = LESSONS.find((l) => l.id === open)
  if (!lesson) return (
    <>
      <h1>{t('Learn')}</h1>
      <p className="lead">{t('Short lessons on antimicrobial resistance. Finish each quick check to earn points.')}</p>
      <div className="grid">
        {LESSONS.map((l, n) => (
          <button key={l.id} className="tile" onClick={() => { setOpen(l.id); setStep(0) }}>
            <span className="tile-icon">{done['lesson-' + l.id] ? '✅' : n + 1}</span><b>{t(l.title)}</b>
          </button>
        ))}
      </div>
    </>
  )
  const last = step === lesson.steps.length
  return (
    <>
      <button className="btn ghost" onClick={() => setOpen(null)}>← {t('All lessons')}</button>
      <h1>{t(lesson.title)}</h1>
      <div className="card">
        {!last ? (
          <>
            <p className="muted">{t('Step {{n}} of {{total}}', { n: step + 1, total: lesson.steps.length })}</p>
            <p className="fact">{t(lesson.steps[step])}</p>
            <button className="btn" onClick={() => setStep(step + 1)}>{step === lesson.steps.length - 1 ? t('Quick check') : t('Next')}</button>
          </>
        ) : (
          <Quiz q={lesson.check} onResult={(ok) => { if (ok) award(10, 'lesson-' + lesson.id) }} />
        )}
      </div>
    </>
  )
}
