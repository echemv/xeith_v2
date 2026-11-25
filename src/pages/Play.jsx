import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { award, useApp } from '../store'
import Bacterium from '../components/Bacterium'

// Pathogen types with unique mechanics
const PATHOGENS = [
  {
    id: 'bacteria',
    name: tx('Bacteria'),
    icon: '🦠',
    color: '#2A8F86',
    gradient: 'linear-gradient(135deg,#2A8F86,#176B65)',
    description: tx('Bacteria multiply fast. Target them with the right antibiotic before they develop resistance!'),
    mechanic: 'antibiotic-targeting',
    fact: tx('Bacteria can share resistance genes with each other through horizontal gene transfer.')
  },
  {
    id: 'virus',
    name: tx('Viruses'),
    icon: '🦠',
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
    color: '#7A5CC7',
    gradient: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)',
    description: tx('Parasites like malaria develop resistance to antiparasitic drugs. Use the right drug, right dose, right duration.'),
    mechanic: 'compliance-course',
    fact: tx('Malaria parasites have developed resistance to chloroquine and other antimalarials.')
  }
]

// Game states
const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over',
  BIG_B_BOSS: 'big_b_boss'
}

const ROUND_DURATION = 30000 // 30 seconds per round
const BIG_B_HEALTH = 5

