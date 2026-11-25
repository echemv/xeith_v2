// Cloudflare Pages Function: POST /api/facts
// Generates AMR facts using AI for review pipeline
// Set in Pages dashboard: LLM_API_KEY, LLM_MODEL, LLM_BASE_URL

const SYSTEM = `You are XEITH's fact generator. Create educational facts about antimicrobial resistance (AMR).
Output ONLY valid JSON. No markdown, no extra text.

Rules:
- Facts must be medically accurate and cited
- No diagnosis, prescription, or specific drug recommendations
- Educational only
- Include source URL for verification
- Language: reply in the requested language`

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })

const TOPICS = ['bacteria', 'virus', 'fungus', 'parasite', 'general']

function buildPrompt(topic, lang, count = 5) {
  return `Generate ${count} educational facts about ${topic} and antimicrobial resistance.
Topic: ${topic}
Language: ${lang}
Each fact must include a verifiable source URL (WHO, CDC, peer-reviewed journal, etc.)

Return JSON array:
[
  {
    "topic": "${topic}",
    "text": "Fact statement",
    "source": { "label": "Source name", "url": "https://..." }
  }
]`
}

export async function onRequestPost({ request, env }) {
  try {
    const { topic = 'general', lang = 'en', count = 5 } = await request.json()

    if (!TOPICS.includes(topic)) {
      return json({ error: 'Invalid topic' }, 400)
    }

    if (!env.LLM_API_KEY || !env.LLM_MODEL) {
      return json({ error: 'AI not configured' }, 503)
    }

    const prompt = buildPrompt(topic, lang, count)

    const r = await fetch((env.LLM_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.LLM_API_KEY },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        max_tokens: 1500,
        temperature: 0.3,
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

    let facts
    try {
      const parsed = JSON.parse(content)
      facts = parsed.facts || parsed
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      return json({ error: 'invalid AI response format' }, 502)
    }

    if (!Array.isArray(facts)) {
      return json({ error: 'AI response must be an array' }, 502)
    }

    // Validate each fact has required fields
    for (const fact of facts) {
      if (!fact.text || !fact.source || !fact.source.url) {
        return json({ error: 'Missing required fields in fact' }, 502)
      }
    }

    return json({ facts })

  } catch (e) {
    console.error('Fact generation error:', e)
    return json({ error: 'bad request' }, 400)
  }
}