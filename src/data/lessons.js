import { tx } from '../i18n'
// Starter lessons. All text needs a pharmacist or clinician to review before public release.
export const LESSONS = [
  { id: 'what', title: tx('What is AMR?'),
    steps: [tx('Microbes such as bacteria can change over time so that medicines no longer work on them. This is antimicrobial resistance (AMR).'), tx('It is the microbes that become resistant, not people or animals. Resistant germs can spread between people, animals and the environment.'), tx('When medicines stop working, infections last longer, are harder to treat and can be more dangerous.')],
    check: { q: tx('What becomes resistant in AMR?'), options: [tx('Microbes such as bacteria'), tx('The person taking the medicine'), tx('The medicine itself')], answer: 0, why: tx('Microbes change so that medicines no longer work on them.') } },
  { id: 'virus', title: tx('Antibiotics and viruses'),
    steps: [tx('Antibiotics treat infections caused by bacteria.'), tx('Most colds, flu and coughs are caused by viruses, so antibiotics won’t help.'), tx('Taking an antibiotic when it isn’t needed does not help you recover and can add to resistance.')],
    check: { q: tx('Can antibiotics treat a cold caused by a virus?'), options: [tx('Yes, always'), tx('No, they work on bacteria, not viruses'), tx('Only if you take a double dose')], answer: 1, why: tx('Antibiotics work on bacteria, not viruses.') } },
  { id: 'use', title: tx('Using antibiotics responsibly'),
    steps: [tx('Use antibiotics only when a clinician has assessed you and prescribed them.'), tx('Don’t share antibiotics or keep leftovers for later.'), tx('Ask your prescriber or pharmacist before you stop or change a course, or if you miss a dose.'), tx('Clean water, handwashing and vaccines prevent infections, so fewer antibiotics are needed.')],
    check: { q: tx('You have antibiotics left over from last month. What is the best step?'), options: [tx('Keep them for the next time you feel sick'), tx('Give them to a family member with the same symptoms'), tx('Ask a pharmacist how to dispose of them safely')], answer: 2, why: tx('Leftovers may be the wrong drug or dose for a new illness. Ask a pharmacist how to dispose of them.') } },
]
