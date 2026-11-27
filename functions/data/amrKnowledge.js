/**
 * Pure-JS curated AMR knowledge base for server-side RAG grounding in /api/chat.
 * Zero browser or React dependencies so it runs cleanly in Cloudflare Workers.
 */
export const AMR_KNOWLEDGE = [
  {
    id: 'what-is-amr',
    topic: 'AMR Basics',
    keys: ['amr', 'antimicrobial resistance', 'superbug', 'resistant', 'bacteria', 'germs', 'what is amr'],
    summary: 'Antimicrobial Resistance (AMR) occurs when microbes (bacteria, viruses, fungi, parasites) evolve via mutation, gene transfer, and selection pressure so medicines no longer kill them. Your body does NOT become resistant—the germ does.',
    lessonUrl: '/learn?module=what-is-amr',
    source: 'WHO GLASS / The Lancet GRAM Study'
  },
  {
    id: 'virus-vs-bacteria',
    topic: 'Viruses vs Bacteria',
    keys: ['virus', 'cold', 'flu', 'cough', 'sore throat', 'antibiotic', 'viral', 'covid'],
    summary: 'Antibiotics only kill bacteria—they do NOT work against viruses like the common cold, flu, or most sore throats. Taking antibiotics for viral infections causes unnecessary side effects and drives resistance.',
    lessonUrl: '/learn?module=virus',
    source: 'WHO AWaRe & NCDC Guidelines'
  },
  {
    id: 'finish-course',
    topic: 'Treatment Compliance',
    keys: ['finish', 'stop early', 'feel better', 'halfway', 'incomplete', 'leftover', 'share', 'dosage', 'course'],
    summary: 'Stopping prescribed antimicrobials early when symptoms improve leaves the tougher, partially resistant microbes alive to multiply and spread. Never share or save leftover antibiotics.',
    lessonUrl: '/learn?module=bacteria',
    source: 'WHO Antimicrobial Stewardship Guidelines'
  },
  {
    id: 'malaria-rdt-act',
    topic: 'Malaria & Parasites',
    keys: ['malaria', 'parasite', 'rdt', 'test', 'act', 'artemisinin', 'chloroquine', 'fever', 'blister'],
    summary: 'Always confirm malaria with a Rapid Diagnostic Test (RDT) or microscopy before taking Artemisinin-based Combination Therapy (ACT). Complete all 6 doses over 3 days; chloroquine is no longer effective against P. falciparum in Nigeria.',
    lessonUrl: '/learn?module=parasites',
    source: 'NCDC & WHO Malaria Treatment Guidelines'
  },
  {
    id: 'fungi-steroid-creams',
    topic: 'Fungal Infections',
    keys: ['fungus', 'fungal', 'ringworm', 'yeast', 'skin', 'rash', 'cream', 'steroid', 'triple action', 'antifungal'],
    summary: 'Fungal infections (like ringworm or candidiasis) require targeted antifungals—not antibiotics or triple-action steroid creams, which suppress local immunity and worsen fungal spread.',
    lessonUrl: '/learn?module=fungi',
    source: 'WHO & Clinical Mycology Stewardship'
  },
  {
    id: 'nafdac-drug-quality',
    topic: 'Drug Quality & NAFDAC',
    keys: ['nafdac', 'fake', 'counterfeit', 'substandard', '38353', 'mas', 'loose', 'chemist', 'pharmacy', 'expired'],
    summary: 'Substandard or under-dosed antimicrobials expose germs to sub-lethal drug levels, accelerating resistance. Check the NAFDAC registration number, avoid loose unlabelled capsules, and verify packs via NAFDAC Mobile Authentication Service (SMS to 38353).',
    lessonUrl: '/learn?module=drug-quality',
    source: 'NAFDAC Nigeria'
  },
  {
    id: 'one-health-colistin',
    topic: 'One Health & Agriculture',
    keys: ['one health', 'farm', 'poultry', 'chicken', 'fish', 'colistin', 'animal', 'livestock', 'manure', 'water'],
    summary: 'Using human antibiotics (especially WHO Reserve drugs like Colistin) for routine animal growth promotion breeds resistant bacteria in livestock that spread to humans through food, water runoff, and the environment.',
    lessonUrl: '/learn?module=one-health',
    source: 'NCDC National Action Plan on AMR (NAP 2.0)'
  },
  {
    id: 'who-aware',
    topic: 'WHO AWaRe Classification',
    keys: ['aware', 'access', 'watch', 'reserve', 'first line', 'last resort', 'stewardship'],
    summary: 'The WHO AWaRe framework groups antibiotics into Access (first-choice, lower resistance risk), Watch (higher resistance potential, restricted), and Reserve (last-resort drugs for multidrug-resistant infections).',
    lessonUrl: '/learn?module=stewardship',
    source: 'WHO AWaRe Antibiotic Book'
  },
  {
    id: 'infection-prevention',
    topic: 'Infection Prevention',
    keys: ['prevent', 'handwash', 'wash hands', 'hygiene', 'vaccine', 'clean water', 'sanitation', 'soap'],
    summary: 'Preventing infections in the first place—through handwashing with soap, clean water, sanitation, and routine vaccination—reduces the need for antibiotics and slows resistance.',
    lessonUrl: '/learn?module=prevention',
    source: 'WHO & NCDC IPC Guidelines'
  }
]

/**
 * Retrieves the top-k most relevant knowledge entries for a user query.
 */
export function retrieveKnowledge(query, topK = 3) {
  const q = String(query || '').toLowerCase()
  const tokens = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2)
  if (!tokens.length) return []

  const scored = AMR_KNOWLEDGE.map((entry) => {
    let score = 0
    for (const kw of entry.keys) {
      if (q.includes(kw)) score += kw.includes(' ') ? 4 : 2
    }
    const hay = `${entry.topic} ${entry.summary}`.toLowerCase()
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 1
    }
    return { entry, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.entry)
}
