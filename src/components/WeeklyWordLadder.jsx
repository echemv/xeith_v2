import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { useApp, award, weekNumber, ymd } from '../store'
import {
  LADDER_POOLS, RUNG_POINTS, REVEAL_COST, RUNG_FLOOR, COMPLETE_POINTS, checkRung, solveRung,
} from '../data/weeklyLadder'

const DAYS_OF_WEEK = [
  tx('Monday'),
  tx('Tuesday'),
  tx('Wednesday'),
  tx('Thursday'),
  tx('Friday'),
  tx('Saturday'),
  tx('Sunday')
]

const RUNGS = 7

function loadProgress(key, start) {
  const empty = { steps: [start], hints: {}, penalties: {}, revealDays: {} }
  try {
    const raw = JSON.parse(localStorage.getItem(key))
    if (Array.isArray(raw)) return { ...empty, steps: raw.length ? raw : [start] } // old format
    if (raw && Array.isArray(raw.steps)) return { ...empty, ...raw }
  } catch { /* storage unavailable or corrupt */ }
  return empty
}

export default function WeeklyWordLadder() {
  const { t } = useTranslation()
  const { done } = useApp()
  const wk = weekNumber()

  // Day index: Monday = 0, ..., Sunday = 6. Rung n (1..7) opens on day index n - 1.
  const todayDayIndex = (new Date().getDay() + 6) % 7
  const today = ymd()
  const ladder = LADDER_POOLS[wk % LADDER_POOLS.length]
  const storageKey = `xeith-weekly-ladder-${wk}`

  const [progress, setProgress] = useState(() => loadProgress(storageKey, ladder.start))
  const [currentInput, setCurrentInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [checking, setChecking] = useState(false)
  const [solved, setSolved] = useState(null) // { rung, pos, letter } for hints, kept in memory only

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(progress)) } catch { /* ignore */ }
  }, [progress, storageKey])

  const { steps } = progress
  const rung = steps.length // the rung being worked on, 1..7
  const prevWord = steps[steps.length - 1]
  const isCompletedForWeek = steps.length > RUNGS
  const rungUnlocked = rung - 1 <= todayDayIndex
  const isTodayStepAlreadyDone = !isCompletedForWeek && !rungUnlocked
  const rungHints = progress.hints[rung] || {}
  const rungReward = Math.max(RUNG_FLOOR, RUNG_POINTS - (progress.penalties[rung] || 0))
  const revealFreeToday = !(progress.revealDays[today] > 0)
  const target = isCompletedForWeek ? steps[RUNGS] : '?'.repeat(ladder.start.length)

  const getSolution = async () => {
    if (solved && solved.rung === rung) return solved
    const s = await solveRung(ladder, rung, prevWord)
    if (s) setSolved({ rung, ...s })
    return s ? { rung, ...s } : null
  }

  // Hints already taken for this rung survive a reload: recompute the solution in memory.
  useEffect(() => {
    if (isCompletedForWeek || !(rungHints.position || rungHints.reveal)) return
    if (solved && solved.rung === rung) return
    let live = true
    solveRung(ladder, rung, prevWord).then((r) => { if (live && r) setSolved({ rung, ...r }) })
    return () => { live = false }
  }, [isCompletedForWeek, rungHints.position, rungHints.reveal, solved, rung, ladder, prevWord])

  const takeHint = async (kind) => {
    if (isCompletedForWeek || !rungUnlocked || rungHints[kind]) return
    const s = await getSolution()
    if (!s) { setErrorMsg(t('Hint unavailable right now. Try again.')); return }
    setProgress((p) => {
      const next = { ...p, hints: { ...p.hints, [rung]: { ...(p.hints[rung] || {}), [kind]: true } } }
      if (kind === 'reveal') {
        const used = p.revealDays[today] || 0
        next.revealDays = { ...p.revealDays, [today]: used + 1 }
        if (used > 0) next.penalties = { ...p.penalties, [rung]: (p.penalties[rung] || 0) + REVEAL_COST }
        // a reveal also shows the position
        next.hints[rung].position = true
      }
      return next
    })
  }

  const handleWordSubmit = async () => {
    if (checking || isCompletedForWeek || !rungUnlocked) return
    const word = currentInput.toUpperCase().trim()
    const expectedLength = ladder.start.length

    if (!/^[A-Z]+$/.test(word) || word.length !== expectedLength) {
      setErrorMsg(t('Word must be {{n}} letters', { n: expectedLength }))
      return
    }
    if (word === prevWord) {
      setErrorMsg(t('That’s the same as the previous word!'))
      return
    }
    const diff = word.split('').filter((char, i) => char !== prevWord[i]).length
    if (diff !== 1) {
      setErrorMsg(`Change exactly one letter from ${prevWord}`)
      return
    }

    setChecking(true)
    let ok = false
    try { ok = await checkRung(ladder, rung, word) } catch { /* crypto unavailable */ }
    setChecking(false)
    if (!ok) {
      setErrorMsg(t('Not the word for this step. Try a hint below.'))
      return
    }

    const nextSteps = [...steps, word]
    setProgress((p) => ({ ...p, steps: nextSteps }))
    setCurrentInput('')
    setErrorMsg('')

    const stepId = `weekly-ladder-step-${wk}-${rung}`
    if (!done[stepId]) award(rungReward, stepId)

    if (nextSteps.length > RUNGS) {
      const fullId = `weekly-ladder-complete-${wk}`
      if (!done[fullId]) award(COMPLETE_POINTS, fullId)
    }
  }

  const s = solved && solved.rung === rung ? solved : null

  return (
    <section className="card weekly-ladder-card">
      <div className="ladder-head">
        <div>
          <p className="eyebrow ladder-eyebrow">
            🧗 {t('7-Day Weekly Word Ladder')} · {t('Week {{wk}}', { wk })}
          </p>
          <h3 className="ladder-title">
            {ladder.start} <span className="arrow" aria-hidden="true">→</span> {target}
          </h3>
          <p className="muted ladder-sub">{t(ladder.theme)}</p>
        </div>
        <span className={`ladder-progress ${isCompletedForWeek ? 'done' : ''}`}>
          {isCompletedForWeek ? '🏆 ' + t('Ladder Complete (+50 pts)') : `${Math.min(steps.length - 1, RUNGS)} / ${RUNGS} ${t('Steps')}`}
        </span>
      </div>

      <div className="ladder-steps-grid">
        <div className="ladder-end start">
          <span className="ladder-end-label">{t('START')}</span>
          <span className="ladder-end-word">{ladder.start}</span>
        </div>

        {DAYS_OF_WEEK.map((dayName, idx) => {
          const stepIndex = idx + 1
          const filledWord = steps[stepIndex]
          const isToday = idx === todayDayIndex
          const isUnlocked = idx <= todayDayIndex
          const isCurrentActiveInput = stepIndex === steps.length && isUnlocked && !isCompletedForWeek
          const state = filledWord ? 'is-filled' : isCurrentActiveInput ? 'is-active' : !isUnlocked ? 'is-locked' : ''

          return (
            <div key={idx} className={`ladder-slot ${state}`}>
              <div className="ladder-slot-day">
                {t(dayName)} {isToday && '📍'}
              </div>
              <div className="ladder-slot-word">
                {filledWord ? (
                  <span>{filledWord} ✓</span>
                ) : isUnlocked ? (
                  <span className="pending">{isCurrentActiveInput ? t('Ready') : '—'}</span>
                ) : (
                  <span>🔒</span>
                )}
              </div>
            </div>
          )
        })}

        <div className={`ladder-end target ${isCompletedForWeek ? 'done' : ''}`}>
          <span className="ladder-end-label">{t('TARGET')} 🏁</span>
          <span className="ladder-end-word">{target}</span>
        </div>
      </div>

      {!isCompletedForWeek && (
        <div>
          {isTodayStepAlreadyDone ? (
            <div className="ladder-done-today">
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">✅</span>
              <div>
                <b>{t('Today’s ladder step is complete!')}</b>
                <p className="muted">
                  {t('Come back tomorrow for the next word step. Keep your streak burning! 🔥')}
                </p>
              </div>
            </div>
          ) : (
            <div className="ladder-panel">
              <p className="ladder-panel-title">
                {t('Day {{n}} Step', { n: rung })}: {t('Change 1 letter from')} <code>{prevWord}</code>
              </p>
              <p className="muted ladder-hint">
                💡 <b>{t('Clue')}:</b> {t(ladder.clues[rung - 1])}
              </p>
              {rungHints.position && s && (
                <p className="muted ladder-hint">
                  <b>{t('Position')}:</b> {t('The letter that changes is letter {{n}}', { n: s.pos + 1 })}
                </p>
              )}
              {rungHints.reveal && s && (
                <p className="muted ladder-hint">
                  <b>{t('Letter')}:</b> {t('Letter {{n}} becomes {{letter}}', { n: s.pos + 1, letter: s.letter })}
                </p>
              )}

              <div className="ladder-form">
                <input
                  type="text"
                  className="ladder-input"
                  value={currentInput}
                  onChange={(e) => { setCurrentInput(e.target.value.toUpperCase()); setErrorMsg('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleWordSubmit()}
                  placeholder={t('4-letter word')}
                  aria-label={t('4-letter word')}
                  maxLength={ladder.start.length}
                />
                <button className="btn" onClick={handleWordSubmit} disabled={checking}>
                  {checking ? t('Checking…') : t('Submit Daily Step (+{{n}} pts)', { n: rungReward })}
                </button>
              </div>

              <div className="ladder-form ladder-hint-actions">
                {!rungHints.position && (
                  <button className="btn ghost" onClick={() => takeHint('position')}>
                    {t('Position hint (free)')}
                  </button>
                )}
                {!rungHints.reveal && (
                  <button className="btn ghost" onClick={() => takeHint('reveal')}>
                    {revealFreeToday
                      ? t('Reveal a letter (free today)')
                      : rungReward > RUNG_FLOOR
                        ? t('Reveal a letter (-{{n}} pts)', { n: Math.min(REVEAL_COST, rungReward - RUNG_FLOOR) })
                        : t('Reveal a letter')}
                  </button>
                )}
              </div>

              {errorMsg && (
                <p className="ladder-error" role="alert">
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {isCompletedForWeek && (
        <div className="ladder-complete">
          <p style={{ fontSize: '1.8rem', margin: 0 }} aria-hidden="true">🎉 🏆</p>
          <h4>{t('Weekly Ladder Conquered!')}</h4>
          <p className="muted">
            {t('You successfully transformed {{start}} to {{target}} across all 7 days (+50 points awarded).', { start: ladder.start, target })}
          </p>
        </div>
      )}
    </section>
  )
}
