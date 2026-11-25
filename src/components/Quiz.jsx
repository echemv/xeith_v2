import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// One multiple-choice question. Calls onResult(true|false) once.
export default function Quiz({ q, onResult }) {
  const { t } = useTranslation()
  const [pick, setPick] = useState(null)
  const choose = (i) => { if (pick !== null) return; setPick(i); if (onResult) onResult(i === q.answer) }
  return (
    <div>
      <h3>{t(q.q)}</h3>
      <div className="col">
        {q.options.map((o, i) => (
          <button key={i} disabled={pick !== null} onClick={() => choose(i)} className={'btn ghost' + (pick !== null ? (i === q.answer ? ' right' : i === pick ? ' wrong' : '') : '')}>{t(o)}</button>
        ))}
      </div>
      <div aria-live="polite">{pick !== null && <p><b>{pick === q.answer ? t('Correct.') : t('Not quite.')}</b> {t(q.why)}</p>}</div>
    </div>
  )
}
