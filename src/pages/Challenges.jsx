import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { useApp, award, weekNumber } from '../store'
import DailyChallenge from '../components/DailyChallenge'
import AiUpdateFramework from '../components/AiUpdateFramework'

const DEFAULT_WEEKLY_CHALLENGES = [
  {
    title: tx('Weekly Quiz'),
    question: tx('What is the most important action to prevent antimicrobial resistance?'),
    options: [
      tx('Wash hands and prevent infections'),
      tx('Take antibiotics for every cold'),
      tx('Share antibiotics with family'),
      tx('Stop antibiotics when feeling better')
    ],
    answer: 0,
    explanation: tx('Preventing infections through hygiene, vaccines, and clean water reduces the need for antibiotics.')
  },
  {
    title: tx('Weekly Fact Check'),
    question: tx('True or False: Resistance means your body becomes immune to antibiotics.'),
    options: [tx('True'), tx('False')],
    answer: 1,
    explanation: tx('Resistance develops in bacteria, not in people. The bacteria change, not your body.')
  },
  {
    title: tx('Weekly Scenario'),
    question: tx('Your friend offers you their leftover antibiotics for your sore throat. What do you do?'),
    options: [
      tx('Take them - same symptoms, same cure'),
      tx('Decline and see a clinician'),
      tx('Take half the dose'),
      tx('Save them for later')
    ],
    answer: 1,
    explanation: tx('Similar symptoms can have different causes. Only a clinician can determine if antibiotics are needed and which one.')
  }
]

function WeeklyChallenge({ index, id, challenge }) {
  const { t } = useTranslation()
  const { done } = useApp()
  const isDone = done[id]
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  if (isDone) {
    return (
      <section className="card" key={id}>
        <p className="eyebrow">{t('Question {{n}} of 3', { n: index + 1 })}</p>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <span style={{ fontSize: '3rem' }}>✅</span>
          <br />
          <b>{t('Completed')}</b>
          <p className="muted" style={{ marginTop: '8px' }}>{t('+5 points earned')}</p>
        </div>
      </section>
    )
  }

  const handleSubmit = () => {
    if (selected !== null) {
      const correct = selected === challenge.answer
      if (correct) award(5, id)
      setSubmitted(true)
    }
  }

  return (
    <section className="card" key={id}>
      <p className="eyebrow">{t('Question {{n}} of 3', { n: index + 1 })}</p>
      <p className="fact">{t(challenge.question)}</p>

      <div className="col" style={{ marginTop: '16px' }}>
        {challenge.options.map((option, i) => (
          <button
            key={i}
            className={`btn ${submitted ? (i === challenge.answer ? 'right' : i === selected ? 'wrong' : 'ghost') : 'ghost'}`}
            onClick={() => !submitted && setSelected(i)}
            disabled={submitted}
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <span style={{ marginRight: '12px', fontWeight: 700 }}>{String.fromCharCode(65 + i)}.</span>
            {t(option)}
            {submitted && i === challenge.answer && <span style={{ marginLeft: 'auto' }}>✅</span>}
            {submitted && i === selected && i !== challenge.answer && <span style={{ marginLeft: 'auto' }}>❌</span>}
          </button>
        ))}
      </div>

      {submitted && (
        <div style={{ marginTop: '16px', padding: '16px', background: selected === challenge.answer ? 'rgba(39,174,96,0.1)' : 'rgba(242,120,107,0.1)', borderRadius: '12px', border: `1px solid ${selected === challenge.answer ? '#27AE60' : '#F2786B'}` }}>
          <p className={selected === challenge.answer ? 'result-correct' : 'result-incorrect'} style={{ margin: '0 0 8px' }}>
            {selected === challenge.answer ? '✅ ' + t('Correct! +5 points') : '❌ ' + t('Not quite.')}
          </p>
          <p className="muted" style={{ margin: 0 }}>{t(challenge.explanation)}</p>
        </div>
      )}

      {!submitted && selected !== null && (
        <button className="btn" onClick={handleSubmit} style={{ width: '100%', marginTop: '12px' }}>{t('Submit Answer')}</button>
      )}
    </section>
  )
}

