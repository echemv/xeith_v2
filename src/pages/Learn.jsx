import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LESSONS, TIERS } from '../data/lessons'
import Quiz from '../components/Quiz'
import AiUpdateFramework from '../components/AiUpdateFramework'
import { ClassroomSectionCardBanner } from '../components/PlayerAchievementCards'
import { getPlayerRank } from '../data/achievements'
import { award, useApp } from '../store'

const LESSON_TO_PATHOGEN = {
  'intro-pathogens': 'bacteria',
  'what-is-amr': 'bacteria',
  bacteria: 'bacteria',
  virus: 'virus',
  fungi: 'fungus',
  parasites: 'parasite'
}

const KEY_TERMS_GLOSSARY = [
  { term: 'Microbe', def: 'A tiny living organism (like bacteria or yeast) only visible under a microscope—most are harmless or helpful.' },
  { term: 'Pathogen', def: 'A disease-causing germ (bacteria, virus, fungus, or parasite) that can make people, animals, or plants sick.' },
  { term: 'AMR', def: 'Antimicrobial Resistance—when germs evolve armor or pumps so the medicines that used to kill them stop working.' },
  { term: 'ACT', def: 'Artemisinin-based Combination Therapy—the 3-day (6-dose) gold-standard tablet course for confirmed malaria.' },
  { term: 'RDT', def: 'Rapid Diagnostic Test—a quick 15-minute finger-prick blood test to confirm malaria before taking medicine.' },
  { term: 'NAFDAC MAS', def: 'Mobile Authentication Service—scratch the panel on a medicine pack and SMS the code to 38353 for free to verify it is genuine.' }
]

