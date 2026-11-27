import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LESSONS } from '../data/lessons'
import {
  getCompletedLessonCount,
  getPlayerRank,
  evaluateAllAchievements
} from '../data/achievements'

/**
 * Generates a high-resolution PNG image of a XEITH Player or Achievement Card using HTML5 Canvas
 * so users can download or share their card on social media.
 */
async function generateCardPngBlob({ title, subtitle, rarity, icon, playerName, points, streak, accent = '#176B65' }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 620
  const ctx = canvas.getContext('2d')

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 1080, 620)
  bg.addColorStop(0, '#0B2230')
  bg.addColorStop(0.55, '#13384C')
  bg.addColorStop(1, '#102A3B')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1080, 620)

  // Decorative glow
  const glow = ctx.createRadialGradient(900, 120, 20, 900, 120, 380)
  glow.addColorStop(0, accent + '66')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1080, 620)

  // Border frame
  ctx.strokeStyle = '#D6A84B'
  ctx.lineWidth = 4
  ctx.strokeRect(28, 28, 1024, 564)

  // Top header pill
  ctx.fillStyle = '#FFE27A'
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
  ctx.fillText(`✦ XEITH AMR STEWARDSHIP COLLECTOR CARD · ${rarity || 'VERIFIED'}`, 68, 88)

  // Icon badge box
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.roundRect(68, 125, 118, 118, 26)
  ctx.fill()
  ctx.font = '64px system-ui, apple-color-emoji, sans-serif'
  ctx.fillText(icon || '🛡️', 94, 206)

  // Card Title
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif'
  ctx.fillText(String(title || 'XEITH AMR Steward').slice(0, 38), 214, 178)

  // Player Name
  ctx.fillStyle = '#7FD1B9'
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
  ctx.fillText(`Awarded to: ${playerName || 'XEITH Steward'}`, 214, 224)

  // Subtitle / Description wrapped
  ctx.fillStyle = 'rgba(245, 243, 236, 0.88)'
  ctx.font = '24px system-ui, -apple-system, sans-serif'
  const words = String(subtitle || '').split(' ')
  let line = ''
  let y = 305
  for (const w of words) {
    const test = line + w + ' '
    if (ctx.measureText(test).width > 920 && line) {
      ctx.fillText(line.trim(), 68, y)
      line = w + ' '
      y += 36
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line.trim(), 68, y)

  // Bottom Stats Bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.beginPath()
  ctx.roundRect(68, 455, 944, 96, 18)
  ctx.fill()

  ctx.fillStyle = '#FFE27A'
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
  ctx.fillText(`⭐ ${points || 0} Stewardship Pts`, 104, 513)

  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(`🔥 ${streak || 0} Day Streak`, 450, 513)

  ctx.fillStyle = '#7FD1B9'
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
  ctx.fillText('xeith.org · Fight Superbugs', 715, 512)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

/**
 * Social Share Modal for any Player Card or Achievement Collector Card
 */
export function ShareCardModal({ cardData, onClose }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [shareNote, setShareNote] = useState('')
  const [cardFile, setCardFile] = useState(null)
  const [cardBlob, setCardBlob] = useState(null)

  useEffect(() => {
    let active = true
    if (!cardData) {
      setCardBlob(null)
      setCardFile(null)
      return
    }
    generateCardPngBlob(cardData)
      .then((blob) => {
        if (!active || !blob) return
        setCardBlob(blob)
        const slug = (cardData.id || 'steward').toLowerCase().replace(/[^a-z0-9-_]/g, '-')
        setCardFile(new File([blob], `xeith-card-${slug}.png`, { type: 'image/png' }))
      })
      .catch(() => {})
    return () => { active = false }
  }, [cardData])

  if (!cardData) return null

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://xeith.org'
  const shareText = t(
    '🏅 I just unlocked the "{{card}}" collector card on XEITH ({{pts}} pts)! Join me in outsmarting antimicrobial resistance (AMR):',
    { card: cardData.title, pts: cardData.points || 0 }
  )
  const fullShareMessage = `${shareText} ${shareUrl}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareMessage)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const canShareFiles = canNativeShare && typeof navigator.canShare === 'function' && cardFile && navigator.canShare({ files: [cardFile] })

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullShareMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  const handleCopyImageAndText = async () => {
    try {
      const blob = cardBlob || (await generateCardPngBlob(cardData))
      if (blob && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
            'text/plain': new Blob([fullShareMessage], { type: 'text/plain' })
          })
        ])
        setCopiedImage(true)
        setShareNote(t('Card image and caption copied — paste directly into WhatsApp, X, or LinkedIn!'))
        setTimeout(() => setCopiedImage(false), 2600)
        return
      }
    } catch {}
    // Fallback: copy caption + download PNG
    await handleCopyText()
    await handleDownloadPng()
    setShareNote(t('Caption copied and card PNG downloaded so you can attach it with your post.'))
  }

  const handleDownloadPng = async () => {
    try {
      setDownloading(true)
      const blob = cardBlob || (await generateCardPngBlob(cardData))
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `xeith-card-${(cardData.id || 'steward').toLowerCase()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleNativeShare = async () => {
    try {
      const file = cardFile || await (async () => {
        const blob = await generateCardPngBlob(cardData)
        return blob ? new File([blob], 'xeith-steward-card.png', { type: 'image/png' }) : null
      })()
      if (navigator.canShare && file && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: cardData.title,
          text: fullShareMessage,
          files: [file]
        })
        return
      }
      if (navigator.share) {
        await navigator.share({ title: cardData.title, text: shareText, url: shareUrl })
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        await handleCopyImageAndText()
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={t('Share Collector Card')}>
      <div className="card share-card-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="ach-rarity-pill" style={{ color: '#D6A84B', borderColor: '#D6A84B55', background: '#D6A84B18' }}>
            ✦ {t('SHARE YOUR STEWARDSHIP CARD')}
          </span>
          <button className="btn ghost" onClick={onClose} style={{ padding: '4px 10px', fontSize: '0.85rem' }}>✕</button>
        </div>

        {/* Visual Card Preview */}
        <div
          className="share-card-preview"
          style={{ background: cardData.gradient || 'linear-gradient(135deg, #176B65, #102D3A)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="share-preview-icon">{cardData.icon || '🏅'}</div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#FFE27A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {cardData.rarity || t('COLLECTOR CARD')} · XEITH AMR
              </div>
              <h3 style={{ margin: '2px 0 4px', color: '#fff', fontSize: '1.15rem' }}>{cardData.title}</h3>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>
                {t('Awarded to')}: <b>{cardData.playerName || t('XEITH Steward')}</b> · ⭐ {cardData.points || 0} {t('pts')}
              </div>
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.45 }}>
            {cardData.subtitle}
          </p>
        </div>

        <p className="muted" style={{ fontSize: '0.82rem', margin: '12px 0 10px' }}>
          {t('Share your achievement with classmates, health clubs, or on social media:')}
        </p>

        <div className="share-social-grid">
          {canNativeShare && (
            <button className="btn primary" onClick={handleNativeShare} style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
              📤 {canShareFiles
                ? t('Share Card Image + Message (WhatsApp, IG, X...)')
                : t('Share via Device Apps')}
            </button>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn share-btn-whatsapp"
          >
            💬 {t('Share on WhatsApp')}
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn share-btn-twitter"
          >
            𝕏 {t('Post on X / Twitter')}
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn share-btn-linkedin"
          >
            💼 {t('Share on LinkedIn')}
          </a>
          <button className="btn ghost" onClick={handleCopyImageAndText}>
            🖼️ {copiedImage ? t('Image + Caption Copied!') : t('Copy Image + Caption')}
          </button>
          <button className="btn ghost" onClick={handleDownloadPng} disabled={downloading}>
            ⬇️ {downloading ? t('Generating PNG...') : t('Download Card PNG')}
          </button>
          <button className="btn ghost" onClick={handleCopyText}>
            📋 {copied ? t('Copied to Clipboard!') : t('Copy Share Caption')}
          </button>
        </div>
        {shareNote && (
          <p className="muted" role="status" style={{ fontSize: '0.78rem', margin: '10px 0 0', color: 'var(--teal)' }}>
            {shareNote}
          </p>
        )}
      </div>
    </div>
  )
}

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
  const [shareData, setShareData] = useState(null)
  const lessonsDone = getCompletedLessonCount(done, cloudStats)
  const rank = getPlayerRank(done, cloudStats, points)
  const evaluated = evaluateAllAchievements({ done, points, streak, cloudStats })
  const unlockedCards = evaluated.filter((c) => c.unlocked)
  const nextRankLessons = rank.level === 1 ? 2 : rank.level === 2 ? 5 : LESSONS.length
  const progressPct = Math.min(100, Math.round((lessonsDone / LESSONS.length) * 100))

  const openSharePlayerCard = () => {
    setShareData({
      id: `rank-level-${rank.level}`,
      title: `${t(rank.title)} (${t(rank.badge)})`,
      subtitle: t(rank.subtitle),
      rarity: t(rank.badge),
      icon: rank.icon,
      playerName: displayName || t('XEITH Steward'),
      points,
      streak,
      accent: rank.accent,
      gradient: rank.gradient
    })
  }

  return (
    <>
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
              <button
                type="button"
                className="player-card-share-pill"
                onClick={openSharePlayerCard}
                title={t('Share your Player Card on social media')}
              >
                📤 {t('Share Card')}
              </button>
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

      {shareData && <ShareCardModal cardData={shareData} onClose={() => setShareData(null)} />}
    </>
  )
}

/**
 * Collectible Achievement Cards Grid
 * Displays all unlocked and in-progress achievement cards with metallic gradients, rarity tags, and social share button.
 */
export function AchievementCardsGrid({
  done = {},
  points = 0,
  streak = 0,
  cloudStats = null,
  playerName = '',
  filterCategory = 'all'
}) {
  const { t } = useTranslation()
  const [shareData, setShareData] = useState(null)
  const evaluated = evaluateAllAchievements({ done, points, streak, cloudStats })
  const list = filterCategory === 'all'
    ? evaluated
    : evaluated.filter((c) => c.category === filterCategory)

  const handleShareCard = (card) => {
    setShareData({
      id: card.id,
      title: t(card.name),
      subtitle: t(card.description),
      rarity: t(card.rarity),
      icon: card.icon,
      playerName: playerName || t('XEITH Steward'),
      points,
      streak,
      accent: card.rarityColor,
      gradient: card.gradient
    })
  }

  return (
    <>
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
                {card.unlocked && (
                  <button
                    type="button"
                    className="btn ghost ach-share-btn"
                    onClick={() => handleShareCard(card)}
                  >
                    📤 {t('Share Card on Social Media')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {shareData && <ShareCardModal cardData={shareData} onClose={() => setShareData(null)} />}
    </>
  )
}

/**
 * Classroom Section Collector Card Banner (rendered inside each of the 3 Classroom Pathway Tiers)
 */
export function ClassroomSectionCardBanner({ tier, isTierComplete, tierDoneCount, tierTotalCount, points = 0, streak = 0, playerName = '' }) {
  const { t } = useTranslation()
  const [shareData, setShareData] = useState(null)

  const sectionCards = {
    beginner: {
      id: 'tier-1-card',
      rarity: t('RARE SECTION CARD'),
      name: t('Section 1 Card: Microbes & AMR Foundations'),
      desc: t('Mastered the difference between helpful microbes and pathogens, and how antimicrobial resistance develops.'),
      unlockPerks: t('Unlocks Level 2 Scenarios & Level 2 Outbreak Surge in The AMR Lab!'),
      icon: '🌱',
      color: '#176B65',
      gradient: 'linear-gradient(135deg, #176B65 0%, #2A8F86 100%)'
    },
    intermediate: {
      id: 'tier-2-card',
      rarity: t('EPIC SECTION CARD'),
      name: t('Section 2 Card: Specialist of the 4 Pathogens'),
      desc: t('Mastered Bacteria, Viruses, Fungi, and Parasites—and why each requires its own targeted treatment.'),
      unlockPerks: t('Unlocks Level 3 Superbug Crisis Mode & Advanced Clinical Scenarios!'),
      icon: '🔬',
      color: '#0284C7',
      gradient: 'linear-gradient(135deg, #0284C7 0%, #4FB3D9 100%)'
    },
    advanced: {
      id: 'tier-3-card',
      rarity: t('LEGENDARY SECTION CARD'),
      name: t('Section 3 Card: One Health & Drug Safety Champion'),
      desc: t('Mastered infection prevention, farm-to-table One Health stewardship, and NAFDAC medicine verification.'),
      unlockPerks: t('Completes the XEITH AMR Stewardship Curriculum!'),
      icon: '🌍',
      color: '#7A5CC7',
      gradient: 'linear-gradient(135deg, #7A5CC7 0%, #D6A84B 100%)'
    }
  }

  const card = sectionCards[tier.id] || sectionCards.beginner

  return (
    <>
      <div className={`classroom-section-collector-card ${isTierComplete ? 'is-unlocked' : 'is-locked'}`} style={{ '--sec-color': card.color }}>
        <div className="csc-left">
          <div className="csc-medallion" style={{ background: isTierComplete ? card.gradient : 'var(--g-soft)' }}>
            <span>{isTierComplete ? card.icon : '🔒'}</span>
          </div>
          <div className="csc-info">
            <div className="csc-tags">
              <span className="ach-rarity-pill" style={{ color: card.color, borderColor: `${card.color}55`, background: `${card.color}15` }}>
                ✦ {card.rarity}
              </span>
              <span className="csc-unlock-perk">⚡ {card.unlockPerks}</span>
            </div>
            <h4 className="csc-title">
              {isTierComplete ? `🏆 ${card.name}` : `${card.name} (${tierDoneCount}/${tierTotalCount} ${t('modules completed')})`}
            </h4>
            <p className="csc-desc">{card.desc}</p>
          </div>
        </div>
        <div className="csc-actions">
          {isTierComplete ? (
            <button
              type="button"
              className="btn primary"
              style={{ fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
              onClick={() =>
                setShareData({
                  id: card.id,
                  title: card.name,
                  subtitle: card.desc,
                  rarity: card.rarity,
                  icon: card.icon,
                  playerName: playerName || t('XEITH Steward'),
                  points,
                  streak,
                  accent: card.color,
                  gradient: card.gradient
                })
              }
            >
              📤 {t('Share Section Card')}
            </button>
          ) : (
            <span className="csc-locked-pill">
              🔒 {t('Finish {{n}} more to unlock & share', { n: Math.max(0, tierTotalCount - tierDoneCount) })}
            </span>
          )}
        </div>
      </div>

      {shareData && <ShareCardModal cardData={shareData} onClose={() => setShareData(null)} />}
    </>
  )
}

/**
 * Weekly Challenge Reward Card Banner (shown on Challenges page)
 * Turns into a glowing gold unlocked collector card once all 3 Weekly Tasks are completed!
 */
export function WeeklyRewardCardBanner({ completedWeeklyCount = 0, points = 0, streak = 0, done = {}, playerName = '' }) {
  const { t } = useTranslation()
  const [shareData, setShareData] = useState(null)
  const isUnlocked = completedWeeklyCount >= 3
  const rank = getPlayerRank(done, null, points)

  return (
    <>
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

        <div className="weekly-collector-right" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isUnlocked && (
            <button
              type="button"
              className="btn primary"
              style={{ fontSize: '.82rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
              onClick={() =>
                setShareData({
                  id: 'weekly-champion',
                  title: t('Weekly Challenge Champion'),
                  subtitle: t('Completed all 3 Weekly AMR Stewardship Challenges on XEITH!'),
                  rarity: t('EPIC WEEKLY CARD'),
                  icon: '🏆',
                  playerName: playerName || t('XEITH Steward'),
                  points,
                  streak,
                  accent: '#D6A84B',
                  gradient: 'linear-gradient(135deg, #D6A84B 0%, #176B65 100%)'
                })
              }
            >
              📤 {t('Share Card')}
            </button>
          )}
          <Link to="/account" className="btn ghost" style={{ fontSize: '.82rem', padding: '8px 14px', whiteSpace: 'nowrap' }}>
            🪪 {t('View Player Card & Badges →')}
          </Link>
        </div>
      </div>

      {shareData && <ShareCardModal cardData={shareData} onClose={() => setShareData(null)} />}
    </>
  )
}
