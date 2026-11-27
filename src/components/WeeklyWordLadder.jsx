import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { useApp, award, weekNumber } from '../store'

const LADDER_POOLS = [
  {
    start: 'GERM',
    target: 'HEAL',
    theme: tx('From Microbe to Recovery: Transform GERM to HEAL across 7 daily steps.'),
    steps: ['GERM', 'TERM', 'TEEM', 'TEED', 'FEED', 'FEEL', 'HEEL', 'HEAL'],
    hints: [
      tx('A specific period or technical word (G → T)'),
      tx('To be full of or swarm with life (R → E)'),
      tx('Equipped with a golf tee or prepared (M → D)'),
      tx('To supply with nourishment or food (T → F)'),
      tx('To perceive through touch or emotion (D → L)'),
      tx('The rear part of the human foot (F → H)'),
      tx('To recover and restore health! (E → A)')
    ]
  },
  {
    start: 'SICK',
    target: 'WELL',
    theme: tx('From SICK to WELL: 7 daily steps, one letter at a time.'),
    steps: ['SICK', 'SACK', 'SANK', 'SINK', 'SILK', 'SILL', 'SELL', 'WELL'],
    hints: [
      tx('A large bag for carrying goods (I → A)'),
      tx('Went down under water (C → N)'),
      tx('Where you wash your hands with soap (A → I)'),
      tx('A smooth, shiny fabric (N → L)'),
      tx('The ledge under a window (K → L)'),
      tx('To exchange something for money (I → E)'),
      tx('Healthy again! (S → W)')
    ]
  },
  {
    start: 'RISK',
    target: 'SAFE',
    theme: tx('From RISK to SAFE: 7 daily steps of stewardship.'),
    steps: ['RISK', 'RISE', 'RICE', 'RACE', 'FACE', 'FATE', 'SATE', 'SAFE'],
    hints: [
      tx('To go up or get higher (K → E)'),
      tx('A grain eaten across Nigeria (S → C)'),
      tx('A contest of speed (I → A)'),
      tx('The front of your head (R → F)'),
      tx('What is destined to happen (C → T)'),
      tx('To satisfy hunger fully (F → S)'),
      tx('Protected from harm! (T → F)')
    ]
  },
]

const DAYS_OF_WEEK = [
  tx('Monday'),
  tx('Tuesday'),
  tx('Wednesday'),
  tx('Thursday'),
  tx('Friday'),
  tx('Saturday'),
  tx('Sunday')
]

