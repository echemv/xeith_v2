import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Thinking from '../components/Thinking'
import Bacterium from '../components/Bacterium'
import { faqAnswer } from '../data/faq'

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

// Online: asks /api/chat (a serverless function that holds the AI key). Offline or on error: answers from the saved FAQ.
export default function Chat() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef(null)
  useEffect(() => { end.current && end.current.scrollIntoView({ behavior: 'smooth' }) }, [messages, busy])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next); setInput(''); setBusy(true)
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 20000)
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal, body: JSON.stringify({ messages: next.slice(-10), lang: i18n.resolvedLanguage }) })
      clearTimeout(to)
      if (!r.ok) throw new Error('bad response')
      const d = await r.json()
      setMessages((m) => [...m, { role: 'assistant', content: d.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: faqAnswer(text), offline: true }])
    } finally { setBusy(false) }
  }
  return (
    <div className="chat">
      <h1><Bacterium size={40} /> {t('Ask XEITH')}</h1>
      <div className="msgs" aria-live="polite">
        {!messages.length && <p className="muted">{t('Ask anything about antimicrobial resistance. I teach and explain. I can’t diagnose or prescribe.')}</p>}
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
        <textarea rows={2} value={input} placeholder={t('Type your question')} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
        <button className="btn" onClick={send} disabled={busy || !input.trim()}>{t('Send')}</button>
      </div>
    </div>
  )
}
