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
  }
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
    <section className="card weekly-ladder-card" style={{ marginTop: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--g-teal)', fontWeight: 700 }}>
            🧗 {t('7-Day Weekly Word Ladder')} · {t('Week {{wk}}', { wk })}
          </p>
          <h3 style={{ margin: '4px 0 6px', color: 'var(--navy)' }}>
            {ladder.start} <span style={{ opacity: 0.5 }}>→</span> {ladder.target}
          </h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
            {t(ladder.theme)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            background: isCompletedForWeek ? 'rgba(39,174,96,0.15)' : 'var(--g-soft)',
            color: isCompletedForWeek ? '#27AE60' : 'var(--navy)',
            padding: '6px 12px',
            borderRadius: '99px',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '1px solid var(--line)'
          }}>
            {isCompletedForWeek ? '🏆 ' + t('Ladder Complete (+50 pts)') : `${Math.min(savedSteps.length - 1, 7)} / 7 ${t('Steps')}`}
          </span>
        </div>
      </div>

      {/* 7 Daily Step Slots Visualizer */}
      <div className="ladder-steps-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
        gap: '8px',
        margin: '20px 0 16px'
      }}>
        {/* Start Word Slot */}
        <div style={{
          padding: '10px 8px',
          borderRadius: '10px',
          background: 'var(--navy)',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 700,
          fontFamily: 'monospace',
          letterSpacing: '0.1em'
        }}>
          <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.7, fontWeight: 500 }}>{t('START')}</span>
          <span style={{ fontSize: '1.05rem' }}>{ladder.start}</span>
        </div>

        {/* 7 Daily Steps */}
        {DAYS_OF_WEEK.map((dayName, idx) => {
          const stepIndex = idx + 1
          const filledWord = savedSteps[stepIndex]
          const isToday = idx === todayDayIndex
          const isUnlocked = idx <= todayDayIndex
          const isCurrentActiveInput = stepIndex === savedSteps.length && isUnlocked && !isCompletedForWeek

          return (
            <div
              key={idx}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                textAlign: 'center',
                border: isCurrentActiveInput ? '2px solid var(--g-teal)' : '1px solid var(--line)',
                background: filledWord ? 'rgba(39,174,96,0.1)' : isCurrentActiveInput ? 'var(--g-soft)' : 'rgba(0,0,0,0.02)',
                opacity: !isUnlocked && !filledWord ? 0.6 : 1,
                transition: 'all .2s ease'
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '2px' }}>
                {dayName} {isToday && '📍'}
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '1rem',
                color: filledWord ? '#27AE60' : isCurrentActiveInput ? 'var(--g-teal)' : 'var(--muted)',
                letterSpacing: '0.05em'
              }}>
                {filledWord ? (
                  <span>{filledWord} ✓</span>
                ) : isUnlocked ? (
                  <span style={{ fontStyle: 'italic', fontSize: '0.82rem' }}>{isCurrentActiveInput ? t('Ready') : '—'}</span>
                ) : (
                  <span>🔒</span>
                )}
              </div>
            </div>
          )
        })}

        {/* Goal Target Slot */}
        <div style={{
          padding: '10px 8px',
          borderRadius: '10px',
          background: isCompletedForWeek ? 'var(--g-teal)' : 'var(--g-soft)',
          color: isCompletedForWeek ? '#fff' : 'var(--navy)',
          textAlign: 'center',
          fontWeight: 700,
          fontFamily: 'monospace',
          border: '1px solid var(--line)',
          letterSpacing: '0.1em'
        }}>
          <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.7, fontWeight: 500 }}>{t('TARGET')} 🏁</span>
          <span style={{ fontSize: '1.05rem' }}>{ladder.target}</span>
        </div>
      </div>

      {/* Input / Progress Section */}
      {!isCompletedForWeek && (
        <div>
          {isTodayStepAlreadyDone ? (
            <div style={{
              background: 'rgba(39,174,96,0.08)',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(39,174,96,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <b style={{ color: 'var(--navy)' }}>{t("Today's ladder step is complete!")}</b>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.84rem' }}>
                  {t('Come back tomorrow for the next word step. Keep your streak burning! 🔥')}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--g-soft)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--line)'
            }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)' }}>
                {t('Day {{n}} Step', { n: savedSteps.length })}: {t('Change 1 letter from')} <code>{savedSteps[savedSteps.length - 1]}</code>
              </p>
              <p className="muted" style={{ margin: '0 0 12px', fontSize: '0.85rem' }}>
                💡 <b>{t('Hint')}:</b> {t(ladder.hints[savedSteps.length - 1])}
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => { setCurrentInput(e.target.value.toUpperCase()); setErrorMsg('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleWordSubmit()}
                  placeholder={t('4-letter word')}
                  maxLength={ladder.start.length}
                  style={{
                    width: '130px',
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid var(--line)'
                  }}
                  autoFocus
                />
                <button className="btn" onClick={handleWordSubmit}>
                  {t('Submit Daily Step (+10 pts)')}
                </button>
              </div>

              {errorMsg && (
                <p style={{ color: 'var(--coral)', margin: '8px 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {isCompletedForWeek && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: 'rgba(39,174,96,0.1)',
          borderRadius: '12px',
          border: '1px solid #27AE60'
        }}>
          <p style={{ fontSize: '1.8rem', margin: 0 }}>🎉 🏆</p>
          <h4 style={{ margin: '6px 0 2px', color: '#27AE60' }}>{t('Weekly Ladder Conquered!')}</h4>
          <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
            {t('You successfully transformed {{start}} to {{target}} across all 7 days (+50 points awarded).', { start: ladder.start, target: ladder.target })}
          </p>
        </div>
      )}
    </section>
  )
}
