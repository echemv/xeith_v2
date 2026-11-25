# XEITH: learn AMR in a language you understand

React PWA (Vite). Streamlined to AMR learning: lessons, a game (stub), daily and weekly challenges, a Nigeria map with sources, an AI chat, and a local account area. Read `CLAUDE.md` first.

## Run
```
npm install
npm run dev          # http://localhost:5173  (chat falls back to the offline FAQ)
npm run build && npm run preview   # test offline mode and the installable PWA
```

## Push to GitHub
```
git init
git add .
git commit -m "XEITH AMR learning app: first scaffold"
git branch -M main
git remote add origin https://github.com/<you>/xeith.git
git push -u origin main
```
Keep the repo private until you submit. Never commit keys (`.env`, `.dev.vars` are git-ignored).

## Deploy (free): Cloudflare Pages
Connect the repo. Build command `npm run build`, output `dist`. The `functions/` folder becomes the `/api/chat` endpoint. Set secrets in the Pages dashboard: `LLM_API_KEY`, `LLM_MODEL`, optional `LLM_BASE_URL` (any OpenAI-compatible chat API). To test the function locally: `npx wrangler pages dev dist` with a `.dev.vars` file.

## Drop-in assets (see `src/config.js`)
- XEITH intro animation: put the file in `public/`, set `INTRO_VIDEO`.
- Chatbot avatar: put the image in `public/`, set `MASCOT_SRC`.
- AMRIS: set `AMRIS_URL`. Map content lives in `src/data/regions.json` (every claim needs a source link).

## Still to build
The Play game, real accounts, AI-refreshed facts/challenges/map data (reviewed before publishing), translations beyond the shell, the full UI pass.