export default function WeeklyWordLadder() {
  const { t } = useTranslation()
  const { done } = useApp()
  const wk = weekNumber()

  // Day index: Monday = 0, ..., Sunday = 6
  const todayDayIndex = (new Date().getDay() + 6) % 7
  const ladder = LADDER_POOLS[wk % LADDER_POOLS.length]
  const storageKey = `xeith-weekly-ladder-${wk}`

  const [savedSteps, setSavedSteps] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : [ladder.start]
    } catch {
      return [ladder.start]
    }
  })

  const [currentInput, setCurrentInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [stepSuccess, setStepSuccess] = useState(false)

  // Sync to storage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedSteps))
    } catch { /* ignore */ }
  }, [savedSteps, storageKey])

  // Current step to fill (index 1 to 7 corresponding to Day 0 to Day 6)
  const currentStepNum = savedSteps.length // 1 to 7
  const isCompletedForWeek = savedSteps.length >= 8
  const isTodayStepAlreadyDone = savedSteps.length > todayDayIndex + 1

  const handleWordSubmit = () => {
    const word = currentInput.toUpperCase().trim()
    const expectedLength = ladder.start.length

    if (word.length !== expectedLength) {
      setErrorMsg(t('Word must be {{n}} letters', { n: expectedLength }))
      return
    }

    const prevWord = savedSteps[savedSteps.length - 1]
    if (word === prevWord) {
      setErrorMsg(t("That's the same as the previous word!"))
      return
    }

    // Check one letter difference
    const diff = word.split('').filter((char, i) => char !== prevWord[i]).length
    if (diff !== 1) {
      setErrorMsg(t('Change exactly one letter from {{prev}}', { prev: prevWord }))
      return
    }

    // Validate against solution path or verify valid word
    const expectedWord = ladder.steps[savedSteps.length]
    if (word !== expectedWord && word !== ladder.target) {
      setErrorMsg(t('Not the expected stewardship step word. Hint: {{hint}}', { hint: t(ladder.hints[savedSteps.length - 1]) }))
      return
    }

    const nextSteps = [...savedSteps, word]
    setSavedSteps(nextSteps)
    setCurrentInput('')
    setErrorMsg('')
    setStepSuccess(true)

    // Award daily step points
    const stepId = `weekly-ladder-step-${wk}-${savedSteps.length}`
    if (!done[stepId]) {
      award(10, stepId)
    }

    // If day 7 / final target reached
    if (nextSteps.length >= 8 || word === ladder.target) {
      const fullId = `weekly-ladder-complete-${wk}`
      if (!done[fullId]) {
        award(50, fullId)
      }
    }
  }

  return (
    <section className="card weekly-ladder-card">
      <div className="ladder-head">
        <div>
          <p className="eyebrow ladder-eyebrow">
            🧗 {t('7-Day Weekly Word Ladder')} · {t('Week {{wk}}', { wk })}
          </p>
          <h3 className="ladder-title">
            {ladder.start} <span className="arrow" aria-hidden="true">→</span> {ladder.target}
          </h3>
          <p className="muted ladder-sub">{t(ladder.theme)}</p>
        </div>
        <span className={`ladder-progress ${isCompletedForWeek ? 'done' : ''}`}>
          {isCompletedForWeek ? '🏆 ' + t('Ladder Complete (+50 pts)') : `${Math.min(savedSteps.length - 1, 7)} / 7 ${t('Steps')}`}
        </span>
      </div>

      {/* 7 Daily Step Slots Visualizer */}
      <div className="ladder-steps-grid">
        {/* Start Word Slot */}
        <div className="ladder-end start">
          <span className="ladder-end-label">{t('START')}</span>
          <span className="ladder-end-word">{ladder.start}</span>
        </div>

        {/* 7 Daily Steps */}
        {DAYS_OF_WEEK.map((dayName, idx) => {
          const stepIndex = idx + 1
          const filledWord = savedSteps[stepIndex]
          const isToday = idx === todayDayIndex
          const isUnlocked = idx <= todayDayIndex
          const isCurrentActiveInput = stepIndex === savedSteps.length && isUnlocked && !isCompletedForWeek
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

        {/* Goal Target Slot */}
        <div className={`ladder-end target ${isCompletedForWeek ? 'done' : ''}`}>
          <span className="ladder-end-label">{t('TARGET')} 🏁</span>
          <span className="ladder-end-word">{ladder.target}</span>
        </div>
      </div>

      {/* Input / Progress Section */}
      {!isCompletedForWeek && (
        <div>
          {isTodayStepAlreadyDone ? (
            <div className="ladder-done-today">
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">✅</span>
              <div>
                <b>{t("Today's ladder step is complete!")}</b>
                <p className="muted">
                  {t('Come back tomorrow for the next word step. Keep your streak burning! 🔥')}
                </p>
              </div>
            </div>
          ) : (
            <div className="ladder-panel">
              <p className="ladder-panel-title">
                {t('Day {{n}} Step', { n: savedSteps.length })}: {t('Change 1 letter from')} <code>{savedSteps[savedSteps.length - 1]}</code>
              </p>
              <p className="muted ladder-hint">
                💡 <b>{t('Hint')}:</b> {t(ladder.hints[savedSteps.length - 1])}
              </p>

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
                <button className="btn" onClick={handleWordSubmit}>
                  {t('Submit Daily Step (+10 pts)')}
                </button>
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
            {t('You successfully transformed {{start}} to {{target}} across all 7 days (+50 points awarded).', { start: ladder.start, target: ladder.target })}
          </p>
        </div>
      )}
    </section>
  )
}
