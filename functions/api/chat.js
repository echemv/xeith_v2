// Cloudflare Pages Function: POST /api/chat. Keeps the AI key on the server.
// Set in the Pages dashboard (never in the repo): LLM_API_KEY, LLM_MODEL, and optionally LLM_BASE_URL.
// Works with any OpenAI-compatible chat endpoint. Guardrails are minimal here and still to be designed.
const SYSTEM = 'You are XEITH, an assistant that teaches antimicrobial resistance (AMR) and responsible antibiotic use. Be clear, short and friendly. Explain concepts; do not diagnose, prescribe, recommend a specific antibiotic or give doses. If someone describes severe or worsening symptoms, tell them to seek urgent care. If unsure, say so. When concluding or offering more details, invite the user to explore the Classroom (or use markdown link [Classroom](/learn)).'
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })

const ALLOWED_LANGS = ['en', 'pid', 'ha', 'yo', 'ig']

export async function onRequestPost({ request, env }) {
  try {
    // Rate-limiting check if D1 database is bound
    if (env.DB) {
      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown'
      const windowSec = Math.floor(Date.now() / 1000 / 60) // 1-minute window
      const ipKey = `chat:${clientIp}:${windowSec}`
      try {
        await env.DB.prepare(
          'CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER, expires_at INTEGER)'
        ).run()
        const nowSec = Math.floor(Date.now() / 1000)
        await env.DB.prepare(
          'INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1'
        ).bind(ipKey, nowSec + 120).run()
        const record = await env.DB.prepare('SELECT count FROM rate_limits WHERE key = ?').bind(ipKey).first()
        if (record && record.count > 30) {
          return json({ error: 'Too many requests. Please wait a moment.' }, 429)
        }
      } catch {
        // Continue if rate limit table check fails
      }
    }

    const { messages = [], lang = 'en' } = await request.json()
    const cleanLang = ALLOWED_LANGS.includes(lang) ? lang : 'en'
    const clean = messages.filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-10).map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }))
    if (!clean.length) return json({ error: 'no messages' }, 400)
    if (!env.LLM_API_KEY || !env.LLM_MODEL) return json({ error: 'AI not configured' }, 503)
    const r = await fetch((env.LLM_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.LLM_API_KEY },
      body: JSON.stringify({ model: env.LLM_MODEL, max_tokens: 500, temperature: 0.3, messages: [{ role: 'system', content: SYSTEM + ' Reply in the language with code: ' + cleanLang + '.' }, ...clean] }),
    })
    if (!r.ok) return json({ error: 'upstream error' }, 502)
    const d = await r.json()
    return json({ reply: (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '' })
  } catch {
    return json({ error: 'bad request' }, 400)
  }
}
