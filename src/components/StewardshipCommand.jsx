import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { award, useApp } from '../store'
import { PATIENT_CASES, SCENARIO_TIERS } from '../data/patientCases'
import { getCompletedLessonCount, getPlayerRank } from '../data/achievements'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const AWARE_COLOR = { A: '#176B65', W: '#D6A84B', R: '#F2786B' }
const AWARE_LABEL = { A: 'Access', W: 'Watch', R: 'Reserve' }

export default function StewardshipCommand({ onExit }) {
  const { t } = useTranslation()
  const { done, points } = useApp()
  const lessonsDone = getCompletedLessonCount(done)
  const playerRank = getPlayerRank(done, null, points)

  const [phase, setPhase] = useState('briefing') // briefing | case | debrief
  const [selectedTierLevel, setSelectedTierLevel] = useState(1)
  const [cases, setCases] = useState([])
  const [caseIndex, setCaseIndex] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [score, setScore] = useState(0)
  const [resistanceMeter, setResistanceMeter] = useState(0) // 0–100
  const [history, setHistory] = useState([]) // { case, chosen, correct }
  const [showExitPrompt, setShowExitPrompt] = useState(false)

  const activeTier = SCENARIO_TIERS.find((tr) => tr.level === selectedTierLevel) || SCENARIO_TIERS[0]
  const isTierUnlocked = (tier) => lessonsDone >= tier.requiredLessons

  const startTierRound = (tierLevel) => {
    const tierObj = SCENARIO_TIERS.find((tr) => tr.level === tierLevel) || SCENARIO_TIERS[0]
    if (!isTierUnlocked(tierObj)) return
    const pool = PATIENT_CASES.filter((c) => c.level === tierLevel)
    const chosenPool = pool.length > 0 ? shuffle(pool) : shuffle(PATIENT_CASES).slice(0, 3)
    setSelectedTierLevel(tierLevel)
    setCases(chosenPool)
    setCaseIndex(0)
    setChosen(null)
    setScore(0)
    setResistanceMeter(0)
    setHistory([])
    setPhase('case')
  }

  useEffect(() => {
    const pool = PATIENT_CASES.filter((c) => c.level === 1)
    setCases(shuffle(pool))
  }, [])

  const currentCase = cases[caseIndex]
  const totalCases = cases.length || 3

  const handleChoice = (optIdx) => {
    if (chosen !== null) return
    setChosen(optIdx)
    const opt = currentCase.options[optIdx]
    const isCorrect = optIdx === currentCase.correct
    const pts = isCorrect ? 20 : opt.aware === 'A' ? 8 : opt.aware === 'W' ? 4 : 0
    setScore((prev) => prev + pts)
    setResistanceMeter((prev) => Math.min(100, prev + Math.round(opt.resistanceRisk * 40)))
    setHistory((prev) => [...prev, { case: currentCase, chosen: optIdx, correct: isCorrect }])
  }

  const nextCase = () => {
    if (caseIndex + 1 >= cases.length) {
      const bonus = resistanceMeter < 30 ? 30 : resistanceMeter < 60 ? 15 : 0
      const finalScore = score + bonus
      award(finalScore, `stewardship-${Date.now()}`)
      setPhase('debrief')
    } else {
      setCaseIndex((prev) => prev + 1)
      setChosen(null)
    }
  }

  if (phase === 'briefing') {
    return (
      <div className="stewardship-briefing animate-fade-in">
        <div className="card glass" style={{ maxWidth: 680, margin: '0 auto', padding: '28px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 8 }}>🏥</div>
            <p className="eyebrow">{t('Classroom-Linked Scenario Simulator')}</p>
            <h2 style={{ margin: '0 0 8px' }}>{t('Stewardship Command: Ward & Community Scenarios')}</h2>
            <p className="muted" style={{ margin: '0 auto 14px', maxWidth: 540 }}>
              {t('Your progress in The AMR Classroom unlocks deeper scenario levels—starting from everyday campus & chemist choices up to hospital ICU superbugs and One Health farms.')}
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 16px',
              borderRadius: 99,
              background: 'var(--g-soft)',
              border: '1px solid var(--line)',
              fontSize: '.83rem',
              fontWeight: 700
            }}>
              <span>{playerRank.icon} {t('Your Pathway Level')}: <b style={{ color: playerRank.accent }}>{t(playerRank.title)}</b></span>
              <span className="muted">•</span>
              <span>📚 {lessonsDone} / 9 {t('Classroom Modules Completed')}</span>
            </div>
          </div>

          {/* 3 Scenario Difficulty Tiers (Locked by Classroom progress) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
            {SCENARIO_TIERS.map((tier) => {
              const unlocked = isTierUnlocked(tier)
              const isSelected = selectedTierLevel === tier.level
              const tierCaseCount = PATIENT_CASES.filter((c) => c.level === tier.level).length
              const missingLessons = Math.max(0, tier.requiredLessons - lessonsDone)

              return (
                <div
                  key={tier.id}
                  onClick={() => unlocked && setSelectedTierLevel(tier.level)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && unlocked) setSelectedTierLevel(tier.level) }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: isSelected && unlocked ? `2px solid ${tier.color}` : '1.5px solid var(--line)',
                    background: !unlocked ? 'rgba(0,0,0,0.03)' : isSelected ? `${tier.color}12` : 'var(--g-soft)',
                    opacity: unlocked ? 1 : 0.78,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    transition: 'all .18s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.35rem' }}>{unlocked ? tier.icon : '🔒'}</span>
                      <strong style={{ fontSize: '.96rem', color: unlocked ? 'var(--ink)' : 'var(--muted)' }}>
                        {t(tier.title)}
                      </strong>
                    </div>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 99,
                      fontSize: '.74rem',
                      fontWeight: 700,
                      background: unlocked ? `${tier.color}18` : 'rgba(242,120,107,0.16)',
                      color: unlocked ? tier.color : 'var(--coral)'
                    }}>
                      {unlocked
                        ? `✓ ${t('Unlocked')} · ${tierCaseCount} ${t('Scenarios')}`
                        : `🔒 ${t('Complete {{n}} more Classroom module(s) to unlock', { n: missingLessons })}`}
                    </span>
                  </div>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: '.82rem', lineHeight: 1.45 }}>
                    {t(tier.subtitle)}
                  </p>
                  {!unlocked && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '.76rem', color: 'var(--coral)', fontWeight: 600 }}>
                        {t(tier.unlockHint)}
                      </span>
                      <Link
                        to="/learn"
                        className="btn ghost"
                        style={{ padding: '4px 12px', fontSize: '.76rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        📚 {t('Unlock in Classroom →')}
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { color: '#176B65', label: t('Access'), desc: t('First-line. Safe & targeted.') },
              { color: '#D6A84B', label: t('Watch'), desc: t('Higher resistance risk.') },
              { color: '#F2786B', label: t('Reserve'), desc: t('Emergency last resort only.') }
            ].map(({ color, label, desc }) => (
              <div key={label} style={{ padding: '10px 8px', borderRadius: 12, border: `1px solid ${color}40`, background: `${color}10`, textAlign: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, margin: '0 auto 6px' }} />
                <b style={{ color, fontSize: '.82rem' }}>{label}</b>
                <p className="muted" style={{ fontSize: '.75rem', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => startTierRound(selectedTierLevel)}
              disabled={!isTierUnlocked(activeTier)}
            >
              🩺 {t('Start {{title}} →', { title: t(activeTier.title) })}
            </button>
            <button className="btn ghost" onClick={onExit}>← {t('Back')}</button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'debrief') {
    const correctCount = history.filter((h) => h.correct).length
    const passed = correctCount >= Math.ceil(totalCases / 2)
    const resistanceLevel = resistanceMeter < 30 ? t('Low') : resistanceMeter < 60 ? t('Moderate') : t('High')
    const resistanceColor = resistanceMeter < 30 ? '#176B65' : resistanceMeter < 60 ? '#D6A84B' : '#F2786B'

    return (
      <div className="framework-modal-overlay" role="dialog" aria-modal="true">
        <div className="card glass animate-fade-in" style={{ position: 'relative', maxWidth: 560, width: '100%', padding: '32px 28px' }}>
          <button className="custom-close-btn framework-close-btn modal-close-corner" onClick={onExit} aria-label={t('Close')} title={t('Lab Menu')}>
            <img src="/close-icon.png" alt={t('Close')} className="custom-close-icon" />
          </button>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>{passed ? '🏆' : '📋'}</div>
            <span style={{
              display: 'inline-block', padding: '5px 14px', borderRadius: 99,
              fontSize: '.78rem', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase',
              background: passed ? 'rgba(23,107,101,.15)' : 'rgba(242,120,107,.15)',
              color: passed ? 'var(--teal)' : 'var(--coral)', marginBottom: 10
            }}>
              {passed ? t('Scenario Round Completed') : t('More Training Needed')}
            </span>
            <h2 style={{ margin: '0 0 6px' }}>{passed ? t('Excellent Stewardship!') : t('Review Your Decisions')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(23,107,101,.07)', border: '1px solid rgba(23,107,101,.2)', textAlign: 'center' }}>
              <p className="eyebrow" style={{ margin: '0 0 4px' }}>{t('Score')}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal)', margin: 0 }}>{score + (resistanceMeter < 30 ? 30 : resistanceMeter < 60 ? 15 : 0)}</p>
              <p className="muted" style={{ fontSize: '.78rem', margin: 0 }}>{correctCount}/{totalCases} {t('correct')}</p>
            </div>
            <div style={{ padding: '14px', borderRadius: 14, background: `${resistanceColor}10`, border: `1px solid ${resistanceColor}40`, textAlign: 'center' }}>
              <p className="eyebrow" style={{ margin: '0 0 4px', color: resistanceColor }}>{t('Resistance Pressure')}</p>
              <div style={{ height: 8, background: 'var(--line)', borderRadius: 4, margin: '4px 0' }}>
                <div style={{ width: `${resistanceMeter}%`, height: '100%', background: resistanceColor, borderRadius: 4, transition: 'width .5s' }} />
              </div>
              <p style={{ fontSize: '.85rem', fontWeight: 700, color: resistanceColor, margin: '4px 0 0' }}>{resistanceLevel}</p>
            </div>
          </div>

          <p className="eyebrow" style={{ marginBottom: 8 }}>{t('Case Review')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 220, overflowY: 'auto' }}>
            {history.map((h, i) => {
              const opt = h.case.options[h.chosen]
              return (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: h.correct ? 'rgba(23,107,101,.07)' : 'rgba(242,120,107,.07)',
                  border: `1px solid ${h.correct ? 'rgba(23,107,101,.2)' : 'rgba(242,120,107,.2)'}`,
                  display: 'flex', gap: 10, alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{h.correct ? '✅' : '❌'}</span>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: '.84rem', fontWeight: 700, color: 'var(--navy)' }}>{t(h.case.name)} — {h.case.hospital}</p>
                    <p className="muted" style={{ margin: 0, fontSize: '.78rem' }}>{t('You chose')}: <b>{t(opt.label)}</b> ({t(AWARE_LABEL[opt.aware])})</p>
                    {!h.correct && <p className="muted" style={{ margin: '2px 0 0', fontSize: '.75rem', color: 'var(--coral)' }}>{t(h.case.options[h.case.correct].label)} — {t(h.case.takeaway)}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/learn" className="btn primary" style={{ justifyContent: 'center' }}>
              📚 {t('Unlock Higher Scenario Levels in Classroom →')}
            </Link>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn ghost" onClick={() => setPhase('briefing')} style={{ flex: 1 }}>
                🔄 {t('Choose Scenario Level')}
              </button>
              <Link to="/challenges" className="btn ghost" style={{ flex: 1, justifyContent: 'center' }}>
                🔥 {t('Challenges')}
              </Link>
              <button className="btn ghost" onClick={onExit} style={{ flex: 1 }}>← {t('Lab Menu')}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentCase) return null

  const isAnswered = chosen !== null
  const isCorrect = isAnswered && chosen === currentCase.correct

  return (
    <div className="stewardship-game animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="eyebrow" style={{ flex: 1 }}>
          {activeTier.icon} {t(activeTier.title)} · {t('Case {{curr}} of {{total}}', { curr: caseIndex + 1, total: totalCases })}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--teal)' }}>⭐ {score}</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{t('Resistance')}:</span>
            <div style={{ width: 60, height: 6, background: 'var(--line)', borderRadius: 3 }}>
              <div style={{ width: `${resistanceMeter}%`, height: '100%', background: resistanceMeter < 40 ? '#176B65' : resistanceMeter < 70 ? '#D6A84B' : '#F2786B', borderRadius: 3, transition: 'width .4s' }} />
            </div>
          </div>
          <button className="custom-close-btn framework-close-btn" onClick={() => setShowExitPrompt(true)} aria-label={t('Exit')} title={t('Exit')}>
            <img src="/close-icon.png" alt={t('Exit')} className="custom-close-icon" />
          </button>
        </div>
      </div>

      <div className="card glass" style={{ marginBottom: 16, padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, background: 'var(--g-teal)', color: '#fff' }}>
            🏥 {t(currentCase.ward)}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', background: 'rgba(0,0,0,.06)', color: 'var(--muted)' }}>
            {currentCase.hospital}
          </span>
        </div>
        <h3 style={{ margin: '0 0 8px', color: 'var(--navy)', fontSize: '1.1rem' }}>{t(currentCase.name)}</h3>
        <p style={{ margin: '0 0 10px', fontSize: '.9rem', lineHeight: 1.6 }}>{t(currentCase.presentation)}</p>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(23,107,101,.07)', border: '1px solid rgba(23,107,101,.2)' }}>
          <p className="eyebrow" style={{ margin: '0 0 2px', fontSize: '.72rem' }}>{t('Working Diagnosis')}</p>
          <p style={{ margin: 0, fontSize: '.88rem', fontWeight: 600, color: 'var(--teal)' }}>{t(currentCase.suspected)}</p>
        </div>
      </div>

      <p className="eyebrow" style={{ marginBottom: 10 }}>{t('Choose your action:')}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {currentCase.options.map((opt, idx) => {
          const isChosen = chosen === idx
          const isThisCorrect = idx === currentCase.correct
          let borderColor = 'var(--line)'
          let bg = 'transparent'
          if (isAnswered) {
            if (isThisCorrect) { borderColor = '#176B65'; bg = 'rgba(23,107,101,.08)' }
            else if (isChosen && !isThisCorrect) { borderColor = '#F2786B'; bg = 'rgba(242,120,107,.08)' }
          }

          return (
            <button
              key={idx}
              className="stewardship-option"
              disabled={isAnswered}
              onClick={() => handleChoice(idx)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px', borderRadius: 14, textAlign: 'left',
                border: `1.5px solid ${borderColor}`, background: bg,
                cursor: isAnswered ? 'default' : 'pointer',
                transition: 'all .2s', width: '100%',
                opacity: isAnswered && !isThisCorrect && !isChosen ? 0.5 : 1
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: AWARE_COLOR[opt.aware] + '20',
                border: `2px solid ${AWARE_COLOR[opt.aware]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.72rem', fontWeight: 800, color: AWARE_COLOR[opt.aware]
              }}>
                {opt.aware}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '.9rem', color: 'var(--navy)' }}>{t(opt.label)}</p>
                <p className="muted" style={{ margin: 0, fontSize: '.78rem' }}>WHO AWaRe: <b style={{ color: AWARE_COLOR[opt.aware] }}>{t(AWARE_LABEL[opt.aware])}</b></p>
                {isAnswered && (isThisCorrect || isChosen) && (
                  <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: isThisCorrect ? 'var(--teal)' : 'var(--coral)', lineHeight: 1.4 }}>
                    {isThisCorrect ? '✅ ' : '❌ '}{t(opt.reasoning)}
                  </p>
                )}
              </div>
              {isAnswered && isThisCorrect && <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>✅</span>}
              {isAnswered && isChosen && !isThisCorrect && <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>❌</span>}
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <div className="animate-fade-in" style={{
          padding: '14px 16px', borderRadius: 14, marginBottom: 16,
          background: isCorrect ? 'rgba(23,107,101,.08)' : 'rgba(214,168,75,.1)',
          border: `1px solid ${isCorrect ? 'rgba(23,107,101,.25)' : 'rgba(214,168,75,.3)'}`
        }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.88rem', color: 'var(--navy)' }}>
            {isCorrect ? '🛡️ ' + t('Excellent Stewardship!') : '📖 ' + t('Key Takeaway:')}
          </p>
          <p className="muted" style={{ margin: 0, fontSize: '.85rem', lineHeight: 1.5 }}>
            {t(currentCase.takeaway)}
          </p>
        </div>
      )}

      {isAnswered && (
        <button className="btn" onClick={nextCase} style={{ width: '100%' }}>
          {caseIndex + 1 >= cases.length ? '📊 ' + t('See My Debrief →') : '→ ' + t('Next Scenario')}
        </button>
      )}

      {showExitPrompt && (
        <div className="framework-modal-overlay" role="dialog" aria-modal="true" aria-label={t('Leaving Ward Round Early')}>
          <div className="card glass animate-fade-in debrief-card">
            <button className="custom-close-btn framework-close-btn modal-close-corner" onClick={() => setShowExitPrompt(false)} aria-label={t('Resume Ward Round')} title={t('Resume Ward Round')}>
              <img src="/close-icon.png" alt={t('Close')} className="custom-close-icon" />
            </button>
            <span style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: '99px',
              fontSize: '.78rem',
              fontWeight: 800,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              background: 'rgba(244,185,66,.16)',
              color: 'var(--gold)',
              marginBottom: '12px'
            }}>
              ⏸️ {t('Ward Round Paused')}
            </span>

            <h2 style={{ margin: '0 0 8px' }}>{t('Leaving Ward Round Early?')}</h2>

            <p className="muted" style={{ fontSize: '.92rem', marginBottom: '16px' }}>
              {t('Completed {{done}} of {{total}} patient cases · Score: ⭐ {{score}}', {
                done: history.length,
                total: totalCases,
                score
              })}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/learn"
                className="btn primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                📚 {t('Go to Classroom Pathway →')}
              </Link>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn ghost" onClick={() => setShowExitPrompt(false)} style={{ flex: 1 }}>
                  ▶ {t('Resume Ward Round')}
                </button>
                <button className="btn ghost" onClick={onExit} style={{ flex: 1 }}>
                  ← {t('Exit to Lab Menu')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
