// Cloudflare Pages Function: POST /api/chat. Keeps the AI key on the server.
// Set in the Pages dashboard (never in the repo): LLM_API_KEY, LLM_MODEL, and optionally LLM_BASE_URL.
// Works with any OpenAI-compatible chat endpoint. Guardrails are minimal here and still to be designed.
const SYSTEM = 'You are XEITH, an assistant that teaches antimicrobial resistance (AMR) and responsible antibiotic use. Be clear, short and friendly. Explain concepts; do not diagnose, prescribe, recommend a specific antibiotic or give doses. If someone describes severe or worsening symptoms, tell them to seek urgent care. If unsure, say so.'
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })

export async function onRequestPost({ request, env }) {
  try {
    const { messages = [], lang = 'en' } = await request.json()
    const clean = messages.filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-10).map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }))
    if (!clean.length) return json({ error: 'no messages' }, 400)
    if (!env.LLM_API_KEY || !env.LLM_MODEL) return json({ error: 'AI not configured' }, 503)
    const r = await fetch((env.LLM_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.LLM_API_KEY },
      body: JSON.stringify({ model: env.LLM_MODEL, max_tokens: 500, temperature: 0.3, messages: [{ role: 'system', content: SYSTEM + ' Reply in the language with code: ' + lang + '.' }, ...clean] }),
    })
    if (!r.ok) return json({ error: 'upstream error' }, 502)
    const d = await r.json()
    return json({ reply: (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '' })
  } catch {
    return json({ error: 'bad request' }, 400)
  }
}
