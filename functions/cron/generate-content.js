// Cloudflare Worker Cron: Scheduled AI content generation
// Runs daily to generate challenges, facts, and map data for human review
// Creates GitHub PRs with generated content for review before publishing

// This is a conceptual implementation - in production, you'd use:
// - Cloudflare Workers with GitHub API integration
// - Or a separate CI/CD pipeline that calls these endpoints
// - Or Cloudflare Pages Functions with scheduled triggers

/*
ENVIRONMENT VARIABLES (set in Cloudflare dashboard):
- LLM_API_KEY: OpenAI-compatible API key
- LLM_MODEL: Model name (e.g., gpt-4o-mini)
- LLM_BASE_URL: Optional custom endpoint
- GITHUB_TOKEN: GitHub PAT for creating PRs
- GITHUB_REPO: owner/repo (e.g., username/xeith-amr)
- GITHUB_BRANCH: base branch (e.g., main)
*/

const TOPICS = ['bacteria', 'virus', 'fungus', 'parasite']
const CHALLENGE_TYPES = ['QUIZ', 'WORD_LADDER', 'PHOTO_CHALLENGE', 'FACT_MATCH']
const REGIONS = ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Abeokuta', 'Jos']

async function callAI(env, system, userPrompt, maxTokens = 1000) {
  const r = await fetch((env.LLM_BASE_URL || 'https://api.openai.com/v1') + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.LLM_API_KEY },
    body: JSON.stringify({
      model: env.LLM_MODEL,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    }),
  })
  if (!r.ok) throw new Error('AI request failed: ' + await r.text())
  const d = await r.json()
  return JSON.parse(d.choices[0].message.content)
}

async function generateDailyChallenges(env, date, lang = 'en') {
  const dayOfYear = Math.floor((new Date(date) - new Date(new Date(date).getFullYear(), 0, 0)) / 864e5)
  const topic = TOPICS[dayOfYear % TOPICS.length]
  const type = CHALLENGE_TYPES[dayOfYear % CHALLENGE_TYPES.length]

  // Use the same prompts as the API endpoint
  const challenge = await callAI(env, `Generate a ${type} challenge about ${topic} and AMR. Output JSON only.`, `Topic: ${topic}, Type: ${type}, Language: ${lang}, Date: ${date}`)
  return { date, lang, topic, type, challenge }
}

async function generateFacts(env, topic, lang = 'en', count = 5) {
  return callAI(env, `Generate ${count} facts about ${topic} and AMR with sources. Output JSON array.`, `Topic: ${topic}, Language: ${lang}, Count: ${count}`)
}

async function generateMapPins(env, region, lang = 'en', count = 3) {
  return callAI(env, `Generate ${count} map pins for ${region}, Nigeria with AMR info. Output JSON array.`, `Region: ${region}, Language: ${lang}, Count: ${count}`)
}

async function createGitHubPR(env, title, body, files) {
  // This would use the GitHub API to create a PR
  // For now, this is a placeholder showing the structure
  console.log('Would create PR:', title)
  console.log('Files:', files.map(f => f.path))
  return { success: true, prUrl: 'https://github.com/example/pr' }
}

// Main cron handler
export default {
  async scheduled(event, env, ctx) {
    console.log('Cron triggered at:', new Date().toISOString())

    if (!env.LLM_API_KEY || !env.LLM_MODEL) {
      console.error('AI not configured')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const langs = ['en', 'pid', 'ha', 'yo', 'ig', 'fr']
    const prFiles = []

    try {
      // Generate daily challenges for each language
      for (const lang of langs) {
        const challenge = await generateDailyChallenges(env, today, lang)
        prFiles.push({
          path: `src/data/challenges/ai-generated/${today}-${lang}.json`,
          content: JSON.stringify(challenge, null, 2)
        })
      }

      // Generate facts for each topic (rotate daily)
      const topic = TOPICS[Math.floor((new Date(today) - new Date(new Date(today).getFullYear(), 0, 0)) / 864e5) % TOPICS.length]
      for (const lang of langs) {
        const facts = await generateFacts(env, topic, lang, 3)
        prFiles.push({
          path: `src/data/facts/ai-generated/${today}-${topic}-${lang}.json`,
          content: JSON.stringify({ topic, lang, date: today, facts }, null, 2)
        })
      }

      // Generate map pins for one region (rotate daily)
      const region = REGIONS[Math.floor((new Date(today) - new Date(new Date(today).getFullYear(), 0, 0)) / 864e5) % REGIONS.length]
      for (const lang of langs) {
        const pins = await generateMapPins(env, region, lang, 2)
        prFiles.push({
          path: `src/data/map/ai-generated/${today}-${region}-${lang}.json`,
          content: JSON.stringify({ region, lang, date: today, pins }, null, 2)
        })
      }

      // Create PR for human review
      if (prFiles.length > 0) {
        await createGitHubPR(env,
          `AI Content for Review: ${today}`,
          `Automated AI-generated content for ${today}. Please review all files before merging.

Files generated:
${prFiles.map(f => `- ${f.path}`).join('\n')}

**Review checklist:**
- [ ] Medical accuracy verified by clinician/pharmacist
- [ ] No diagnosis, prescription, or specific drug recommendations
- [ ] Educational content only
- [ ] Sources are credible (WHO, CDC, peer-reviewed)
- [ ] Translations are accurate
- [ ] No sensitive data included`,
          prFiles
        )
      }

      console.log('Content generation complete. PR created for review.')
    } catch (e) {
      console.error('Cron job failed:', e)
    }
  }
}