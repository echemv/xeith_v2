import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LESSONS } from '../data/lessons'
import {
  getCompletedLessonCount,
  getPlayerRank,
  evaluateAllAchievements
} from '../data/achievements'

/**
 * Collectible Holographic Player Card ("XEITH Steward ID Card")
 * Displays player's rank, Classroom level, points, streak, and unlocked achievement badges.
 */
export function PlayerHeroCard({
  displayName,
  points = 0,
  streak = 0,
  done = {},
  cloudStats = null,
  compact = false
}) {
  const { t } = useTranslation()
  const lessonsDone = getCompletedLessonCount(done, cloudStats)
  const rank = getPlayerRank(done, cloudStats, points)
  const evaluated = evaluateAllAchievements({ done, points, streak, cloudStats })
  const unlockedCards = evaluated.filter((c) => c.unlocked)
  const nextRankLessons = rank.level === 1 ? 2 : rank.level === 2 ? 5 : LESSONS.length
  const progressPct = Math.min(100, Math.round((lessonsDone / LESSONS.length) * 100))

  return (
    <div
      className={`xeith-player-card ${compact ? 'is-compact' : ''}`}
      style={{ '--player-accent': rank.accent, '--player-grad': rank.gradient }}
    >
      <div className="player-card-shimmer" aria-hidden="true" />
      <div className="player-card-top">
        <div className="player-avatar-crest" style={{ background: rank.gradient }}>
          <img src="/mascot.png" alt="" className="player-crest-mascot" />
          <span className="player-level-orb">{rank.level}</span>
        </div>

        <div className="player-identity-col">
          <div className="player-rank-pill-row">
            <span className="player-rank-chip" style={{ background: rank.gradient }}>
              {rank.icon} {t(rank.badge)}
            </span>
            <span className="player-card-id-tag">
              🏅 {unlockedCards.length}/{evaluated.length} {t('Cards Unlocked')}
            </span>
          </div>
          <h3 className="player-card-name">{displayName || t('XEITH Steward')}</h3>
          <p className="player-card-title">{t(rank.title)} — {t(rank.subtitle)}</p>
        </div>
      </div>

      <div className="player-stats-ribbon">
        <div className="player-stat-box">
          <span className="p-stat-val">⭐ {points}</span>
          <span className="p-stat-lbl">{t('Stewardship Pts')}</span>
        </div>
        <div className="player-stat-box">
          <span className="p-stat-val">🔥 {streak}</span>
          <span className="p-stat-lbl">{t('Day Streak')}</span>
        </div>
        <div className="player-stat-box">
          <span className="p-stat-val">📚 {lessonsDone}/{LESSONS.length}</span>
          <span className="p-stat-lbl">{t('Classroom')}</span>
        </div>
        <div className="player-stat-box">
          <span className="p-stat-val">🔓 {t('Level {{n}}', { n: rank.level })}</span>
          <span className="p-stat-lbl">{t('Scenarios Open')}</span>
        </div>
      </div>

      {/* Pathway Level Progress Bar */}
      <div className="player-pathway-progress">
        <div className="player-pathway-labels">
          <span>
            {rank.level < 3
              ? t('Classroom Progress to Next Scenario Level ({{done}}/{{req}} modules)', { done: lessonsDone, req: nextRankLessons })
              : t('All 3 Scenario Levels Unlocked! ({{done}}/{{total}} modules mastered)', { done: lessonsDone, total: LESSONS.length })}
          </span>
          <b>{progressPct}%</b>
        </div>
        <div className="player-pathway-bar">
          <div className="player-pathway-fill" style={{ width: `${progressPct}%`, background: rank.gradient }} />
        </div>
      </div>

      {/* Equipped Achievement Badges Strip */}
      {unlockedCards.length > 0 && (
        <div className="player-equipped-badges">
          <span className="equipped-label">{t('Earned Crests')}:</span>
          <div className="equipped-badges-row">
            {unlockedCards.slice(0, 6).map((c) => (
              <span key={c.id} className="equipped-badge-pill" title={`${t(c.name)}: ${t(c.description)}`}>
                <span>{c.icon}</span>
                <span>{t(c.name)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Collectible Achievement Cards Grid
 * Displays all unlocked and in-progress achievement cards with metallic gradients, rarity tags, and progress meters.
 */
export function AchievementCardsGrid({
  done = {},
  points = 0,
  streak = 0,
  cloudStats = null,
  filterCategory = 'all'
}) {
  const { t } = useTranslation()
  const evaluated = evaluateAllAchievements({ done, points, streak, cloudStats })
  const list = filterCategory === 'all'
    ? evaluated
    : evaluated.filter((c) => c.category === filterCategory)

  return (
    <div className="collectible-cards-grid">
      {list.map((card) => {
        const pct = Math.min(100, Math.round((card.progress / card.total) * 100))
        return (
          <div
            key={card.id}
            className={`collectible-ach-card ${card.unlocked ? 'is-unlocked' : 'is-locked'}`}
            style={{ '--ach-grad': card.gradient, '--ach-color': card.rarityColor }}
          >
            <div className="ach-card-header">
              <span className="ach-rarity-pill" style={{ color: card.rarityColor, borderColor: `${card.rarityColor}55`, background: `${card.rarityColor}14` }}>
                ✦ {t(card.rarity)}
              </span>
              <span className="ach-reward-pill">+{card.pointsReward} {t('pts')}</span>
            </div>

            <div className="ach-card-medallion-wrap">
              <div
                className="ach-card-medallion"
                style={{ background: card.unlocked ? card.gradient : 'var(--g-soft)' }}
              >
                <span className="ach-medallion-icon">{card.icon}</span>
              </div>
              {card.unlocked && <span className="ach-unlocked-check" title={t('Unlocked')}>✓</span>}
            </div>

            <h4 className="ach-card-title">{t(card.name)}</h4>
            <p className="ach-card-desc">{t(card.description)}</p>

            <div className="ach-card-footer">
              <div className="ach-progress-meta">
                <span className="ach-status-label" style={{ color: card.unlocked ? card.rarityColor : 'var(--muted)' }}>
                  {card.unlocked ? `🏆 ${t('Card Unlocked')}` : `🔒 ${t('In Progress')}`}
                </span>
                <span className="ach-progress-fraction">
                  {card.progress} / {card.total}
                </span>
              </div>
              <div className="ach-progress-track">
                <div
                  className="ach-progress-fill"
                  style={{ width: `${pct}%`, background: card.unlocked ? card.gradient : 'var(--teal)' }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Weekly Challenge Reward Card Banner (shown on Challenges page)
 * Turns into a glowing gold unlocked collector card once all 3 Weekly Tasks are completed!
 */
export function WeeklyRewardCardBanner({ completedWeeklyCount = 0, points = 0, streak = 0, done = {} }) {
  const { t } = useTranslation()
  const isUnlocked = completedWeeklyCount >= 3
  const rank = getPlayerRank(done, null, points)

  return (
    <div className={`weekly-collector-banner ${isUnlocked ? 'is-unlocked' : ''}`}>
      <div className="weekly-collector-left">
        <div className="weekly-collector-emblem">
          <span>{isUnlocked ? '🏆' : '🏅'}</span>
        </div>
        <div>
          <div className="weekly-collector-tags">
            <span className="ach-rarity-pill" style={{ color: '#D6A84B', borderColor: 'rgba(214,168,75,0.45)', background: 'rgba(214,168,75,0.16)' }}>
              ✦ {t('WEEKLY COLLECTOR CARD')}
            </span>
            <span className="weekly-rank-tag">
              {rank.icon} {t(rank.title)} ({t('Level {{n}}', { n: rank.level })})
            </span>
          </div>
          <h3 className="weekly-collector-title">
            {isUnlocked
              ? t('Weekly Challenge Champion Card Unlocked!')
              : t('Complete All 3 Weekly Challenges to Unlock Your Champion Card')}
          </h3>
          <p className="weekly-collector-sub">
            {isUnlocked
              ? t('You conquered all 3 weekly AMR tasks! Your Champion Crest is now displayed on your XEITH Player Card and Leaderboard profile.')
              : t('Progress: {{done}} of 3 weekly questions completed. Finish the remaining tasks below to claim your collector card!', { done: completedWeeklyCount })}
          </p>
        </div>
      </div>

      <div className="weekly-collector-right">
        <Link to="/account" className="btn ghost" style={{ fontSize: '.82rem', padding: '8px 14px', whiteSpace: 'nowrap' }}>
          🪪 {t('View Player Card & Badges →')}
        </Link>
      </div>
    </div>
  )
}
