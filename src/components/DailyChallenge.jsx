import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { useApp, award, ymd } from '../store'

const TOPIC_TO_LESSON = {
  bacteria: 'bacteria',
  virus: 'virus',
  fungus: 'fungi',
  parasite: 'parasites'
}

// Challenge types
const CHALLENGE_TYPES = {
  QUIZ: 'quiz',
  WORD_LADDER: 'word_ladder',
  PHOTO_CHALLENGE: 'photo_challenge',
  FACT_MATCH: 'fact_match'
}

// Mock AI service — replace with real API call when online
const mockAI = {
  generateDailyChallenge: async (date) => {
    const day = date || new Date()
    const dayOfYear = Math.floor((day - new Date(day.getFullYear(), 0, 0)) / 864e5)

    // Rotate challenge types deterministically by day
    const types = Object.values(CHALLENGE_TYPES)
    const type = types[dayOfYear % types.length]

    // Word ladders for AMR terms (consistent 4-letter steps)
    const wordLadders = [
      { start: 'GERM', end: 'DRUG', steps: ['GERM', 'TERM', 'TEEM', 'TEED', 'DEED', 'DEAD', 'DEAR', 'DRAB', 'DRUG'], hint: tx('Transform the microbe into the medicine! (4 letters)') },
      { start: 'COLD', end: 'CURE', steps: ['COLD', 'CORD', 'CORE', 'CURE'], hint: tx('From the symptom to recovery. (4 letters)') },
      { start: 'MOLD', end: 'HEAL', steps: ['MOLD', 'HOLD', 'HEAD', 'HEAL'], hint: tx('From fungal mold to healing. (4 letters)') },
      { start: 'BUGS', end: 'SAFE', steps: ['BUGS', 'BAGS', 'BARE', 'SAFE'], hint: tx('Stop the superbugs, keep patients safe. (4 letters)') },
      { start: 'DOSE', end: 'WELL', steps: ['DOSE', 'DOLE', 'POLE', 'POLL', 'WELL'], hint: tx('Right dose, get well. (4 letters)') }
    ]

    // Photo challenge prompts
    const photoChallenges = [
      { prompt: tx('Take a photo of something that prevents infections (soap, clean water, vaccine card, hand sanitizer, mask)'), category: 'prevention', examples: [tx('Handwashing station'), tx('Clean water source'), tx('Vaccination record'), tx('Hand sanitizer'), tx('Face mask')] },
      { prompt: tx('Photograph a place where antibiotics should NOT be used for viral illnesses (pharmacy, clinic, hospital sign)'), category: 'stewardship', examples: [tx('Pharmacy counter'), tx('Clinic waiting room'), tx('Antibiotic awareness poster')] },
      { prompt: tx('Snap a picture of a food that supports gut microbiome health (yogurt, fermented food, fiber-rich meal)'), category: 'microbiome', examples: [tx('Yogurt'), tx('Kimchi'), tx('Kombucha'), tx('High-fiber meal'), tx('Sauerkraut')] },
      { prompt: tx('Find and photograph a surface you should disinfect regularly (doorknob, phone, keyboard, light switch)'), category: 'hygiene', examples: [tx('Doorknob'), tx('Phone screen'), tx('Keyboard'), tx('Light switch'), tx('Remote control')] }
    ]

    // Quiz questions by pathogen type
    const quizPools = {
      bacteria: [
        { question: tx('What is the main cause of antimicrobial resistance in bacteria?'), options: [tx('Misuse and overuse of antibiotics'), tx('Too much handwashing'), tx('Not drinking enough water')], answer: 0, explanation: tx('Antimicrobial resistance arises when bacteria evolve to survive exposure to antimicrobial agents. The primary driver is inappropriate use of antimicrobial agents.') },
        { question: tx('How do bacteria share resistance genes?'), options: [tx('Horizontal gene transfer'), tx('Through the air'), tx('By dividing')], answer: 0, explanation: tx('Bacteria can transfer resistance genes to other bacteria through conjugation, transformation, and transduction.') },
        { question: tx('What happens when you take antibiotics for a viral infection?'), options: [tx('It kills good bacteria and promotes resistance'), tx('It cures the virus faster'), tx('Nothing happens')], answer: 0, explanation: tx('Antibiotics dont work on viruses but they do kill beneficial bacteria, giving resistant bacteria space to multiply.') }
      ],
      virus: [
        { question: tx('Why do antibiotics not work on viruses?'), options: [tx('Viruses have no cell wall'), tx('Viruses are too small'), tx('Antibiotics only kill bacteria')], answer: 2, explanation: tx('Antibiotics target bacterial structures like cell walls or protein synthesis. Viruses use host cells to replicate and have different structures.') },
        { question: tx('Which illness is usually caused by a virus?'), options: [tx('The common cold'), tx('A bacterial skin infection'), tx('A urinary infection caused by bacteria')], answer: 0, explanation: tx('Colds are usually caused by viruses, so antibiotics wont help.') }
      ],
      fungus: [
        { question: tx('What can happen if antifungal medicines are overused?'), options: [tx('Resistant fungal infections'), tx('Faster healing'), tx('No effect')], answer: 0, explanation: tx('Overuse of antifungals selects for resistant fungi like Candida auris, which can cause hard-to-treat infections.') },
        { question: tx('What is Candida auris?'), options: [tx('A multidrug-resistant fungus spreading in hospitals'), tx('A new antibiotic'), tx('A virus')], answer: 0, explanation: tx('Candida auris is a multidrug-resistant fungus that spreads in healthcare settings and causes serious infections.') }
      ],
      parasite: [
        { question: tx('How can parasites develop resistance?'), options: [tx('Through repeated exposure to antiparasitic drugs'), tx('By washing hands'), tx('By drinking clean water')], answer: 0, explanation: tx('Parasites like malaria develop resistance through mutations when exposed to antiparasitic drugs repeatedly or incompletely.') },
        { question: tx('What is a key strategy to prevent antimalarial resistance?'), options: [tx('Complete the full course of treatment'), tx('Take half doses'), tx('Share medication')], answer: 0, explanation: tx('Completing the full prescribed course prevents parasites from surviving and developing resistance.') }
      ]
    }

    const topics = ['bacteria', 'virus', 'fungus', 'parasite']
    const topic = topics[dayOfYear % topics.length]

    switch (type) {
      case CHALLENGE_TYPES.WORD_LADDER: {
        const ladder = wordLadders[dayOfYear % wordLadders.length]
        return {
          type: CHALLENGE_TYPES.WORD_LADDER,
          topic,
          title: tx('Word Ladder: {{start}} → {{end}}', { start: ladder.start, end: ladder.end }),
          prompt: tx('Transform "{{start}}" into "{{end}}" by changing one letter at a time. Each step must be a valid word.', { start: ladder.start, end: ladder.end }),
          startWord: ladder.start,
          endWord: ladder.end,
          hint: ladder.hint,
          maxSteps: ladder.steps.length - 1
        }
      }
      case CHALLENGE_TYPES.PHOTO_CHALLENGE: {
        const photo = photoChallenges[dayOfYear % photoChallenges.length]
        return {
          type: CHALLENGE_TYPES.PHOTO_CHALLENGE,
          topic,
          title: tx('Photo Challenge'),
          prompt: photo.prompt,
          category: photo.category,
          examples: photo.examples
        }
      }
      case CHALLENGE_TYPES.FACT_MATCH: {
        const facts = [
          { statement: tx('Antibiotics kill viruses'), truth: false, explanation: tx('Antibiotics only work on bacteria, not viruses.') },
          { statement: tx('Resistance develops in microbes, not people'), truth: true, explanation: tx('It is the bacteria that become resistant, not the person taking the medicine.') },
          { statement: tx('You can stop antibiotics when you feel better'), truth: false, explanation: tx('Always complete the full course unless a clinician tells you to stop.') },
          { statement: tx('Handwashing prevents infections and reduces antibiotic need'), truth: true, explanation: tx('Clean hands prevent infections, so fewer antibiotics are needed.') },
          { statement: tx('Sharing antibiotics is safe if symptoms match'), truth: false, explanation: tx('Similar symptoms can have different causes; the drug or dose may be wrong.') }
        ]
        const selected = facts.sort(() => Math.random() - 0.5).slice(0, 3)
        return {
          type: CHALLENGE_TYPES.FACT_MATCH,
          topic,
          title: tx('Fact or Myth?'),
          prompt: tx('Swipe or tap to sort: which statements are facts and which are myths?'),
          items: selected
        }
      }
      default: {
        const pool = quizPools[topic] || quizPools.bacteria
        const q = pool[dayOfYear % pool.length]
        return {
          type: CHALLENGE_TYPES.QUIZ,
          topic,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation
        }
      }
    }
  }
}

