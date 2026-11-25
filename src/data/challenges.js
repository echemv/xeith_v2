import { tx } from '../i18n'
// Pool for the daily and weekly challenges. The day and week pick from it deterministically, so it works offline.
// To refresh content, replace this list (or load a newer JSON when online). Review any AI-drafted items before adding them.
export const CHALLENGES = [
  { q: tx('Antibiotics work against which kind of germ?'), options: [tx('Bacteria'), tx('Viruses'), tx('Both equally')], answer: 0, why: tx('Antibiotics treat bacterial infections, not viral ones.') },
  { q: tx('What is AMR?'), options: [tx('When microbes change so medicines stop working on them'), tx('When people get used to medicine'), tx('A side effect of antibiotics')], answer: 0, why: tx('AMR is when microbes change so that medicines no longer work on them.') },
  { q: tx('Which illness is usually caused by a virus?'), options: [tx('The common cold'), tx('A bacterial skin infection'), tx('A urinary infection caused by bacteria')], answer: 0, why: tx('Colds are usually caused by viruses, so antibiotics won’t help.') },
  { q: tx('Is it safe to share antibiotics with a relative who has similar symptoms?'), options: [tx('Yes, if it worked for you'), tx('No, they need their own assessment'), tx('Yes, if you split the dose')], answer: 1, why: tx('Similar symptoms can have different causes, and the drug or dose may be wrong for them.') },
  { q: tx('Who should decide whether you need an antibiotic?'), options: [tx('A clinician after assessing you'), tx('A friend who took one before'), tx('Whoever sells it')], answer: 0, why: tx('A clinician can tell whether an antibiotic is needed and which one.') },
  { q: tx('Why does using antibiotics when they are not needed matter?'), options: [tx('It can make resistant germs more likely'), tx('It makes colds go away faster'), tx('It has no effect at all')], answer: 0, why: tx('Unneeded use gives bacteria more chances to become resistant and does not help you recover.') },
  { q: tx('What should you do before stopping an antibiotic early because you feel better?'), options: [tx('Ask your prescriber or pharmacist'), tx('Just stop'), tx('Take double the next day')], answer: 0, why: tx('The right length depends on the infection, so check with the person who prescribed it.') },
  { q: tx('Which helps prevent infections and so reduces the need for antibiotics?'), options: [tx('Handwashing and clean water'), tx('Keeping leftover antibiotics at home'), tx('Sharing medicines')], answer: 0, why: tx('Preventing infections means fewer antibiotics are needed.') },
]
