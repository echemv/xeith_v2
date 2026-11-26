# XEITH: project brief (read first)

**What it is:** a PWA that teaches antimicrobial resistance (AMR) stewardship in six languages (English, Nigerian Pidgin, Hausa, Yorùbá, Igbo, French), enabled by AI. Built for the Code Against Resistance pitch (Babcock University AMR Club): application deadline 25 Nov 2026, **pitch Fri 27 Nov 2026, 8:00 AM WAT**. Scope is learning only: no medicine records, symptom checker or care finder. Integrative loop, not six separate tabs: **Discover & Ask -> Test & Play -> Track & Connect.**

## Flow
Intro animation (once per session; `INTRO_VIDEO` in `src/config.js`) -> first-visit language screen with the headline cycling through languages and tappable language bubbles (once ever) -> app. Language selector stays top right.

## Sections (current names)
- Home: banner, section tiles, fact of the day, yellow warning, floating chatbot avatar that roams then settles bottom right with a random greeting.
- **The AMR Classroom** (was Learn): six categories: Understanding AMR · Bacteria · Viruses · Fungi · Parasites · One Health & Stewardship. Lesson format: Intro -> Learn -> Visualise -> Apply -> Test (3-5 flashcards) -> Remember -> Reward. Lessons rotate weekly from a content file.
- **The AMR Lab** (was Play): flagship "Resistance Quest", a 2D simulation covering all four pathogens (bacteria, viruses, fungi, parasites), 3 difficulty modes (Beginner/Intermediate/Expert), points, high scores, local leaderboard. Existing concept: be the antibiotic fighting Big B (bacteria world). STUB.
- **Challenges:** daily 1-3 minute activities (MCQ, Spot the Myth, Match the Pairs, picture ID, case scenario, word puzzle) rotating by weekday, plus a **7-rung Weekly AMR Ladder** (one rung unlocks per day, answers saved and visible, weekly reward).
- **Map:** Nigeria, zoomable, pins with hover tag and click bubble with sources; links to amris.online.
- **Ask XEITH:** AI chat; rotating bacterium while thinking.
- **My XEITH** (was Account): display name, masked email, streak and longest streak, points, badges, challenge and game history, local leaderboard, download and delete data.

## Global rules
1. **One language state.** The selected language drives navigation, buttons, lessons, challenges, games, notifications and AI replies. It persists (`src/store.js`), never resets progress, and never silently reverts to English mid-flow. No hardcoded user-facing strings; all text goes through `src/translations.js`.
2. **Mobile-first.** Nothing overlaps or clips at 360px (floating avatar, banners, tickers, language selector). Touch targets at least 44px, WCAG AA contrast, respect `prefers-reduced-motion`.
3. **Interactive by default.** Every card/button gives press and hover feedback, every activity gives immediate feedback, and every async feature has loading, success, error and empty states. No static-page feel.
4. **Scientific accuracy.** Never say microbes "choose", "learn" or "decide" to resist. Resistance arises through selection pressure, mutation and gene transfer. Cover all four pathogen groups, not just bacteria.
5. **Grounded content.** Lessons, AI answers and generated puzzles draw only from the curated knowledge base (`src/data/`), each entry carrying source, date and review status. No invented clinical facts or statistics. No live scraping of external health databases.

## Safety and data rules
- **Offline first.** Everything works offline except live AI answers and map tiles. Daily facts and challenges come from local pools chosen by date. Chat falls back to `src/data/faq.js`. The map shows a text list under it.
- **Secrets never in the repo or browser.** The AI key lives only in the Pages function (`functions/api/chat.js`) environment.
- **Education only.** The AI must not diagnose, prescribe, recommend a specific antibiotic or give doses. It states uncertainty and points to a qualified health professional when appropriate.
- **AI content is drafted, then reviewed.** Facts, challenges and map entries refreshed by AI go through human review and carry source links before publishing. Never present unreviewed AI output as fact.
- **Map integrity.** Show only sourced, dated data. Label verified surveillance data vs community-reported. Never invent statistics.
- **Privacy.** Profile and progress are local to the device for now. Provide download and delete of all data. Check Nigeria's Data Protection Act 2023 before storing anything server-side. Profiles are private by default; collect minimal personal data.
- **Translations are drafts.** Label them as unreviewed; scientific terms need human review before being called final. Missing rows show English visibly.
- Type text with the typographic apostrophe (’). Cite any statistic with a source.

