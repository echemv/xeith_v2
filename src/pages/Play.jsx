import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { award, useApp } from '../store'
import Bacterium from '../components/Bacterium'
import StewardshipCommand from '../components/StewardshipCommand'

const PATHOGEN_TO_LESSON = {
  bacteria: 'bacteria',
  virus: 'virus',
  fungus: 'fungi',
  parasite: 'parasites'
}

// Pathogen types with unique mechanics
const PATHOGENS = [
  {
    id: 'bacteria',
    name: tx('Bacteria'),
    icon: '🦠',
    badge: 'Fast Multiplier',
    color: '#2A8F86',
    gradient: 'linear-gradient(135deg,#2A8F86,#176B65)',
    description: tx('Bacteria multiply fast. Target them with the right antibiotic before they develop resistance!'),
    mechanic: 'antibiotic-targeting',
    fact: tx('Bacteria can share resistance genes with each other through horizontal gene transfer.')
  },
  {
    id: 'virus',
    name: tx('Viruses'),
    icon: '🧪',
    badge: 'Antibiotics Ineffective',
    color: '#4FB3D9',
    gradient: 'linear-gradient(135deg,#4FB3D9,#176B65)',
    description: tx('Antibiotics DO NOT work on viruses. Avoid wasting antibiotics on viral infections!'),
    mechanic: 'avoid-antibiotics',
    fact: tx('Most colds, flu, and COVID-19 are caused by viruses. Antibiotics are useless against them.')
  },
  {
    id: 'fungus',
    name: tx('Fungi'),
    icon: '🍄',
    badge: 'Emerging Threat',
    color: '#D6A84B',
    gradient: 'linear-gradient(135deg,#F4B942,#D6A84B)',
    description: tx('Fungal infections need antifungals. Overuse breeds resistant fungi like Candida auris.'),
    mechanic: 'targeted-treatment',
    fact: tx('Candida auris is a multidrug-resistant fungus spreading in hospitals worldwide.')
  },
  {
    id: 'parasite',
    name: tx('Parasites'),
    icon: '🪱',
    badge: 'Compliance Critical',
    color: '#7A5CC7',
    gradient: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)',
    description: tx('Parasites like malaria develop resistance to antiparasitic drugs. Complete the full course!'),
    mechanic: 'compliance-course',
    fact: tx('Malaria parasites have developed resistance to chloroquine and other antimalarials.')
  }
]

// Game states
const GAME_STATES = {
  MENU: 'menu',
  STEWARDSHIP: 'stewardship',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  EARLY_EXIT: 'early_exit',
  GAME_OVER: 'game_over',
  BIG_B_BOSS: 'big_b_boss'
}

const ROUND_DURATION = 30000 // 30 seconds per round
const BIG_B_HEALTH = 5

