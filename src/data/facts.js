import { tx } from '../i18n'
// Daily facts. Picked by date, so they work offline. Add a source for any statistic and verify it against the original.
export const FACTS = [
  { t: tx('Antibiotics treat bacterial infections. They don’t work on viruses such as colds and flu.') },
  { t: tx('AMR happens when microbes change so that medicines no longer work on them.') },
  { t: tx('Resistant germs can spread between people, animals and the environment.') },
  { t: tx('Handwashing, clean water and vaccines prevent infections, which means fewer antibiotics are needed.') },
  { t: tx('Never share antibiotics or save leftovers. The drug and dose may be wrong for another illness.') },
  { t: tx('Ask your prescriber or pharmacist before you stop or change an antibiotic.') },
  { t: tx('In 2021, an estimated 1.14 million deaths worldwide were directly attributable to bacterial AMR.'), src: { label: 'Lancet GRAM study (2024), via Wellcome', url: 'https://wellcome.org/insights/articles/new-forecasts-reveal-39-million-deaths-will-be-directly-attributable-bacterial-antimicrobial' } },
  { t: tx('A systematic review of Nigerian studies (to 2017) found a median of 46.7% of antibiotic use was without a prescription.'), src: { label: 'University of Ibadan systematic review', url: 'https://www.maratto.africa/research/a-systematic-review-of-antibiotic-use-in-humans-c9e35a34a0' } },
  { t: tx('Most coughs and colds get better on their own because viruses cause them. Antibiotics won’t speed recovery.') },
  { t: tx('Using antibiotics only when needed protects them for the people who need them most.') },
]
