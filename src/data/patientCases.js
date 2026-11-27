import { tx } from '../i18n'

// Nigerian patient & community scenarios for Stewardship Command, organized into 3 Classroom-gated difficulty tiers
// Level 1: Everyday Community & Basics (Unlocked at Level 1 — 0+ lessons)
// Level 2: Pathogen & Ward Triage (Unlocked at Level 2 — 2+ lessons completed)
// Level 3: Advanced ICU, Surgery & One Health (Unlocked at Level 3 — 5+ lessons completed)

export const SCENARIO_TIERS = [
  {
    level: 1,
    id: 'tier-1',
    icon: '🌱',
    title: tx('Level 1: Everyday Community Scenarios'),
    subtitle: tx('Common campus, chemist, and household situations: colds, leftover pills, and testing before malaria drugs.'),
    requiredLessons: 0,
    unlockHint: tx('Unlocked from the start! Matches Classroom Level 1 (The Basics).'),
    color: '#176B65'
  },
  {
    level: 2,
    id: 'tier-2',
    icon: '🔬',
    title: tx('Level 2: Clinic & Pathogen Triage'),
    subtitle: tx('Match the right treatment to Bacteria, Viruses, Fungi, and Parasites in Nigerian outpatient clinics.'),
    requiredLessons: 2,
    unlockHint: tx('Complete at least 2 modules in The AMR Classroom (Level 1 Basics) to unlock Level 2 Scenarios.'),
    color: '#0284C7'
  },
  {
    level: 3,
    id: 'tier-3',
    icon: '🌍',
    title: tx('Level 3: Hospital ICU, Surgery & One Health'),
    subtitle: tx('Complex hospital superbugs (ESBL), pregnancy care, newborn sepsis, and One Health farm outbreaks.'),
    requiredLessons: 5,
    unlockHint: tx('Complete at least 5 modules in The AMR Classroom to unlock Level 3 Advanced Scenarios.'),
    color: '#7A5CC7'
  }
]

