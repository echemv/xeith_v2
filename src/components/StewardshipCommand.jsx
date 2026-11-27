import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { award } from '../store'
import { PATIENT_CASES } from '../data/patientCases'

const TOTAL_CASES = 5

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const AWARE_COLOR = { A: '#176B65', W: '#D6A84B', R: '#F2786B' }
const AWARE_LABEL = { A: tx('Access'), W: tx('Watch'), R: tx('Reserve') }

export default function StewardshipCommand({ onExit }) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState('briefing') // briefing | case | result | debrief
  const [cases, setCases] = useState([])
  const [caseIndex, setCaseIndex] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [score, setScore] = useState(0)
  const [resistanceMeter, setResistanceMeter] = useState(0) // 0–100
  const [history, setHistory] = useState([]) // { case, chosen, correct }
  const [showReasoning, setShowReasoning] = useState(false)
  const [showExitPrompt, setShowExitPrompt] = useState(false)

  useEffect(() => {
    setCases(shuffle(PATIENT_CASES).slice(0, TOTAL_CASES))
  }, [])

  const currentCase = cases[caseIndex]

  const handleChoice = (optIdx) => {
    if (chosen !== null) return
    setChosen(optIdx)
    const opt = currentCase.options[optIdx]
    const isCorrect = optIdx === currentCase.correct
    const pts = isCorrect ? 20 : opt.aware === 'A' ? 8 : opt.aware === 'W' ? 4 : 0
    setScore(prev => prev + pts)
    setResistanceMeter(prev => Math.min(100, prev + Math.round(opt.resistanceRisk * 40)))
    setHistory(prev => [...prev, { case: currentCase, chosen: optIdx, correct: isCorrect }])
  }

  const nextCase = () => {
    if (caseIndex + 1 >= cases.length) {
      // Game over
      const bonus = resistanceMeter < 30 ? 30 : resistanceMeter < 60 ? 15 : 0
      const finalScore = score + bonus
      award(finalScore, `stewardship-${Date.now()}`)
      setPhase('debrief')
    } else {
      setCaseIndex(prev => prev + 1)
      setChosen(null)
      setShowReasoning(false)
    }
  }

  if (phase === 'briefing') {
    return (
      <div className="stewardship-briefing animate-fade-in">
        <div className="card glass" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '32px 28px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏥</div>
          <p className="eyebrow">{t('New Game Mode')}</p>
          <h2 style={{ margin: '0 0 12px' }}>{t('Stewardship Command')}</h2>
          <p className="muted" style={{ marginBottom: 20 }}>
            {t('You are the Antimicrobial Stewardship Officer at a Nigerian teaching hospital. Five practice cases come through your ward: pick the approach that helps the patient and limits resistance. This is a learning game, not medical advice.')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { color: '#176B65', label: tx('Access'), desc: tx('First choice for common infections.') },
              { color: '#D6A84B', label: tx('Watch'), desc: tx('Higher resistance risk.') },
              { color: '#F2786B', label: tx('Reserve'), desc: tx('Last resort only.') }
            ].map(({ color, label, desc }) => (
              <div key={label} style={{ padding: '10px 8px', borderRadius: 12, border: `1px solid ${color}40`, background: `${color}10`, textAlign: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, margin: '0 auto 6px' }} />
                <b style={{ color, fontSize: '.82rem' }}>{t(label)}</b>
                <p className="muted" style={{ fontSize: '.75rem', margin: 0 }}>{t(desc)}</p>
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '.85rem', marginBottom: 24 }}>
            💡 {t('Based on the WHO AWaRe classification')}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setPhase('case')}>
              🩺 {t('Start Ward Round')}
            </button>
            <button className="btn ghost" onClick={onExit}>← {t('Back')}</button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'debrief') {
    const correctCount = history.filter(h => h.correct).length
    const passed = correctCount >= Math.ceil(TOTAL_CASES / 2)
    const resistanceLevel = t(resistanceMeter < 30 ? 'Low' : resistanceMeter < 60 ? 'Moderate' : 'High')
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
              {passed ? t('Ward Round Completed') : t('More Training Needed')}
            </span>
            <h2 style={{ margin: '0 0 6px' }}>{passed ? t('Excellent Stewardship!') : t('Review Your Choices')}</h2>
          </div>

          {/* Score + Resistance bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(23,107,101,.07)', border: '1px solid rgba(23,107,101,.2)', textAlign: 'center' }}>
              <p className="eyebrow" style={{ margin: '0 0 4px' }}>{t('Score')}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal)', margin: 0 }}>{score + (resistanceMeter < 30 ? 30 : resistanceMeter < 60 ? 15 : 0)}</p>
              <p className="muted" style={{ fontSize: '.78rem', margin: 0 }}>{correctCount}/{TOTAL_CASES} correct</p>
            </div>
            <div style={{ padding: '14px', borderRadius: 14, background: `${resistanceColor}10`, border: `1px solid ${resistanceColor}40`, textAlign: 'center' }}>
              <p className="eyebrow" style={{ margin: '0 0 4px', color: resistanceColor }}>{t('Resistance Pressure')}</p>
              <div style={{ height: 8, background: 'var(--line)', borderRadius: 4, margin: '4px 0' }}>
                <div style={{ width: `${resistanceMeter}%`, height: '100%', background: resistanceColor, borderRadius: 4, transition: 'width .5s' }} />
              </div>
              <p style={{ fontSize: '.85rem', fontWeight: 700, color: resistanceColor, margin: '4px 0 0' }}>{resistanceLevel}</p>
            </div>
          </div>

          {/* Case-by-case review */}
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
                    <p style={{ margin: '0 0 2px', fontSize: '.84rem', fontWeight: 700, color: 'var(--navy)' }}>{h.case.name} — {h.case.hospital}</p>
                    <p className="muted" style={{ margin: 0, fontSize: '.78rem' }}>{t('You chose:')} <b>{opt.label}</b> ({t(AWARE_LABEL[opt.aware])})</p>
                    {!h.correct && <p className="muted" style={{ margin: '2px 0 0', fontSize: '.75rem', color: 'var(--coral)' }}>{h.case.options[h.case.correct].label} was best — {h.case.takeaway}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/learn?module=bacteria" className="btn primary" style={{ justifyContent: 'center' }}>
              📚 Reinforce in Classroom Pathway →
            </Link>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn ghost" onClick={() => { setCases(shuffle(PATIENT_CASES).slice(0, TOTAL_CASES)); setCaseIndex(0); setChosen(null); setScore(0); setResistanceMeter(0); setHistory([]); setShowReasoning(false); setPhase('case') }} style={{ flex: 1 }}>
                🔄 New Ward Round
              </button>
              <Link to="/challenges" className="btn ghost" style={{ flex: 1, justifyContent: 'center' }}>
                🔥 Daily Challenges
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="eyebrow" style={{ flex: 1 }}>Case {caseIndex + 1} of {TOTAL_CASES}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--teal)' }}>⭐ {score}</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{t('Resistance:')}</span>
            <div style={{ width: 60, height: 6, background: 'var(--line)', borderRadius: 3 }}>
              <div style={{ width: `${resistanceMeter}%`, height: '100%', background: resistanceMeter < 40 ? '#176B65' : resistanceMeter < 70 ? '#D6A84B' : '#F2786B', borderRadius: 3, transition: 'width .4s' }} />
            </div>
          </div>
          <button className="custom-close-btn framework-close-btn" onClick={() => setShowExitPrompt(true)} aria-label={t('Exit')} title={t('Exit')}>
            <img src="/close-icon.png" alt={t('Exit')} className="custom-close-icon" />
          </button>
        </div>
      </div>

      {/* Case card */}
      <div className="card glass" style={{ marginBottom: 16, padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', fontWeight: 700, background: 'var(--g-teal)', color: '#fff' }}>
            🏥 {currentCase.ward}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '.75rem', background: 'rgba(0,0,0,.06)', color: 'var(--muted)' }}>
            {currentCase.hospital}
          </span>
        </div>
        <h3 style={{ margin: '0 0 8px', color: 'var(--navy)', fontSize: '1.1rem' }}>{currentCase.name}</h3>
        <p style={{ margin: '0 0 10px', fontSize: '.9rem', lineHeight: 1.6 }}>{currentCase.presentation}</p>
        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(23,107,101,.07)', border: '1px solid rgba(23,107,101,.2)' }}>
          <p className="eyebrow" style={{ margin: '0 0 2px', fontSize: '.72rem' }}>{t('Case summary')}</p>
          <p style={{ margin: 0, fontSize: '.88rem', fontWeight: 600, color: 'var(--teal)' }}>{currentCase.suspected}</p>
        </div>
      </div>

      {/* Options */}
      <p className="eyebrow" style={{ marginBottom: 10 }}>{t('Choose your approach:')}</p>
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
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '.9rem', color: 'var(--navy)' }}>{opt.label}</p>
                <p className="muted" style={{ margin: 0, fontSize: '.78rem' }}>WHO AWaRe: <b style={{ color: AWARE_COLOR[opt.aware] }}>{t(AWARE_LABEL[opt.aware])}</b></p>
                {isAnswered && (isThisCorrect || isChosen) && (
                  <p style={{ margin: '4px 0 0', fontSize: '.78rem', color: isThisCorrect ? 'var(--teal)' : 'var(--coral)', lineHeight: 1.4 }}>
                    {isThisCorrect ? '✅ ' : '❌ '}{opt.reasoning}
                  </p>
                )}
              </div>
              {isAnswered && isThisCorrect && <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>✅</span>}
              {isAnswered && isChosen && !isThisCorrect && <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>❌</span>}
            </button>
          )
        })}
      </div>

      {/* Post-answer feedback */}
      {isAnswered && (
        <div className="animate-fade-in" style={{
          padding: '14px 16px', borderRadius: 14, marginBottom: 16,
          background: isCorrect ? 'rgba(23,107,101,.08)' : 'rgba(214,168,75,.1)',
          border: `1px solid ${isCorrect ? 'rgba(23,107,101,.25)' : 'rgba(214,168,75,.3)'}`
        }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.88rem', color: 'var(--navy)' }}>
            {isCorrect ? '🛡️ Excellent Stewardship!' : '📖 Clinical Insight:'}
          </p>
          <p className="muted" style={{ margin: 0, fontSize: '.85rem', lineHeight: 1.5 }}>
            {currentCase.takeaway}
          </p>
        </div>
      )}

      {isAnswered && (
        <button className="btn" onClick={nextCase} style={{ width: '100%' }}>
          {caseIndex + 1 >= cases.length ? '📊 See My Debrief →' : '→ Next Patient'}
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
                total: TOTAL_CASES,
                score
              })}
            </p>

            <div style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(23,107,101,.08)',
              border: '1px solid rgba(23,107,101,.25)',
              textAlign: 'left',
              marginBottom: '22px'
            }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.88rem', color: 'var(--navy)' }}>
                📖 {t('Learn More in the Classroom')}
              </p>
              <p className="muted" style={{ margin: 0, fontSize: '.86rem', lineHeight: 1.5 }}>
                {t('Review WHO AWaRe prescribing principles (Access, Watch, Reserve) and resistance mechanisms in the Classroom Pathway.')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/learn?module=bacteria"
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
