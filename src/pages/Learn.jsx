import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LESSONS, TIERS } from '../data/lessons'
import Quiz from '../components/Quiz'
import AiUpdateFramework from '../components/AiUpdateFramework'
import { award, useApp } from '../store'

const LESSON_TO_PATHOGEN = {
  bacteria: 'bacteria',
  virus: 'virus',
  fungi: 'fungus',
  parasites: 'parasite'
}

export default function Learn() {
  const { t } = useTranslation()
  const { done } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(() => searchParams.get('module') || null)
  const [step, setStep] = useState(0)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [viewMode, setViewMode] = useState('pathway') // 'pathway' | 'grid'
  const [showRefs, setShowRefs] = useState(true)
  const [showFramework, setShowFramework] = useState(false)

  useEffect(() => {
    const mod = searchParams.get('module')
    if (mod && LESSONS.some((l) => l.id === mod)) {
      setOpen(mod)
      setStep(0)
    }
  }, [searchParams])

  const openModule = (id) => {
    setOpen(id)
    setStep(0)
    setSearchParams(id ? { module: id } : {})
  }

  const lesson = LESSONS.find((l) => l.id === open)

  // Calculate completed modules
  const completedCount = LESSONS.filter((l) => done['lesson-' + l.id]).length
  const progressPercent = Math.round((completedCount / LESSONS.length) * 100)

  // Determine User Stewardship Rank
  let userRank = {
    title: t('Novice Steward'),
    level: 1,
    icon: '🌱',
    desc: t('Building core foundational knowledge on pathogens and mechanisms.')
  }
  if (completedCount >= 5) {
    userRank = {
      title: t('Master One Health Sentinel'),
      level: 3,
      icon: '🌍',
      desc: t('Advanced mastery across clinical stewardship and agro-environmental policy.')
    }
  } else if (completedCount >= 3) {
    userRank = {
      title: t('Clinical Advocate'),
      level: 2,
      icon: '🩺',
      desc: t('Intermediate expertise in diagnostic stewardship and clinical regimens.')
    }
  }

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
            <button
              className="btn ghost ai-framework-btn"
              onClick={() => setShowFramework(true)}
              title={t('View how the AI continuously verifies and updates surveillance info')}
            >
              🤖 {t('AI Knowledge Update Framework')}
            </button>
          </div>

          <h1>{t('The AMR Classroom')}</h1>
          <p className="lead">
            {t('Follow a structured Beginner-to-Advanced pathway across biological mechanisms, clinical diagnostic protocols, and One Health systems in Nigeria.')}
          </p>

          {/* User Rank & Progression Card */}
          <div className="classroom-progress-card">
            <div className="progress-info-row">
              <div className="user-rank-info">
                <span className="user-rank-badge">
                  {userRank.icon} {t('Rank: {{title}} (Level {{lvl}})', { title: userRank.title, lvl: userRank.level })}
                </span>
                <p className="progress-count">
                  <b>{completedCount}</b> / {LESSONS.length} {t('Modules Mastered')} • {progressPercent}%
                </p>
              </div>
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

            <div className="classroom-progress-track">
              <div
                className="classroom-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
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
                            {t('Level {{lvl}}: {{badge}}', { lvl: tier.level, badge: tier.badge })}
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
                      <span className="tier-mastered-badge">✅ {t('Tier Mastered')}</span>
                    )}
                  </div>

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
            onClick={() => setStep(idx)}
          >
            <span className="tab-idx">{step > idx ? '✓' : idx + 1}</span>
            <span className="tab-title">{t(s.heading.split(':')[0])}</span>
          </button>
        ))}
        <button
          role="tab"
          aria-selected={isQuizStep}
          className={'step-tab-btn check-tab' + (isQuizStep ? ' is-active' : '')}
          onClick={() => setStep(totalSteps)}
        >
          <span className="tab-idx">🎯</span>
          <span className="tab-title">{t('Verification Check')}</span>
        </button>
      </div>

      {/* Step Content Card */}
      <div className="card lesson-body-card">
        {!isQuizStep ? (
          <article className="step-content-article">
            <div className="step-content-header">
              <span className="step-counter-tag">
                {t('Part {{curr}} of {{total}}', { curr: step + 1, total: totalSteps })}
              </span>
              <h2 className="step-heading">{t(currentStepData.heading)}</h2>
            </div>

            <div className="step-paragraphs">
              {t(currentStepData.content).split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="step-p">{paragraph}</p>
              ))}
            </div>

            {currentStepData.caseStudy && (
              <aside className="lesson-callout callout-vignette" role="note" aria-label={t('Nigerian Field Reality')}>
                <div className="callout-icon-col">
                  <span>🏥</span>
                </div>
                <div>
                  <h4 className="callout-title">{t('Nigerian Field Reality & Clinical Context')}</h4>
                  <p className="callout-body">{t(currentStepData.caseStudy)}</p>
                </div>
              </aside>
            )}

            {currentStepData.takeaway && (
              <aside className="lesson-callout callout-rule" role="note" aria-label={t('Stewardship Rule of Thumb')}>
                <div className="callout-icon-col">
                  <span>🛡️</span>
                </div>
                <div>
                  <h4 className="callout-title">{t('Stewardship Rule of Thumb')}</h4>
                  <p className="callout-body">{t(currentStepData.takeaway)}</p>
                </div>
              </aside>
            )}

            <div className="step-navigation-row">
              <button
                className="btn ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                ← {t('Previous')}
              </button>
              <button
                className="btn primary"
                onClick={() => setStep((s) => s + 1)}
              >
                {step === totalSteps - 1 ? t('Proceed to Verification Check →') : t('Next Step →')}
              </button>
            </div>
          </article>
        ) : (
          <div className="lesson-quiz-step">
            <div className="quiz-header-banner">
              <h2>🎯 {t('Mastery Verification Check')}</h2>
              <p className="muted">
                {t('Test your comprehension of the biological mechanisms and clinical stewardship protocols covered in this module. Pass this check to earn 10 points!')}
              </p>
            </div>
            <Quiz
              q={lesson.checks || lesson.check}
              onResult={(ok) => {
                if (ok) award(10, 'lesson-' + lesson.id)
              }}
            />

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
