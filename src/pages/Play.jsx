import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tx } from '../i18n'
import { award, useApp } from '../store'
import Bacterium from '../components/Bacterium'
import StewardshipCommand from '../components/StewardshipCommand'
import { getCompletedLessonCount } from '../data/achievements'

const PATHOGEN_TO_LESSON = {
  bacteria: 'bacteria',
  virus: 'virus',
  fungus: 'fungi',
  parasite: 'parasites'
}

// 3 Classroom-unlocked Difficulty Tiers (inspired by SteWARdS Antibiotic Defence, JMIR Serious Games 2024; e59848 & PMC10131630)
const DIFFICULTY_LEVELS = [
  {
    level: 1,
    id: 'intern',
    icon: '🟢',
    name: tx('Level 1: Standard Training'),
    badge: tx('1.0x Speed · Starter'),
    requiredLessons: 0,
    speedMult: 1.0,
    spawnMs: 1650,
    trapRatio: 0.35,
    scoreMult: 1.0,
    desc: tx('Unlocked from the start. Balanced target speed to learn which treatments match each germ.')
  },
  {
    level: 2,
    id: 'outbreak',
    icon: '🟡',
    name: tx('Level 2: Outbreak Surge'),
    badge: tx('1.4x Speed · +25% Pts'),
    requiredLessons: 2,
    speedMult: 1.4,
    spawnMs: 1250,
    trapRatio: 0.46,
    scoreMult: 1.25,
    desc: tx('Requires 2 Classroom modules. Faster microbes, more resistance traps, and +25% bonus points!')
  },
  {
    level: 3,
    id: 'crisis',
    icon: '🔴',
    name: tx('Level 3: Superbug Crisis'),
    badge: tx('1.8x Speed · +50% Pts · Boss'),
    requiredLessons: 5,
    speedMult: 1.8,
    spawnMs: 980,
    trapRatio: 0.54,
    scoreMult: 1.5,
    desc: tx('Requires 5 Classroom modules. High-speed multi-drug resistant wave, +50% points, and Big B Boss battle!')
  }
]

// 7-Step Malaria RDT + 3-Day (6-Dose) ACT Blister Pack Regimen for the Parasite Game
const MALARIA_REGIMEN_STEPS = [
  { slot: 'RDT', short: tx('RDT Test'), targetLabel: tx('🩸 1. RDT Blood Test (Confirm Malaria)'), coach: tx('Step 1 complete! RDT confirmed Plasmodium falciparum parasites in the blood. Now start Day 1 of ACT!') },
  { slot: 'D1-AM', short: tx('Day 1 AM'), targetLabel: tx('💊 2. ACT Dose 1 (Day 1 Morning)'), coach: tx('Dose 1/6 taken! Fast-acting artemisinin begins clearing malaria parasites from red blood cells.') },
  { slot: 'D1-PM', short: tx('Day 1 PM'), targetLabel: tx('💊 3. ACT Dose 2 (Day 1 Night + Food)'), coach: tx('Dose 2/6 taken with food! Day 1 complete—parasite load is dropping, keep going into Day 2.') },
  { slot: 'D2-AM', short: tx('Day 2 AM'), targetLabel: tx('💊 4. ACT Dose 3 (Day 2 Morning)'), coach: tx('Dose 3/6 taken! Fever is starting to come down, but hiding parasites remain—do NOT stop on Day 2!') },
  { slot: 'D2-PM', short: tx('Day 2 PM'), targetLabel: tx('💊 5. ACT Dose 4 (Day 2 Night)'), coach: tx('Dose 4/6 complete! Day 2 finished—only 2 final doses on Day 3 left to prevent resistance.') },
  { slot: 'D3-AM', short: tx('Day 3 AM'), targetLabel: tx('💊 6. ACT Dose 5 (Day 3 Morning)'), coach: tx('Dose 5/6 taken! The partner drug is wiping out the toughest surviving parasites.') },
  { slot: 'D3-PM', short: tx('Day 3 PM'), targetLabel: tx('💊 7. ACT Dose 6 (Finish Full 3-Day Course!)'), coach: tx('🎉 All 6 ACT doses completed across 3 days! 100% of malaria parasites cleared with zero resistance!') }
]

