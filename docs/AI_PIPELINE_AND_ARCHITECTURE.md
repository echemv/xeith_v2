# XEITH — AI Pipeline, Data Provenance & Technical Deep-Dive

This document explains how **XEITH** works end-to-end, how its AI endpoints and offline fallbacks are implemented, how the underlying data was sourced, and what technical questions an AI engineer or judge is likely to ask.

---

## 1. End-to-End Architecture

XEITH is an **offline-first Progressive Web App (PWA)** backed by a **Cloudflare Worker** and **Cloudflare D1** database:

1. **Frontend (React + Vite PWA)**
   - Built with Vite (`vite.config.js`) and `vite-plugin-pwa` (`registerType: 'autoUpdate'`).
   - Precaches the app shell, bundled fonts, and static datasets (`src/data/`) into the browser Service Worker so core learning modules, games, Nigeria map data, and offline FAQs work with zero internet connectivity.
2. **Edge Gateway (`worker.js` & `wrangler.toml`)**
   - Serves static built assets from `./dist` via `env.ASSETS` (`not_found_handling = "single-page-application"`).
   - Routes `/api/chat`, `/api/challenges`, `/api/facts`, `/api/account`, and `/api/map` to `functions/api/*.js`.
   - Attaches security headers to all responses: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and `Permissions-Policy`.
   - Binds Cloudflare D1 (`DB` → `xeith-db`) for accounts, sessions, leaderboards, and IP rate limiting.
3. **LLM Provider Configuration (`wrangler.toml`)**
   - Uses an OpenAI-compatible `/chat/completions` API:
     - `LLM_BASE_URL = "https://api.groq.com/openai/v1"`
     - `LLM_MODEL = "qwen/qwen3.8-27b"`
     - `LLM_API_KEY` (stored as a Cloudflare Worker secret, never in the repository or client bundle).

---

## 2. The Three AI Endpoints

### A. AI Chat (`POST /api/chat` in `functions/api/chat.js` + `src/pages/Chat.jsx`)
- **Rate Limiting:** 30 requests/minute per client IP (`cf-connecting-ip`) tracked in the D1 `rate_limits` table.
- **Input Sanitization:**
  - Whitelists `lang` to `['en', 'pid', 'ha', 'yo', 'ig']`.
  - Keeps only the last 10 `user` / `assistant` messages and truncates each to 1,500 characters.
- **Inference:**
  - Calls `LLM_BASE_URL + '/chat/completions'` with `model: env.LLM_MODEL`, `temperature: 0.3`, `max_tokens: 500`.
  - Injects an immutable `SYSTEM` prompt instructing the model to teach AMR stewardship concepts, **never** diagnose, prescribe, recommend specific antibiotics, or give doses, direct severe/worsening symptoms to urgent care, and invite users to `[Classroom](/learn)`.
- **Offline Fallback (`src/pages/Chat.jsx`):**
  - When `navigator.onLine` is `false` or `/api/chat` fails, the client falls back to `findFaqMatch()` and `faqAnswer()` in `src/data/faq.js` across 6 FAQ compartments.

### B. Challenge Generator & Vision Photo Checker (`POST /api/challenges` in `functions/api/challenges.js`)
- **Rate Limiting:** 20 requests/minute per client IP in D1 `rate_limits`.
- **Challenge Generation:**
  - Supports `QUIZ`, `WORD_LADDER`, `PHOTO_CHALLENGE`, and `FACT_MATCH` across `['bacteria', 'virus', 'fungus', 'parasite']` and the 5 whitelisted languages, prompting the LLM to return strict JSON.
- **Multimodal Vision Photo Verification (`action === 'VERIFY_PHOTO'`):**
  - Validates that `imageDataUrl` matches `^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$` and is at most `600000` characters.
  - Selects `env.LLM_VISION_MODEL`, defaulting on Groq to `meta-llama/llama-4-scout-17b-16e-instruct` (or `gpt-4o-mini` for non-Groq endpoints).
  - Calls `/chat/completions` with `temperature: 0.2`, `max_tokens: 300`, and `response_format: { type: 'json_object' }`.
  - Returns `{ approved, detectedItem, feedback }` (with `detectedItem` capped at 80 chars and `feedback` at 350 chars).

### C. Admin-Gated Fact Generator (`POST /api/facts` in `functions/api/facts.js`)
- **Authentication:** Requires `Authorization: Bearer <ADMIN_KEY>` checked via constant-time comparison (`timingSafeEqualStr`).
- **Inference & Validation:**
  - Generates 1–10 facts per request (`temperature: 0.3`, `max_tokens: 1500`, `response_format: { type: 'json_object' }`).
  - Validates that the parsed response is an array where every entry has `text` and `source.url`.

