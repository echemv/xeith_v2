// Offline fallback answers for the chat when the AI cannot be reached. Reviewed text only.
const FAQ = [
  { keys: ['what is amr', 'resistance', 'resistant', 'amr'], a: 'AMR (antimicrobial resistance) is when microbes such as bacteria change so that medicines no longer work on them. It makes infections harder to treat. The Learn section explains it step by step.' },
  { keys: ['virus', 'cold', 'flu', 'cough'], a: 'Most colds, flu and coughs are caused by viruses. Antibiotics only work on bacteria, so they won’t help with those and can add to resistance.' },
  { keys: ['leftover', 'share', 'sharing', 'friend'], a: 'Don’t share antibiotics or keep leftovers. The drug and dose may be wrong for another illness. Ask a pharmacist how to dispose of leftovers safely.' },
  { keys: ['stop', 'finish', 'feel better', 'miss'], a: 'Don’t stop or change an antibiotic on your own, and ask before doing anything if you miss a dose. Your prescriber or pharmacist can tell you what is right for your infection.' },
  { keys: ['prevent', 'hand', 'vaccine', 'clean water'], a: 'Handwashing, clean water and vaccines prevent infections, so fewer antibiotics are needed.' },
]
export const faqAnswer = (text) => {
  const q = text.toLowerCase()
  const hit = FAQ.find((f) => f.keys.some((k) => q.includes(k)))
  return (hit ? hit.a : 'I can’t reach the AI right now and I don’t have a saved answer for that. Try the Learn section, or ask again when you’re online.')
}
