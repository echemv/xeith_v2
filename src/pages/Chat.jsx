import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Thinking from '../components/Thinking'
import Bacterium from '../components/Bacterium'
import { faqAnswer } from '../data/faq'

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
      return href.startsWith('/') ? (
        <Link key={k} to={href} className="chat-inline-link">
          {label}
        </Link>
      ) : (
        <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="chat-inline-link">
          {label}
        </a>
      )
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
  text.split('\n').forEach((line, i) => {
    const bullet = line.match(/^\s*[*-]\s+(.+)$/)
    const heading = line.match(/^\s*#{1,6}\s+(.+)$/)
    const body = bullet ? bullet[1] : heading ? heading[1] : line
    if (bullet) {
      list = list || []
      list.push(<li key={i}>{inline(body, i)}</li>)
      return
    }
    if (list) { blocks.push(<ul key={'u' + i}>{list}</ul>); list = null }
    if (body.trim()) blocks.push(heading ? <p key={i}><strong>{inline(body, i)}</strong></p> : <p key={i}>{inline(body, i)}</p>)
  })
  if (list) blocks.push(<ul key="u-last">{list}</ul>)
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
  const end = useRef(null)

  const activeThread = threads.find((t) => t.id === activeId) || null
  const messages = activeThread ? activeThread.messages : []

  useEffect(() => {
    end.current && end.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

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

    try {
      const ctrl = new AbortController()
      const to = setTimeout(() => ctrl.abort(), 20000)
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ messages: contextMessages, lang: i18n.resolvedLanguage }),
      })
      clearTimeout(to)
      if (!r.ok) throw new Error('bad response')
      const d = await r.json()
      appendAssistantReply(targetThreadId, d.reply, false)
    } catch {
      appendAssistantReply(targetThreadId, faqAnswer(text), true)
    } finally {
      setBusy(false)
    }
  }

  const appendAssistantReply = (threadId, content, offline = false) => {
    setThreads((prev) => {
      const target = prev.find((th) => th.id === threadId)
      if (!target) return prev
      const updated = {
        ...target,
        updatedAt: Date.now(),
        messages: [...target.messages, { role: 'assistant', content, offline }],
      }
      const nextList = [updated, ...prev.filter((th) => th.id !== threadId)]
      saveThreadsToStorage(nextList)
      return nextList
    })
  }

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
              <div className="chat-suggestions-box">
                <div className="chat-suggestions-header">
                  <span>💡 {t('Suggested questions')}</span>
                </div>
                <div className="chat-starter-pills">
                  {STARTER_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      className="chat-starter-pill"
                      onClick={() => send(t(q))}
                      disabled={busy}
                    >
                      {t(q)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={'msg ' + m.role}>
              {m.role === 'assistant' ? <Reply text={m.content} /> : m.content}
              {m.offline && <small> · {t('offline answer')}</small>}
            </div>
          ))}

          {busy && <Thinking />}
          <div ref={end} />
        </div>

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
