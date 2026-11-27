import { tx } from '../i18n'

/**
 * Compartmentalized Offline FAQ Library for Ask XEITH.
 * Grouped into 6 layperson-friendly categories mirroring the Classroom pathway,
 * with keyword + token scoring for typed offline questions and related follow-ups.
 */
export const FAQ_CATEGORIES = [
  {
    id: 'basics',
    icon: '🌱',
    title: tx('AMR & Microbe Basics'),
    desc: tx('What microbes, pathogens, and drug resistance actually mean in plain words.'),
    lessonLink: '/learn?module=intro-pathogens',
    items: [
      {
        id: 'what-is-amr',
        q: tx('What is AMR and why does it matter?'),
        keys: ['what is amr', 'antimicrobial resistance', 'resistance', 'resistant', 'amr', 'why does it matter', 'meaning of amr'],
        a: tx('**Antimicrobial Resistance (AMR)** happens when germs (bacteria, viruses, fungi, or parasites) change over time so that the medicines meant to kill them no longer work.\n\nWhen this happens, common infections become much harder and more expensive to treat, and everyday hospital care becomes riskier. You can learn the basics step by step in [Introduction to Microbes & Pathogens](/learn?module=intro-pathogens) and [What Is AMR?](/learn?module=what-is-amr).')
      },
      {
        id: 'body-or-germ',
        q: tx('Does my body become resistant to antibiotics, or does the germ?'),
        keys: ['my body', 'body become resistant', 'used to medicine', 'body get used', 'person or germ', 'who becomes resistant'],
        a: tx('**It is the germ (microbe) that becomes resistant—NOT your body!**\n\nMany people think their body has "gotten used to" an antibiotic, but in reality the bacteria causing the infection have evolved defenses against that drug. Because resistance lives inside the germ, a drug-resistant germ can even spread to someone who rarely takes antibiotics. Explore more in [What Is AMR?](/learn?module=what-is-amr).')
      },
      {
        id: 'four-germs',
        q: tx('What are the 4 main types of germs (pathogens)?'),
        keys: ['4 types', 'four types', 'pathogen', 'pathogens', 'microbe', 'microbes', 'types of germs', 'difference between'],
        a: tx('Most human infections are caused by one of **4 main types of pathogens (germs)**:\n- **Bacteria:** Single-celled living microbes (e.g., typhoid, strep throat, bacterial UTIs) — treated with **antibiotics**.\n- **Viruses:** Tiny genetic packets that hijack body cells (e.g., common cold/catarrh, flu, COVID-19) — antibiotics do **not** work on them.\n- **Fungi:** Yeasts and molds (e.g., ringworm, thrush, *Candida auris*) — treated with **antifungals**.\n- **Parasites:** Organisms like the malaria parasite (*Plasmodium*) — treated with **antiparasitics / antimalarials**.\n\nCheck out [Introduction to Microbes & Pathogens](/learn?module=intro-pathogens) in the Classroom.')
      },
      {
        id: 'how-superbugs-form',
        q: tx('How do drug-resistant "superbugs" form?'),
        keys: ['superbug', 'superbugs', 'how do superbugs', 'born', 'evolve', 'create superbugs', 'mutate'],
        a: tx('A **"superbug"** is a germ that has learned to survive several antimicrobial medicines.\n\nWhen someone takes an antibiotic they don’t need—or stops a prescription after just 2 or 3 capsules—only the weakest bacteria die. The toughest survivors with natural shields stay alive, multiply, and can even pass their resistance "cheat codes" (genes) to neighboring bacteria. See [What Are Bacteria & How Do Antibiotics Work?](/learn?module=bacteria).')
      }
    ]
  },
  {
    id: 'antibiotics',
    icon: '💊',
    title: tx('Taking Antibiotics Safely'),
    desc: tx('Finishing your dose, missed pills, loose chemist capsules, and sharing leftovers.'),
    lessonLink: '/learn?module=bacteria',
    items: [
      {
        id: 'finish-course',
        q: tx('Why must I finish my antibiotic course even when I feel better?'),
        keys: ['stop', 'finish', 'feel better', 'feeling better', 'complete course', 'early', 'halfway'],
        a: tx('Feeling better on Day 2 or 3 just means the **weakest** bacteria have been cleared—not that every harmful bacterium is gone.\n\nIf you stop your prescription early, the toughest surviving bacteria get a chance to recover, multiply, and learn how to block that antibiotic next time. Never stop or change your dose on your own—always complete the prescribed course or ask your doctor/pharmacist first. Learn more in [What Are Bacteria?](/learn?module=bacteria).')
      },
      {
        id: 'loose-chemist-capsules',
        q: tx('Why is buying 2 or 3 loose capsules ("cut-and-join") from a chemist risky?'),
        keys: ['chemist', 'ppmv', 'loose capsules', 'cut and join', 'two capsules', '3 tablets', 'without prescription', 'over the counter'],
        a: tx('Buying 2 or 3 loose capsules without a prescription is one of the fastest ways to create drug-resistant infections:\n- The medicine may be the **wrong drug** for your illness (for example, an antibiotic for a viral cold).\n- A 2-day shortcut dose is too weak to wipe out a real bacterial infection, so it acts like a **training gym** that leaves tougher, drug-resistant bacteria behind in your body.\n\nAlways get assessed by a qualified healthcare professional before starting antibiotics.')
      },
      {
        id: 'share-leftovers',
        q: tx('Can I share antibiotics with family or keep leftovers for next time?'),
        keys: ['leftover', 'leftovers', 'share', 'sharing', 'friend', 'family', 'save for later', 'keep pills'],
        a: tx('**Never share antibiotics or save leftovers for later.**\n\nTwo people with similar symptoms (like a cough, fever, or stomach ache) can have completely different illnesses requiring different treatments and doses. Taking someone else’s leftover pills often means both people get an incomplete, ineffective dose that breeds resistance.')
      },
      {
        id: 'missed-dose',
        q: tx('What should I do if I miss a dose of my antibiotic?'),
        keys: ['miss a dose', 'missed dose', 'forgot to take', 'forgot my pill', 'double dose', 'skip a dose'],
        a: tx('If you miss a dose, **do not automatically swallow a double dose** to make up for it.\n\nCheck the patient leaflet or ask your pharmacist or prescriber right away—they will tell you whether to take the missed dose immediately or wait until your next scheduled time.')
      },
      {
        id: 'aware-traffic-light',
        q: tx('What is the WHO Traffic-Light (Access, Watch, Reserve) guide for antibiotics?'),
        keys: ['aware', 'access watch reserve', 'traffic light', 'watch group', 'reserve group', 'access group', 'colistin', 'ciprofloxacin'],
        a: tx('The World Health Organization groups antibiotics into **3 traffic-light tiers (AWaRe)** to protect them:\n- 🟢 **Access (Green):** Safe, targeted first-choice antibiotics (like Amoxicillin) for everyday bacterial infections.\n- 🟡 **Watch (Yellow):** Broader antibiotics (like Ciprofloxacin or Azithromycin) that trigger resistance faster and must be used cautiously.\n- 🔴 **Reserve (Red):** Emergency last-resort hospital drugs (like Colistin) kept strictly for life-threatening superbugs.\n\nRead more in [What Are Bacteria & How Do Antibiotics Work?](/learn?module=bacteria).')
      }
    ]
  },
  {
    id: 'colds-viruses',
    icon: '🤧',
    title: tx('Colds, Flu, Coughs & Viruses'),
    desc: tx('Why antibiotics don’t cure colds or catarrh, the yellow mucus myth, and protecting your gut.'),
    lessonLink: '/learn?module=virus',
    items: [
      {
        id: 'cold-flu-antibiotics',
        q: tx('Can antibiotics treat the flu, common cold (catarrh), or most coughs?'),
        keys: ['virus', 'cold', 'flu', 'cough', 'catarrh', 'runny nose', 'sneeze', 'ampiclox', 'covid'],
        a: tx('**No.** Colds (catarrh), the flu, COVID-19, and most acute coughs are caused by **viruses**.\n\nAntibiotics are built specifically to attack bacterial cell walls and machinery, which viruses do not have. Taking Amoxicillin or Ampiclox for a cold will not help you recover even one hour faster—and can harm your helpful gut bacteria. Visit [What Are Viruses?](/learn?module=virus) in the Classroom.')
      },
      {
        id: 'yellow-green-mucus',
        q: tx('My nasal mucus (catarrh) turned thick yellow or green—do I need an antibiotic?'),
        keys: ['yellow', 'green', 'mucus', 'phlegm', 'sputum', 'thick catarrh', 'color'],
        a: tx('**Not necessarily!** Thick yellow or green mucus during a cold is a normal part of how your body fights a **virus**.\n\nWhen you catch a cold virus, your immune system sends millions of white blood cells (neutrophils) to your nose. Those cells contain a natural greenish enzyme that colors your mucus as they clear out the virus. Rest, fluids, and simple symptom care are usually what you need—unless a doctor diagnoses a secondary complication. Learn more in [What Are Viruses?](/learn?module=virus).')
      },
      {
        id: 'gut-microbiome-harm',
        q: tx('What happens to my stomach if I take antibiotics when I don’t need them?'),
        keys: ['stomach', 'gut', 'microbiome', 'good bacteria', 'friendly bacteria', 'diarrhea', 'side effects'],
        a: tx('Your digestive tract is home to trillions of **friendly bacteria** that help you digest food and block harmful germs.\n\nWhen you swallow an unnecessary antibiotic for a viral cold, the drug wipes out billions of those helpful gut bacteria. This can cause stomach upset, diarrhea, or yeast infections (thrush), and leaves room for drug-resistant bacteria to take over for months.')
      },
      {
        id: 'sore-throat',
        q: tx('Do sore throats need antibiotics?'),
        keys: ['sore throat', 'throat pain', 'strep', 'tonsillitis', 'swallowing'],
        a: tx('Most sore throats (especially those that come with a runny nose, cough, or hoarse voice) are caused by **viruses** and heal without antibiotics.\n\nOnly a smaller share—such as bacterial **strep throat** confirmed by a clinician—requires antibiotics. Always let a healthcare worker check your throat before taking any antibiotic.')
      }
    ]
  },
  {
    id: 'malaria-fungi',
    icon: '🦟',
    title: tx('Malaria, Fungi & Other Germs'),
    desc: tx('Why you must test with an RDT before taking malaria drugs, plus ringworm and fungal infections.'),
    lessonLink: '/learn?module=parasites',
    items: [
      {
        id: 'test-before-malaria',
        q: tx('Is every fever in Nigeria malaria? Why should I test with an RDT first?'),
        keys: ['malaria', 'fever', 'rdt', 'test before', 'blood test', 'act', 'antimalarial', 'parasite'],
        a: tx('**No—not every fever is malaria!** Health surveys in Nigeria show that over **60% of people** who buy malaria medicine without testing actually test negative for malaria (their fever is caused by a virus or another illness).\n\nNigeria’s National Malaria Guidelines say: **Test Before You Treat**. Always confirm with a quick 15-minute Rapid Diagnostic Test (**RDT**) or lab blood test before swallowing malaria tablets. And if your test is positive, finish **all 6 doses across all 3 days**! See [What Are Parasites & Protecting Malaria Medicines](/learn?module=parasites).')
      },
      {
        id: 'chloroquine-and-acts',
        q: tx('Why did Chloroquine stop working for malaria, and how do ACT tablets work?'),
        keys: ['chloroquine', 'artemisinin', 'combination', 'lumefantrine', 'coartem', 'lonart', 'why two drugs'],
        a: tx('Decades ago, **Chloroquine** was overused for every fever without testing, and malaria parasites evolved a way to pump the drug out—making Chloroquine fail across Africa.\n\nToday’s **ACTs (Artemisinin-based Combination Therapies)** combine **two** different malaria drugs in one tablet: a fast-acting drug that clears most parasites quickly, plus a longer-acting partner drug that clears remaining stragglers so resistance cannot easily develop.')
      },
      {
        id: 'fungal-infections',
        q: tx('What treats fungal infections like ringworm or yeast infections (thrush)?'),
        keys: ['fungus', 'fungi', 'fungal', 'ringworm', 'thrush', 'yeast', 'candida', 'antifungal', 'skin rash'],
        a: tx('Fungal infections—like **ringworm** on the skin/scalp, athlete’s foot, or **yeast infections (thrush)**—are caused by fungi, not bacteria. Antibiotics cannot cure them; they require proper **antifungal** medicines.\n\nAvoid unprescribed "triple-action" creams that mix strong steroids with antibiotics and antifungals, as steroids can weaken skin defenses and make fungal ringworm spread wider. Explore [What Are Fungi & Antifungal Resistance?](/learn?module=fungi).')
      },
      {
        id: 'candida-auris',
        q: tx('What is Candida auris and why is it a hospital superbug?'),
        keys: ['candida auris', 'critical priority', 'hospital fungus', 'super fungus', 'fluconazole'],
        a: tx('***Candida auris*** is an emerging multidrug-resistant yeast placed in the World Health Organization’s highest alert tier (**Critical Priority**).\n\nOver 90% of strains resist Fluconazole (a common antifungal pill), and it can cling to hospital beds and equipment for weeks, threatening fragile intensive-care patients. Read more in [What Are Fungi?](/learn?module=fungi).')
      }
    ]
  },
  {
    id: 'prevention-safety',
    icon: '🧼',
    title: tx('Prevention, Farms & Fake Drugs'),
    desc: tx('Handwashing, vaccines, farm antibiotics (One Health), NAFDAC MAS checks, and safe disposal.'),
    lessonLink: '/learn?module=human-spread',
    items: [
      {
        id: 'handwashing-vaccines',
        q: tx('How do handwashing, clean water, and vaccines help stop AMR?'),
        keys: ['prevent', 'prevention', 'hand', 'handwashing', 'soap', 'vaccine', 'vaccines', 'clean water', 'spread', 'eskape'],
        a: tx('**The best antibiotic is the infection that never happens!** When you prevent an infection, you need **zero** antibiotics—giving germs zero chance to develop resistance.\n\n- **Handwashing** with soap and clean water for 20 seconds (or 70% alcohol sanitizer) stops over 80% of touch-spread germs.\n- **Vaccines** (like Typhoid and Pneumonia vaccines) and **clean water** stop major infections before they ever start. See [How Superbugs Spread & How to Stop Them](/learn?module=human-spread).')
      },
      {
        id: 'one-health-farms',
        q: tx('How do antibiotics given to farm chickens and fish affect people (One Health)?'),
        keys: ['farm', 'poultry', 'chicken', 'livestock', 'animal', 'one health', 'food', 'meat', 'fish', 'manure'],
        a: tx('Over **70% of medically important antibiotics** worldwide are used in farm animals rather than people.\n\nWhen farmers give human antibiotics (especially emergency drugs like Colistin) to healthy flocks every day, resistant superbugs grow in the animals and wash into rivers, soil, and crops. **One Health** means protecting antibiotics across people, animals, and the environment—and cooking meat/fish thoroughly at home. Learn more in [One Health: Farms, Food & Water](/learn?module=one-health).')
      },
      {
        id: 'nafdac-fake-drugs',
        q: tx('How do fake or sun-damaged drugs cause resistance, and how do I check NAFDAC MAS?'),
        keys: ['fake', 'counterfeit', 'substandard', 'nafdac', 'mas', 'scratch', 'sms', 'sun', 'expired'],
        a: tx('Fake (counterfeit) pills or genuine medicines left baking in hot open-air markets often contain only **half-strength** active medicine. Swallowing a weak pill kills only weak germs and trains tougher survivors to become resistant—even if you finish the whole pack!\n\n**How to verify in Nigeria:** Buy only from licensed, cool pharmacies, scratch the silver **NAFDAC Mobile Authentication Service (MAS)** panel on the pack, and text the PIN to the free SMS number on the pack before taking your first dose. See [Fake Medicines & Safe Disposal](/learn?module=systems-quality).')
      },
      {
        id: 'dispose-leftovers',
        q: tx('How should I safely dispose of expired or leftover antibiotics?'),
        keys: ['dispose', 'disposal', 'throw away', 'flush', 'toilet', 'trash', 'dustbin', 'expired pills'],
        a: tx('**Never flush leftover or expired antibiotics down the toilet, sink, or gutter**, and don’t toss loose pills into open waste dumps.\n\nSewage systems do not remove antibiotic chemicals; flushed pills flow into rivers and soil where they train wild bacteria to become resistant. Instead, return unused or expired medicines to a **hospital pharmacy or licensed community pharmacy** for safe disposal.')
      }
    ]
  },
  {
    id: 'when-to-see-doctor',
    icon: '🏥',
    title: tx('When to See a Doctor or Pharmacist'),
    desc: tx('Warning signs for urgent medical care and why lab tests matter before treatment.'),
    lessonLink: '/learn?module=systems-quality',
    items: [
      {
        id: 'urgent-warning-signs',
        q: tx('What warning signs mean I should seek urgent medical care right away?'),
        keys: ['urgent', 'emergency', 'hospital', 'doctor', 'danger', 'severe', 'high fever', 'breathing'],
        a: tx('Seek **urgent medical care at a clinic or hospital** right away if you or a child experience:\n- Difficulty breathing, fast breathing, or chest pain\n- High fever that does not come down or lasts more than 2–3 days\n- Confusion, extreme drowsiness, stiff neck, or seizures\n- Inability to keep fluids down, severe dehydration, or a rapidly spreading skin infection\n\n*XEITH is an educational tool and cannot diagnose illnesses or prescribe medicine.*')
      },
      {
        id: 'why-lab-tests',
        q: tx('Why do doctors ask for a lab culture or sensitivity test before picking an antibiotic?'),
        keys: ['lab', 'culture', 'sensitivity', 'test', 'diagnose', 'which antibiotic', 'antibiogram'],
        a: tx('Different bacteria respond to different antibiotics. A **lab culture and susceptibility test** (or rapid diagnostic test) tells your doctor:\n1. Whether your illness is actually caused by a bacterium, virus, or malaria parasite.\n2. Exactly **which targeted antibiotic** will kill that specific germ—so you don’t waste time and money taking a medicine the germ is already resistant to!')
      }
    ]
  }
]

