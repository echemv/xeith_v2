// Cloudflare Pages Function: POST /api/chat. Keeps the AI key on the server.
// Set in the Pages dashboard (never in the repo): LLM_API_KEY, LLM_MODEL, and optionally LLM_BASE_URL.
// Includes pre-LLM input guardrails, server-side RAG grounding from curated AMR knowledge, and post-LLM output validation.
import { retrieveKnowledge } from '../data/amrKnowledge.js'

const SYSTEM = 'You are XEITH, an assistant that teaches antimicrobial resistance (AMR) and responsible antibiotic use. Be clear, short and friendly. Ground your answer in the VERIFIED KNOWLEDGE CONTEXT provided below when relevant, and include the matching Classroom link (e.g. [Classroom](/learn)). Do not diagnose, prescribe, recommend a specific antibiotic, or give dosages. If someone describes severe or worsening symptoms, tell them to seek urgent medical care. If unsure, say so.'

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } })

const ALLOWED_LANGS = ['en', 'pid', 'ha', 'yo', 'ig']

const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/i,
  /reveal\s+(?:your\s+)?(?:system\s+prompt|instructions|rules)/i,
  /you\s+are\s+now\s+(?:a\s+)?(?:doctor|physician|pharmacist|unrestricted)/i,
  /jailbreak|developer\s+mode|bypass\s+(?:safety|rules|guardrails)/i,
]

const PRESCRIBING_REQUEST_PATTERNS = [
  /\b(?:prescribe|prescription)\s+(?:me|for)\b/i,
  /\bwhat\s+(?:dose|dosage|mg|milligrams?)\s+(?:of|should)\b/i,
  /\bhow\s+many\s+(?:mg|tablets?|capsules?|pills?)\s+(?:of|should\s+i\s+take)\b/i,
  /\bwhich\s+antibiotic\s+should\s+i\s+(?:take|buy)\b/i,
]

const URGENT_SYMPTOM_PATTERNS = [
  /\b(?:can'?t|cannot|difficulty|trouble)\s+breath(?:e|ing)\b/i,
  /\b(?:chest\s+pain|seizure|unconscious|coughing\s+(?:up\s+)?blood|severe\s+bleeding)\b/i,
]

const UNSAFE_OUTPUT_PATTERNS = [
  /\b(?:take|use|start)\s+\d+\s*(?:mg|mcg|g|ml|tablets?|capsules?)\b/i,
  /\b\d+\s*(?:mg|mcg)\b.{0,30}\b(?:twice|three\s+times|once|every\s+\d+\s+hours?|daily|for\s+\d+\s+days?)\b/i,
  /\bi\s+(?:prescribe|recommend\s+taking)\s+(?:amoxicillin|ciprofloxacin|azithromycin|metronidazole|flagyl|ampliclox|augmentin|ceftriaxone|doxycycline)\b/i,
]

function detectInputGuardrail(text) {
  if (URGENT_SYMPTOM_PATTERNS.some((re) => re.test(text))) {
    return {
      triggered: true,
      reply: '⚠️ If you or someone else is experiencing severe or urgent symptoms (such as trouble breathing, chest pain, seizures, or coughing up blood), please seek **immediate emergency medical care** at the nearest clinic or hospital.\n\nXEITH is an educational platform and cannot assess symptoms or provide medical treatment.'
    }
  }
  if (INJECTION_PATTERNS.some((re) => re.test(text))) {
    return {
      triggered: true,
      reply: 'I can only help with **antimicrobial resistance (AMR) education** and responsible medicine stewardship. I cannot change my safety rules, diagnose conditions, or prescribe treatments.\n\nExplore our verified modules in the [Classroom](/learn)!'
    }
  }
  if (PRESCRIBING_REQUEST_PATTERNS.some((re) => re.test(text))) {
    return {
      triggered: true,
      reply: 'I cannot recommend a specific antibiotic, diagnose an illness, or give medication dosages. Only a qualified doctor, pharmacist, or laboratory test (like a culture or malaria RDT) can determine the right treatment.\n\nLearn how **WHO AWaRe** antibiotic categories and diagnostic testing work in the [Classroom](/learn?module=stewardship).'
    }
  }
  return { triggered: false }
}

function sanitizeOutput(reply) {
  if (typeof reply !== 'string' || !reply.trim()) return ''
  if (UNSAFE_OUTPUT_PATTERNS.some((re) => re.test(reply))) {
    return 'For your safety, I cannot suggest specific antibiotics or medication dosages. Please consult a licensed doctor or pharmacist and ask for an appropriate test before taking any antimicrobial.\n\nYou can learn more about safe antibiotic stewardship in the [Classroom](/learn?module=stewardship).'
  }
  return reply
}

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

    const latestUserMsg = [...clean].reverse().find((m) => m.role === 'user')?.content || ''
    const inputCheck = detectInputGuardrail(latestUserMsg)
    if (inputCheck.triggered) {
      return json({ reply: inputCheck.reply, guarded: true, groundedSources: [] })
    }

    if (!env.LLM_API_KEY || !env.LLM_MODEL) return json({ error: 'AI not configured' }, 503)

    // Server-side RAG: retrieve top-3 curated AMR knowledge entries
    const retrieved = retrieveKnowledge(latestUserMsg, 3)
    const ragBlock = retrieved.length > 0
      ? '\n\nVERIFIED KNOWLEDGE CONTEXT (use these facts and cite their Classroom link when relevant):\n' +
        retrieved.map((e, idx) => `${idx + 1}. [${e.topic}] ${e.summary} (Link: [Classroom](${e.lessonUrl}), Source: ${e.source})`).join('\n')
      : ''

    const r = await fetch((env.LLM_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.LLM_API_KEY },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          { role: 'system', content: `${SYSTEM} Reply in the language with code: ${cleanLang}.${ragBlock}` },
          ...clean
        ]
      }),
    })
    if (!r.ok) return json({ error: 'upstream error' }, 502)
    const d = await r.json()
    const rawReply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || ''
    const safeReply = sanitizeOutput(rawReply)

    return json({
      reply: safeReply,
      groundedSources: retrieved.map((e) => ({ id: e.id, topic: e.topic, source: e.source, lessonUrl: e.lessonUrl }))
    })
  } catch {
    return json({ error: 'bad request' }, 400)
  }
}