---

## 3. Data Provenance & "Scraping" Reality

Be explicit about what is **curated static data** versus what is a **simulated/planned pipeline**:

- **No Live Scraper or Vector DB at Runtime:** There is no Python/Node web scraper, FAISS/Chroma vector store, or live WHO/NCDC/PubMed API crawler running in this repository. As documented in `CLAUDE.md`, there is no live scraping or live external feeds at runtime.
- **How the Current Data Was Sourced:**
  - Lessons (`src/data/lessons.js`), offline FAQs (`src/data/faq.js`), clinical scenarios (`src/data/patientCases.js`), and regional map data (`src/data/regions.json`) were manually curated and structured from authoritative sources:
    - **WHO GLASS** (Global Antimicrobial Resistance and Use Surveillance System) & **WHO AWaRe** (*Access, Watch, Reserve*)
    - **NCDC** (Nigeria Centre for Disease Control) National Action Plan on AMR
    - **NAFDAC** Mobile Authentication Service (`38353`)
    - **The Lancet** Global Burden of AMR (GRAM) study
    - **2024 *JMIR Serious Games* RCT** (`e59848`, *SteWARdS Antibiotic Defence*) for game mechanics
- **What `src/components/AiUpdateFramework.jsx` Is:**
  - An **architectural blueprint and interactive UI simulation** showing how a production surveillance pipeline would ingest WHO GLASS, NCDC, PubMed, NAFDAC, and HL7/FHIR lab feeds, run verification/RAG gates with human clinical sign-off, and distribute lightweight JSON delta patches to the PWA.

---

## 4. Questions a Strong AI Engineer Will Ask (and Honest Answers)

### 1. "Is `/api/chat` using RAG, or is it just zero-shot prompting?"
- **Current state:** Live `/api/chat` uses **system-prompt-constrained inference** (`temperature: 0.3` + last 10 conversation turns). It does **not** retrieve chunks from `src/data/` or a vector database at query time; `findFaqMatch()` only runs in the client-side offline fallback.
- **Next step:** Inject top-$k$ matching entries from `src/data/faq.js` / `src/data/lessons.js` into the `/api/chat` context window so live answers are grounded in and cite verified local records.

### 2. "How do you prevent prompt injection or jailbreaking the medical guardrails?"
- **Current state:** Relies on the immutable `SYSTEM` prompt, `temperature: 0.3`, a 10-message history window, and a 1,500-character input cap. There is no separate input/output guardrail classifier.
- **Defensible framing:** XEITH has zero prescribing/EHR integration, and its system prompt enforces refusal + urgent-care redirection. Adding a lightweight pre/post-filter (or structured refusal check) is the natural production hardening step.

### 3. "How well does `qwen/qwen3.8-27b` handle Hausa, Yorùbá, Igbo, and Nigerian Pidgin?"
- **Current state:** General-purpose LLMs can drop diacritics (`ẹ ọ ṣ ị ụ ɓ ɗ ƙ`) or lose precision on medical terms in low-resource languages.
- **Defensible framing:** All static curriculum and UI strings (`src/translations/`, `docs/translation-sheet.csv`) are pre-bundled and human-reviewable, while live chat passes the whitelisted language code and falls back to pre-translated offline FAQs when offline.

### 4. "Can users spoof or game `VERIFY_PHOTO`?"
- **Current state:** `VERIFY_PHOTO` enforces MIME-type whitelisting (`jpeg`/`png`/`webp`), a 600 KB base64 size cap, and `temperature: 0.2` JSON-mode vision checks (`meta-llama/llama-4-scout-17b-16e-instruct`). It does not yet perform perceptual hashing (replay/duplicate detection) or camera-vs-gallery verification.
- **Defensible framing:** Built for low-friction educational feedback; `CLAUDE.md` already specifies client-side EXIF stripping, object storage, and human moderation queues before any community photo sharing is enabled.

### 5. "Why would `/api/challenges` return `502` on Cloudflare?"
- A `502` (`upstream error`) from `functions/api/challenges.js` means the upstream `LLM_BASE_URL` call returned a non-2xx status (for example, a missing/expired `LLM_API_KEY` secret in Cloudflare, or `LLM_MODEL` availability/rate-limit issues on Groq). Checking Cloudflare Worker **Settings → Variables and Secrets** and `wrangler tail` logs will pinpoint the upstream response.