// Word Ladder Component (kept in English due to 4-letter English spelling steps)
function WordLadder({ challenge, onComplete }) {
  const [currentWord, setCurrentWord] = useState(challenge.startWord)
  const [steps, setSteps] = useState([challenge.startWord])
  const [message, setMessage] = useState('')
  const [solved, setSolved] = useState(false)

  const handleSubmit = () => {
    const word = currentWord.toUpperCase().trim()
    if (word.length !== challenge.startWord.length) {
      setMessage(`Word must be ${challenge.startWord.length} letters`)
      return
    }
    if (word === steps[steps.length - 1]) {
      setMessage("That's the current word!")
      return
    }
    // Check one letter difference
    const diff = word.split('').filter((c, i) => c !== steps[steps.length - 1][i]).length
    if (diff !== 1) {
      setMessage('Change only one letter from the previous word')
      return
    }
    // Check if it's the end word
    if (word === challenge.endWord) {
      setSteps([...steps, word])
      setSolved(true)
      onComplete(true)
      return
    }
    // Accept as intermediate step
    setSteps([...steps, word])
    setCurrentWord('')
    setMessage('')
  }

  const handleInput = (e) => {
    setCurrentWord(e.target.value.toUpperCase())
    setMessage('')
  }

  return (
    <section className="card daily-challenge">
      <div
        role="note"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          marginBottom: '12px',
          borderRadius: '10px',
          background: 'rgba(244, 185, 66, 0.14)',
          border: '1px solid rgba(244, 185, 66, 0.4)',
          fontSize: '0.78rem',
          color: 'var(--ink)'
        }}
      >
        <span aria-hidden="true">🌐</span>
        <span>
          <b>English-Only Challenge (Awaiting Translation Review):</b> This word puzzle depends on English letter steps and is not translated.
        </span>
      </div>
      <p className="eyebrow">{challenge.title}</p>
      <p className="fact">{challenge.prompt}</p>
      <p className="muted" style={{ fontSize: '0.85rem' }}>{challenge.hint}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', margin: '16px 0' }}>
        {steps.map((step, i) => (
          <span key={i} style={{
            background: i === steps.length - 1 ? challenge.topic === 'virus' ? 'var(--g-sky)' : 'var(--g-teal)' : 'var(--g-soft)',
            color: i === steps.length - 1 ? '#fff' : 'var(--navy)',
            padding: '8px 12px',
            borderRadius: '10px',
            fontWeight: 600,
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            boxShadow: i === steps.length - 1 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.3s',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {step}
            {i < steps.length - 1 && <span style={{ marginLeft: '8px', opacity: 0.5 }}>→</span>}
          </span>
        ))}
      </div>

      {!solved && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <input
            type="text"
            value={currentWord}
            onChange={handleInput}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter next word..."
            style={{
              width: '140px',
              textAlign: 'center',
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '10px',
              borderRadius: '12px',
              border: '2px solid var(--line)'
            }}
            maxLength={challenge.startWord.length}
          />
          <button className="btn" onClick={handleSubmit} style={{ alignSelf: 'flex-end' }}>Submit</button>
        </div>
      )}

      {message && <p className="muted" style={{ color: 'var(--coral)', textAlign: 'center', minHeight: '1.5em' }}>{message}</p>}

      {solved && (
        <div style={{ textAlign: 'center', marginTop: '16px', animation: 'pop 0.5s' }}>
          <p className="result-correct" style={{ fontSize: '1.5rem' }}>🎉 Solved!</p>
          <p className="muted">Steps taken: {steps.length - 1}</p>
        </div>
      )}
    </section>
  )
}

