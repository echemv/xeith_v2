import { tx } from '../i18n'
import { LESSONS } from './lessons'
import { weekNumber } from '../store'

/**
 * Shared progression, Classroom level-gating, Player Rank Card metadata,
 * and Collectible Achievement Cards (works both offline/locally and synced with Cloud/Leaderboards).
 */
export const PATHWAY_RANKS = [
  {
    level: 1,
    minLessons: 0,
    title: tx('Beginner Explorer'),
    subtitle: tx('Learning the basics of microbes, pathogens, and what AMR means'),
    badge: tx('Level 1 · Starter'),
    icon: '🌱',
    accent: '#176B65',
    gradient: 'linear-gradient(135deg, #176B65 0%, #2A8F86 100%)',
    cardBg: 'linear-gradient(135deg, rgba(23,107,101,0.16) 0%, rgba(42,143,134,0.06) 100%)'
  },
  {
    level: 2,
    minLessons: 2,
    title: tx('Pathogen Detective'),
    subtitle: tx('Investigating Bacteria, Viruses, Fungi, and Parasites'),
    badge: tx('Level 2 · Intermediate'),
    icon: '🔬',
    accent: '#0284C7',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #4FB3D9 100%)',
    cardBg: 'linear-gradient(135deg, rgba(2,132,199,0.16) 0%, rgba(79,179,217,0.06) 100%)'
  },
  {
    level: 3,
    minLessons: 5,
    title: tx('AMR Champion'),
    subtitle: tx('Mastering infection prevention, One Health, and safe medicines'),
    badge: tx('Level 3 · Advanced'),
    icon: '🌍',
    accent: '#7A5CC7',
    gradient: 'linear-gradient(135deg, #7A5CC7 0%, #D6A84B 100%)',
    cardBg: 'linear-gradient(135deg, rgba(122,92,199,0.18) 0%, rgba(214,168,75,0.08) 100%)'
  }
]

export function getCompletedLessonCount(done = {}, cloudStats = null) {
  const localCount = LESSONS.filter((l) => done && done['lesson-' + l.id]).length
  const cloudCount = cloudStats?.lessonsCompleted || cloudStats?.lessons_completed || 0
  return Math.max(localCount, cloudCount)
}

export function getPlayerRank(done = {}, cloudStats = null, points = 0) {
  const lessonsDone = getCompletedLessonCount(done, cloudStats)
  if (lessonsDone >= 5 || points >= 250) return PATHWAY_RANKS[2]
  if (lessonsDone >= 2 || points >= 90) return PATHWAY_RANKS[1]
  return PATHWAY_RANKS[0]
}

export function getRankByPoints(points = 0) {
  if (points >= 250) return PATHWAY_RANKS[2]
  if (points >= 90) return PATHWAY_RANKS[1]
  return PATHWAY_RANKS[0]
}

