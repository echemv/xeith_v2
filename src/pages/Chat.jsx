import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Thinking from '../components/Thinking'
import Bacterium from '../components/Bacterium'
import { FAQ_CATEGORIES, findFaqMatch, faqAnswer } from '../data/faq'

const THREADS_STORAGE_KEY = 'xeith-chat-threads'
const ACTIVE_THREAD_KEY = 'xeith-active-thread-id'

function loadSavedThreads() {
  try {
    const raw = localStorage.getItem(THREADS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    // Check legacy single-chat persistence
    const legacy = localStorage.getItem('xeith-chat-history')
    if (legacy) {
      const msgs = JSON.parse(legacy)
      if (Array.isArray(msgs) && msgs.length > 0) {
        const firstUser = msgs.find((m) => m.role === 'user')
        const initialTitle = firstUser ? (firstUser.content.length > 36 ? firstUser.content.slice(0, 36) + '…' : firstUser.content) : 'Conversation 1'
        const migrated = {
          id: 't_' + Date.now(),
          title: initialTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: msgs,
        }
        localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify([migrated]))
        return [migrated]
      }
    }
  } catch (e) {
    console.error('Error loading chat threads:', e)
  }
  return []
}

function saveThreadsToStorage(threads) {
  try {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads))
  } catch (e) {
    console.error('Error saving chat threads:', e)
  }
}

