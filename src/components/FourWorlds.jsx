import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp, award } from '../store'
import data from '../data/fourWorlds.json'
import '../styles/challenge-games.css'

const LEVEL_POINTS = { beginner: 10, intermediate: 15, expert: 20 } // 1x / 1.5x / 2x
const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' }
const MAX_MISTAKES = data.maxMistakes || 4

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const fresh = (puzzle) => ({
  order: shuffle(puzzle.groups.flatMap((g) => g.tiles)),
  selected: [],
  solved: [],
  mistakes: 0,
  guesses: [],
  status: 'playing',
  message: null,
})

export default function FourWorlds() {
  const { t } = useTranslation()
  const { done } = useApp()
  const [puzzleId, setPuzzleId] = useState(data.puzzles[0].id)
  const puzzle = data.puzzles.find((p) => p.id === puzzleId)
  const [game, setGame] = useState(() => fresh(puzzle))
  const [shake, setShake] = useState(false)
  const shakeTimer = useRef(null)
  const doneId = 'fourworlds-' + puzzle.id
  const points = LEVEL_POINTS[puzzle.level] || 10

  useEffect(() => () => clearTimeout(shakeTimer.current), [])

  const pick = (id) => {
    const p = data.puzzles.find((x) => x.id === id)
    setPuzzleId(id)
    setGame(fresh(p))
    setShake(false)
  }

  const toggle = (tile) => {
    if (game.status !== 'playing') return
    setGame((g) => {
      const has = g.selected.includes(tile)
      if (!has && g.selected.length >= 4) return g
      return { ...g, message: null, selected: has ? g.selected.filter((x) => x !== tile) : [...g.selected, tile] }
    })
  }

  const submit = () => {
    if (game.selected.length !== 4 || game.status !== 'playing') return
    const key = [...game.selected].sort().join('|')
    if (game.guesses.includes(key)) {
      setGame((g) => ({ ...g, message: { kind: 'info', text: t('You already tried that group.') } }))
      return
    }
    const gi = puzzle.groups.findIndex((g) => game.selected.every((s) => g.tiles.includes(s)))
    if (gi >= 0) {
      const solved = [...game.solved, gi]
      const won = solved.length === puzzle.groups.length
      const firstWin = won && !done[doneId]
      setGame((g) => ({
        ...g,
        solved,
        guesses: [...g.guesses, key],
        order: g.order.filter((x) => !puzzle.groups[gi].tiles.includes(x)),
        selected: [],
        status: won ? 'won' : 'playing',
        message: { kind: 'good', text: firstWin ? t('All four worlds sorted! +{{n}} points', { n: points }) : won ? t('All four worlds sorted!') : t('Correct group!') },
      }))
      if (won) award(points, doneId)
      return
    }
    const oneAway = puzzle.groups.some((g) => game.selected.filter((s) => g.tiles.includes(s)).length === 3)
    const mistakes = game.mistakes + 1
    const lost = mistakes >= MAX_MISTAKES
    setShake(true)
    clearTimeout(shakeTimer.current)
    shakeTimer.current = setTimeout(() => setShake(false), 450)
    setGame((g) => {
      const rest = puzzle.groups.map((_, i) => i).filter((i) => !g.solved.includes(i))
      return {
        ...g,
        mistakes,
        guesses: [...g.guesses, key],
        ...(lost ? { solved: [...g.solved, ...rest], order: [], selected: [], status: 'lost' } : {}),
        message: lost
          ? { kind: 'bad', text: t('Out of mistakes. Here are the four groups.') }
          : { kind: 'bad', text: oneAway ? t('One away!') : t('Not a group. Try again.') },
      }
    })
  }

  return (
    <section className="cg-panel" aria-labelledby="fw-title">
      <header className="cg-head">
        <div>
          <p className="eyebrow">{t('Games')}</p>
          <h2 id="fw-title" className="cg-title">{t('Four Worlds')}</h2>
          <p className="cg-sub">{t('Find four groups of four. You can make 4 mistakes.')}</p>
        </div>
        <span className="cg-draft">{t('Xeith AI')}</span>
      </header>

      <div className="cg-chips" role="tablist" aria-label={t('Choose a puzzle')}>
        {data.puzzles.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={p.id === puzzleId}
            className={`cg-chip ${p.id === puzzleId ? 'is-active' : ''}`}
            onClick={() => pick(p.id)}
          >
            <span className="cg-chip-n">{i + 1}</span>
            <span>{t(LEVEL_LABEL[p.level])}</span>
            {done['fourworlds-' + p.id] && <span className="cg-chip-done" aria-label={t('Completed')}>✓</span>}
          </button>
        ))}
      </div>

      <div className="cg-meta">
        <b className="cg-puzzle-name">{t(puzzle.title)}</b>
        <span className="cg-points">+{points} {t('pts')}</span>
      </div>

      <div className="fw-solved">
        {game.solved.map((gi) => {
          const g = puzzle.groups[gi]
          return (
            <div key={gi} className={`fw-group fw-g${gi}`}>
              <b className="fw-group-label">{t(g.label)}</b>
              <span className="fw-group-tiles">{g.tiles.map((x) => t(x)).join(' · ')}</span>
              {game.status !== 'playing' && <span className="fw-group-explain">{t(g.explain)}</span>}
            </div>
          )
        })}
      </div>

      {game.order.length > 0 && (
        <div className="fw-grid">
          {game.order.map((tile) => {
            const sel = game.selected.includes(tile)
            return (
              <button
                key={tile}
                className={`fw-tile ${sel ? 'is-selected' : ''} ${sel && shake ? 'is-shaking' : ''}`}
                aria-pressed={sel}
                onClick={() => toggle(tile)}
              >
                {t(tile)}
              </button>
            )
          })}
        </div>
      )}

      <div className="fw-mistakes" aria-label={t('Mistakes left: {{n}}', { n: MAX_MISTAKES - game.mistakes })}>
        <span className="cg-sub">{t('Mistakes left')}</span>
        <span className="fw-dots" aria-hidden="true">
          {Array.from({ length: MAX_MISTAKES }, (_, i) => (
            <span key={i} className={`fw-dot ${i < MAX_MISTAKES - game.mistakes ? '' : 'is-used'}`} />
          ))}
        </span>
      </div>

      {game.message && (
        <div key={game.message.text + game.mistakes + game.solved.length} className={`cg-banner is-${game.message.kind}`} role="status">
          {game.message.text}
        </div>
      )}

      <div className="cg-actions">
        {game.status === 'playing' ? (
          <>
            <button className="cg-btn ghost" onClick={() => setGame((g) => ({ ...g, order: shuffle(g.order) }))}>{t('Shuffle')}</button>
            <button className="cg-btn ghost" disabled={!game.selected.length} onClick={() => setGame((g) => ({ ...g, selected: [] }))}>{t('Deselect all')}</button>
            <button className="cg-btn primary" disabled={game.selected.length !== 4} onClick={submit}>{t('Submit')}</button>
          </>
        ) : (
          <button className="cg-btn primary" onClick={() => pick(puzzle.id)}>{t('Play again')}</button>
        )}
      </div>

      <p className="cg-source">
        {t('Source')}: <a href={puzzle.source.url} target="_blank" rel="noopener noreferrer">{puzzle.source.name}</a> · {t('Draft, not yet reviewed')}
      </p>
    </section>
  )
}