export const ACHIEVEMENT_CARDS = [
  {
    id: 'weekly-champion',
    icon: '🏆',
    rarity: tx('EPIC'),
    rarityColor: '#D6A84B',
    gradient: 'linear-gradient(135deg, #D6A84B 0%, #F4B942 100%)',
    category: 'challenges',
    name: tx('Weekly Challenge Champion'),
    description: tx('Complete all 3 Weekly Challenges in a single week to prove your AMR stewardship mastery.'),
    pointsReward: 50,
    evaluate: ({ done, wk }) => {
      const count = [0, 1, 2].filter((k) => done?.[`week-${wk}-${k}`]).length
      const anyPastWeek = Object.keys(done || {}).filter((k) => k.startsWith('week-')).length >= 3
      const unlocked = count >= 3 || anyPastWeek
      return { unlocked, progress: unlocked ? 3 : count, total: 3 }
    }
  },
  {
    id: 'first-lesson',
    icon: '🌱',
    rarity: tx('COMMON'),
    rarityColor: '#2A8F86',
    gradient: 'linear-gradient(135deg, #176B65 0%, #2A8F86 100%)',
    category: 'learning',
    name: tx('Microbe Explorer'),
    description: tx('Complete your very first lesson in The AMR Classroom pathway.'),
    pointsReward: 15,
    evaluate: ({ lessonsDone }) => ({
      unlocked: lessonsDone >= 1,
      progress: Math.min(1, lessonsDone),
      total: 1
    })
  },
  {
    id: 'level-2-unlock',
    icon: '🔬',
    rarity: tx('RARE'),
    rarityColor: '#0284C7',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #4FB3D9 100%)',
    category: 'learning',
    name: tx('Pathogen Detective'),
    description: tx('Complete 2 Classroom modules to unlock Level 2 Scenarios and Pathogen Triage.'),
    pointsReward: 30,
    evaluate: ({ lessonsDone }) => ({
      unlocked: lessonsDone >= 2,
      progress: Math.min(2, lessonsDone),
      total: 2
    })
  },
  {
    id: 'level-3-unlock',
    icon: '🌍',
    rarity: tx('EPIC'),
    rarityColor: '#7A5CC7',
    gradient: 'linear-gradient(135deg, #7A5CC7 0%, #4FB3D9 100%)',
    category: 'learning',
    name: tx('One Health Sentinel'),
    description: tx('Complete 5 Classroom modules to unlock Level 3 Advanced ICU & One Health Scenarios.'),
    pointsReward: 75,
    evaluate: ({ lessonsDone }) => ({
      unlocked: lessonsDone >= 5,
      progress: Math.min(5, lessonsDone),
      total: 5
    })
  },
  {
    id: 'classroom-master',
    icon: '🎓',
    rarity: tx('LEGENDARY'),
    rarityColor: '#E05344',
    gradient: 'linear-gradient(135deg, #7A5CC7 0%, #F2786B 50%, #F4B942 100%)',
    category: 'learning',
    name: tx('Grand Steward of XEITH'),
    description: tx('Master all 9 modules across Level 1, Level 2, and Level 3 in The AMR Classroom.'),
    pointsReward: 150,
    evaluate: ({ lessonsDone }) => ({
      unlocked: lessonsDone >= LESSONS.length,
      progress: Math.min(LESSONS.length, lessonsDone),
      total: LESSONS.length
    })
  },
  {
    id: 'daily-challenger',
    icon: '⚡',
    rarity: tx('COMMON'),
    rarityColor: '#2A8F86',
    gradient: 'linear-gradient(135deg, #2A8F86 0%, #7FD1B9 100%)',
    category: 'challenges',
    name: tx('Daily habit Builder'),
    description: tx('Complete a Daily Challenge (Quiz, Photo Challenge, Fact Match, or Word Ladder).'),
    pointsReward: 20,
    evaluate: ({ done }) => {
      const count = Object.keys(done || {}).filter((k) => k.startsWith('daily-')).length
      return { unlocked: count >= 1, progress: Math.min(1, count), total: 1 }
    }
  },
  {
    id: 'word-climber',
    icon: '🧗',
    rarity: tx('RARE'),
    rarityColor: '#0284C7',
    gradient: 'linear-gradient(135deg, #102D3A 0%, #2A8F86 100%)',
    category: 'challenges',
    name: tx('Word Ladder Climber'),
    description: tx('Complete steps in the 7-Day Weekly Word Ladder challenge.'),
    pointsReward: 35,
    evaluate: ({ done }) => {
      const count = Object.keys(done || {}).filter((k) => k.includes('ladder')).length
      return { unlocked: count >= 1, progress: Math.min(1, count), total: 1 }
    }
  },
  {
    id: 'ward-commander',
    icon: '🩺',
    rarity: tx('RARE'),
    rarityColor: '#D6A84B',
    gradient: 'linear-gradient(135deg, #176B65 0%, #D6A84B 100%)',
    category: 'game',
    name: tx('Ward Round Commander'),
    description: tx('Complete a clinical scenario round or pathogen triage mission in The AMR Lab.'),
    pointsReward: 40,
    evaluate: ({ done, cloudStats }) => {
      const localGames = Object.keys(done || {}).filter((k) => k.startsWith('game-') || k.startsWith('stewardship-')).length
      const total = Math.max(localGames, cloudStats?.gamesPlayed || 0)
      return { unlocked: total >= 1, progress: Math.min(1, total), total: 1 }
    }
  },
  {
    id: 'streak-guardian',
    icon: '🔥',
    rarity: tx('EPIC'),
    rarityColor: '#F2786B',
    gradient: 'linear-gradient(135deg, #F2786B 0%, #F4B942 100%)',
    category: 'streak',
    name: tx('Streak Flame Guardian'),
    description: tx('Build and maintain a 3-day active learning streak on XEITH.'),
    pointsReward: 50,
    evaluate: ({ streak, cloudStats }) => {
      const best = Math.max(streak || 0, cloudStats?.streak || 0, cloudStats?.longestStreak || 0)
      return { unlocked: best >= 3, progress: Math.min(3, best), total: 3 }
    }
  }
]

export function evaluateAllAchievements({ done = {}, points = 0, streak = 0, cloudStats = null }) {
  const wk = weekNumber()
  const lessonsDone = getCompletedLessonCount(done, cloudStats)
  return ACHIEVEMENT_CARDS.map((card) => {
    const status = card.evaluate({ done, points, streak, cloudStats, wk, lessonsDone })
    return {
      ...card,
      ...status
    }
  })
}
