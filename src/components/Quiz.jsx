import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Enhanced Quiz Component:
 * Seamlessly supports both a single question object `{ q, options, answer, why }`
 * OR an array of questions `[{ q, options, answer, why }, ...]`.
 * Provides question-by-question progress, instantaneous scientific feedback,
 * scoring summary, and awards stewardship mastery points upon completion.
 */
export default function Quiz({ q, onResult }) {
  const { t } = useTranslation()
  const questions = Array.isArray(q) ? q : [q]
  const [currIdx, setCurrIdx] = useState(0)
  const [picks, setPicks] = useState({})
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const currentQ = questions[currIdx]
  const currentPick = picks[currIdx] !== undefined ? picks[currIdx] : null

  const choose = (optionIdx) => {
    if (currentPick !== null) return
    const isRight = optionIdx === currentQ.answer
    setPicks((prev) => ({ ...prev, [currIdx]: optionIdx }))
    if (isRight) setCorrectCount((c) => c + 1)
  }

  const nextQuestion = () => {
    if (currIdx < questions.length - 1) {
      setCurrIdx((i) => i + 1)
    } else {
      setFinished(true)
      const passed = correctCount + (currentPick === currentQ.answer ? 1 : 0) >= Math.ceil(questions.length / 2)
      if (onResult) onResult(passed)
    }
  }

  if (finished) {
    const total = questions.length
    const score = correctCount
    return (
      <div className="quiz-result-card" role="region" aria-label={t('Quiz Results')}>
        <div className="quiz-result-header">
          <span className="quiz-trophy-icon">🏆</span>
          <div>
            <h3>{t('Verification Check Complete!')}</h3>
            <p className="muted">
              {t('You scored {{score}} out of {{total}} on this clinical & stewardship check.', { score, total })}
            </p>
          </div>
        </div>
        <div className="quiz-score-badge">
          <b>{score === total ? t('Perfect Score!') : t('Well Done!')}</b>
          <span>{t('+10 Stewardship Points Earned')}</span>
        </div>
        <div className="quiz-review-list">
          {questions.map((item, idx) => (
            <div key={idx} className="quiz-review-item">
              <p className="quiz-review-q">
                <b>#{idx + 1}:</b> {t(item.q)}
              </p>
              <p className={'quiz-review-ans ' + (picks[idx] === item.answer ? 'is-correct' : 'is-wrong')}>
                {picks[idx] === item.answer ? '✓ ' : '✗ '}
                <b>{picks[idx] === item.answer ? t('Your Answer:') : t('Correct Answer:')}</b> {t(item.options[item.answer])}
              </p>
              <p className="quiz-review-why">{t(item.why)}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-step-container" role="region" aria-label={t('Clinical Stewardship Quiz')}>
      <div className="quiz-meta-row">
        <span className="quiz-step-counter">
          {t('Question {{curr}} of {{total}}', { curr: currIdx + 1, total: questions.length })}
        </span>
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((currIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="quiz-question-title">{t(currentQ.q)}</h3>

      <div className="quiz-options-col">
        {currentQ.options.map((optionText, i) => {
          let btnClass = 'quiz-option-btn'
          if (currentPick !== null) {
            if (i === currentQ.answer) btnClass += ' right'
            else if (i === currentPick) btnClass += ' wrong'
          }
          return (
            <button
              key={i}
              disabled={currentPick !== null}
              onClick={() => choose(i)}
              className={btnClass}
            >
              <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
              <span className="opt-text">{t(optionText)}</span>
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="quiz-feedback-wrap">
        {currentPick !== null && (
          <div className={'quiz-feedback-box ' + (currentPick === currentQ.answer ? 'is-correct' : 'is-wrong')}>
            <p className="quiz-feedback-heading">
              {currentPick === currentQ.answer ? '✅ ' + t('Correct!') : '❌ ' + t('Not quite.')}
            </p>
            <p className="quiz-feedback-body">{t(currentQ.why)}</p>
            <button className="btn quiz-next-btn" onClick={nextQuestion}>
              {currIdx < questions.length - 1 ? t('Next Question →') : t('Complete Check & Claim Points →')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