## Other feature ( build before the pitch)
Photo challenges and public image feeds, friends/followers/follow requests, public profiles, real accounts and server-side leaderboards. These need moderation, storage and privacy work. Leaderboards stay local to the device for now. Mention them as roadmap only.

## Build order: everything, in waves
Build the whole brief, in this order. After each wave: build passes, phone-test on a real device, commit, and tag it (`wave-1`, `wave-2`...). If time runs out, deploy the latest passing tag. Never leave main broken.

- **Wave 1, foundation (fix the push first):** the app builds cleanly, the logo is fixed, one global language state, renames (Classroom/Lab/My XEITH), mobile layout fixes.
- **Wave 2, interactive UI + Classroom:** design pass across all sections, 6 category pages, one complete sample lesson with the 7-step format, weekly lesson rotation from a content file.
- **Wave 3, engagement:** Resistance Quest (4 pathogen worlds, 3 difficulties, 1 fully playable level first), daily activities (7 types), 7-rung Weekly Ladder, streaks, points, badges, local leaderboard, My XEITH progress.
- **Wave 4, AI and map:** Ask XEITH grounded in the knowledge base with refusals and sources, map with sourced/dated data and a verified vs community-reported legend, translations of remaining strings (labelled unreviewed).
- **Wave 5, community (local-first prototype):** follow/friend graph, public/private profile toggle, photo challenges with a moderation queue (nothing public until approved), report button, visibility controls (everyone vs approved connections), EXIF stripping. Without a backend this runs on-device or against mock data, and the UI labels it "prototype". Real multi-user needs a backend, consent and a Nigeria DPA 2023 check. Do not collect real users' photos until that exists.
- **Later:** Outbreak Alert game, AMR Arcade, extra Quest levels, approved external data integrations.

## Design tokens (gradient scheme)
Navy #102D3A, deep #0B2230, teal #176B65, teal-light #2A8F86, gold #D6A84B, amber #F4B942, ivory #F5F3EC; accents sky #4FB3D9, mint #7FD1B9, coral #F2786B, violet #7A5CC7 (Big B). Gradients are CSS variables in `src/styles.css`. Fonts: Fraunces (headings), Inter (body), bundled for offline.

## UI direction: friendly game-like learning (Duolingo-style vibe, XEITH identity)
- Keep the brand palette (navy/teal/gold/ivory + accents) but use bright, flat, saturated surfaces; ivory backgrounds, not dark gradients everywhere.
- Rounded corners (16-24px), chunky buttons with a solid bottom edge that "presses down" on tap, big touch targets, friendly type (Fraunces headings, Inter body, bold weights).
- Mobile: bottom tab bar (Home, Classroom, Lab, Challenges, My XEITH), Ask XEITH as a floating button that never covers content.
- Classroom as a winding lesson path of numbered nodes (locked/active/done), not a list.
- Gamified feedback everywhere: XP bar, streak flame, hearts/progress rings, badge unlock modals, confetti/shake on correct/wrong answers, short encouraging copy. Keep every animation under 600ms and respect prefers-reduced-motion.
- A mascot (Big B and a friendly antibiotic hero) in empty states, loading and celebrations.
- Every screen: one obvious primary action. No walls of text. Cards over paragraphs.
- All new text goes through translations. Test layouts with long Hausa/Yorùbá/Pidgin strings.

## Working rules
- Small commits per task. Run build and lint before saying "done". Prefer editing over rewriting. Ask before adding dependencies.
- Use plan mode and `superpowers` for multi-step work; run `code-simplifier` and `security-guidance` before deploy.