export const PATIENT_CASES = [
  // ================= LEVEL 1: EVERYDAY COMMUNITY & BASICS =================
  {
    id: 'case-101',
    level: 1,
    ward: tx('University Clinic'),
    hospital: 'BUTH (Ilishan-Remo)',
    name: tx('Chidi, 19, Undergraduate Student'),
    presentation: tx('Runny nose, sneezing, mild sore throat, and thick yellow nasal mucus for 3 days during exams. Rapid Strep test is NEGATIVE.'),
    suspected: tx('Common Viral Cold (Catarrh / Viral Pharyngitis)'),
    options: [
      {
        label: tx('Rest, warm fluids, and simple paracetamol (No antibiotic)'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.0,
        reasoning: tx('Correct! Yellow mucus during a cold is just white blood cells clearing a virus. Antibiotics do not work on viruses.')
      },
      {
        label: tx('Buy 4 loose capsules of Ampiclox from a chemist'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.45,
        reasoning: tx('Wrong—Ampiclox cannot kill a cold virus, and taking loose capsules harms friendly gut bacteria.')
      },
      {
        label: tx('Azithromycin (Watch antibiotic) for 3 days'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.65,
        reasoning: tx('Inappropriate—using a Watch-group antibiotic for a viral cold breeds resistance rapidly.')
      },
      {
        label: tx('Share a roommate’s leftover Ciprofloxacin'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.8,
        reasoning: tx('Dangerous—never share leftover antibiotics or take them for a viral illness.')
      }
    ],
    correct: 0,
    takeaway: tx('Colds and most sore throats are caused by viruses. Colored mucus is a normal sign of your immune system working—not a reason to take antibiotics.')
  },
  {
    id: 'case-102',
    level: 1,
    ward: tx('Community Pharmacy'),
    hospital: 'Sagamu Community Health Hub',
    name: tx('Tunde, 22, Football Player'),
    presentation: tx('Feels tired and warm after evening training. Wants to buy malaria tablets and an antibiotic immediately without any blood test.'),
    suspected: tx('Unconfirmed Fever (Cause Unknown Yet)'),
    options: [
      {
        label: tx('Do a 15-minute Rapid Diagnostic Test (RDT) for malaria first before taking any medicine'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.0,
        reasoning: tx('Spot on! Over 60% of fevers in Nigeria are not malaria. Always Test Before You Treat.')
      },
      {
        label: tx('Take malaria tablets and Amoxicillin together "to cover everything"'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.55,
        reasoning: tx('Mixing unprescribed antimalarials and antibiotics without testing wastes money and trains germs to become resistant.')
      },
      {
        label: tx('Take 1 day of malaria tablets and stop as soon as the sweat breaks'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.75,
        reasoning: tx('Stopping malaria medicine after 1 day leaves surviving parasites behind to develop resistance.')
      },
      {
        label: tx('Inject Ceftriaxone immediately'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.85,
        reasoning: tx('Never use a Watch-group hospital antibiotic injection for an unconfirmed community fever.')
      }
    ],
    correct: 0,
    takeaway: tx('Not every fever is malaria or typhoid! Always confirm with a quick blood test (like a malaria RDT) before starting antimicrobial medicines.')
  },
  {
    id: 'case-103',
    level: 1,
    ward: tx('Outpatient Dispensary'),
    hospital: 'OOUTH (Sagamu)',
    name: tx('Mama Ngozi, 50, Market Trader'),
    presentation: tx('Was prescribed a 5-day course of Amoxicillin for a confirmed bacterial infection. By Day 2 her pain is gone, and she wants to stop and save the rest.'),
    suspected: tx('Confirmed Bacterial Infection on Day 2 of Treatment'),
    options: [
      {
        label: tx('Keep taking the medicine on schedule until all 5 days are completely finished'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.05,
        reasoning: tx('Correct! Finishing the full prescribed course ensures the toughest surviving bacteria are wiped out completely.')
      },
      {
        label: tx('Stop on Day 2 and keep the remaining capsules for her neighbor'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.75,
        reasoning: tx('Stopping early kills only the weakest bacteria and leaves the toughest survivors to multiply into superbugs.')
      },
      {
        label: tx('Flush the remaining tablets down the toilet'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.7,
        reasoning: tx('Never stop early without medical advice—and never flush antibiotics into drains or water supplies.')
      },
      {
        label: tx('Swallow all 3 remaining days of pills at once to finish faster'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.6,
        reasoning: tx('Dangerous—taking multiple days of doses at once causes toxicity and does not clear the infection properly.')
      }
    ],
    correct: 0,
    takeaway: tx('Feeling better on Day 2 just means the weakest germs have died. Always complete your prescribed course so tougher survivors cannot bounce back as superbugs.')
  },

  // ================= LEVEL 2: CLINIC & PATHOGEN TRIAGE =================
  {
    id: 'case-001',
    level: 2,
    ward: tx('General Medicine'),
    hospital: 'LUTH (Lagos)',
    name: tx('Mr Adeyemi, 45'),
    presentation: tx('Fever 38.9°C, productive cough for 5 days, oxygen saturation 94%. Sputum test confirms Streptococcus pneumoniae bacteria.'),
    suspected: tx('Mild Community-Acquired Bacterial Pneumonia'),
    options: [
      {
        label: tx('Amoxicillin (oral, Green Access group)'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.05,
        reasoning: tx('First-line WHO Access drug for mild bacterial pneumonia. Effective and low resistance risk.')
      },
      {
        label: tx('Azithromycin (oral, Yellow Watch group)'),
        aware: 'W',
        damage: 1,
        resistanceRisk: 0.25,
        reasoning: tx('Watch-group antibiotic. Save for patients with penicillin allergy or atypical pathogens.')
      },
      {
        label: tx('Ciprofloxacin (IV, Yellow Watch group)'),
        aware: 'W',
        damage: 1,
        resistanceRisk: 0.4,
        reasoning: tx('Overusing Ciprofloxacin drives resistance and is not first-line for standard community pneumonia.')
      },
      {
        label: tx('Meropenem (IV, Red Reserve group)'),
        aware: 'R',
        damage: 0,
        resistanceRisk: 0.9,
        reasoning: tx('Reserve-group emergency hospital drug! Never waste a last-resort drug on a mild infection.')
      }
    ],
    correct: 0,
    takeaway: tx('Under the WHO Traffic-Light (AWaRe) rule, always choose a Green "Access" antibiotic like Amoxicillin first when it fits the infection.')
  },
  {
    id: 'case-002',
    level: 2,
    ward: tx('Emergency'),
    hospital: 'UCH (Ibadan)',
    name: tx('Fatima, 7 years'),
    presentation: tx('Fever 40°C, malaria Rapid Diagnostic Test (RDT) is POSITIVE, no vomiting, able to eat and drink.'),
    suspected: tx('Uncomplicated Plasmodium falciparum Malaria (Confirmed by RDT)'),
    options: [
      {
        label: tx('Artemether-Lumefantrine (ACT) full 3-day course (6 doses)'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.05,
        reasoning: tx('Correct! First-line combination therapy (ACT) per Nigerian guidelines after a positive RDT.')
      },
      {
        label: tx('Chloroquine tablets'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.8,
        reasoning: tx('Malaria parasites in Nigeria developed widespread resistance to Chloroquine years ago—treatment will fail.')
      },
      {
        label: tx('Amoxicillin antibiotic syrup + Paracetamol'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.5,
        reasoning: tx('Antibiotics only kill bacteria—they have zero effect on malaria parasites!')
      },
      {
        label: tx('Take ACT for 1 day only and stop when fever drops'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.75,
        reasoning: tx('Incomplete ACT dosing leaves surviving parasites in the blood and breeds artemisinin resistance.')
      }
    ],
    correct: 0,
    takeaway: tx('Once malaria is confirmed by an RDT blood test, treat with a full 3-day (6-dose) ACT combination course—never Chloroquine or antibiotics.')
  },
  {
    id: 'case-004',
    level: 2,
    ward: tx('Paediatrics'),
    hospital: 'ABUTH (Zaria)',
    name: tx('Baby Chukwuemeka, 8 months'),
    presentation: tx('Mild ear discomfort, temperature 37.6°C, eating well. Ear check shows mild redness without pus or fluid buildup.'),
    suspected: tx('Mild Acute Ear Infection (Likely Viral following a Cold)'),
    options: [
      {
        label: tx('Pain relief + Watchful waiting for 48–72 hours'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.0,
        reasoning: tx('Over 80% of mild childhood ear infections after a cold are viral and clear up safely without antibiotics.')
      },
      {
        label: tx('Ciprofloxacin ear drops + Oral Azithromycin'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.5,
        reasoning: tx('Using two Watch-group antibiotics for a mild viral earache drives community superbugs.')
      },
      {
        label: tx('Ceftriaxone injection for 5 days'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.7,
        reasoning: tx('Hospital injections are unnecessary and harmful for a mild, uncomplicated earache.')
      },
      {
        label: tx('Meropenem IV'),
        aware: 'R',
        damage: 0,
        resistanceRisk: 0.9,
        reasoning: tx('Never use a Red Reserve antibiotic for a mild outpatient illness.')
      }
    ],
    correct: 0,
    takeaway: tx('Most mild earaches and coughs after a cold resolve on their own. Careful observation prevents unnecessary antibiotic exposure in children.')
  },
  {
    id: 'case-204',
    level: 2,
    ward: tx('Dermatology Clinic'),
    hospital: 'UNTH (Enugu)',
    name: tx('Adaora, 16, Secondary School Student'),
    presentation: tx('Itchy, ring-shaped scaly rash on her arm after sharing a hostel towel. A chemist sold her a "triple-action" steroid + antibiotic cream, and the rash grew larger.'),
    suspected: tx('Fungal Ringworm (Tinea corporis)'),
    options: [
      {
        label: tx('Stop the steroid mix and use a targeted Antifungal cream (e.g., Clotrimazole)'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.05,
        reasoning: tx('Correct! Ringworm is caused by a fungus and needs a targeted antifungal—steroid-antibiotic mixes worsen fungal rashes.')
      },
      {
        label: tx('Swallow oral Amoxicillin capsules for 7 days'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.45,
        reasoning: tx('Amoxicillin is an antibacterial antibiotic—it does not kill fungi.')
      },
      {
        label: tx('Apply double the amount of triple-action steroid cream'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.6,
        reasoning: tx('Steroids suppress local skin immunity, allowing the fungus to spread deeper and resist treatment.')
      },
      {
        label: tx('Take Artemether-Lumefantrine malaria tablets'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.4,
        reasoning: tx('Antimalarials treat blood parasites, not fungal skin infections.')
      }
    ],
    correct: 0,
    takeaway: tx('Ringworm is a fungus, not a worm or bacterium! Always treat fungal rashes with a proper antifungal medicine rather than mixed steroid-antibiotic creams.')
  },

  // ================= LEVEL 3: HOSPITAL ICU, SURGERY & ONE HEALTH =================
  {
    id: 'case-003',
    level: 3,
    ward: tx('Intensive Care Unit (ICU)'),
    hospital: 'BUTH (Ilishan-Remo)',
    name: tx('Mrs Okafor, 62'),
    presentation: tx('3 days after abdominal surgery. High fever and severe wound infection. Lab culture confirms ESBL-producing Klebsiella pneumoniae (resistant to penicillins and ceftriaxone).'),
    suspected: tx('Severe Drug-Resistant ESBL Klebsiella Infection (Culture-Confirmed)'),
    options: [
      {
        label: tx('Targeted Carbapenem IV therapy (guided by the lab culture result)'),
        aware: 'R',
        damage: 2,
        resistanceRisk: 0.2,
        reasoning: tx('Correct! When a lab culture confirms a life-threatening multidrug-resistant ESBL superbug, targeted high-tier therapy is justified.')
      },
      {
        label: tx('Ceftriaxone IV (Yellow Watch group)'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.7,
        reasoning: tx('ESBL enzymes chop up and destroy Ceftriaxone—the lab culture already showed this drug will fail.')
      },
      {
        label: tx('Oral Amoxicillin capsules'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.6,
        reasoning: tx('ESBL superbugs completely destroy standard penicillins like Amoxicillin.')
      },
      {
        label: tx('No treatment needed'),
        aware: 'A',
        damage: 0,
        resistanceRisk: 0.5,
        reasoning: tx('A severe post-surgical ICU superbug infection is life-threatening and requires lab-guided treatment.')
      }
    ],
    correct: 0,
    takeaway: tx('This is why we protect our high-tier hospital antibiotics! When a lab culture confirms a severe ESBL superbug, reserved drugs become life-saving.')
  },
  {
    id: 'case-005',
    level: 3,
    ward: tx('Obstetrics & Maternity'),
    hospital: 'LUTH (Lagos)',
    name: tx('Mrs Bello, 28 (36 Weeks Pregnant)'),
    presentation: tx('Painful urination. Urine lab culture confirms E. coli bacteria sensitive to Cephalexin. She asks if she can just take her husband’s leftover Ciprofloxacin.'),
    suspected: tx('Culture-Confirmed Bacterial UTI in Late Pregnancy'),
    options: [
      {
        label: tx('Prescribe pregnancy-safe Cephalexin guided by her urine culture sensitivity'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.05,
        reasoning: tx('Correct! Cephalexin is an Access-group antibiotic proven safe in late pregnancy and matched to her lab test.')
      },
      {
        label: tx('Let her take her husband’s leftover Ciprofloxacin for 3 days'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.6,
        reasoning: tx('Dangerous! Ciprofloxacin is unsafe in pregnancy (can harm the baby’s developing joints) and leftover courses breed resistance.')
      },
      {
        label: tx('Give an unverified antibiotic pack from an open-air sun market without NAFDAC MAS'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.75,
        reasoning: tx('Sun-degraded or counterfeit drugs fail to cure the infection and endanger both mother and baby.')
      },
      {
        label: tx('Meropenem IV in the ICU'),
        aware: 'R',
        damage: 0,
        resistanceRisk: 0.85,
        reasoning: tx('Never use a Reserve-group drug when a safe Access-group oral antibiotic works per the lab culture.')
      }
    ],
    correct: 0,
    takeaway: tx('Never share family leftovers—especially in pregnancy, where drugs like Ciprofloxacin can harm the baby. Always use lab-guided, pregnancy-safe treatment.')
  },
  {
    id: 'case-008',
    level: 3,
    ward: tx('Surgical Ward'),
    hospital: 'UCH (Ibadan)',
    name: tx('Mr Taiwo, 55'),
    presentation: tx('Scheduled for a routine, uncomplicated appendix removal surgery. The team is deciding how to prevent a surgical wound infection.'),
    suspected: tx('Routine Surgical Prophylaxis (Preventing Post-Op Wound Infection)'),
    options: [
      {
        label: tx('A single targeted pre-surgery Access antibiotic dose 30 minutes before incision + strict hand/instrument sterility'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.05,
        reasoning: tx('Gold standard! A single pre-op Access dose plus sterile technique prevents wound infection without breeding ward superbugs.')
      },
      {
        label: tx('5 days of post-op Ciprofloxacin + Metronidazole after clean surgery'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.6,
        reasoning: tx('Extending prophylactic antibiotics for days after a clean surgery does not prevent infection—it only breeds hospital resistance.')
      },
      {
        label: tx('3 days of Reserve-group Meropenem before and after surgery'),
        aware: 'R',
        damage: 0,
        resistanceRisk: 0.9,
        reasoning: tx('Using a Red Reserve antibiotic for routine surgery prophylaxis destroys our last line of defense.')
      },
      {
        label: tx('Skip handwashing and rely on antibiotics alone'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.8,
        reasoning: tx('Antibiotics can never replace clean hands and sterile surgical instruments!')
      }
    ],
    correct: 0,
    takeaway: tx('Modern surgery depends on working antibiotics and strict hygiene—using a single targeted pre-op dose rather than days of unnecessary post-op pills.')
  },
  {
    id: 'case-304',
    level: 3,
    ward: tx('One Health Community Advisory'),
    hospital: 'Ogun State Veterinary & Public Health Extension',
    name: tx('Alhaji Musa’s Commercial Poultry Farm (2,000 Chicks)'),
    presentation: tx('To make his healthy broiler chicks grow faster and avoid sickness in a crowded coop, a neighbor advises mixing human Colistin powder into their drinking water every day.'),
    suspected: tx('One Health Stewardship: Farm Prophylaxis & Colistin Protection'),
    options: [
      {
        label: tx('Refuse daily Colistin; upgrade coop hygiene, clean water lines, and use poultry vaccines (Newcastle/Gumboro) with a vet'),
        aware: 'A',
        damage: 2,
        resistanceRisk: 0.0,
        reasoning: tx('Champion choice! Colistin is a Red Reserve human antibiotic. Clean coops and vaccines protect the flock without breeding mcr-1 superbugs.')
      },
      {
        label: tx('Mix Colistin powder into the healthy chicks’ water every day for 6 weeks'),
        aware: 'R',
        damage: 0,
        resistanceRisk: 0.95,
        reasoning: tx('Catastrophic—giving human Reserve antibiotics to healthy farm animals breeds the mobile mcr-1 resistance gene that enters our food and water.')
      },
      {
        label: tx('Dump leftover antibiotic water directly into the nearby vegetable stream'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.85,
        reasoning: tx('Farm antibiotic runoff pollutes rivers and trains bacteria on irrigated vegetables to become drug-resistant.')
      },
      {
        label: tx('Switch to daily human Ciprofloxacin in the chicken feed instead'),
        aware: 'W',
        damage: 0,
        resistanceRisk: 0.8,
        reasoning: tx('Human Watch-group fluoroquinolones should never be used as daily growth promoters in healthy poultry.')
      }
    ],
    correct: 0,
    takeaway: tx('Over 70% of antibiotics worldwide are used in livestock. Under Nigeria’s AMR Action Plan (NAP 2.0), keeping farms clean and vaccinated protects human medicines!')
  }
]