export default function Learn() {
  const { t } = useTranslation()
  const { done, points, streak, profile } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(() => searchParams.get('module') || null)
  const [step, setStep] = useState(0)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [viewMode, setViewMode] = useState('pathway') // 'pathway' | 'grid'
  const [showRefs, setShowRefs] = useState(false)
  const [showFramework, setShowFramework] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const mod = searchParams.get('module')
    if (mod && LESSONS.some((l) => l.id === mod)) {
      setOpen(mod)
      setStep(0)
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [open, step])

  const openModule = (id) => {
    setOpen(id)
    setStep(0)
    setSearchParams(id ? { module: id } : {})
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  const changeStep = (nextStep) => {
    setStep(nextStep)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  const toggleSpeakStep = (headingText, bodyText) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(`${headingText}. ${bodyText}`)
    utter.rate = 0.98
    utter.onend = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utter)
  }

  const lesson = LESSONS.find((l) => l.id === open)

  // Calculate completed modules & unified rank
  const completedCount = LESSONS.filter((l) => done['lesson-' + l.id]).length
  const progressPercent = Math.round((completedCount / LESSONS.length) * 100)
  const userRank = getPlayerRank(done, null, points)
  const nextUnfinishedLesson = [...LESSONS].sort((a, b) => a.order - b.order).find((l) => !done['lesson-' + l.id])

  // Categories list for filtering in Grid view
  const categories = ['ALL', ...new Set(LESSONS.map((l) => l.category))]
  const filteredLessons = activeCategory === 'ALL'
    ? LESSONS
    : LESSONS.filter((l) => l.category === activeCategory)

  if (!lesson) {
    return (
      <div className="classroom-overview animate-fade-in">
        {/* Header with Rank & AI Update Framework button */}
        <header className="classroom-header">
          <div className="header-meta-row">
            <div className="classroom-hero-badge">
              <span>🎓</span> {t('Evidence-Based Stewardship Curriculum')}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn ghost ai-framework-btn"
                onClick={() => setShowGlossary(!showGlossary)}
              >
                📖 {showGlossary ? t('Hide Key Terms Glossary') : t('Quick Key Terms Glossary')}
              </button>
              <button
                className="btn ghost ai-framework-btn"
                onClick={() => setShowFramework(true)}
                title={t('View how the AI continuously verifies and updates surveillance info')}
              >
                🤖 {t('AI Knowledge Update Framework')}
              </button>
            </div>
          </div>

          <h1>{t('The AMR Classroom')}</h1>
          <p className="lead">
            {t('Start from the basics of microbes and pathogens, explore how bacteria, viruses, fungi, and parasites work, and build your way up step by step. Complete each section to unlock shareable Collector Cards and new game levels!')}
          </p>

          {showGlossary && (
            <div className="classroom-glossary-drawer animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>📖 {t('Everyday AMR Key Terms Glossary')}</h4>
                <button className="btn ghost" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setShowGlossary(false)}>✕</button>
              </div>
              <div className="glossary-chips-grid">
                {KEY_TERMS_GLOSSARY.map((g) => (
                  <div key={g.term} className="glossary-term-card">
                    <b>{t(g.term)}</b>
                    <p>{t(g.def)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Rank, Next Module CTA & Unlock Milestones Card */}
          <div className="classroom-progress-card">
            <div className="progress-info-row">
              <div className="user-rank-info">
                <span className="user-rank-badge">
                  {userRank.icon} {t('Rank: {{title}} (Level {{lvl}})', { title: t(userRank.title), lvl: userRank.level })}
                </span>
                <p className="progress-count">
                  <b>{completedCount}</b> / {LESSONS.length} {t('Modules Mastered')} • {progressPercent}%
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {nextUnfinishedLesson && (
                  <button
                    className="btn primary"
                    style={{ fontSize: '0.84rem', padding: '9px 16px' }}
                    onClick={() => openModule(nextUnfinishedLesson.id)}
                  >
                    ▶ {t('Continue Step {{n}}: {{title}}', { n: nextUnfinishedLesson.order, title: t(nextUnfinishedLesson.title) })}
                  </button>
                )}
                <div className="view-mode-toggle" role="group" aria-label={t('Curriculum Layout')}>
                  <button
                    className={'toggle-btn' + (viewMode === 'pathway' ? ' active' : '')}
                    onClick={() => setViewMode('pathway')}
                  >
                    🗺️ {t('Pathway View')}
                  </button>
                  <button
                    className={'toggle-btn' + (viewMode === 'grid' ? ' active' : '')}
                    onClick={() => setViewMode('grid')}
                  >
                    ▦ {t('Grid View')}
                  </button>
                </div>
              </div>
            </div>

            <div className="classroom-progress-track">
              <div
                className="classroom-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Unified Classroom Unlock Milestones Strip */}
            <div className="classroom-unlock-milestones">
              <div className={`unlock-milestone-pill ${completedCount >= 2 ? 'is-reached' : ''}`}>
                <span>{completedCount >= 2 ? '✅' : '🔒'}</span>
                <span>{t('2 Modules: Section 1 Card + Level 2 Scenarios & Outbreak Surge')}</span>
              </div>
              <div className={`unlock-milestone-pill ${completedCount >= 5 ? 'is-reached' : ''}`}>
                <span>{completedCount >= 5 ? '✅' : '🔒'}</span>
                <span>{t('5 Modules: Level 3 Superbug Crisis & ICU Scenarios')}</span>
              </div>
              <div className={`unlock-milestone-pill ${completedCount >= 9 ? 'is-reached' : ''}`}>
                <span>{completedCount >= 9 ? '✅' : '🔒'}</span>
                <span>{t('9 Modules: All 3 Section Cards + Grand Steward Legendary Card')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* VIEW 1: BEGINNER TO ADVANCED PATHWAY VIEW */}
        {viewMode === 'pathway' && (
          <div className="pathway-container animate-fade-in">
            {TIERS.map((tier) => {
              const tierLessons = LESSONS.filter((l) => tier.moduleIds.includes(l.id)).sort((a, b) => a.order - b.order)
              const tierDoneCount = tierLessons.filter((l) => done['lesson-' + l.id]).length
              const isTierComplete = tierDoneCount === tierLessons.length

              return (
                <section key={tier.id} className={'pathway-tier-section' + (isTierComplete ? ' tier-finished' : '')}>
                  <div className="tier-header-card">
                    <div className="tier-header-left">
                      <span className="tier-icon-circle" style={{ borderColor: tier.color }}>
                        {tier.icon}
                      </span>
                      <div>
                        <div className="tier-meta-badges">
                          <span className="tier-level-tag">
                            {t('Level {{lvl}}: {{badge}}', { lvl: tier.level, badge: t(tier.badge) })}
                          </span>
                          <span className="tier-progress-tag">
                            {tierDoneCount}/{tierLessons.length} {t('Completed')}
                          </span>
                        </div>
                        <h2 className="tier-title">{t(tier.title)}</h2>
                        <p className="tier-desc">{t(tier.subtitle)}</p>
                      </div>
                    </div>
                    {isTierComplete && (
                      <span className="tier-mastered-badge">✅ {t('Section Mastered')}</span>
                    )}
                  </div>

                  {/* Section Mastery Collector Card with Social Media Sharing */}
                  <ClassroomSectionCardBanner
                    tier={tier}
                    isTierComplete={isTierComplete}
                    tierDoneCount={tierDoneCount}
                    tierTotalCount={tierLessons.length}
                    points={points}
                    streak={streak}
                    playerName={profile?.name}
                  />

                  <div className="pathway-milestones-track">
                    {tierLessons.map((l, mIdx) => {
                      const isCompleted = !!done['lesson-' + l.id]
                      return (
                        <div key={l.id} className="pathway-milestone-wrap">
                          <div
                            className={'pathway-card' + (isCompleted ? ' is-completed' : '')}
                            onClick={() => openModule(l.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openModule(l.id) }}
                          >
                            <div className="milestone-top">
                              <span className="milestone-num">
                                {isCompleted ? '✓' : t('Step {{n}}', { n: l.order })}
                              </span>
                              <span className="milestone-time">⏱️ {l.readTime}</span>
                            </div>

                            <span className="milestone-cat">{t(l.category)}</span>
                            <h3 className="milestone-title">{t(l.title)}</h3>
                            <p className="milestone-sub">{t(l.subtitle)}</p>

                            <div className="milestone-bottom">
                              <span className="milestone-evidence">
                                📑 {t('{{n}} sources', { n: l.references.length })}
                              </span>
                              <span className="milestone-cta">
                                {isCompleted ? t('Review →') : t('Start →')}
                              </span>
                            </div>
                          </div>
                          {mIdx < tierLessons.length - 1 && (
                            <div className="pathway-connector-line">
                              <span className="connector-arrow">↓</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* VIEW 2: CLASSIC GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid-view-container animate-fade-in">
            <div className="category-filter-chips" role="tablist" aria-label={t('Module Categories')}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={'category-chip' + (activeCategory === cat ? ' active' : '')}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'ALL' ? t('All Modules') : t(cat)}
                </button>
              ))}
            </div>

            <div className="module-grid-rich">
              {filteredLessons.map((l) => {
                const isCompleted = !!done['lesson-' + l.id]
                return (
                  <div
                    key={l.id}
                    className={'module-card-rich' + (isCompleted ? ' is-completed' : '')}
                    onClick={() => openModule(l.id)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openModule(l.id) }}
                  >
                    <div className="module-top-row">
                      <div className="module-tag-group">
                        <span className="module-tier-pill">
                          {l.tierIcon} {t(l.tierLevel.split(':')[0])}
                        </span>
                        <span className="module-category-tag">{t(l.category)}</span>
                      </div>
                      <span className="module-time-tag">⏱️ {l.readTime}</span>
                    </div>

                    <div className="module-main-info">
                      <div className="module-index-badge">
                        {isCompleted ? '✓' : `0${l.order}`}
                      </div>
                      <div>
                        <h3 className="module-title">{t(l.title)}</h3>
                        <p className="module-subtitle">{t(l.subtitle)}</p>
                      </div>
                    </div>

                    <p className="module-summary">{t(l.summary)}</p>

                    <div className="module-footer-row">
                      <span className="module-evidence-badge">
                        📑 {t('{{n}} sources', { n: l.references.length })}
                      </span>
                      <span className="module-action-link">
                        {isCompleted ? t('Review Module →') : t('Start Module →')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AI Knowledge Update Framework Modal */}
        {showFramework && (
          <AiUpdateFramework onClose={() => setShowFramework(false)} />
        )}
      </div>
    )
  }

  // Inside an active lesson
  const totalSteps = lesson.steps.length
  const isQuizStep = step === totalSteps
  const currentStepData = !isQuizStep ? lesson.steps[step] : null
  const nextModuleInOrder = LESSONS.find((l) => l.order === lesson.order + 1) || null
  const currentTier = TIERS.find((tr) => tr.moduleIds.includes(lesson.id))
  const currentTierLessons = currentTier ? LESSONS.filter((l) => currentTier.moduleIds.includes(l.id)) : []
  const currentTierDoneCount = currentTierLessons.filter((l) => done['lesson-' + l.id]).length
  const isCurrentTierComplete = currentTierLessons.length > 0 && currentTierDoneCount === currentTierLessons.length

  return (
    <div className="lesson-reader-container animate-fade-in">
      <div className="lesson-nav-top">
        <button className="btn ghost lesson-back-btn" onClick={() => openModule(null)}>
          ← {t('All Curriculum Modules')}
        </button>
        <div className="lesson-meta-badges">
          <span className="badge-tier">{lesson.tierIcon} {t(lesson.tierLevel)}</span>
          <span className="badge-category">{t(lesson.category)}</span>
          <span className="badge-time">⏱️ {lesson.readTime}</span>
          {done['lesson-' + lesson.id] && (
            <span className="badge-completed">✅ {t('Completed')}</span>
          )}
        </div>
      </div>

      <header className="lesson-reader-header">
        <h1>{t(lesson.title)}</h1>
        <p className="lesson-lead-subtitle">{t(lesson.subtitle)}</p>
      </header>

      {/* Step Tabs Navigation */}
      <div className="step-tabs-nav" role="tablist" aria-label={t('Lesson Steps')}>
        {lesson.steps.map((s, idx) => (
          <button
            key={idx}
            role="tab"
            aria-selected={step === idx}
            className={'step-tab-btn' + (step === idx ? ' is-active' : '') + (step > idx ? ' is-done' : '')}
            onClick={() => changeStep(idx)}
          >
            <span className="tab-idx">{step > idx ? '✓' : idx + 1}</span>
            <span className="tab-title">{t(s.heading.split(':')[0])}</span>
          </button>
        ))}
        <button
          role="tab"
          aria-selected={isQuizStep}
          className={'step-tab-btn check-tab' + (isQuizStep ? ' is-active' : '')}
          onClick={() => changeStep(totalSteps)}
        >
          <span className="tab-idx">🎯</span>
          <span className="tab-title">{t('Verification Check')}</span>
        </button>
      </div>

      {/* Step Content Card */}
      <div className="card lesson-body-card">
        {!isQuizStep ? (
          <article className="step-content-article">
            <div className="step-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <span className="step-counter-tag">
                  {t('Part {{curr}} of {{total}}', { curr: step + 1, total: totalSteps })}
                </span>
                <h2 className="step-heading">{t(currentStepData.heading)}</h2>
              </div>
              {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                <button
                  type="button"
                  className={`btn ${isSpeaking ? 'primary' : 'ghost'}`}
                  style={{ fontSize: '0.8rem', padding: '7px 13px' }}
                  onClick={() => toggleSpeakStep(t(currentStepData.heading), t(currentStepData.content))}
                >
                  {isSpeaking ? `⏹ ${t('Stop Audio')}` : `🔊 ${t('Listen to Step')}`}
                </button>
              )}
            </div>

            <div className="step-paragraphs">
              {t(currentStepData.content).split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="step-p">{paragraph}</p>
              ))}
            </div>

            {/* Interactive Visual Quick-Reference Cards for Key Modules */}
            {lesson.id === 'intro-pathogens' && step === 2 && (
              <div className="lesson-visual-grid">
                <div className="visual-match-card">
                  <span className="vm-icon">🦠</span>
                  <b>{t('Bacteria')}</b>
                  <span className="vm-pill">{t('Antibiotics ONLY')}</span>
                  <small>{t('Typhoid, Strep throat, UTIs')}</small>
                </div>
                <div className="visual-match-card">
                  <span className="vm-icon">🛡️</span>
                  <b>{t('Viruses')}</b>
                  <span className="vm-pill">{t('Rest, Fluids & Antivirals')}</span>
                  <small>{t('Common cold, Flu, COVID-19 (No Antibiotics!)')}</small>
                </div>
                <div className="visual-match-card">
                  <span className="vm-icon">🍄</span>
                  <b>{t('Fungi')}</b>
                  <span className="vm-pill">{t('Antifungals')}</span>
                  <small>{t('Ringworm, Athlete’s foot, Thrush')}</small>
                </div>
                <div className="visual-match-card">
                  <span className="vm-icon">🦟</span>
                  <b>{t('Parasites')}</b>
                  <span className="vm-pill">{t('Antimalarials (3-Day ACT)')}</span>
                  <small>{t('Malaria—always test with RDT first!')}</small>
                </div>
              </div>
            )}

            {lesson.id === 'systems-quality' && step === 0 && (
              <div className="lesson-visual-grid">
                <div className="visual-match-card">
                  <span className="vm-icon">🔢</span>
                  <b>{t('1. NAFDAC Reg. No.')}</b>
                  <small>{t('Check for a clear NAFDAC Registration Number printed on the box.')}</small>
                </div>
                <div className="visual-match-card">
                  <span className="vm-icon">📱</span>
                  <b>{t('2. Scratch & SMS 38353')}</b>
                  <small>{t('Scratch the MAS panel and text the PIN to 38353 for free instant verification.')}</small>
                </div>
                <div className="visual-match-card">
                  <span className="vm-icon">💊</span>
                  <b>{t('3. Sealed Blister Pack')}</b>
                  <small>{t('Never buy loose, unlabelled capsules or cut blister strips with no expiry date.')}</small>
                </div>
              </div>
            )}

            {currentStepData.caseStudy && (
              <aside className="lesson-callout callout-vignette" role="note" aria-label={t('Real-Life Example')}>
                <div className="callout-icon-col">
                  <span>🏥</span>
                </div>
                <div>
                  <h4 className="callout-title">{t('Real-Life Example & Nigerian Context')}</h4>
                  <p className="callout-body">{t(currentStepData.caseStudy)}</p>
                </div>
              </aside>
            )}

            {currentStepData.takeaway && (
              <aside className="lesson-callout callout-rule" role="note" aria-label={t('Key Takeaway')}>
                <div className="callout-icon-col">
                  <span>🛡️</span>
                </div>
                <div>
                  <h4 className="callout-title">{t('Key Takeaway to Remember')}</h4>
                  <p className="callout-body">{t(currentStepData.takeaway)}</p>
                </div>
              </aside>
            )}

            <div className="step-navigation-row">
              <button
                className="btn ghost"
                disabled={step === 0}
                onClick={() => changeStep(Math.max(0, step - 1))}
              >
                ← {t('Previous')}
              </button>
              <button
                className="btn primary"
                onClick={() => changeStep(step + 1)}
              >
                {step === totalSteps - 1 ? t('Proceed to Verification Check →') : t('Next Step →')}
              </button>
            </div>
          </article>
        ) : (
          <div className="lesson-quiz-step">
            <div className="quiz-header-banner">
              <h2>🎯 {t('Quick Check')}</h2>
              <p className="muted">
                {t('Check what you just learned in this lesson. Answer the questions below to earn 10 points!')}
              </p>
            </div>
            <Quiz
              q={lesson.checks || lesson.check}
              onResult={(ok) => {
                if (ok) award(10, 'lesson-' + lesson.id)
              }}
            />

            {/* Module & Section Completion Celebration + Next Module CTA */}
            {done['lesson-' + lesson.id] && (
              <div className="module-completion-celebration animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span className="badge-completed" style={{ display: 'inline-block', marginBottom: '6px' }}>
                      🎉 {t('Module Completed! (+10 Stewardship Pts)')}
                    </span>
                    <h3 style={{ margin: '0 0 4px' }}>
                      {isCurrentTierComplete
                        ? t('You completed all modules in {{tier}}!', { tier: t(currentTier.title) })
                        : t('Great job mastering {{title}}!', { title: t(lesson.title) })}
                    </h3>
                    <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                      {isCurrentTierComplete
                        ? t('Your shareable Section Collector Card is now unlocked below!')
                        : t('Keep going to finish this section and unlock your shareable Section Collector Card.')}
                    </p>
                  </div>
                  {nextModuleInOrder && (
                    <button
                      className="btn primary"
                      onClick={() => openModule(nextModuleInOrder.id)}
                    >
                      {t('Next Module: Step {{n}} →', { n: nextModuleInOrder.order })}
                    </button>
                  )}
                </div>

                {currentTier && (
                  <div style={{ marginTop: '14px' }}>
                    <ClassroomSectionCardBanner
                      tier={currentTier}
                      isTierComplete={isCurrentTierComplete}
                      tierDoneCount={currentTierDoneCount}
                      tierTotalCount={currentTierLessons.length}
                      points={points}
                      streak={streak}
                      playerName={profile?.name}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="cross-section-bridge" style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="muted" style={{ fontSize: '.85rem', fontWeight: 600 }}>
                🔗 {t('Apply this module across XEITH:')}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Link
                  to={LESSON_TO_PATHOGEN[lesson.id] ? `/play?pathogen=${LESSON_TO_PATHOGEN[lesson.id]}` : '/play'}
                  className="btn ghost"
                  style={{ fontSize: '.82rem', padding: '7px 14px' }}
                >
                  🧪 {t('Practice in The AMR Lab →')}
                </Link>
                <Link to="/challenges" className="btn ghost" style={{ fontSize: '.82rem', padding: '7px 14px' }}>
                  🔥 {t('Daily Challenges →')}
                </Link>
                <Link to="/map" className="btn ghost" style={{ fontSize: '.82rem', padding: '7px 14px' }}>
                  🗺️ {t('Nigeria Surveillance Map →')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scientific references section */}
      {lesson.references && lesson.references.length > 0 && (
        <section className="card lesson-references-card" aria-label={t('Academic & Clinical References')}>
          <div
            className="refs-header-toggle"
            onClick={() => setShowRefs(!showRefs)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowRefs(!showRefs) }}
          >
            <div className="refs-header-left">
              <span className="refs-icon">📚</span>
              <div>
                <h3 className="refs-title">{t('Scientific references')}</h3>
                <p className="refs-subtitle">{t('Direct evidence from WHO, NCDC, The Lancet, and peer-reviewed clinical studies.')}</p>
              </div>
            </div>
            <span className="refs-toggle-arrow">{showRefs ? '▲' : '▼'}</span>
          </div>

          {showRefs && (
            <div className="refs-list animate-fade-in">
              {lesson.references.map((ref, rIdx) => (
                <div key={rIdx} className="ref-item">
                  <div className="ref-index">[{rIdx + 1}]</div>
                  <div className="ref-content">
                    <p className="ref-citation">
                      <b>{ref.author}</b> ({ref.year}). <i>{ref.title}</i>. {ref.journal}.
                    </p>
                    {ref.stat && (
                      <div className="ref-key-stat">
                        <span className="stat-label">{t('Key finding:')}</span> {ref.stat}
                      </div>
                    )}
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ref-source-link"
                      >
                        🔗 {ref.url.startsWith('http') ? ref.url : `https://${ref.url}`}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* AI Update Framework button in reader footer */}
      <div className="reader-footer-framework-callout">
        <button
          className="btn ghost text-sm"
          onClick={() => setShowFramework(true)}
        >
          🤖 {t('How was this lesson verified? View AI Surveillance & Knowledge Update Framework')}
        </button>
      </div>

      {showFramework && (
        <AiUpdateFramework onClose={() => setShowFramework(false)} />
      )}
    </div>
  )
}
