// Cloudflare Pages Function: POST /api/challenges
// Generates daily/weekly AMR challenges using AI
// Set in Pages dashboard: LLM_API_KEY, LLM_MODEL, LLM_BASE_URL

const SYSTEM = `You are XEITH's challenge generator. Create engaging educational challenges about antimicrobial resistance (AMR).
Output ONLY valid JSON. No markdown, no extra text.

Challenge types:
1. QUIZ - Multiple choice question about AMR
2. WORD_LADDER - Transform one AMR term into another (one letter changes per step)
3. PHOTO_CHALLENGE - Real-world photo prompt related to AMR prevention/stewardship
4. FACT_MATCH - Sort statements into facts vs myths

Rules:
- Content must be medically accurate
- No diagnosis, prescription, or specific drug recommendations
- Educational only
- Language: reply in the requested language
- Word ladders must use valid English words at each step`

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })

const CHALLENGE_TYPES = ['QUIZ', 'WORD_LADDER', 'PHOTO_CHALLENGE', 'FACT_MATCH']
const TOPICS = ['bacteria', 'virus', 'fungus', 'parasite']

function buildPrompt(type, topic, lang, date) {
  const dayOfYear = Math.floor((new Date(date) - new Date(new Date(date).getFullYear(), 0, 0)) / 864e5)

  const prompts = {
    QUIZ: `Generate a multiple-choice quiz question about ${topic} and AMR.
Topic: ${topic}
Language: ${lang}
Difficulty: beginner-friendly

Return JSON:
{
  "type": "QUIZ",
  "topic": "${topic}",
  "question": "question text",
  "options": ["option A", "option B", "option C", "option D"],
  "answer": 0,
  "explanation": "why this is correct"
}`,

    WORD_LADDER: `Generate a word ladder puzzle transforming one AMR-related word into another.
Topic: ${topic}
Language: ${lang}
Constraints: 4-6 letter words, each step changes exactly 1 letter, all intermediate words must be valid English words.

Return JSON:
{
  "type": "WORD_LADDER",
  "topic": "${topic}",
  "startWord": "START",
  "endWord": "END",
  "hint": "clue for the player",
  "maxSteps": 6
}`,

    PHOTO_CHALLENGE: `Generate a photo challenge prompt for AMR awareness.
Topic: ${topic}
Language: ${lang}
The prompt should ask users to photograph something real-world related to infection prevention, antibiotic stewardship, or microbiome health.

Return JSON:
{
  "type": "PHOTO_CHALLENGE",
  "topic": "${topic}",
  "prompt": "Take a photo of...",
  "category": "prevention|stewardship|microbiome|hygiene",
  "examples": ["example 1", "example 2", "example 3", "example 4", "example 5"]
}`,

    FACT_MATCH: `Generate 3-4 statements about ${topic} and AMR for a fact-checking challenge.
Topic: ${topic}
Language: ${lang}
Mix of true and false statements. Each needs an explanation.

Return JSON:
{
  "type": "FACT_MATCH",
  "topic": "${topic}",
  "items": [
    { "statement": "statement text", "truth": true, "explanation": "why this is true" },
    { "statement": "statement text", "truth": false, "explanation": "why this is false" }
  ]
}`
  }

  return prompts[type] || prompts.QUIZ
}

const ALLOWED_LANGS = ['en', 'pid', 'ha', 'yo', 'ig']

export async function onRequestPost({ request, env }) {
  try {
    // Rate-limiting check if D1 database is bound
    if (env.DB) {
      const clientIp = request.headers.get('cf-connecting-ip') || 'unknown'
      const windowSec = Math.floor(Date.now() / 1000 / 60) // 1-minute window
      const ipKey = `challenges:${clientIp}:${windowSec}`
      try {
        await env.DB.prepare(
          'CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER, expires_at INTEGER)'
        ).run()
        const nowSec = Math.floor(Date.now() / 1000)
        await env.DB.prepare(
          'INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1'
        ).bind(ipKey, nowSec + 120).run()
        const record = await env.DB.prepare('SELECT count FROM rate_limits WHERE key = ?').bind(ipKey).first()
        if (record && record.count > 20) {
          return json({ error: 'Rate limit exceeded. Please wait a moment.' }, 429)
        }
      } catch {
        // Continue if rate limit check fails
      }
    }

    const { type, topic, lang = 'en', date } = await request.json()
    const cleanLang = ALLOWED_LANGS.includes(lang) ? lang : 'en'

    // Validate
    if (!CHALLENGE_TYPES.includes(type)) {
      return json({ error: 'Invalid challenge type' }, 400)
    }
    if (!TOPICS.includes(topic)) {
      return json({ error: 'Invalid topic' }, 400)
    }

    // Check AI config
    if (!env.LLM_API_KEY || !env.LLM_MODEL) {
      return json({ error: 'AI not configured' }, 503)
    }

    const prompt = buildPrompt(type, topic, cleanLang, date || new Date().toISOString())

    const r = await fetch((env.LLM_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.LLM_API_KEY },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        max_tokens: 800,
        temperature: 0.4,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    if (!r.ok) {
      const err = await r.text()
      console.error('Upstream error:', err)
      return json({ error: 'upstream error' }, 502)
    }

    const d = await r.json()
    const content = d.choices?.[0]?.message?.content

    if (!content) {
      return json({ error: 'empty response' }, 502)
    }

    let challenge
    try {
      challenge = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      return json({ error: 'invalid AI response format' }, 502)
    }

    // Validate response structure
    if (!challenge.type || challenge.type !== type) {
      return json({ error: 'AI returned wrong type' }, 502)
    }

    return json({ challenge })

  } catch (e) {
    console.error('Challenge generation error:', e)
    return json({ error: 'bad request' }, 400)
  }
}