export default function Challenges() {
  const { t, i18n } = useTranslation()
  const { done, points, streak } = useApp()
  const wk = weekNumber()
  const weeklyIds = [0, 1, 2].map(k => 'week-' + wk + '-' + k)
  const [weeklyList, setWeeklyList] = useState(DEFAULT_WEEKLY_CHALLENGES)
  const [showFramework, setShowFramework] = useState(false)

  useEffect(() => {
    const loadWeekly = async () => {
      const lang = i18n.resolvedLanguage || 'en'
      const cacheKey = `xeith-weekly-challenges-${wk}-${lang}`
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          setWeeklyList(JSON.parse(cached))
          return
        }
      } catch { /* ignore */ }

      if (typeof navigator !== 'undefined' && !navigator.onLine) return

      const topics = ['bacteria', 'virus', 'parasite']
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 4500)
      try {
        const results = await Promise.all(
          topics.map((topic) =>
            fetch('/api/challenges', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: ctrl.signal,
              body: JSON.stringify({ type: 'QUIZ', topic, lang, date: new Date().toISOString() })
            }).then((r) => (r.ok ? r.json() : null))
          )
        )
        clearTimeout(timer)
        if (results.every((r) => r && r.question && Array.isArray(r.options))) {
          try { localStorage.setItem(cacheKey, JSON.stringify(results)) } catch { /* ignore */ }
          setWeeklyList(results)
        }
      } catch {
        clearTimeout(timer)
      }
    }
    loadWeekly()
  }, [wk, i18n.resolvedLanguage])

  const completedWeeklyCount = weeklyIds.filter(id => done[id]).length

  return (
    <div className="challenges-page animate-fade-in">
      <header className="challenges-header" style={{ marginBottom: '24px' }}>
        <div className="header-meta-row">
          <div className="classroom-hero-badge">
            <span>🔥</span> {t('Daily & Weekly Stewardship Engine')}
          </div>
          <button
            className="btn ghost ai-framework-btn"
            onClick={() => setShowFramework(true)}
            title={t('View how AI updates challenges and surveillance data')}
          >
            🤖 {t('AI Knowledge Update Framework')}
          </button>
        </div>

        <h1>{t('Challenges')}</h1>
        <p className="lead">{t('Daily micro-habits and weekly clinical scenarios to build active stewardship reflexes.')}</p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '16px 0 20px' }}>
          <div className="card glass" style={{ flex: '1 1 140px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔥</span>
            <div>
              <b style={{ fontSize: '1.15rem', display: 'block', color: 'var(--navy)' }}>{streak} {t('Days')}</b>
              <span className="muted" style={{ fontSize: '0.78rem' }}>{t('Current Streak')}</span>
            </div>
          </div>
          <div className="card glass" style={{ flex: '1 1 140px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>⭐</span>
            <div>
              <b style={{ fontSize: '1.15rem', display: 'block', color: 'var(--navy)' }}>{points}</b>
              <span className="muted" style={{ fontSize: '0.78rem' }}>{t('Stewardship Points')}</span>
            </div>
          </div>
          <div className="card glass" style={{ flex: '1 1 140px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <div>
              <b style={{ fontSize: '1.15rem', display: 'block', color: 'var(--navy)' }}>{completedWeeklyCount} / 3</b>
              <span className="muted" style={{ fontSize: '0.78rem' }}>{t('Weekly Tasks')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Daily Challenge - directly rendered without awkward outer wrapper */}
      <DailyChallenge />

      <h2 style={{ marginTop: '28px', marginBottom: '14px' }}>{t('This Week')}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {weeklyIds.map((id, k) => (
          <WeeklyChallenge key={id} index={k} id={id} challenge={weeklyList[k] || DEFAULT_WEEKLY_CHALLENGES[k]} />
        ))}
      </div>

      <section className="card glass" style={{ marginTop: '28px' }}>
        <p className="eyebrow">{t('How challenges work')}</p>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2 }}>
          <li>{t('Daily challenge rotates: Quiz, Word Ladder, Photo Challenge, or Fact Check')}</li>
          <li>{t('Word Ladder: Transform one AMR term into another, one letter at a time')}</li>
          <li>{t('Photo Challenge: Take a real-world photo matching the prompt')}</li>
          <li>{t('Fact Check: Sort facts from myths about antimicrobial resistance')}</li>
          <li>{t('Weekly: 3 questions, 5 points each. Build your streak for bonus points!')}</li>
        </ul>
      </section>

      {showFramework && (
        <AiUpdateFramework onClose={() => setShowFramework(false)} />
      )}
    </div>
  )
}