export default function Play() {
  const { t } = useTranslation()
  const { points } = useApp()
  const [gameState, setGameState] = useState(GAME_STATES.MENU)
  const [selectedPathogen, setSelectedPathogen] = useState(null)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [spawnedTargets, setSpawnedTargets] = useState([])
  const [bigBHealth, setBigBHealth] = useState(BIG_B_HEALTH)
  const [bigBPhase, setBigBPhase] = useState(0)
  const [particles, setParticles] = useState([])
  const [showFact, setShowFact] = useState(null)

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
        if (prev.length >= 8) return prev
        return [...prev, createTarget()]
      })
    }, selectedPathogen?.mechanic === 'avoid-antibiotics' ? 1500 : 2000)
    return () => clearInterval(interval)
  }, [gameState, selectedPathogen])

  const createTarget = () => {
    const isBad = Math.random() < 0.3
    let correctAction, wrongAction, label

    switch (selectedPathogen?.mechanic) {
      case 'antibiotic-targeting': // Bacteria - click correct antibiotic
        const antibiotics = ['Penicillin', 'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Vancomycin']
        const resistances = ['Resistant', 'Multi-drug Resistant', 'XDR', 'PDR']
        correctAction = antibiotics[Math.floor(Math.random() * antibiotics.length)]
        wrongAction = resistances[Math.floor(Math.random() * resistances.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'resistant' : 'susceptible', label, x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 }

      case 'avoid-antibiotics': // Virus - avoid clicking antibiotics
        const viruses = ['Rhinovirus (Cold)', 'Influenza (Flu)', 'RSV', 'Coronavirus', 'Adenovirus']
        const antibioticsV = ['Antibiotic', 'Antibiotic', 'Antibiotic', 'Antibiotic', 'Antibiotic']
        correctAction = viruses[Math.floor(Math.random() * viruses.length)]
        wrongAction = 'Antibiotic'
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'antibiotic' : 'virus', label, x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8 }

      case 'targeted-treatment': // Fungi - match antifungal
        const antifungals = ['Fluconazole', 'Amphotericin B', 'Caspofungin', 'Voriconazole', 'Terbinafine']
        const fungi = ['Candida', 'Aspergillus', 'Cryptococcus', 'Dermatophyte', 'C. auris']
        correctAction = antifungals[Math.floor(Math.random() * antifungals.length)]
        wrongAction = fungi[Math.floor(Math.random() * fungi.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'fungus' : 'antifungal', label, x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 }

      case 'compliance-course': // Parasite - complete full course
        const stages = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Complete']
        const skips = ['Skip dose', 'Stop early', 'Share meds', 'Wrong dose', 'Save for later']
        correctAction = stages[Math.floor(Math.random() * stages.length)]
        wrongAction = skips[Math.floor(Math.random() * skips.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'noncompliance' : 'compliance', label, x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 }

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
      const pointsEarned = 10 * Math.min(newCombo, 5)
      setScore(prev => prev + pointsEarned)
      createParticles(target.x, target.y, 'success')
    } else {
      setCombo(0)
      createParticles(target.x, target.y, 'fail')
      if (selectedPathogen.mechanic === 'avoid-antibiotics') {
        // Using antibiotics on viruses is especially bad
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
      maxDistance: 40 + Math.random() * 30,
      color: type === 'success' ? (selectedPathogen?.color || '#2A8F86') : '#F2786B',
      type
    }))
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)))
    }, 600)
  }

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        distance: Math.min(p.distance + 2, p.maxDistance),
        opacity: 1 - p.distance / p.maxDistance
      })).filter(p => p.distance < p.maxDistance))
    }, 16)
    return () => clearInterval(interval)
  }, [particles.length])

  // Move targets
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return
    const interval = setInterval(() => {
      setSpawnedTargets(prev => prev.map(t => ({
        ...t,
        x: Math.max(5, Math.min(95, t.x + t.vx)),
        y: Math.max(15, Math.min(85, t.y + t.vy)),
        vx: t.x <= 5 || t.x >= 95 ? -t.vx : t.vx,
        vy: t.y <= 15 || t.y >= 85 ? -t.vy : t.vy
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
    setTimeout(() => {
      setRound(prev => prev + 1)
      setTimeLeft(ROUND_DURATION)
      setSpawnedTargets([])
      setGameState(GAME_STATES.PLAYING)
    }, 2000)
  }

  const finishGame = () => {
    const bonus = combo > 5 ? 50 : combo > 3 ? 25 : 0
    const totalScore = score + bonus
    award(totalScore, `game-${selectedPathogen.id}-${Date.now()}`)
    setGameState(GAME_STATES.GAME_OVER)
  }

  const handleBossAction = (action) => {
    // Big B boss fight - bacteria edition
    const actions = [
      { name: tx('Narrow-spectrum antibiotic'), damage: 1, resistanceRisk: 0.1 },
      { name: tx('Broad-spectrum antibiotic'), damage: 2, resistanceRisk: 0.4 },
      { name: tx('Combination therapy'), damage: 2, resistanceRisk: 0.05 },
      { name: tx('Phage therapy'), damage: 1, resistanceRisk: 0 }
    ]
    const chosen = actions[action]
    const newHealth = Math.max(0, bigBHealth - chosen.damage)
    setBigBHealth(newHealth)

    // Resistance development
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
  }

  if (gameState === GAME_STATES.MENU) {
    return (
      <>
        <h1>{t('The AMR Lab')}</h1>
        <p className="lead">{t('Choose a pathogen to learn how antimicrobial resistance works — and how to fight it.')}</p>
        <div className="grid">
          {PATHOGENS.map(p => (
            <button key={p.id} className="tile glass" onClick={() => startGame(p)} style={{ borderColor: p.color }}>
              <span className="tile-icon" style={{ background: p.gradient, color: '#fff' }}>{p.icon}</span>
              <b style={{ color: p.color }}>{t(p.name)}</b>
              <span className="muted">{t(p.description)}</span>
            </button>
          ))}
        </div>
        <section className="card glass">
          <p className="eyebrow">{t('How to play')}</p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2 }}>
            <li>{t('Each pathogen has unique mechanics teaching real AMR concepts')}</li>
            <li>{t('Tap the right targets, avoid the wrong ones')}</li>
            <li>{t('Build combos for bonus points')}</li>
            <li>{t('Defeat Big B, the super-resistant bacterium, in the final boss battle')}</li>
          </ul>
        </section>
      </>
    )
  }

  if (gameState === GAME_STATES.ROUND_END) {
    return (
      <>
        <button className="btn ghost" onClick={goBack}>← {t('Exit')}</button>
        <div className="card glass" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <h2>{t('Round {{n}} Complete!', { n: round })}</h2>
          <p className="fact" style={{ fontSize: '2.5rem', color: selectedPathogen.color }}>{score} {t('points')}</p>
          <p className="muted">{combo > 3 ? t('Amazing combo!') : t('Keep going!')}</p>
          <button className="btn" onClick={() => setGameState(GAME_STATES.PLAYING)} style={{ marginTop: '1rem' }}>{t('Next Round')}</button>
        </div>
      </>
    )
  }

  if (gameState === GAME_STATES.GAME_OVER) {
    return (
      <>
        <button className="btn ghost" onClick={goBack}>← {t('Back to Lab')}</button>
        <div className="card glass" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <h2>🎉 {t('Mission Complete!')}</h2>
          <p className="fact" style={{ fontSize: '3rem', color: selectedPathogen.color }}>{score} {t('points earned')}</p>
          <p className="muted">{t(selectedPathogen.fact)}</p>
          <button className="btn" onClick={goBack} style={{ marginTop: '1rem' }}>{t('Back to Lab')}</button>
        </div>
      </>
    )
  }

  if (gameState === GAME_STATES.BIG_B_BOSS) {
    return (
      <>
        <button className="btn ghost" onClick={goBack}>← {t('Exit')}</button>
        <div className="card glass" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Bacterium size={100} spin={true} style={{ filter: `hue-rotate(${bigBPhase * 60}deg) saturate(${1 + bigBPhase * 0.3})` }} />
            <h2 style={{ marginTop: '0.5rem', color: '#7A5CC7' }}>Big B — {t('Superbug')}</h2>
            <p className="muted">{t('Phase {{n}} of 4', { n: bigBPhase + 1 })}</p>
          </div>
          <div style={{ height: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ width: `${(bigBHealth / BIG_B_HEALTH) * 100}%`, height: '100%', background: bigBPhase > 2 ? 'var(--g-coral)' : 'var(--g-teal)', transition: 'width 0.3s' }} />
          </div>
          <p className="eyebrow" style={{ textAlign: 'center' }}>{t('Choose your treatment strategy:')}</p>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <button className="btn" onClick={() => handleBossAction(0)} style={{ background: 'var(--g-sky)' }}>{t('Narrow-spectrum')}<br/><small>{t('Low resistance risk')}</small></button>
            <button className="btn" onClick={() => handleBossAction(1)} style={{ background: 'var(--g-teal)' }}>{t('Broad-spectrum')}<br/><small>{t('High resistance risk')}</small></button>
            <button className="btn" onClick={() => handleBossAction(2)} style={{ background: 'var(--g-gold)' }}>{t('Combination therapy')}<br/><small>{t('Best resistance prevention')}</small></button>
            <button className="btn" onClick={() => handleBossAction(3)} style={{ background: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)' }}>{t('Phage therapy')}<br/><small>{t('No resistance risk')}</small></button>
          </div>
          {bigBPhase > 0 && (
            <div className="warn" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <span className="warn-icon">⚠</span>
              <div>
                <p><b>{t('Resistance developing!')}</b></p>
                <p>{t('Big B is adapting. Choose combination therapy or phage therapy to prevent further resistance.')}</p>
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  // Playing state
  return (
    <>
      <button className="btn ghost" onClick={goBack} style={{ marginBottom: '0.5rem' }}>← {t('Exit')}</button>

      <div className="gamebar">
        <span style={{ background: selectedPathogen.gradient, color: '#fff' }}>
          {t(selectedPathogen.name)} <Bacterium size={20} spin={true} />
        </span>
        <span>⏱ {Math.ceil(timeLeft / 1000)}s</span>
        <span>🎯 {t('Round')} {round}/3</span>
        <span>⭐ {score}</span>
        {combo > 1 && <span style={{ background: 'var(--g-gold)', color: '#3B2F00' }}>🔥 Combo x{combo}</span>}
      </div>

      {showFact && (
        <div className="card glass" style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, maxWidth: '90vw', animation: 'pop 0.3s' }}>
          <p className="eyebrow">{t('Did you know?')}</p>
          <p className="fact" style={{ fontSize: '1rem' }}>{t(showFact)}</p>
        </div>
      )}

      <div className="gamearea" style={{ position: 'relative', background: selectedPathogen.gradient + '20', border: `2px solid ${selectedPathogen.color}40` }}>
        {spawnedTargets.map(target => (
          <button
            key={target.id}
            className={`gamecell ${target.type === 'susceptible' || target.type === 'virus' || target.type === 'antifungal' || target.type === 'compliance' ? 'good' : 'bad'}`}
            onClick={() => handleTargetClick(target)}
            style={{
              position: 'absolute',
              left: `${target.x}%`,
              top: `${target.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 'clamp(80px, 18vw, 120px)',
              height: 'clamp(60px, 14vw, 90px)',
              borderRadius: '16px',
              border: `3px solid ${target.type === 'susceptible' || target.type === 'virus' || target.type === 'antifungal' || target.type === 'compliance' ? selectedPathogen.color : '#F2786B'}`,
              background: target.type === 'susceptible' || target.type === 'virus' || target.type === 'antifungal' || target.type === 'compliance'
                ? `linear-gradient(135deg, ${selectedPathogen.color}20, ${selectedPathogen.color}05)`
                : 'linear-gradient(135deg, #F2786B20, #F2786B05)',
              color: selectedPathogen.color,
              fontSize: '0.75rem',
              fontWeight: 600,
              textAlign: 'center',
              padding: '8px 6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseDown={(e) => e.target.style.transform = 'translate(-50%, -50%) scale(0.95)'}
            onMouseUp={(e) => e.target.style.transform = 'translate(-50%, -50%) scale(1)'}
            onMouseLeave={(e) => e.target.style.transform = 'translate(-50%, -50%) scale(1)'}
          >
            {target.label}
          </button>
        ))}

        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -50%) translate(${Math.cos(p.angle) * p.distance}px, ${Math.sin(p.angle) * p.distance}px)`,
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: p.color,
              opacity: p.opacity !== undefined ? p.opacity : 1,
              pointerEvents: 'none',
              boxShadow: `0 0 8px ${p.color}`
            }}
          />
        ))}

        <div className="feedback" style={{ gridColumn: '1 / -1', minHeight: '0', fontSize: '0.9rem' }}>
          {selectedPathogen.mechanic === 'antibiotic-targeting' && t('Click susceptible bacteria. Avoid resistant ones!')}
          {selectedPathogen.mechanic === 'avoid-antibiotics' && t('Click viruses. DO NOT click antibiotics — they do not work on viruses!')}
          {selectedPathogen.mechanic === 'targeted-treatment' && t('Click antifungals. Avoid the fungi!')}
          {selectedPathogen.mechanic === 'compliance-course' && t('Click compliance steps. Avoid non-compliance!')}
        </div>
      </div>
    </>
  )
}