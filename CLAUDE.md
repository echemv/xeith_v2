# XEITH: project brief (read first)

**What it is:** a PWA that teaches antimicrobial resistance (AMR) stewardship in six languages (English, Nigerian Pidgin, Hausa, Yorùbá, Igbo, French), enabled by AI. Built for the Code Against Resistance pitch (Babcock University AMR Club): application deadline 25 Nov 2026, pitch Fri 27 Nov 2026, 8:00 AM WAT. Scope is learning only: no medicine records, symptom checker or care finder.

## Flow
Intro animation (once per session; `INTRO_VIDEO` in `src/config.js`) -> first-visit language screen with the headline cycling through languages and tappable language bubbles (once ever) -> app. Language selector stays top right.

## Sections
Home (banner, section tiles, fact of the day, yellow warning, floating chatbot avatar that roams then settles bottom right with a random greeting) · Learn (structured lessons with quick checks) · Play (game: be the antibiotic fighting Big B; STUB) · Challenges (daily and weekly, points and streaks) · Map (Nigeria, zoomable, pins with hover tag and click bubble with sources; links to amris.online) · Ask XEITH (AI chat; rotating bacterium while thinking) · Account (display name, masked email, streak, points, download and delete data).

## Rules
- **Offline first.** Everything works offline except live AI answers and map tiles. Daily facts and challenges come from local pools chosen by date. Chat falls back to `src/data/faq.js`. The map shows a text list under it.
- **Secrets never in the repo or browser.** The AI key lives only in the Pages function (`functions/api/chat.js`) environment.
- **Education only.** The AI must not diagnose, prescribe, recommend a specific antibiotic or give doses. Guardrails to be designed in more depth later.
- **AI content is drafted, then reviewed.** Facts, challenges and map entries refreshed by AI must go through human review and carry source links before they are published. Never present unreviewed AI output as fact.
- **Privacy.** Profile and progress are local to the device for now (`src/store.js`). Provide download and delete of all data. A real account service needs consent, minimal data, deletion and export; check Nigeria's Data Protection Act 2023 before storing anything server-side.
- Translations are drafts (`src/translations.js`, English text is the key, missing rows show English). Label them as unreviewed.
- Type text with the typographic apostrophe (’). Cite any statistic with a source.

## Design tokens (gradient scheme)
Navy #102D3A, deep #0B2230, teal #176B65, teal-light #2A8F86, gold #D6A84B, amber #F4B942, ivory #F5F3EC; accents sky #4FB3D9, mint #7FD1B9, coral #F2786B, violet #7A5CC7 (Big B). Gradients are CSS variables in `src/styles.css`. Fonts: Fraunces (headings), Inter (body), bundled for offline.

## Next tasks
1. Install, run, fix first-run errors, push, deploy. 2. Build the Play game. 3. Real accounts. 4. AI pipeline: scheduled job drafts facts, challenges and map updates into pull requests for human review. 5. Translate remaining strings. 6. UI pass.
