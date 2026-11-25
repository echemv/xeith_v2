import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { useApp, award, ymd, dayNumber, weekNumber } from '../store'
import DailyChallenge from '../components/DailyChallenge'

export default function Challenges() {
  const { t } = useTranslation()
  const { done, points, streak } = useApp()
  const dailyId = 'daily-' + ymd()
  const wk = weekNumber()
  const weeklyIds = [0, 1, 2].map(k => 'week-' + wk + '-' + k)

  const WeeklyChallenge = ({ index, id }) => {
    const { done } = useApp()
    const isDone = done[id]

    // Simple weekly challenges - could be enhanced with AI
    const weeklyChallenges = [
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

    const challenge = weeklyChallenges[index]

    if (isDone) {
      return (
        <section className="card" key={id}>
          <p className="eyebrow">{t('Question {{n}} of 3', { n: index + 1 })}</p>
          <p style={{ textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '3rem' }}>✅</span>
            <br />
            <b>{t('Completed')}</b>
            <p className="muted" style={{ marginTop: '8px' }}>{t('+5 points earned')}</p>
          </p>
        </section>
      )
    }

    const [selected, setSelected] = useState(null)
    const [submitted, setSubmitted] = useState(false)

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

  return (
    <>
      <h1>{t('Challenges')}</h1>
      <p className="lead">🔥 {t('Streak: {{n}} days', { n: streak })} · ⭐ {t('{{n}} points', { n: points })}</p>

      <section className="card"><p className="eyebrow">{t('Today')}</p>
        <DailyChallenge />
      </section>

      <h2>{t('This Week')}</h2>
      {weeklyIds.map((id, k) => <WeeklyChallenge key={id} index={k} id={id} />)}

      <section className="card glass" style={{ marginTop: '24px' }}>
        <p className="eyebrow">{t('How challenges work')}</p>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2 }}>
          <li>{t('Daily challenge rotates: Quiz, Word Ladder, Photo Challenge, or Fact Check')}</li>
          <li>{t('Word Ladder: Transform one AMR term into another, one letter at a time')}</li>
          <li>{t('Photo Challenge: Take a real-world photo matching the prompt')}</li>
          <li>{t('Fact Check: Sort facts from myths about antimicrobial resistance')}</li>
          <li>{t('Weekly: 3 questions, 5 points each. Build your streak for bonus points!')}</li>
        </ul>
      </section>
    </>
  )
}