function formatRelativeTime(ts, t) {
  if (!ts) return ''
  const now = new Date()
  const d = new Date(ts)
  const isToday = now.toDateString() === d.toDateString()
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (yesterday.toDateString() === d.toDateString()) {
    return t('Yesterday')
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function inline(text) {
  const TOKEN_REGEX = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\bLet me know if you(?:'d| would) like more details[!.\s]*|\b(?:the\s+)?Learn section\b|\bClassroom\b)/gi
  return text.split(TOKEN_REGEX).filter(Boolean).map((p, k) => {
    const mdLink = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (mdLink) {
      const [, label, href] = mdLink
      const cleanHref = href.trim()
      if (cleanHref.startsWith('/') && !cleanHref.startsWith('//')) {
        return (
          <Link key={k} to={cleanHref} className="chat-inline-link">
            {label}
          </Link>
        )
      }
      if (/^https?:\/\//i.test(cleanHref)) {
        return (
          <a key={k} href={cleanHref} target="_blank" rel="noopener noreferrer" className="chat-inline-link">
            {label}
          </a>
        )
      }
      return <span key={k}>{label}</span>
    }
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) {
      return <strong key={k}>{p.slice(2, -2)}</strong>
    }
    if (/^Let me know if you(?:'d| would) like more details/i.test(p)) {
      const trimmed = p.trimEnd()
      const trailing = p.slice(trimmed.length)
      return (
        <span key={k}>
          <Link to="/learn" className="chat-inline-link chat-classroom-link" title="Explore the Classroom">
            {trimmed} →
          </Link>
          {trailing}
        </span>
      )
    }
    if (/^(?:the\s+)?(?:Learn section|Classroom)$/i.test(p)) {
      return (
        <Link key={k} to="/learn" className="chat-inline-link" title="Go to Classroom">
          {p}
        </Link>
      )
    }
    return <span key={k}>{p}</span>
  })
}

function Reply({ text }) {
  const blocks = []
  let list = null
  let listType = null
  const flushList = (key) => {
    if (!list) return
    blocks.push(listType === 'ol' ? <ol key={key}>{list}</ol> : <ul key={key}>{list}</ul>)
    list = null
    listType = null
  }
  text.split('\n').forEach((line, i) => {
    const bullet = line.match(/^\s*[*-]\s+(.+)$/)
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/)
    const heading = line.match(/^\s*#{1,6}\s+(.+)$/)
    if (bullet || ordered) {
      const nextType = ordered ? 'ol' : 'ul'
      if (list && listType !== nextType) flushList('l' + i)
      list = list || []
      listType = nextType
      list.push(<li key={i}>{inline(bullet ? bullet[1] : ordered[1], i)}</li>)
      return
    }
    flushList('l' + i)
    const body = heading ? heading[1] : line
    if (body.trim()) {
      blocks.push(heading
        ? <h4 key={i} className="chat-reply-heading">{inline(body, i)}</h4>
        : <p key={i}>{inline(body, i)}</p>)
    }
  })
  flushList('l-last')
  return blocks
}

const STARTER_QUESTIONS = [
  'What is AMR and why does it matter?',
  'Can antibiotics treat the flu or colds?',
  'Why must I finish my antibiotic course?',
  'How do superbugs spread?',
]

export default function Chat() {
  const { t, i18n } = useTranslation()
  const [threads, setThreads] = useState(() => loadSavedThreads())
  const [activeId, setActiveId] = useState(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_THREAD_KEY)
      if (savedId) return savedId
    } catch {}
    const initial = loadSavedThreads()
    return initial.length > 0 ? initial[0].id : null
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false))
  const [activeCatId, setActiveCatId] = useState(null)
  const [showFaqBrowser, setShowFaqBrowser] = useState(false)
  const end = useRef(null)

  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const activeThread = threads.find((t) => t.id === activeId) || null
  const messages = activeThread ? activeThread.messages : []

  const prevMsgCount = useRef(messages.length)

  useEffect(() => {
    // Only scroll when a new message is added or the assistant starts thinking—never on empty or initial load
    if ((messages.length > 0 && messages.length > prevMsgCount.current) || busy) {
      end.current && end.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    prevMsgCount.current = messages.length
  }, [messages.length, busy])

  const selectThread = (id) => {
    setActiveId(id)
    try {
      localStorage.setItem(ACTIVE_THREAD_KEY, id)
    } catch {}
    setDrawerOpen(false)
  }

  const startNewChat = () => {
    setActiveId(null)
    try {
      localStorage.removeItem(ACTIVE_THREAD_KEY)
    } catch {}
    setDrawerOpen(false)
  }

  const deleteThread = (e, id) => {
    e.stopPropagation()
    const updated = threads.filter((th) => th.id !== id)
    setThreads(updated)
    saveThreadsToStorage(updated)
    if (activeId === id) {
      const nextActive = updated.length > 0 ? updated[0].id : null
      setActiveId(nextActive)
      if (nextActive) {
        try { localStorage.setItem(ACTIVE_THREAD_KEY, nextActive) } catch {}
      } else {
        try { localStorage.removeItem(ACTIVE_THREAD_KEY) } catch {}
      }
    }
  }

  const clearAllThreads = () => {
    if (!window.confirm(t('Are you sure you want to delete all conversations?'))) return
    setThreads([])
    setActiveId(null)
    saveThreadsToStorage([])
    try { localStorage.removeItem(ACTIVE_THREAD_KEY) } catch {}
    setDrawerOpen(false)
  }

  const send = async (explicitText) => {
    const text = (typeof explicitText === 'string' ? explicitText : input).trim()
    if (!text || busy) return

    const now = Date.now()
    let currentThread = threads.find((th) => th.id === activeId)
    let updatedThreads = [...threads]

    if (!currentThread) {
      const title = text.length > 36 ? text.slice(0, 36) + '…' : text
      currentThread = {
        id: 'th_' + now + '_' + Math.random().toString(36).slice(2, 6),
        title,
        createdAt: now,
        updatedAt: now,
        messages: [{ role: 'user', content: text }],
      }
      updatedThreads = [currentThread, ...threads]
      setActiveId(currentThread.id)
      try { localStorage.setItem(ACTIVE_THREAD_KEY, currentThread.id) } catch {}
    } else {
      const updatedMessages = [...currentThread.messages, { role: 'user', content: text }]
      currentThread = {
        ...currentThread,
        updatedAt: now,
        messages: updatedMessages,
      }
      updatedThreads = [currentThread, ...threads.filter((th) => th.id !== currentThread.id)]
    }

    setThreads(updatedThreads)
    saveThreadsToStorage(updatedThreads)
    setInput('')
    setBusy(true)

    const targetThreadId = currentThread.id
    const contextMessages = currentThread.messages.slice(-10)
    const minSpinDelay = new Promise((resolve) => setTimeout(resolve, 600))

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('offline')
      }
      const ctrl = new AbortController()
      const to = setTimeout(() => ctrl.abort(), 20000)
      const [r] = await Promise.all([
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({ messages: contextMessages, lang: i18n.resolvedLanguage }),
        }),
        minSpinDelay,
      ])
      clearTimeout(to)
      if (!r.ok) throw new Error('bad response')
      const d = await r.json()
      appendAssistantReply(targetThreadId, d.reply, false)
    } catch {
      await minSpinDelay
      const match = findFaqMatch(text)
      if (match) {
        appendAssistantReply(targetThreadId, match.item.a, true, {
          categoryId: match.category?.id,
          categoryTitle: match.category?.title,
          related: match.related?.map((item) => item.q) || [],
        })
      } else {
        appendAssistantReply(targetThreadId, faqAnswer(text), true, {
          showCategories: true,
        })
      }
    } finally {
      setBusy(false)
      setShowFaqBrowser(false)
    }
  }

  const appendAssistantReply = (threadId, content, offline = false, meta = {}) => {
    setThreads((prev) => {
      const target = prev.find((th) => th.id === threadId)
      if (!target) return prev
      const updated = {
        ...target,
        updatedAt: Date.now(),
        messages: [...target.messages, { role: 'assistant', content, offline, ...meta }],
      }
      const nextList = [updated, ...prev.filter((th) => th.id !== threadId)]
      saveThreadsToStorage(nextList)
      return nextList
    })
  }

  const activeCategory = FAQ_CATEGORIES.find((c) => c.id === activeCatId) || null

  const renderFaqExplorer = (compact = false) => (
    <div className={`chat-faq-explorer ${compact ? 'is-compact' : ''}`}>
      <div className="chat-suggestions-header">
        <div className="chat-faq-header-left">
          <span>{isOffline ? '📴' : '📚'}</span>
          <span>
            {activeCategory
              ? `${activeCategory.icon} ${t(activeCategory.title)}`
              : isOffline
                ? t('Offline FAQ Library — Tap a topic to explore answers')
                : t('Browse Compartmentalized FAQ Topics')}
          </span>
        </div>
        <div className="chat-faq-header-actions">
          {activeCategory && (
            <button
              type="button"
              className="chat-faq-back-btn"
              onClick={() => setActiveCatId(null)}
            >
              ← {t('All Topics')}
            </button>
          )}
          {compact && (
            <button
              type="button"
              className="chat-faq-close-btn"
              onClick={() => setShowFaqBrowser(false)}
              aria-label={t('Close')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!activeCategory ? (
        <div className="chat-faq-compartments-grid">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="chat-faq-compartment-card"
              onClick={() => setActiveCatId(cat.id)}
            >
              <div className="compartment-card-top">
                <span className="compartment-icon" aria-hidden="true">{cat.icon}</span>
                <span className="compartment-count">
                  {cat.items.length} {t('FAQs')}
                </span>
              </div>
              <strong className="compartment-title">{t(cat.title)}</strong>
              <span className="compartment-desc">{t(cat.desc)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="chat-faq-questions-list">
          <p className="chat-faq-cat-subtitle">{t(activeCategory.desc)}</p>
          <div className="chat-starter-pills">
            {activeCategory.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chat-starter-pill"
                onClick={() => send(t(item.q))}
                disabled={busy}
              >
                <span>❓ {t(item.q)}</span>
                <span className="pill-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="chat-container">
      {/* Slide-over backdrop for mobile/drawer view */}
      <div
        className={`chat-sidebar-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Conversations history sidebar */}
      <aside className={`chat-sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="chat-sidebar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{t('Chat History')}</span>
          </div>
          <button
            className="chat-icon-btn chat-sidebar-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <button className="chat-new-sidebar-btn" onClick={startNewChat}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>{t('New Chat')}</span>
        </button>

        <div className="chat-thread-list" role="list">
          {threads.length === 0 ? (
            <div className="chat-empty-threads">
              <p className="muted">{t('No conversations yet')}</p>
            </div>
          ) : (
            threads.map((thread) => {
              const isActive = thread.id === activeId
              return (
                <div
                  key={thread.id}
                  className={`chat-thread-item ${isActive ? 'active' : ''}`}
                  onClick={() => selectThread(thread.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') selectThread(thread.id) }}
                >
                  <div className="chat-thread-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </div>
                  <div className="chat-thread-info">
                    <span className="chat-thread-title" title={thread.title}>{thread.title || t('New Chat')}</span>
                    <span className="chat-thread-meta">
                      {formatRelativeTime(thread.updatedAt, t)} · {t('{{count}} messages', { count: thread.messages?.length || 0 })}
                    </span>
                  </div>
                  <button
                    className="chat-thread-del-btn"
                    onClick={(e) => deleteThread(e, thread.id)}
                    title={t('Delete conversation')}
                    aria-label={t('Delete conversation')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {threads.length > 0 && (
          <div className="chat-sidebar-footer">
            <button className="chat-clear-all-btn" onClick={clearAllThreads}>
              {t('Clear all conversations')}
            </button>
          </div>
        )}
      </aside>

      {/* Main chat window */}
      <div className="chat-main-card">
        <div className="chat-topbar">
          <div className="chat-topbar-left">
            <button
              className="chat-history-toggle-btn"
              onClick={() => setDrawerOpen((v) => !v)}
              title={t('Chat History')}
              aria-label={t('Chat History')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="chat-history-btn-label">{t('History')}</span>
              {threads.length > 0 && <span className="chat-badge-count">{threads.length}</span>}
            </button>
            <h1 className="chat-title">
              <Bacterium size={34} />
              <span>{t('Ask XEITH')}</span>
            </h1>
          </div>

          <div className="chat-topbar-actions">
            {isOffline && (
              <span className="chat-offline-pill" title={t('Working offline with built-in FAQ library')}>
                📴 {t('Offline FAQ Mode')}
              </span>
            )}
            {isOffline && messages.length > 0 && (
              <button
                type="button"
                className={`chat-faq-toggle-btn ${showFaqBrowser ? 'active' : ''}`}
                onClick={() => setShowFaqBrowser((v) => !v)}
                title={t('Browse FAQ Topics')}
              >
                📚 <span>{t('FAQ Topics')}</span>
              </button>
            )}
            <button className="chat-new-header-btn" onClick={startNewChat} title={t('New Chat')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>{t('New Chat')}</span>
            </button>
          </div>
        </div>

        <div className="msgs" aria-live="polite">
          {!messages.length && (
            <div className="chat-welcome-state">
              <p className="muted">
                {t('Ask anything about antimicrobial resistance. I teach and explain. I can’t diagnose or prescribe.')}
              </p>

              {/* When offline, show the full FAQ Explorer upfront */}
              {isOffline && renderFaqExplorer(false)}

              <div className="chat-suggestions-box" style={{ marginTop: '14px' }}>
                <div className="chat-suggestions-header">
                  <span>💡 {t('Quick starter questions')}</span>
                  {!isOffline && (
                    <button
                      type="button"
                      className="chat-faq-corner-link"
                      onClick={() => setShowFaqBrowser((v) => !v)}
                    >
                      {showFaqBrowser ? t('Hide FAQs') : t('Browse FAQs →')}
                    </button>
                  )}
                </div>
                <div className="chat-starter-pills">
                  {STARTER_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      className="chat-starter-pill"
                      onClick={() => send(t(q))}
                      disabled={busy}
                    >
                      <span>{t(q)}</span>
                      <span className="pill-arrow">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* When online and "Browse FAQs" is clicked, open right below Quick starter questions */}
              {!isOffline && showFaqBrowser && renderFaqExplorer(true)}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={'msg ' + m.role}>
              {m.role === 'assistant' ? <Reply text={m.content} /> : m.content}
              {m.offline && <small className="chat-offline-tag"> · 📴 {t('offline answer')}</small>}

              {/* Related follow-up questions from the same FAQ compartment */}
              {m.role === 'assistant' && Array.isArray(m.related) && m.related.length > 0 && (
                <div className="chat-related-faqs">
                  <span className="chat-related-label">
                    {t('More in {{cat}}:', { cat: t(m.categoryTitle || 'this topic') })}
                  </span>
                  <div className="chat-related-pills">
                    {m.related.map((rq, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        className="chat-related-pill"
                        onClick={() => send(t(rq))}
                        disabled={busy}
                      >
                        {t(rq)} →
                      </button>
                    ))}
                    <button
                      type="button"
                      className="chat-related-pill is-topic-btn"
                      onClick={() => {
                        setActiveCatId(null)
                        setShowFaqBrowser(true)
                      }}
                    >
                      📚 {t('All 6 FAQ Topics')}
                    </button>
                  </div>
                </div>
              )}

              {/* When an offline question had no exact match, show quick compartment buttons inline */}
              {m.role === 'assistant' && m.showCategories && (
                <div className="chat-related-faqs">
                  <span className="chat-related-label">{t('Pick a compartment to see available offline answers:')}</span>
                  <div className="chat-related-pills">
                    {FAQ_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className="chat-related-pill is-topic-btn"
                        onClick={() => {
                          setActiveCatId(cat.id)
                          setShowFaqBrowser(true)
                        }}
                      >
                        {cat.icon} {t(cat.title)} ({cat.items.length})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {busy && <Thinking />}
          <div ref={end} />
        </div>

        {/* Collapsible mid-chat FAQ compartment browser above composer */}
        {messages.length > 0 && showFaqBrowser && (
          <div className="chat-mid-faq-drawer">
            {renderFaqExplorer(true)}
          </div>
        )}

        <div className="composer">
          <textarea
            rows={2}
            value={input}
            placeholder={t('Type your question')}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <button className="btn" onClick={() => send()} disabled={busy || !input.trim()}>
            {t('Send')}
          </button>
        </div>
      </div>
    </div>
  )
}