// Flat list of all FAQ items with category reference
export const ALL_FAQS = FAQ_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryTitle: cat.title, categoryIcon: cat.icon }))
)

// Find the best offline FAQ match (returns { item, category, related } or null)
export function findFaqMatch(text) {
  if (!text || typeof text !== 'string') return null
  const q = text.toLowerCase().trim()
  if (!q) return null

  // 1. Exact question match
  const exact = ALL_FAQS.find((item) => item.q.toLowerCase() === q)
  if (exact) {
    const category = FAQ_CATEGORIES.find((c) => c.id === exact.categoryId)
    const related = category ? category.items.filter((i) => i.id !== exact.id).slice(0, 3) : []
    return { item: exact, category, related }
  }

  // 2. Score each FAQ item by phrase match + keyword tokens
  const words = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2)
  let best = null
  let bestScore = 0

  for (const item of ALL_FAQS) {
    let score = 0
    for (const key of item.keys) {
      const k = key.toLowerCase()
      if (q.includes(k)) {
        score += k.includes(' ') ? 6 : 3
      }
    }
    const qLower = item.q.toLowerCase()
    for (const w of words) {
      if (qLower.includes(w)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }

  if (best && bestScore >= 2) {
    const category = FAQ_CATEGORIES.find((c) => c.id === best.categoryId)
    const related = category ? category.items.filter((i) => i.id !== best.id).slice(0, 3) : []
    return { item: best, category, related }
  }

  return null
}

export const faqAnswer = (text) => {
  const match = findFaqMatch(text)
  if (match) return match.item.a
  return 'I can’t reach the live AI right now and I didn’t find an exact match for that wording. Tap any of the **Offline FAQ Topics** below to browse ready-made answers, or explore the [Classroom](/learn)!'
}
