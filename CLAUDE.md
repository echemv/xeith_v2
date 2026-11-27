# XEITH: project brief (read first)

**What it is:** a PWA that teaches antimicrobial resistance (AMR) stewardship in five languages (English, Nigerian Pidgin, Hausa, Yorùbá, Igbo), enabled by AI. Built for the Code Against Resistance pitch (Babcock University AMR Club): **pitch Fri 27 Nov 2026, 8:00 AM WAT**. Scope is learning only: no medicine records, symptom checker or care finder. Loop: **Discover & Ask -> Test & Play -> Track & Connect.**

**Source of truth for progress:** `docs/CHECKLIST.md` (status per item with file evidence). Update it whenever a task is finished.

## Flow
Intro animation (once per session; `INTRO_VIDEO` in `src/config.js`) -> first-visit language screen (once ever) -> app. Language selector stays top right.

## Sections
- **Home:** hero with one primary action, progress strip (streak, points, ladder day), Today card (daily challenge + fact), Continue Learning card, 4 explore tiles, compact safety banner, floating chatbot that never covers content.
- **The AMR Classroom:** six categories (Understanding AMR, Bacteria, Viruses, Fungi, Parasites, One Health & Stewardship). Lesson format: Intro, Learn, Visualise, Apply, Test (3-5 flashcards), Remember, Reward. Weekly rotation from a content file.
- **The AMR Lab:** Resistance Quest (4 pathogen worlds, 3 difficulties, points, high scores), plus the Stewardship Command game. Later: Outbreak Alert.
- **Challenges hub:** tabs Daily · Weekly Ladder · Case Files (branching scenarios) · Games · League. All activities have Beginner/Intermediate/Expert levels (1x/1.5x/2x points; 3 completions unlock the next level).
  - Daily: rotating types (MCQ, Spot the Myth, Match the Pairs, picture ID, short case, word puzzle).
  - Weekly Ladder: 7 rungs, one unlocks per day. The target word is hidden until completion. Hints: clue (free) -> position hint (free) -> letter reveal (first of each day free, then 2 pts off that rung's reward, floor 4, never negative).
  - Games (original names, no NYT branding): Four Worlds (sort 16 tiles into 4 groups), Order It, Resistance Word (English only). Letter games are labelled English-only; sorting/ordering games must be translatable.
  - Case Files: Nigerian settings (pharmacy, poultry farm, school, clinic, market); correct choices are stewardship actions, never diagnosis or drug choice.
  - League: Bronze/Silver/Gold/Platinum by weekly points; display name + score only.
- **Map:** Nigeria, pins on the correct states, sourced and dated data, verified vs community-reported labels.
- **Ask XEITH:** AI chat grounded in the knowledge base, cites entries, refuses diagnosis/doses, offline FAQ fallback.
- **My XEITH:** display name, masked email, streak and longest streak, points, badges, history, league tier, download and delete data, share card.

## Global rules
1. **One language state.** The selected language drives navigation, buttons, lessons, challenges, games, notifications and AI replies. Persists (`src/store.js`), never resets progress, never silently reverts to English. No hardcoded user-facing strings; all text via `src/translations.js`. Check diacritics (ẹ ọ ṣ ị ụ ɓ ɗ ƙ and tone marks) render in every font.
2. **Mobile-first.** Nothing overlaps or clips at 360px. Touch targets at least 44px, WCAG AA contrast, respect `prefers-reduced-motion`. Mobile uses a bottom tab bar, not the top pills.
3. **Interactive by default.** Press and hover feedback, immediate activity feedback, loading/success/error/empty states.
4. **Scientific accuracy.** Never say microbes "choose", "learn", "decide" or "develop" resistance. Resistance arises through selection pressure, mutation and gene transfer. Cover all four pathogen groups.
5. **Grounded content.** Lessons, AI answers and generated puzzles use only the curated knowledge base (`src/data/knowledge/`): each entry has source name, URL, retrieved date, licence, level and review status. No invented clinical facts or statistics. No live scraping or live external feeds at runtime; building the knowledge base from official sources at build time is fine if reviewed. Never claim feeds the app doesn't use.
6. **Honest copy.** No claims like "synthesized from WHO/NCDC feeds". Map entries marked "pending review" until a person verifies them.

## Safety, security and data
- **Offline first.** Everything works offline except live AI answers and map tiles. Daily content comes from local pools chosen by date. Chat falls back to `src/data/faq.js`. The map has a text list under it.
- **Secrets** (AI keys, LLM vars, tokens) only in server-side environment variables. Never in the repo, client bundle or logs.
- **Challenge answers are not exposed.** Never ship plaintext answers or targets for future days (ladder uses salted hashes + a server check when online; the AI challenge API never returns an answer before submission). Verify by grepping the built output. Locally scored points are unverified; don't use them for rankings without a server check.
- **Accounts (current state).** Cloud accounts exist (D1, email/password, OTP, recovery code). Keep stored data minimal; never log passwords or OTPs; PBKDF2/OTP/rate-limit parameters reviewed with security-guidance; SQL always parameterised; every account endpoint authorised. Check Nigeria's Data Protection Act 2023 (consent, minimisation, delete/export) before real users.
- **Education only.** The AI must not diagnose, prescribe, recommend a specific antibiotic or give doses. It states uncertainty and points to qualified health professionals.
- **AI content is drafted, then reviewed.** Draft status and source links are required before publishing. Never present unreviewed AI output as fact.
- **Translations are drafts.** Label as unreviewed; scientific terms need human review.
- **Map integrity.** Sourced, dated data only; never invent statistics. Data date shown must be the real source date.
- Type text with the typographic apostrophe (’). Cite any statistic with a source. Avoid em dashes and filler marketing phrases in copy.

## Community (build before the pitch, behind feature flags)
- Build: share cards, follow/friend graph (follow requests, approve/reject, mutual = friends), public/private profile toggle (private by default), photo challenges, reactions, report button, league.
- Everything user-generated ships behind flags (`COMMUNITY_SOCIAL`, `COMMUNITY_PHOTOS`), off in production until the moderation path is tested end to end.
- Photos: nothing public until a moderator approves; client-side re-encode to strip EXIF/location; size/type limits; stored in object storage, not the database; visibility = everyone / approved connections / only me; a user can delete their own uploads; report button on every item.
- Public profile shows only display name, avatar, badges and approved posts. No email, no location, nothing from OTP/account tables.
- Terms/community guidelines screen shown before first upload. Check Nigeria DPA 2023 before real users (consent, minimisation, delete/export).


## Theming (light + dark)
- Semantic tokens only (--bg, --surface, --surface-2, --text, --text-muted, --border, --accent, --success, --warning, --danger) for [data-theme="light"] and [data-theme="dark"]. No hardcoded colours or pure-white cards in dark mode.
- Every text/background pair passes WCAG AA in BOTH themes (4.5:1; 3:1 for large text and UI borders).
- Follows prefers-color-scheme, user choice persists, applied before first paint, updates <meta name="theme-color">.
- Check every new component in both themes at 360px and 1280px.

## Design
- Palette: navy #102D3A, deep #0B2230, teal #176B65, teal-light #2A8F86, gold #D6A84B, amber #F4B942, ivory #F5F3EC; accents sky #4FB3D9, mint #7FD1B9, coral #F2786B, violet #7A5CC7 (Big B).
- Fonts: Fraunces (headings), Inter (body), bundled for offline. A switch to rounded fonts (Nunito/Fredoka) is allowed only if the diacritics test passes.
- Vibe: friendly game-like learning, Duolingo-style energy with XEITH identity. Rounded corners (16-24px), chunky press-down buttons, XP bar, streak flame, progress rings, badge modals, mascot (Big B + antibiotic hero) in empty states and celebrations. Animations under 600ms.
- Icons: line icons (lucide) for navigation, buttons, links, headings. Emoji/illustration only on feature tiles, achievements and celebrations, one consistent style. No emoji inside buttons or headings.
- One obvious primary action per screen. Cards over paragraphs. Chatbot bubble never overlaps content or the footer; the footer draft-translation label must be readable.
- Logo wordmark "XEITH" fully readable at 360px.

## Team and git
- Baseline branch: `feat/pending-tasks` (contains the other dev's latest main). Work on feature branches off it (worktrees), merge with `--no-ff` back into it, then PR `feat/pending-tasks` -> `main` once the build passes and a phone test is done. Never commit straight to main.
- Dev A: UI/styles/theme/Home/Map/copy/community UI. Dev B: `src/store.js`, `functions/`, auth, database, leaderboard. Ask for new store fields or endpoints instead of editing them.
- Rebase onto `feat/pending-tasks` before merging, small commits, never force-push, never commit straight to main, no new repos. New translation keys and styles go in new files to avoid conflicts. Tag stable versions whenever the site works. Feature freeze 6 PM 26 Nov; after that, bug fixes only. Deploy from the latest passing tag.

## Skills and checks
- `frontend-design` for UI work; `webapp-testing` for screenshots at 360px/1280px in light and dark; `superpowers` for planning and TDD; `security-guidance`, `code-review` and `pr-review-toolkit` before merges; `code-simplifier` after each wave.
- Run build and lint before saying "done". Prefer editing to rewriting. Ask before adding dependencies. Keep prompts scoped to specific files to save tokens.