export default function Play() {
  const { t } = useTranslation()
  const { points, done } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [gameState, setGameState] = useState(GAME_STATES.MENU)
  const [selectedPathogen, setSelectedPathogen] = useState(null)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [goodHits, setGoodHits] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [spawnedTargets, setSpawnedTargets] = useState([])
  const [bigBHealth, setBigBHealth] = useState(BIG_B_HEALTH)
  const [bigBPhase, setBigBPhase] = useState(0)
  const [particles, setParticles] = useState([])
  const [showFact, setShowFact] = useState(null)
  const [pausedFrom, setPausedFrom] = useState(null)

  // Deep-link support: /play?pathogen=bacteria|virus|fungus|parasite OR /play?mode=stewardship
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'stewardship') {
      setGameState(GAME_STATES.STEWARDSHIP)
      return
    }
    const pId = searchParams.get('pathogen')
    if (pId && gameState === GAME_STATES.MENU) {
      const found = PATHOGENS.find((p) => p.id === pId)
      if (found) startGame(found)
    }
  }, [searchParams])

  // Timer
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          endRound()
          return 0
        }
        return prev - 1000
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState])

  // Spawn targets periodically
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return
    const interval = setInterval(() => {
      setSpawnedTargets(prev => {
        if (prev.length >= 7) return prev
        return [...prev, createTarget()]
      })
    }, selectedPathogen?.mechanic === 'avoid-antibiotics' ? 1400 : 1800)
    return () => clearInterval(interval)
  }, [gameState, selectedPathogen])

  const createTarget = () => {
    const isBad = Math.random() < 0.35
    let correctAction, wrongAction, label

    switch (selectedPathogen?.mechanic) {
      case 'antibiotic-targeting': {
        const antibiotics = ['Penicillin', 'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Vancomycin']
        const resistances = ['MDR Strain', 'XDR Klebsiella', 'MRSA', 'Carbapenem-Resistant']
        correctAction = antibiotics[Math.floor(Math.random() * antibiotics.length)]
        wrongAction = resistances[Math.floor(Math.random() * resistances.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'resistant' : 'susceptible', label, x: Math.random() * 74 + 13, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 }
      }
      case 'avoid-antibiotics': {
        const viruses = ['Rhinovirus (Cold)', 'Influenza (Flu)', 'RSV', 'SARS-CoV-2', 'Adenovirus']
        const antibioticsV = ['Antibiotic (Wrong!)', 'Amoxicillin', 'Cipro', 'Ampicillin']
        correctAction = viruses[Math.floor(Math.random() * viruses.length)]
        wrongAction = antibioticsV[Math.floor(Math.random() * antibioticsV.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'antibiotic' : 'virus', label, x: Math.random() * 74 + 13, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6 }
      }
      case 'targeted-treatment': {
        const antifungals = ['Fluconazole', 'Amphotericin B', 'Caspofungin', 'Voriconazole']
        const fungi = ['Candida albicans', 'Aspergillus', 'Cryptococcus', 'C. auris (Superbug)']
        correctAction = antifungals[Math.floor(Math.random() * antifungals.length)]
        wrongAction = fungi[Math.floor(Math.random() * fungi.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'fungus' : 'antifungal', label, x: Math.random() * 74 + 13, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 }
      }
      case 'compliance-course': {
        const stages = ['Day 1 (Full)', 'Day 2 (On time)', 'Day 3 (Continued)', 'Day 5 (Almost)', 'Day 7 (Completed)']
        const skips = ['Skip dose', 'Stop early', 'Share with friend', 'Double dose', 'Save for next time']
        correctAction = stages[Math.floor(Math.random() * stages.length)]
        wrongAction = skips[Math.floor(Math.random() * skips.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'noncompliance' : 'compliance', label, x: Math.random() * 74 + 13, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 }
      }
      default:
        return { id: Date.now(), type: 'susceptible', label: 'Target', x: 50, y: 50, vx: 0, vy: 0 }
    }
  }

  const handleTargetClick = (target) => {
    const isGoodClick = (
      (selectedPathogen.mechanic === 'antibiotic-targeting' && target.type === 'susceptible') ||
      (selectedPathogen.mechanic === 'avoid-antibiotics' && target.type === 'virus') ||
      (selectedPathogen.mechanic === 'targeted-treatment' && target.type === 'antifungal') ||
      (selectedPathogen.mechanic === 'compliance-course' && target.type === 'compliance')
    )

    if (isGoodClick) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setGoodHits(prev => prev + 1)
      const pointsEarned = 10 * Math.min(newCombo, 5)
      setScore(prev => prev + pointsEarned)
      createParticles(target.x, target.y, 'success')
    } else {
      setCombo(0)
      setMistakes(prev => prev + 1)
      createParticles(target.x, target.y, 'fail')
      if (selectedPathogen.mechanic === 'avoid-antibiotics') {
        setScore(prev => Math.max(0, prev - 15))
      }
    }

    setSpawnedTargets(prev => prev.filter(t => t.id !== target.id))
    setShowFact(selectedPathogen.fact)
    setTimeout(() => setShowFact(null), 3000)
  }

  const createParticles = (x, y, type) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x, y,
      angle: (i / 8) * Math.PI * 2,
      distance: 0,
      maxDistance: 35 + Math.random() * 25,
      color: type === 'success' ? (selectedPathogen?.color || '#2A8F86') : '#F2786B',
      type
    }))
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)))
    }, 600)
  }

  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        distance: Math.min(p.distance + 2.5, p.maxDistance),
        opacity: 1 - p.distance / p.maxDistance
      })).filter(p => p.distance < p.maxDistance))
    }, 16)
    return () => clearInterval(interval)
  }, [particles.length])

  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return
    const interval = setInterval(() => {
      setSpawnedTargets(prev => prev.map(t => ({
        ...t,
        x: Math.max(8, Math.min(92, t.x + t.vx)),
        y: Math.max(16, Math.min(84, t.y + t.vy)),
        vx: t.x <= 8 || t.x >= 92 ? -t.vx : t.vx,
        vy: t.y <= 16 || t.y >= 84 ? -t.vy : t.vy
      })))
    }, 50)
    return () => clearInterval(interval)
  }, [gameState])

  const startGame = (pathogen) => {
    setSelectedPathogen(pathogen)
    setGameState(GAME_STATES.PLAYING)
    setRound(1)
    setScore(0)
    setCombo(0)
    setGoodHits(0)
    setMistakes(0)
    setTimeLeft(ROUND_DURATION)
    setSpawnedTargets([])
    setBigBHealth(BIG_B_HEALTH)
    setBigBPhase(0)
  }

  const endRound = () => {
    if (round >= 3) {
      if (selectedPathogen.id === 'bacteria') {
        setGameState(GAME_STATES.BIG_B_BOSS)
        return
      }
      finishGame()
      return
    }
    setGameState(GAME_STATES.ROUND_END)
  }

  useEffect(() => {
    if (gameState !== GAME_STATES.ROUND_END) return
    const timer = setTimeout(() => {
      setRound(prev => prev + 1)
      setTimeLeft(ROUND_DURATION)
      setSpawnedTargets([])
      setGameState(GAME_STATES.PLAYING)
    }, 2000)
    return () => clearTimeout(timer)
  }, [gameState])

  const finishGame = () => {
    const bonus = combo > 5 ? 50 : combo > 3 ? 25 : 0
    const totalScore = score + bonus
    award(totalScore, `game-${selectedPathogen.id}-${Date.now()}`)
    setGameState(GAME_STATES.GAME_OVER)
  }

  const handleBossAction = (action) => {
    const actions = [
      { name: tx('Narrow-spectrum antibiotic'), damage: 1, resistanceRisk: 0.1 },
      { name: tx('Broad-spectrum antibiotic'), damage: 2, resistanceRisk: 0.4 },
      { name: tx('Combination therapy'), damage: 2, resistanceRisk: 0.05 },
      { name: tx('Phage therapy'), damage: 1, resistanceRisk: 0 }
    ]
    const chosen = actions[action]
    const newHealth = Math.max(0, bigBHealth - chosen.damage)
    setBigBHealth(newHealth)

    if (Math.random() < chosen.resistanceRisk && bigBPhase < 3) {
      setBigBPhase(prev => prev + 1)
    }

    createParticles(50, 30, chosen.damage > 1 ? 'success' : 'fail')

    if (newHealth <= 0) {
      setTimeout(finishGame, 1000)
    }
  }

  const goBack = () => {
    setGameState(GAME_STATES.MENU)
    setSelectedPathogen(null)
    setPausedFrom(null)
    setSearchParams({})
  }

  const requestEarlyExit = () => {
    setPausedFrom(gameState)
    setGameState(GAME_STATES.EARLY_EXIT)
  }

  const resumeGame = () => {
    setGameState(pausedFrom || GAME_STATES.PLAYING)
    setPausedFrom(null)
  }

  // 1. STEWARDSHIP COMMAND GAME MODE
  if (gameState === GAME_STATES.STEWARDSHIP) {
    return <StewardshipCommand onExit={goBack} />
  }

  // 2. MAIN LAB MENU (Spacious, modern layout with Hero Game + Pathogen Carousel)
  if (gameState === GAME_STATES.MENU) {
    return (
      <div className="play-page animate-fade-in">
        {/* Header with Lab Stats */}
        <div className="play-header-hero">
          <div>
            <span className="badge-pill teal">🎮 Interactive Clinical Simulators</span>
            <h1 style={{ marginTop: '8px', marginBottom: '8px' }}>{t('The AMR Lab')}</h1>
            <p className="lead" style={{ margin: 0 }}>
              {t('Master clinical stewardship, test pathogen triage instincts, and stop hospital resistance spread.')}
            </p>
          </div>
          <div className="lab-stat-box glass">
            <span className="eyebrow" style={{ color: 'var(--teal)' }}>Lab Reputation</span>
            <span className="lab-points-display">⭐ {points} pts</span>
            <span className="muted" style={{ fontSize: '.75rem' }}>Earn points to unlock clinical honors</span>
          </div>
        </div>

        {/* FEATURED: Stewardship Command Card */}
        <div className="featured-game-banner glass animate-fade-in">
          <div className="featured-game-content">
            <div className="featured-badge-row">
              <span className="badge-tag gold">🌟 FEATURED STRATEGY SIMULATOR</span>
              <span className="badge-tag live">WHO AWaRe Guidelines</span>
            </div>
            <h2>Stewardship Command: Nigerian Ward Rounds</h2>
            <p className="muted" style={{ maxWidth: '640px', fontSize: '.95rem', margin: '8px 0 20px' }}>
              Step into the shoes of an Antimicrobial Stewardship Officer at LUTH, UCH, and BUTH. Triage real Nigerian patient scenarios, balance cure rates against resistance pressure, and strictly adhere to Access, Watch, and Reserve protocols.
            </p>
            <div className="featured-actions">
              <button 
                className="btn primary" 
                onClick={() => setGameState(GAME_STATES.STEWARDSHIP)}
                style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
              >
                🩺 Start Ward Round (5 Cases) →
              </button>
              <Link to="/learn?module=bacteria" className="btn ghost" style={{ padding: '12px 20px' }}>
                📖 Review Guidelines First
              </Link>
            </div>
          </div>
          <div className="featured-game-graphic">
            <div className="graphic-glow-circle">
              <span style={{ fontSize: '3.8rem' }}>🏥</span>
            </div>
          </div>
        </div>

        {/* Pathogen Rapid Response Arena */}
        <div style={{ marginTop: '36px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="eyebrow">Target Practice &amp; Reflexes</span>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>Pathogen Rapid Triage Arena</h2>
          </div>
          <span className="muted" style={{ fontSize: '.84rem' }}>30s rapid rounds · Combo multipliers · Boss battle</span>
        </div>

        <div className="pathogen-carousel-grid">
          {PATHOGENS.map(p => {
            const lessonKey = PATHOGEN_TO_LESSON[p.id]
            const isCompleted = !!(done && done['lesson-' + lessonKey])
            return (
              <div 
                key={p.id} 
                className="pathogen-card glass"
                style={{ '--card-accent': p.color }}
              >
                <div className="pathogen-card-top">
                  <div className="pathogen-card-icon" style={{ background: p.gradient }}>
                    {p.icon}
                  </div>
                  <span className="pathogen-tag" style={{ color: p.color, background: `${p.color}15` }}>
                    {p.badge}
                  </span>
                </div>

                <div className="pathogen-card-body">
                  <h3 style={{ color: p.color, margin: '8px 0 6px' }}>{t(p.name)}</h3>
                  <p className="muted" style={{ fontSize: '.86rem', lineHeight: 1.5, margin: 0, minHeight: '52px' }}>
                    {t(p.description)}
                  </p>
                </div>

                <div className="pathogen-card-footer">
                  <button 
                    className="btn" 
                    onClick={() => startGame(p)}
                    style={{ 
                      width: '100%', 
                      background: p.gradient, 
                      color: '#fff',
                      border: 'none',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    ⚡ Play 3 Rounds →
                  </button>
                  <Link 
                    to={`/learn?module=${lessonKey}`} 
                    className="pathogen-learn-link"
                    style={{ color: p.color }}
                  >
                    {isCompleted ? '✓ Module Mastered' : '📖 Study Module in Classroom'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Global Cross-Links Section */}
        <section className="card glass play-integration-strip" style={{ marginTop: '36px' }}>
          <div className="integration-col">
            <span style={{ fontSize: '1.8rem' }}>🗺️</span>
            <div>
              <b style={{ color: 'var(--navy)' }}>Track Real-World Resistance</b>
              <p className="muted" style={{ margin: 0, fontSize: '.82rem' }}>See where resistant strains are spreading across Nigerian geopolitical zones.</p>
            </div>
            <Link to="/map" className="btn ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }}>View Map →</Link>
          </div>
          <div className="integration-divider" />
          <div className="integration-col">
            <span style={{ fontSize: '1.8rem' }}>🔥</span>
            <div>
              <b style={{ color: 'var(--navy)' }}>Daily AI Case Missions</b>
              <p className="muted" style={{ margin: 0, fontSize: '.82rem' }}>Fresh challenges synthesized daily from WHO &amp; NCDC surveillance feeds.</p>
            </div>
            <Link to="/challenges" className="btn ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }}>Daily Tasks →</Link>
          </div>
        </section>
      </div>
    )
  }

  // 3. ROUND END
  if (gameState === GAME_STATES.ROUND_END) {
    return (
      <div className="game-screen-wrapper animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button className="custom-close-btn framework-close-btn" onClick={requestEarlyExit} aria-label={t('Exit to Lab')} title={t('Exit to Lab')}>
            <img src="/close-icon.png" alt={t('Exit')} className="custom-close-icon" />
          </button>
        </div>
        <div className="card glass round-end-card">
          <span className="badge-pill teal">Round {round} Completed</span>
          <h2 style={{ marginTop: '12px' }}>{t('Round {{n}} Triage Complete!', { n: round })}</h2>
          <p className="fact" style={{ fontSize: '3rem', color: selectedPathogen.color, fontWeight: 800 }}>
            {score} <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>{t('points')}</span>
          </p>
          <p className="muted" style={{ fontSize: '1rem', marginBottom: '24px' }}>
            {combo > 3 ? `🔥 ${t('Incredible streak!')} (${combo}x multiplier)` : t('Great reflexes! Keep pushing the bacteria back.')}
          </p>
          <button className="btn primary" onClick={() => setGameState(GAME_STATES.PLAYING)} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            {round === 2 && selectedPathogen.id === 'bacteria' ? '⚠️ Final Round (Boss Upcoming) →' : t('Next Round →')}
          </button>
        </div>
      </div>
    )
  }

  // 3b. EARLY EXIT PROMPT
  if (gameState === GAME_STATES.EARLY_EXIT && selectedPathogen) {
    const lessonId = PATHOGEN_TO_LESSON[selectedPathogen.id] || 'bacteria'
    return (
      <div className="framework-modal-overlay" role="dialog" aria-modal="true" aria-label={t('Leaving Lab Early')}>
        <div className="card glass animate-fade-in debrief-card">
          <button className="custom-close-btn framework-close-btn modal-close-corner" onClick={resumeGame} aria-label={t('Resume Game')} title={t('Resume Game')}>
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
            ⏸️ {t('Session Paused')}
          </span>

          <h2 style={{ margin: '0 0 8px' }}>{t('Leaving the Lab Early?')}</h2>

          <p className="muted" style={{ fontSize: '.92rem', marginBottom: '16px' }}>
            {t('Round {{r}}/3 · {{pts}} points scored so far ({{hits}} targeted)', {
              r: round,
              pts: score,
              hits: goodHits
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
              📖 {t('Want to learn more before your next run?')}
            </p>
            <p className="muted" style={{ margin: 0, fontSize: '.86rem', lineHeight: 1.5 }}>
              {t('Head to the {{name}} module in the Classroom Pathway to master how resistance works and earn bonus points.', { name: t(selectedPathogen.name) })}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to={`/learn?module=${lessonId}`}
              className="btn primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              📚 {t('Go to Classroom ({{name}}) →', { name: t(selectedPathogen.name) })}
            </Link>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn ghost" onClick={resumeGame} style={{ flex: 1 }}>
                ▶ {t('Resume Game')}
              </button>
              <button className="btn ghost" onClick={goBack} style={{ flex: 1 }}>
                ← {t('Exit to Lab Menu')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. GAME OVER DEBRIEF
  if (gameState === GAME_STATES.GAME_OVER) {
    const totalAttempts = goodHits + mistakes
    const accuracy = totalAttempts > 0 ? Math.round((goodHits / totalAttempts) * 100) : 0
    const didWin = score >= 50 && goodHits >= mistakes
    const lessonId = PATHOGEN_TO_LESSON[selectedPathogen.id] || 'bacteria'

    return (
      <div className="framework-modal-overlay" role="dialog" aria-modal="true" aria-label={t('Mission Debrief')}>
        <div className="card glass animate-fade-in debrief-card">
          <button className="custom-close-btn framework-close-btn modal-close-corner" onClick={goBack} aria-label={t('Lab Menu')} title={t('Lab Menu')}>
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
            background: didWin ? 'rgba(23,107,101,.16)' : 'rgba(242,120,107,.16)',
            color: didWin ? 'var(--teal)' : 'var(--coral)',
            marginBottom: '12px'
          }}>
            {didWin ? '🏆 ' + t('Stewardship Victory') : '⚠️ ' + t('Resistance Overwhelmed Treatment')}
          </span>

          <h2 style={{ margin: '0 0 8px' }}>
            {didWin ? t('Mission Complete!') : t('Time to Regroup & Study!')}
          </h2>

          <p className="fact" style={{ fontSize: '2.6rem', color: didWin ? selectedPathogen.color : '#DC3545', margin: '8px 0', fontWeight: 800 }}>
            {score} <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>{t('points earned')}</span>
          </p>

          <p className="muted" style={{ fontSize: '.9rem', marginBottom: '14px' }}>
            {t('Accuracy: {{acc}}% ({{hits}} targeted · {{err}} mistakes)', { acc: accuracy, hits: goodHits, err: mistakes })}
          </p>

          <div style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: didWin ? 'rgba(23,107,101,.08)' : 'rgba(244,185,66,.12)',
            border: `1px solid ${didWin ? 'rgba(23,107,101,.25)' : 'rgba(217,130,43,.3)'}`,
            textAlign: 'left',
            marginBottom: '22px'
          }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '.88rem', color: 'var(--navy)' }}>
              {didWin ? '🛡️ ' + t('Clinical Takeaway:') : '📖 ' + t('Why Resistance Won:')}
            </p>
            <p className="muted" style={{ margin: 0, fontSize: '.86rem', lineHeight: 1.5 }}>
              {didWin
                ? t(selectedPathogen.fact)
                : t('Clicking wrong targets or missing susceptible pathogens gives resistant strains room to multiply. Review the {{name}} module in the Classroom Pathway to master the mechanism!', { name: t(selectedPathogen.name) })}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to={`/learn?module=${lessonId}`}
              className="btn primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              {didWin
                ? `📖 ${t('Deepen Mastery in Classroom Pathway →')}`
                : `📚 ${t('Review {{name}} in Classroom Pathway →', { name: t(selectedPathogen.name) })}`}
            </Link>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn ghost" onClick={() => startGame(selectedPathogen)} style={{ flex: 1 }}>
                🔄 {t('Play Again')}
              </button>
              <button className="btn ghost" onClick={() => setGameState(GAME_STATES.STEWARDSHIP)} style={{ flex: 1 }}>
                🩺 {t('Stewardship Mode')}
              </button>
              <button className="btn ghost" onClick={goBack} style={{ flex: 1 }}>
                ← {t('Lab Menu')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 5. BIG B BOSS BATTLE
  if (gameState === GAME_STATES.BIG_B_BOSS) {
    return (
      <div className="game-screen-wrapper animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button className="custom-close-btn framework-close-btn" onClick={requestEarlyExit} aria-label={t('Exit')} title={t('Exit')}>
            <img src="/close-icon.png" alt={t('Exit')} className="custom-close-icon" />
          </button>
        </div>
        <div className="card glass" style={{ maxWidth: '520px', margin: '0 auto', padding: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <Bacterium size={110} spin={true} style={{ filter: `hue-rotate(${bigBPhase * 60}deg) saturate(${1 + bigBPhase * 0.4}) drop-shadow(0 8px 24px rgba(122,92,199,.4))` }} />
            <h2 style={{ marginTop: '0.8rem', color: '#7A5CC7' }}>Big B — {t('Superbug')}</h2>
            <p className="muted" style={{ fontSize: '.88rem' }}>{t('Phase {{n}} of 4: Multi-Drug Resistant Mutation Active', { n: bigBPhase + 1 })}</p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: '4px' }}>
              <span className="muted">Superbug Integrity</span>
              <b style={{ color: bigBPhase > 2 ? 'var(--coral)' : 'var(--teal)' }}>{bigBHealth} / {BIG_B_HEALTH} HP</b>
            </div>
            <div style={{ height: '14px', background: 'var(--line)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${(bigBHealth / BIG_B_HEALTH) * 100}%`, height: '100%', background: bigBPhase > 2 ? 'var(--g-coral)' : 'var(--g-teal)', transition: 'width 0.3s' }} />
            </div>
          </div>

          <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '12px' }}>{t('Choose your treatment strategy:')}</p>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button className="btn" onClick={() => handleBossAction(0)} style={{ background: 'var(--g-sky)', padding: '12px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <b>{t('Narrow-spectrum')}</b>
              <small style={{ opacity: .85 }}>{t('Low resistance risk')}</small>
            </button>
            <button className="btn" onClick={() => handleBossAction(1)} style={{ background: 'var(--g-teal)', padding: '12px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <b>{t('Broad-spectrum')}</b>
              <small style={{ opacity: .85 }}>{t('High resistance risk')}</small>
            </button>
            <button className="btn" onClick={() => handleBossAction(2)} style={{ background: 'var(--g-gold)', padding: '12px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <b>{t('Combination therapy')}</b>
              <small style={{ opacity: .85 }}>{t('Best prevention')}</small>
            </button>
            <button className="btn" onClick={() => handleBossAction(3)} style={{ background: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)', padding: '12px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <b>{t('Phage therapy')}</b>
              <small style={{ opacity: .85 }}>{t('Zero resistance')}</small>
            </button>
          </div>

          {bigBPhase > 0 && (
            <div className="warn" style={{ marginTop: '1.2rem', textAlign: 'center' }}>
              <span className="warn-icon">⚠️</span>
              <div>
                <p style={{ margin: 0 }}><b>{t('Resistance developing!')}</b></p>
                <p style={{ margin: '4px 0 0', fontSize: '.84rem' }}>{t('Big B is adapting. Choose combination therapy or phage therapy to bypass genetic defenses.')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 6. PLAYING ARENA
  return (
    <div className="game-screen-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
        <div className="game-instruction-pill">
          {selectedPathogen.mechanic === 'antibiotic-targeting' && '🎯 Click Susceptible Antibiotics · Avoid MDR/XDR'}
          {selectedPathogen.mechanic === 'avoid-antibiotics' && '🚫 Click Viruses Only · DO NOT use Antibiotics'}
          {selectedPathogen.mechanic === 'targeted-treatment' && '🍄 Click Antifungals · Avoid Resistant Fungi'}
          {selectedPathogen.mechanic === 'compliance-course' && '💊 Complete Full Course · Avoid Skips & Halts'}
        </div>
        <button className="custom-close-btn framework-close-btn" onClick={requestEarlyExit} aria-label={t('Exit')} title={t('Exit')}>
          <img src="/close-icon.png" alt={t('Exit')} className="custom-close-icon" />
        </button>
      </div>

      <div className="gamebar-spacious">
        <span className="gamebar-item pathogen-badge" style={{ background: selectedPathogen.gradient, color: '#fff' }}>
          {selectedPathogen.icon} {t(selectedPathogen.name)}
        </span>
        <span className="gamebar-item">⏱ {Math.ceil(timeLeft / 1000)}s</span>
        <span className="gamebar-item">🎯 {t('Round')} {round}/3</span>
        <span className="gamebar-item score-badge">⭐ {score}</span>
        {combo > 1 && (
          <span className="gamebar-item combo-badge animate-pop">
            🔥 {combo}x Combo
          </span>
        )}
      </div>

      {showFact && (
        <div className="fact-popup glass animate-pop">
          <p className="eyebrow" style={{ margin: '0 0 2px' }}>{t('Did you know?')}</p>
          <p className="fact" style={{ fontSize: '.88rem', margin: 0 }}>{t(showFact)}</p>
        </div>
      )}

      <div 
        className="gamearea-spacious" 
        style={{ 
          background: `radial-gradient(ellipse at center, ${selectedPathogen.color}15 0%, rgba(16,45,58,0.04) 100%)`, 
          borderColor: `${selectedPathogen.color}40` 
        }}
      >
        {spawnedTargets.map(target => {
          const isGood = target.type === 'susceptible' || target.type === 'virus' || target.type === 'antifungal' || target.type === 'compliance'
          return (
            <button
              key={target.id}
              className={`gamecell-spacious ${isGood ? 'target-good' : 'target-bad'}`}
              onClick={() => handleTargetClick(target)}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                borderColor: isGood ? selectedPathogen.color : '#F2786B',
                color: isGood ? selectedPathogen.color : '#E05344'
              }}
            >
              {target.label}
            </button>
          )
        })}

        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -50%) translate(${Math.cos(p.angle) * p.distance}px, ${Math.sin(p.angle) * p.distance}px)`,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: p.color,
              opacity: p.opacity !== undefined ? p.opacity : 1,
              pointerEvents: 'none',
              boxShadow: `0 0 10px ${p.color}`,
              zIndex: 10
            }}
          />
        ))}
      </div>
    </div>
  )
}