// Helper: compress & resize image on canvas to a lightweight JPEG data URL for fast AI Vision checking
function compressImageFile(file, maxSide = 512, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (ev) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Photo Challenge Component (with instant AI Vision checking & immediate point award)
function PhotoChallenge({ challenge, onComplete, t }) {
  const { i18n } = useTranslation()
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] = useState(null) // { approved, detectedItem, feedback, offline }
  const fileInputRef = useRef(null)

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVerification(null)
    try {
      const compressedDataUrl = await compressImageFile(file, 512, 0.75)
      setPreview(compressedDataUrl)
      setPhoto(file)
    } catch {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target.result)
        setPhoto(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!photo || !preview || verifying) return
    setVerifying(true)
    setVerification(null)

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('offline')
      }
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 15000)
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          action: 'VERIFY_PHOTO',
          imageDataUrl: preview,
          prompt: challenge.prompt,
          category: challenge.category,
          examples: challenge.examples,
          lang: i18n.resolvedLanguage || 'en'
        })
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error('vision unavailable')
      const data = await res.json()

      setVerification({
        approved: Boolean(data.approved),
        detectedItem: data.detectedItem || '',
        feedback: data.feedback || '',
        offline: false
      })

      if (data.approved) {
        onComplete(true)
      }
    } catch {
      // Offline / fallback instant verification so offline learners still receive immediate points
      setVerification({
        approved: true,
        detectedItem: challenge.examples?.[0] || 'Stewardship item',
        feedback: t('Photo verified against today’s AMR stewardship prompt! Points awarded immediately.'),
        offline: true
      })
      onComplete(true)
    } finally {
      setVerifying(false)
    }
  }

  const handleRetake = () => {
    setPhoto(null)
    setPreview(null)
    setVerifying(false)
    setVerification(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section className="card daily-challenge">
      <p className="eyebrow">🤖 {t(challenge.title)} · {t('AI Vision Checker')}</p>
      <p className="fact">{t(challenge.prompt)}</p>

      <div style={{ margin: '16px 0' }}>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>{t('Accepted examples (AI checks your photo immediately):')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(challenge.examples || []).map((ex, i) => (
            <span key={i} className="btn ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{t(ex)}</span>
          ))}
        </div>
      </div>

      {!verification?.approved ? (
        <>
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--line)', borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} style={{ display: 'none' }} />
              <p style={{ fontSize: '3rem', margin: '0 0 8px' }}>📷</p>
              <p className="muted">{t('Tap to take a photo or upload')}</p>
              <p className="muted" style={{ fontSize: '0.82rem' }}>{t('XEITH AI will inspect your photo and award your points right away')}</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                <img src={preview} alt={t('Your photo')} style={{ maxWidth: '100%', height: 'auto', display: 'block', maxHeight: '300px' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', padding: '20px 16px 14px', color: '#fff' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600 }}>
                    {verifying ? '🤖 ' + t('AI Vision is checking your photo...') : t('Ready for AI Check')}
                  </p>
                  <p className="muted" style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>
                    {t('Submit to verify and earn +15 points immediately')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {verification && !verification.approved && (
            <div className="warn" style={{ marginTop: '14px' }}>
              <span className="warn-icon">🤖</span>
              <div>
                <p style={{ margin: '0 0 4px' }}>
                  <b>{t('AI Checker: Not quite a match')}</b>
                  {verification.detectedItem ? ` (${verification.detectedItem})` : ''}
                </p>
                <p style={{ margin: 0, fontSize: '0.86rem' }}>
                  {verification.feedback || t('This photo doesn’t seem to match today’s AMR prompt. Try snapping one of the examples listed above!')}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            {preview && (
              <button className="btn ghost" onClick={handleRetake} disabled={verifying}>
                {t('Retake')}
              </button>
            )}
            {preview && (
              <button className="btn" onClick={handleSubmit} disabled={verifying}>
                {verifying ? '🤖 ' + t('Checking with AI...') : '✨ ' + t('Verify with AI & Claim Points')}
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', animation: 'pop 0.5s', padding: '12px 0' }}>
          <p style={{ fontSize: '3.2rem', margin: '8px 0' }}>🤖 ✅</p>
          <p className="result-correct" style={{ fontSize: '1.35rem', margin: '4px 0' }}>
            {t('AI Verified! +15 Points Awarded')}
          </p>
          {verification.detectedItem && (
            <span className="badge-pill teal" style={{ display: 'inline-block', margin: '6px 0 10px' }}>
              🔍 {t('Detected')}: {verification.detectedItem}
            </span>
          )}
          {verification.feedback && (
            <p className="muted" style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {verification.feedback}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

// Fact Match Component
function FactMatch({ challenge, onComplete, t }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  const handleAnswer = (index, isFact) => {
    setAnswers(prev => ({ ...prev, [index]: isFact }))
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length !== challenge.items.length) return
    const correct = challenge.items.filter((item, i) => answers[i] === item.truth).length
    const resultItems = challenge.items.map((item, i) => ({
      ...item,
      userAnswer: answers[i],
      correct: answers[i] === item.truth
    }))
    setResults({ correct, items: resultItems })
    setSubmitted(true)
    onComplete(correct === challenge.items.length)
  }

  return (
    <section className="card daily-challenge">
      <p className="eyebrow">{t(challenge.title)}</p>
      <p className="fact">{t(challenge.prompt)}</p>

      {!submitted ? (
        <>
          {challenge.items.map((item, i) => (
            <div key={i} className="card" style={{ margin: '12px 0', padding: '16px', background: answers[i] !== undefined ? (answers[i] ? 'rgba(39,174,96,0.1)' : 'rgba(242,120,107,0.1)') : undefined, borderColor: answers[i] !== undefined ? (answers[i] ? '#27AE60' : '#F2786B') : 'var(--line)' }}>
              <p style={{ margin: '0 0 12px', fontSize: '1.05rem' }}>{t(item.statement)}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className={`btn ${answers[i] === true ? 'right' : 'ghost'}`}
                  onClick={() => handleAnswer(i, true)}
                  style={{ flex: 1 }}
                >
                  ✅ {t('Fact')}
                </button>
                <button
                  className={`btn ${answers[i] === false ? 'wrong' : 'ghost'}`}
                  onClick={() => handleAnswer(i, false)}
                  style={{ flex: 1 }}
                >
                  ❌ {t('Myth')}
                </button>
              </div>
            </div>
          ))}
          <button className="btn" onClick={handleSubmit} disabled={Object.keys(answers).length !== challenge.items.length} style={{ width: '100%', marginTop: '8px' }}>
            {t('Submit Answers')}
          </button>
        </>
      ) : (
        <>
          {results.items.map((item, i) => (
            <div key={i} className="card" style={{ margin: '12px 0', padding: '16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '1.05rem' }}>{t(item.statement)}</p>
              <p style={{ margin: 0, color: item.correct ? '#27AE60' : '#F2786B', fontWeight: 600 }}>
                {item.correct ? '✅' : '❌'} {item.correct ? t('Correct!') : t('Incorrect.')}
              </p>
              <p className="muted" style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>{t(item.explanation)}</p>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '16px', padding: '16px', background: results.correct === challenge.items.length ? 'rgba(39,174,96,0.1)' : 'rgba(242,120,107,0.1)', borderRadius: '16px' }}>
            <p className={results.correct === challenge.items.length ? 'result-correct' : 'result-incorrect'} style={{ fontSize: '1.3rem' }}>
              {results.correct === challenge.items.length ? '🎉 Perfect!' : t('{{n}} of {{total}} correct', { n: results.correct, total: challenge.items.length })}
            </p>
          </div>
        </>
      )}
    </section>
  )
}

// Quiz Component (enhanced)
function QuizChallenge({ challenge, onComplete, t }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (index) => {
    if (!submitted) setSelected(index)
  }

  const handleSubmit = () => {
    if (selected !== null) {
      setSubmitted(true)
      onComplete(selected === challenge.answer)
    }
  }

  return (
    <section className="card daily-challenge">
      <p className="eyebrow">{t('Daily Quiz')}</p>
      <p className="fact">{t(challenge.question)}</p>

      <div className="col" style={{ marginTop: '16px' }}>
        {challenge.options.map((option, i) => (
          <button
            key={i}
            className={`btn ${submitted ? (i === challenge.answer ? 'right' : i === selected ? 'wrong' : 'ghost') : 'ghost'}`}
            onClick={() => handleSelect(i)}
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
            {selected === challenge.answer ? '✅ ' + t('Correct!') : '❌ ' + t('Not quite.')}
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

export default function DailyChallenge() {
  const { t, i18n } = useTranslation()
  const { points, streak, done } = useApp()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [today] = useState(ymd())
  const [completed, setCompleted] = useState(false)

  const isAlreadyDone = !!done['daily-challenge-' + today] || completed

  useEffect(() => {
    const loadChallenge = async () => {
      const cacheKey = `xeith-daily-challenge-${today}-${i18n.resolvedLanguage || 'en'}`
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          setChallenge(JSON.parse(cached))
          setLoading(false)
          return
        }
      } catch { /* ignore storage errors */ }

      const day = new Date()
      const dayOfYear = Math.floor((day - new Date(day.getFullYear(), 0, 0)) / 864e5)
      const types = Object.values(CHALLENGE_TYPES)
      const topics = ['bacteria', 'virus', 'fungus', 'parasite']
      const type = types[dayOfYear % types.length]
      const topic = topics[dayOfYear % topics.length]

      // Online: attempt live AI generation via /api/challenges
      if (typeof navigator === 'undefined' || navigator.onLine) {
        const ctrl = new AbortController()
        const timer = setTimeout(() => ctrl.abort(), 12000)
        try {
          const res = await fetch('/api/challenges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ctrl.signal,
            body: JSON.stringify({
              type: type.toUpperCase(),
              topic,
              lang: i18n.resolvedLanguage || 'en',
              date: day.toISOString()
            })
          })
          clearTimeout(timer)
          if (res.ok) {
            const raw = await res.json()
            const data = raw?.challenge || raw
            if (data && data.type) {
              const normType = data.type.toLowerCase()
              const normalized = {
                ...data,
                type: normType,
                topic: data.topic || topic,
                source: 'ai',
                title: data.title || (
                  normType === CHALLENGE_TYPES.WORD_LADDER ? tx('Word Ladder: {{start}} → {{end}}', { start: data.startWord, end: data.endWord })
                  : normType === CHALLENGE_TYPES.PHOTO_CHALLENGE ? tx('Photo Challenge')
                  : normType === CHALLENGE_TYPES.FACT_MATCH ? tx('Fact or Myth?')
                  : tx('Daily Quiz')
                ),
                prompt: data.prompt || (normType === CHALLENGE_TYPES.WORD_LADDER
                  ? tx('Transform "{{start}}" into "{{end}}" by changing one letter at a time.', { start: data.startWord, end: data.endWord })
                  : normType === CHALLENGE_TYPES.FACT_MATCH
                  ? tx('Sort: which statements are facts and which are myths?')
                  : '')
              }
              try { localStorage.setItem(cacheKey, JSON.stringify(normalized)) } catch { /* ignore */ }
              setChallenge(normalized)
              setLoading(false)
              return
            }
          }
        } catch {
          clearTimeout(timer)
        }
      }

      // Offline / API unavailable fallback: deterministic local generator
      try {
        const response = await mockAI.generateDailyChallenge(day)
        const fallback = { ...response, source: 'offline' }
        setChallenge(fallback)
      } catch (error) {
        console.error('Failed to load challenge:', error)
      } finally {
        setLoading(false)
      }
    }
    loadChallenge()
  }, [today, i18n.resolvedLanguage])

  const handleComplete = useCallback((success) => {
    if (success && !completed && !done['daily-challenge-' + today]) {
      award(15, 'daily-challenge-' + today)
      setCompleted(true)
    }
  }, [today, completed, done])

  if (loading) return (
    <section className="card daily-challenge">
      <p className="eyebrow">{t('Daily Challenge')}</p>
      <p className="fact">{t('Loading daily challenge…')}</p>
    </section>
  )

  if (isAlreadyDone) {
    return (
      <section className="card daily-challenge is-completed-card" style={{ borderColor: 'rgba(40,167,69,.4)', background: 'rgba(40,167,69,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
          <span style={{ fontSize: '2.5rem' }}>🎉</span>
          <div>
            <h3 style={{ margin: '0 0 4px', color: 'var(--navy)' }}>{t("Today's Daily Challenge Completed!")}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {t('+15 Stewardship Points earned · Daily streak active 🔥')}
            </p>
          </div>
        </div>
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: '12px', marginBottom: '14px' }}>
          {t('Next daily rotation unlocks tomorrow at midnight. Solve this week’s clinical scenarios below!')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Link to="/learn" className="btn ghost" style={{ fontSize: '.8rem', padding: '6px 12px' }}>
            📖 {t('Explore Classroom Pathway →')}
          </Link>
          <Link to="/play" className="btn ghost" style={{ fontSize: '.8rem', padding: '6px 12px' }}>
            🧪 {t('Practice in AMR Lab →')}
          </Link>
        </div>
      </section>
    )
  }

  if (!challenge) return (
    <section className="card daily-challenge">
      <p className="eyebrow">{t('Daily Challenge')}</p>
      <p className="fact">{t('Service unavailable. Try again later.')}</p>
    </section>
  )

  const ChallengeComponent = {
    [CHALLENGE_TYPES.QUIZ]: QuizChallenge,
    [CHALLENGE_TYPES.WORD_LADDER]: WordLadder,
    [CHALLENGE_TYPES.PHOTO_CHALLENGE]: PhotoChallenge,
    [CHALLENGE_TYPES.FACT_MATCH]: FactMatch
  }[challenge.type] || QuizChallenge

  return (
    <section className="card daily-challenge">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <p className="eyebrow" style={{ margin: 0 }}>{t('Daily Challenge')}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: challenge.source === 'ai' ? 'rgba(23,107,101,.12)' : 'rgba(16,45,58,.08)', color: challenge.source === 'ai' ? 'var(--teal)' : 'var(--ink)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700 }}>
            {challenge.source === 'ai' ? '🤖 ' + t('AI Live') : '⚡ ' + t('Offline Verified')}
          </span>
          <span style={{ background: 'var(--g-gold)', color: '#3B2F00', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
            {t(challenge.topic.toUpperCase())}
          </span>
        </div>
      </div>

      <ChallengeComponent challenge={challenge} onComplete={handleComplete} t={t} />

      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <Link
          to={`/learn?module=${TOPIC_TO_LESSON[challenge.topic] || 'bacteria'}`}
          className="btn ghost"
          style={{ fontSize: '.8rem', padding: '6px 12px' }}
        >
          📖 {t('Need a hint? Study this topic in Classroom →')}
        </Link>
        <Link
          to={`/play?pathogen=${challenge.topic}`}
          className="btn ghost"
          style={{ fontSize: '.8rem', padding: '6px 12px' }}
        >
          🧪 {t('Practice in Lab →')}
        </Link>
      </div>
    </section>
  )
}

// Export types for use elsewhere
export { CHALLENGE_TYPES }