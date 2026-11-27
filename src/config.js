// Drop your files into /public and set these. Leave empty to use the built-in placeholders.
export const INTRO_VIDEO = ''      // for example '/intro.mp4' (the XEITH animation). Plays once per session, with a Skip button.
export const MASCOT_SRC = '/mascot.png' // extracted green bacterium mascot (chatbot avatar)
export const WELCOME_INTERVAL_MS = 1600  // how long each language shows on the first-visit screen
export const AMRIS_URL = 'https://amris.online'

// Cloud prototypes from the meyi branch, parked and OFF. Not imported into this build; any future
// import must be gated behind this flag and reviewed first.
//  - AI Vision photo checker (origin/meyi: DailyChallenge.jsx PhotoChallenge + functions/api/challenges.js
//    action VERIFY_PHOTO): awards points straight from an AI check, with no human moderation.
//  - Live leaderboard ranking (origin/meyi: functions/api/account.js /leaderboard/* + Account.jsx):
//    responses expose user_id.
export const CLOUD_PROTOTYPE = false