// Pathogen types with unique mechanics and dynamic rotating fact pools
const PATHOGENS = [
  {
    id: 'bacteria',
    name: tx('Bacteria'),
    icon: '🦠',
    badge: tx('Fast Multiplier'),
    color: '#2A8F86',
    gradient: 'linear-gradient(135deg,#2A8F86,#176B65)',
    description: tx('Bacteria multiply fast. Target them with the right antibiotic before they develop resistance!'),
    mechanic: 'antibiotic-targeting',
    fact: tx('Bacteria can share resistance genes with each other through horizontal gene transfer.'),
    facts: [
      tx('Bacteria can pass resistance "cheat codes" (plasmids) directly to neighboring bacteria through horizontal gene transfer.'),
      tx('It is the bacteria that become resistant to antibiotics—never the human body itself.'),
      tx('Under the WHO Traffic-Light rule, at least 60% of antibiotics used should come from the Green "Access" group.'),
      tx('Buying 2 or 3 loose capsules from a chemist kills only weak bacteria and trains tougher survivors into superbugs.'),
      tx('Over 1.27 million deaths every year are directly caused by antibiotic-resistant bacterial infections worldwide.'),
      tx('Some resistant bacteria build tiny "efflux pumps" in their cell walls to spit antibiotics right back out!')
    ]
  },
  {
    id: 'virus',
    name: tx('Viruses'),
    icon: '🧪',
    badge: tx('Antibiotics Ineffective'),
    color: '#4FB3D9',
    gradient: 'linear-gradient(135deg,#4FB3D9,#176B65)',
    description: tx('Antibiotics DO NOT work on viruses. Avoid wasting antibiotics on viral infections!'),
    mechanic: 'avoid-antibiotics',
    fact: tx('Most colds, flu, and COVID-19 are caused by viruses. Antibiotics are useless against them.'),
    facts: [
      tx('Most colds (catarrh), flu, and coughs are caused by viruses—antibiotics have zero power against them.'),
      tx('Viruses have no cell walls or ribosomes, so antibiotics like Amoxicillin or Ampiclox have nothing to attack.'),
      tx('Thick yellow or green nasal mucus during a cold is just your white blood cells clearing a virus—not proof you need an antibiotic!'),
      tx('Taking antibiotics for a viral cold wipes out billions of friendly gut bacteria that protect your digestion.'),
      tx('Over 90% of sore throats accompanied by a runny nose or cough are viral and heal without antibiotics.'),
      tx('Rest, hydration, and simple symptom care help your immune system clear common respiratory viruses.')
    ]
  },
  {
    id: 'fungus',
    name: tx('Fungi'),
    icon: '🍄',
    badge: tx('Emerging Threat'),
    color: '#D6A84B',
    gradient: 'linear-gradient(135deg,#F4B942,#D6A84B)',
    description: tx('Fungal infections need antifungals. Overuse breeds resistant fungi like Candida auris.'),
    mechanic: 'targeted-treatment',
    fact: tx('Candida auris is a multidrug-resistant fungus spreading in hospitals worldwide.'),
    facts: [
      tx('Candida auris is a multidrug-resistant hospital yeast placed in the WHO Critical Priority tier.'),
      tx('Because fungal cells closely resemble human cells, modern medicine has only 4 main classes of systemic antifungal drugs.'),
      tx('Spraying "azole" fungicides on farm crops trains soil molds to resist the same azole antifungal pills used in hospitals.'),
      tx('Ringworm is caused by a fungus (not a worm!) and needs a proper antifungal—not an antibiotic.'),
      tx('Unprescribed "triple-action" steroid creams can weaken skin immunity and make fungal rashes spread wider.'),
      tx('Candida auris can cling to hospital bed rails and plastic equipment for weeks if not specially disinfected.')
    ]
  },
  {
    id: 'parasite',
    name: tx('Parasites'),
    icon: '🪱',
    badge: tx('Compliance Critical'),
    color: '#7A5CC7',
    gradient: 'linear-gradient(135deg,#7A5CC7,#4FB3D9)',
    description: tx('Parasites like malaria develop resistance to antiparasitic drugs. Complete the full course!'),
    mechanic: 'compliance-course',
    fact: tx('Malaria parasites have developed resistance to chloroquine and other antimalarials.'),
    facts: [
      tx('Not every fever in Nigeria is malaria! Over 60% of unconfirmed fevers test negative for malaria parasites.'),
      tx('Always "Test Before You Treat" with a 15-minute Rapid Diagnostic Test (RDT) or lab test before taking malaria tablets.'),
      tx('Chloroquine stopped working across Africa because it was overused for every fever without testing.'),
      tx('Modern ACT malaria tablets combine TWO drugs in one pill so the partner drug clears any surviving parasites.'),
      tx('Even if your fever disappears on Day 2 of malaria treatment, you must finish all 6 doses across all 3 days!'),
      tx('Nigeria accounts for roughly 27% of global malaria cases—making ACT stewardship vital for every family.')
    ]
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
  const lessonsDone = getCompletedLessonCount(done)
  const [searchParams, setSearchParams] = useSearchParams()
  const [gameState, setGameState] = useState(GAME_STATES.MENU)
  const [selectedPathogen, setSelectedPathogen] = useState(null)
  const [difficultyLevel, setDifficultyLevel] = useState(1)
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
  const [factIndex, setFactIndex] = useState(0)
  const [pausedFrom, setPausedFrom] = useState(null)
  // Visual progress trackers for Parasite (7-step RDT + 6-dose ACT blister pack) & Coach XEITH feedback
  const [malariaStepIdx, setMalariaStepIdx] = useState(0)
  const [parasiteLoad, setParasiteLoad] = useState(100)
  const [coachMsg, setCoachMsg] = useState('')

  const activeDiff = DIFFICULTY_LEVELS.find((d) => d.level === difficultyLevel) || DIFFICULTY_LEVELS[0]
  const isDiffUnlocked = (diff) => lessonsDone >= diff.requiredLessons
  // Progressive speed scaling by both Difficulty Level AND Round (Round 1 -> Round 2 -> Round 3)
  const currentSpeedMult = activeDiff.speedMult * (1 + (round - 1) * 0.25)
  const currentTrapRatio = Math.min(0.68, activeDiff.trapRatio + (round - 1) * 0.06)

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

  // Spawn targets periodically (scaled by Difficulty Level and Round)
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return
    const spawnInterval = Math.max(720, Math.round(activeDiff.spawnMs / (1 + (round - 1) * 0.18)))
    const interval = setInterval(() => {
      setSpawnedTargets(prev => {
        if (prev.length >= (activeDiff.level === 3 ? 9 : 7)) return prev
        return [...prev, createTarget()]
      })
    }, spawnInterval)
    return () => clearInterval(interval)
  }, [gameState, selectedPathogen, round, activeDiff.level, malariaStepIdx])

  const createTarget = () => {
    const isBad = Math.random() < currentTrapRatio
    let correctAction, wrongAction, label
    const baseV = 0.42 * currentSpeedMult

    switch (selectedPathogen?.mechanic) {
      case 'antibiotic-targeting': {
        const antibiotics = [
          tx('🟢 Amoxicillin (Access)'),
          tx('🟢 Ampicillin (Access)'),
          tx('🟢 Co-trimoxazole (Access)'),
          tx('🟢 Nitrofurantoin (Access)'),
          tx('🟡 Targeted Azithromycin')
        ]
        const resistances = [
          tx('🚫 Loose Chemist Capsules'),
          tx('🚫 MDR Superbug Strain'),
          tx('🚫 Unprescribed Reserve Colistin'),
          tx('🚫 Leftover Shared Pills')
        ]
        correctAction = antibiotics[Math.floor(Math.random() * antibiotics.length)]
        wrongAction = resistances[Math.floor(Math.random() * resistances.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'resistant' : 'susceptible', label, x: Math.random() * 72 + 14, y: Math.random() * 58 + 20, vx: (Math.random() - 0.5) * baseV, vy: (Math.random() - 0.5) * baseV }
      }
      case 'avoid-antibiotics': {
        // Grounded in SteWARdS Antibiotic Defence (JMIR Serious Games 2024; e59848): use symptomatic relief for viruses, never antibiotics
        const viralCare = [
          tx('💧 Rest & Hydration (Viral Care)'),
          tx('🍵 Warm Honey & Steam (Cold Relief)'),
          tx('🌡️ Paracetamol (Fever Relief)'),
          tx('🧼 20s Soap Handwashing')
        ]
        const antibioticsV = [
          tx('🚫 Loose Ampiclox for Cold'),
          tx('🚫 Amoxicillin for Flu'),
          tx('🚫 Cipro for Yellow Mucus'),
          tx('🚫 Antibiotics on a Virus')
        ]
        correctAction = viralCare[Math.floor(Math.random() * viralCare.length)]
        wrongAction = antibioticsV[Math.floor(Math.random() * antibioticsV.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'antibiotic' : 'virus', label, x: Math.random() * 72 + 14, y: Math.random() * 58 + 20, vx: (Math.random() - 0.5) * (baseV * 1.25), vy: (Math.random() - 0.5) * (baseV * 1.25) }
      }
      case 'targeted-treatment': {
        const antifungals = [
          tx('🍄 Targeted Fluconazole'),
          tx('🍄 Clotrimazole Antifungal'),
          tx('🍄 Hospital Caspofungin'),
          tx('🧼 Deep Ward Disinfection')
        ]
        const fungi = [
          tx('🚫 Triple-Action Steroid Cream'),
          tx('🚫 Amoxicillin on Ringworm'),
          tx('🚫 Candida auris Biofilm'),
          tx('🚫 Unchecked Azole Crop Spray')
        ]
        correctAction = antifungals[Math.floor(Math.random() * antifungals.length)]
        wrongAction = fungi[Math.floor(Math.random() * fungi.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'fungus' : 'antifungal', label, x: Math.random() * 72 + 14, y: Math.random() * 58 + 20, vx: (Math.random() - 0.5) * baseV, vy: (Math.random() - 0.5) * baseV }
      }
      case 'compliance-course': {
        // Clear, meaningful Malaria RDT + 3-Day (6-Dose) ACT Blister Pack progression
        const activeStep = MALARIA_REGIMEN_STEPS[malariaStepIdx % MALARIA_REGIMEN_STEPS.length]
        const supportActions = [
          activeStep.targetLabel,
          activeStep.targetLabel,
          tx('🥛 Take ACT with Milk/Food'),
          tx('🛏️ Sleep Under Treated Net')
        ]
        const skips = [
          tx('🚫 Stop ACT on Day 2 (Fever Gone)'),
          tx('🚫 Chloroquine (Parasite Resistant!)'),
          tx('🚫 Skip RDT Blood Test'),
          tx('🚫 Take Antibiotic for Malaria'),
          tx('🚫 Share Half-Pack of ACT')
        ]
        correctAction = supportActions[Math.floor(Math.random() * supportActions.length)]
        wrongAction = skips[Math.floor(Math.random() * skips.length)]
        label = isBad ? wrongAction : correctAction
        return { id: Date.now() + Math.random(), type: isBad ? 'noncompliance' : 'compliance', label, x: Math.random() * 72 + 14, y: Math.random() * 58 + 20, vx: (Math.random() - 0.5) * baseV, vy: (Math.random() - 0.5) * baseV }
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
      const pointsEarned = Math.round(10 * Math.min(newCombo, 5) * activeDiff.scoreMult)
      setScore(prev => prev + pointsEarned)
      createParticles(target.x, target.y, 'success')

      if (selectedPathogen.mechanic === 'compliance-course') {
        const stepObj = MALARIA_REGIMEN_STEPS[malariaStepIdx % MALARIA_REGIMEN_STEPS.length]
        setCoachMsg(stepObj.coach)
        setMalariaStepIdx(prev => (prev + 1) % MALARIA_REGIMEN_STEPS.length)
        setParasiteLoad(prev => Math.max(0, prev - 15))
      } else {
        setCoachMsg(tx('Great stewardship choice! Target matched accurately (+{{pts}} pts).', { pts: pointsEarned }))
      }
    } else {
      setCombo(0)
      setMistakes(prev => prev + 1)
      createParticles(target.x, target.y, 'fail')
      setScore(prev => Math.max(0, prev - 10))
      if (selectedPathogen.mechanic === 'compliance-course') {
        setParasiteLoad(prev => Math.min(100, prev + 18))
        setCoachMsg(tx('⚠️ Resistance trap! Stopping ACT early, skipping RDT, or using Chloroquine lets malaria parasites rebound!'))
      } else if (selectedPathogen.mechanic === 'avoid-antibiotics') {
        setCoachMsg(tx('⚠️ Wasted antibiotic on a virus! That harms friendly gut bacteria and does nothing to the cold virus.'))
      } else {
        setCoachMsg(tx('⚠️ Resistance warning! That choice feeds multidrug-resistant superbugs.'))
      }
    }

    setSpawnedTargets(prev => prev.filter(t => t.id !== target.id))
    // Rotate to the next dynamic fact every 2 hits (or on mistake) without flashing a fixed overlay over the arena
    if (!isGoodClick || (goodHits + 1) % 2 === 0) {
      const poolLen = selectedPathogen.facts?.length || 1
      setFactIndex(prev => (prev + 1) % poolLen)
    }
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

  // Automatically cycle through the pathogen's Did You Know pool every 6 seconds during gameplay
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING || !selectedPathogen?.facts?.length) return
    const ticker = setInterval(() => {
      setFactIndex(prev => (prev + 1) % selectedPathogen.facts.length)
    }, 6000)
    return () => clearInterval(ticker)
  }, [gameState, selectedPathogen])

  const startGame = (pathogen) => {
    setSelectedPathogen(pathogen)
    setFactIndex(Math.floor(Math.random() * (pathogen.facts?.length || 1)))
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
    setMalariaStepIdx(0)
    setParasiteLoad(100)
    setCoachMsg(
      pathogen.id === 'parasite'
        ? tx('Step 1: Look for "🩸 1. RDT Blood Test" first to confirm malaria, then complete all 6 ACT doses in order while avoiding Chloroquine and Day-2 stops!')
        : pathogen.id === 'virus'
          ? tx('Viruses cause colds & flu! Tap Symptomatic Relief (Rest, Hydration, Steam) and AVOID wasting antibiotics!')
          : tx('Tap the right targeted treatment and avoid multidrug-resistant superbug traps!')
    )
  }

  const endRound = () => {
    if (round >= 3) {
      if (selectedPathogen.id === 'bacteria' || activeDiff.level === 3) {
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
            <span className="badge-pill teal">🎮 {t('Interactive Clinical Simulators')}</span>
            <h1 style={{ marginTop: '8px', marginBottom: '8px' }}>{t('The AMR Lab')}</h1>
            <p className="lead" style={{ margin: 0 }}>
              {t('Master clinical stewardship, test pathogen triage instincts, and stop hospital resistance spread.')}
            </p>
          </div>
          <div className="lab-stat-box glass">
            <span className="eyebrow" style={{ color: 'var(--teal)' }}>{t('Lab Reputation')}</span>
            <span className="lab-points-display">⭐ {t('{{n}} pts', { n: points })}</span>
            <span className="muted" style={{ fontSize: '.75rem' }}>{t('Earn points to unlock clinical honors')}</span>
          </div>
        </div>

        {/* FEATURED: Stewardship Command Card */}
        <div className="featured-game-banner glass animate-fade-in">
          <div className="featured-game-content">
            <div className="featured-badge-row">
              <span className="badge-tag gold">🌟 {t('FEATURED STRATEGY SIMULATOR')}</span>
              <span className="badge-tag live">{t('WHO AWaRe Guidelines')}</span>
            </div>
            <h2>{t('Stewardship Command: Nigerian Ward Rounds')}</h2>
            <p className="muted" style={{ maxWidth: '640px', fontSize: '.95rem', margin: '8px 0 20px' }}>
              {t('Step into the shoes of an Antimicrobial Stewardship Officer at LUTH, UCH, and BUTH. Triage real Nigerian patient scenarios unlocked by your Classroom level, balance cure rates against resistance pressure, and follow Access, Watch, and Reserve rules.')}
            </p>
            <div className="featured-actions">
              <button 
                className="btn primary" 
                onClick={() => setGameState(GAME_STATES.STEWARDSHIP)}
                style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
              >
                🩺 {t('Choose Scenario Level & Start →')}
              </button>
              <Link to="/learn" className="btn ghost" style={{ padding: '12px 20px' }}>
                📖 {t('Unlock Levels in Classroom')}
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
        <div style={{ marginTop: '36px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="eyebrow">{t('Target Practice & Reflexes')}</span>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem' }}>{t('Pathogen Rapid Triage Arena')}</h2>
          </div>
          <span className="muted" style={{ fontSize: '.84rem' }}>{t('30s rapid rounds · Combo multipliers · Boss battle')}</span>
        </div>

        {/* 3 Classroom-Gated Difficulty Levels Selector */}
        <div className="card glass" style={{ marginBottom: '18px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--navy)' }}>
              🎚️ {t('Select Arena Difficulty Level (Unlocked by Classroom Progress)')}
            </span>
            <span className="muted" style={{ fontSize: '.78rem' }}>
              📚 {lessonsDone} / 9 {t('Classroom Modules Completed')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
            {DIFFICULTY_LEVELS.map((diff) => {
              const unlocked = isDiffUnlocked(diff)
              const selected = difficultyLevel === diff.level
              const needed = Math.max(0, diff.requiredLessons - lessonsDone)
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => unlocked && setDifficultyLevel(diff.level)}
                  disabled={!unlocked}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: selected && unlocked ? '2px solid var(--teal)' : '1px solid var(--line)',
                    background: !unlocked ? 'rgba(0,0,0,0.03)' : selected ? 'rgba(23,107,101,0.1)' : 'var(--g-soft)',
                    opacity: unlocked ? 1 : 0.72,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '.85rem', color: 'var(--ink)' }}>
                      {unlocked ? diff.icon : '🔒'} {t(diff.name)}
                    </strong>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: unlocked ? 'var(--teal)' : 'var(--coral)' }}>
                      {unlocked ? t(diff.badge) : `🔒 +${needed} ${t('Lessons')}`}
                    </span>
                  </div>
                  <span className="muted" style={{ fontSize: '.75rem', lineHeight: 1.35 }}>
                    {t(diff.desc)}
                  </span>
                </button>
              )
            })}
          </div>
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
                    {t(p.badge)}
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
                    ⚡ {t('Play 3 Rounds →')}
                  </button>
                  <Link 
                    to={`/learn?module=${lessonKey}`} 
                    className="pathogen-learn-link"
                    style={{ color: p.color }}
                  >
                    {isCompleted ? '✓ ' + t('Module Mastered') : '📖 ' + t('Study Module in Classroom')}
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
              <b style={{ color: 'var(--navy)' }}>{t('Track Real-World Resistance')}</b>
              <p className="muted" style={{ margin: 0, fontSize: '.82rem' }}>{t('See sourced resistance information for each Nigerian geopolitical zone.')}</p>
            </div>
            <Link to="/map" className="btn ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }}>{t('View Map →')}</Link>
          </div>
          <div className="integration-divider" />
          <div className="integration-col">
            <span style={{ fontSize: '1.8rem' }}>🔥</span>
            <div>
              <b style={{ color: 'var(--navy)' }}>{t('Daily Challenges')}</b>
              <p className="muted" style={{ margin: 0, fontSize: '.82rem' }}>{t('A new short challenge every day, plus the weekly ladder.')}</p>
            </div>
            <Link to="/challenges" className="btn ghost" style={{ padding: '6px 14px', fontSize: '.85rem' }}>{t('Daily Tasks →')}</Link>
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
          <span className="badge-pill teal">{t('Round {{n}} Completed', { n: round })}</span>
          <h2 style={{ marginTop: '12px' }}>{t('Round {{n}} Triage Complete!', { n: round })}</h2>
          <p className="fact" style={{ fontSize: '3rem', color: selectedPathogen.color, fontWeight: 800 }}>
            {score} <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>{t('points')}</span>
          </p>
          <p className="muted" style={{ fontSize: '1rem', marginBottom: '24px' }}>
            {combo > 3 ? `🔥 ${t('Incredible streak!')} (${combo}x multiplier)` : t('Great reflexes! Keep pushing the bacteria back.')}
          </p>
          <button className="btn primary" onClick={() => setGameState(GAME_STATES.PLAYING)} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
            {round === 2 && selectedPathogen.id === 'bacteria' ? '⚠️ ' + t('Final Round (Boss Upcoming) →') : t('Next Round →')}
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
              <span className="muted">{t('Superbug Integrity')}</span>
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
          {selectedPathogen.mechanic === 'antibiotic-targeting' && `🎯 ${t('Tap Green Access Antibiotics · Avoid Loose Capsules & Superbugs')}`}
          {selectedPathogen.mechanic === 'avoid-antibiotics' && `🚫 ${t('Tap Viral Relief (Rest, Hydration, Steam) · DO NOT Use Antibiotics')}`}
          {selectedPathogen.mechanic === 'targeted-treatment' && `🍄 ${t('Tap Targeted Antifungals · Avoid Triple-Action Steroid Mixes')}`}
          {selectedPathogen.mechanic === 'compliance-course' && `🦟 ${t('Complete RDT Blood Test + All 6 ACT Doses · Avoid Chloroquine & Day-2 Stops')}`}
        </div>
        <button className="custom-close-btn framework-close-btn" onClick={requestEarlyExit} aria-label={t('Exit')} title={t('Exit')}>
          <img src="/close-icon.png" alt={t('Exit')} className="custom-close-icon" />
        </button>
      </div>

      <div className="gamebar-spacious">
        <span className="gamebar-item pathogen-badge" style={{ background: selectedPathogen.gradient, color: '#fff' }}>
          {selectedPathogen.icon} {t(selectedPathogen.name)} · {activeDiff.icon} L{activeDiff.level}
        </span>
        <span className="gamebar-item">⏱ {Math.ceil(timeLeft / 1000)}s</span>
        <span className="gamebar-item">🎯 {t('Round')} {round}/3 ({Math.round(currentSpeedMult * 100)}% {t('Speed')})</span>
        <span className="gamebar-item score-badge">⭐ {score}</span>
        {combo > 1 && (
          <span className="gamebar-item combo-badge animate-pop">
            🔥 {t('{{n}}x Combo', { n: combo })}
          </span>
        )}
      </div>

      {/* Special Visual Malaria RDT + 3-Day (6-Dose) ACT Blister Pack Tracker for the Parasite Game */}
      {selectedPathogen.mechanic === 'compliance-course' && (
        <div className="card glass" style={{ marginBottom: '12px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--navy)' }}>
              🦟 {t('Malaria Cure Protocol: 1) Confirm with RDT → 2) Complete 3-Day (6-Dose) ACT Pack')}
            </span>
            <span style={{ fontSize: '.78rem', fontWeight: 700, color: parasiteLoad <= 25 ? '#27AE60' : 'var(--purple, #7A5CC7)' }}>
              🩸 {t('Blood Parasite Load')}: {parasiteLoad}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(60px, 1fr))', gap: '6px', overflowX: 'auto' }}>
            {MALARIA_REGIMEN_STEPS.map((st, idx) => {
              const isDone = idx < (malariaStepIdx % MALARIA_REGIMEN_STEPS.length) || parasiteLoad === 0
              const isCurrent = idx === (malariaStepIdx % MALARIA_REGIMEN_STEPS.length)
              return (
                <div
                  key={st.slot}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '.72rem',
                    fontWeight: 700,
                    border: isCurrent ? '2px solid #7A5CC7' : '1px solid var(--line)',
                    background: isDone ? 'rgba(39,174,96,0.14)' : isCurrent ? 'rgba(122,92,199,0.14)' : 'var(--g-soft)',
                    color: isDone ? '#27AE60' : isCurrent ? '#7A5CC7' : 'var(--muted)'
                  }}
                >
                  <div>{idx === 0 ? '🩸' : '💊'} {t(st.short)}</div>
                  <div style={{ fontSize: '.66rem', marginTop: '2px' }}>
                    {isDone ? '✓ ' + t('Done') : isCurrent ? '🎯 ' + t('Tap Now!') : t('Wait')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Live Coach XEITH Feedback Strip (inspired by NPC dialogues in SteWARdS Antibiotic Defence) */}
      {coachMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            marginBottom: '10px',
            borderRadius: '12px',
            background: 'var(--g-soft)',
            border: '1px solid var(--line)',
            fontSize: '.82rem'
          }}
        >
          <img src="/mascot.png" width={26} height={26} alt="" style={{ objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{t(coachMsg)}</span>
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

      {/* Dynamic, non-blocking Did You Know ticker bar docked cleanly below the arena */}
      <div className="fact-popup glass" key={factIndex} style={{ borderColor: `${selectedPathogen.color}55` }}>
        <div className="fact-ticker-header">
          <span className="eyebrow" style={{ margin: 0, color: selectedPathogen.color }}>
            💡 {t('Did you know?')} · {(factIndex % (selectedPathogen.facts?.length || 1)) + 1}/{selectedPathogen.facts?.length || 1}
          </span>
          <button
            type="button"
            className="fact-next-btn"
            onClick={() => setFactIndex(prev => (prev + 1) % (selectedPathogen.facts?.length || 1))}
          >
            {t('Next tip →')}
          </button>
        </div>
        <p className="fact" style={{ fontSize: '.86rem', margin: '4px 0 0' }}>
          {t(selectedPathogen.facts?.[factIndex % selectedPathogen.facts.length] || selectedPathogen.fact)}
        </p>
      </div>
    </div>
  )
}
