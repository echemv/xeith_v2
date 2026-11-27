// Cloudflare Pages Function: POST /api/map
// Generates map data (Nigeria AMR pins) using AI for review pipeline
// Set in Pages dashboard: LLM_API_KEY, LLM_MODEL, LLM_BASE_URL

const SYSTEM = `You are XEITH's map data generator. Create location-based AMR information pins for Nigeria.
Output ONLY valid JSON. No markdown, no extra text.

Rules:
- Pins must be real locations in Nigeria (hospitals, universities, research centers, health ministries)
- Information must be medically accurate and cited
- No diagnosis or treatment recommendations
- Educational only
- Include source URL for verification
- Language: reply in the requested language`

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })
const ALLOWED_LANGS = ['en', 'pid', 'ha', 'yo', 'ig']

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const enc = new TextEncoder()
  const bufA = enc.encode(a)
  const bufB = enc.encode(b)
  if (bufA.byteLength !== bufB.byteLength) return false
  if (crypto?.subtle?.timingSafeEqual) {
    return crypto.subtle.timingSafeEqual(bufA, bufB)
  }
  let diff = 0
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i]
  return diff === 0
}

const REGIONS = [
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Abuja', lat: 9.0765, lng: 7.3986 },
  { name: 'Kano', lat: 12.0022, lng: 8.5919 },
  { name: 'Ibadan', lat: 7.3775, lng: 3.9470 },
  { name: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
  { name: 'Benin City', lat: 6.3350, lng: 5.6037 },
  { name: 'Maiduguri', lat: 11.8469, lng: 13.1571 },
  { name: 'Zaria', lat: 11.0734, lng: 7.7005 },
  { name: 'Abeokuta', lat: 7.1608, lng: 3.3483 },
  { name: 'Jos', lat: 9.9285, lng: 8.8923 }
]

function buildPrompt(region, lang, count = 3) {
  return `Generate ${count} AMR-related map pins for ${region.name}, Nigeria.
Region: ${region.name}
Coordinates: ${region.lat}, ${region.lng}
Language: ${lang}
Each pin should be a real institution (hospital, university, research center, health agency) with AMR-relevant information.

Return JSON array:
[
  {
    "name": "Institution name",
    "lat": ${region.lat},
    "lng": ${region.lng},
    "description": "Educational description of AMR activities/data at this location",
    "source": { "label": "Source name", "url": "https://..." },
    "type": "hospital|university|research|agency|community"
  }
]`
}

export async function onRequestPost({ request, env }) {
  try {
    // Pipeline protection: require review/admin secret to trigger bulk AI map data generation
    const authHeader = request.headers.get('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!env.ADMIN_KEY || !timingSafeEqualStr(token, env.ADMIN_KEY)) {
      return json({ error: 'Unauthorized: Map data generation is restricted to the internal review pipeline' }, 401)
    }

    const { region, lang = 'en', count = 3 } = await request.json()
    const cleanLang = ALLOWED_LANGS.includes(lang) ? lang : 'en'
    const safeCount = Math.min(Math.max(1, Math.floor(Number(count) || 3)), 10)

    const regionData = REGIONS.find(r => r.name.toLowerCase() === (typeof region === 'string' ? region : '').toLowerCase())
    if (!regionData) {
      return json({ error: 'Invalid region' }, 400)
    }

    if (!env.LLM_API_KEY || !env.LLM_MODEL) {
      return json({ error: 'AI not configured' }, 503)
    }

    const prompt = buildPrompt(regionData, cleanLang, safeCount)

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

    let pins
    try {
      const parsed = JSON.parse(content)
      pins = parsed.pins || parsed
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      return json({ error: 'invalid AI response format' }, 502)
    }

    if (!Array.isArray(pins)) {
      return json({ error: 'AI response must be an array' }, 502)
    }

    // Validate each pin
    for (const pin of pins) {
      if (!pin.name || !pin.description || !pin.source || !pin.source.url) {
        return json({ error: 'Missing required fields in pin' }, 502)
      }
    }

    return json({ pins })

  } catch (e) {
    console.error('Map generation error:', e)
    return json({ error: 'bad request' }, 400)
  }
}