// Nigerian hospital patient cases for Stewardship Command game
// All cases reference real Nigerian tertiary hospitals, NCDC data, WHO AWaRe classifications
// AWaRe: A=Access, W=Watch, R=Reserve

export const PATIENT_CASES = [
  {
    id: 'case-001',
    ward: 'General Medicine',
    hospital: 'LUTH (Lagos)',
    name: 'Mr Adeyemi, 45',
    presentation: 'Fever 38.9°C, productive cough × 5 days, O₂ sat 94%. Sputum Gram stain: Gram-positive diplococci.',
    suspected: 'Community-acquired pneumonia (CAP) — likely Streptococcus pneumoniae',
    options: [
      { label: 'Amoxicillin (oral)', aware: 'A', damage: 2, resistanceRisk: 0.05, reasoning: 'First-line Access drug for mild CAP. Correct WHO choice.' },
      { label: 'Azithromycin (oral)', aware: 'W', damage: 1, resistanceRisk: 0.25, reasoning: 'Watch-group macrolide. Reserve for atypicals or penicillin allergy.' },
      { label: 'Ciprofloxacin (IV)', aware: 'W', damage: 1, resistanceRisk: 0.4, reasoning: 'Fluoroquinolones drive resistance. Not first-line for CAP.' },
      { label: 'Meropenem (IV)', aware: 'R', damage: 0, resistanceRisk: 0.9, reasoning: 'Reserve-group carbapenem. Massively inappropriate for mild CAP.' }
    ],
    correct: 0,
    takeaway: 'Amoxicillin covers S. pneumoniae at 80–90% efficacy with minimal resistance pressure. Always start Access-group first.'
  },
  {
    id: 'case-002',
    ward: 'Emergency',
    hospital: 'UCH (Ibadan)',
    name: 'Fatima, 7 years',
    presentation: 'Fever 40°C, rapid test malaria POSITIVE, no vomiting, eating well. Parasitaemia 0.3%.',
    suspected: 'Uncomplicated falciparum malaria',
    options: [
      { label: 'Artemether-Lumefantrine (AL)', aware: 'A', damage: 2, resistanceRisk: 0.05, reasoning: 'First-line ACT per NCDC/FMOH guidelines. Correct choice.' },
      { label: 'Chloroquine', aware: 'A', damage: 0, resistanceRisk: 0.8, reasoning: 'P. falciparum is chloroquine-resistant in Nigeria. This will fail.' },
      { label: 'IV Artesunate', aware: 'R', damage: 1, resistanceRisk: 0.1, reasoning: 'Reserve for severe malaria. Overkill for uncomplicated disease.' },
      { label: 'Amoxicillin + Paracetamol', aware: 'A', damage: 0, resistanceRisk: 0.3, reasoning: 'Antibiotics do not treat malaria. Dangerous delay in treatment.' }
    ],
    correct: 0,
    takeaway: 'AL (Coartem) is first-line for uncomplicated malaria in Nigeria. Chloroquine resistance is widespread since 2001.'
  },
  {
    id: 'case-003',
    ward: 'ICU',
    hospital: 'BUTH (Makurdi)',
    name: 'Mrs Okafor, 62',
    presentation: 'Post-op day 3 (abdominal surgery). Fever, purulent wound discharge. Culture: ESBL-producing Klebsiella pneumoniae.',
    suspected: 'Surgical site infection — ESBL Klebsiella (resistant to penicillins, cephalosporins)',
    options: [
      { label: 'Meropenem (IV)', aware: 'R', damage: 2, resistanceRisk: 0.2, reasoning: 'Carbapenems remain active against most ESBL producers. Appropriate for severe infection.' },
      { label: 'Ceftriaxone (IV)', aware: 'W', damage: 0, resistanceRisk: 0.7, reasoning: 'ESBLs inactivate cephalosporins. This will fail — resistance mechanism is specific.' },
      { label: 'Amoxicillin-Clavulanate', aware: 'A', damage: 0, resistanceRisk: 0.6, reasoning: 'Most ESBL-producers are resistant to beta-lactam/inhibitor combos too.' },
      { label: 'Fosfomycin (oral)', aware: 'W', damage: 1, resistanceRisk: 0.15, reasoning: 'Consider for UTI but not adequate for systemic wound infection.' }
    ],
    correct: 0,
    takeaway: 'ESBL infections require carbapenem therapy. This is an appropriate use of Reserve-group drugs — culture-guided, severe disease.'
  },
  {
    id: 'case-004',
    ward: 'Paediatrics',
    hospital: 'ABUTH (Zaria)',
    name: 'Baby Chukwuemeka, 8 months',
    presentation: 'Ear pain, pulling at ear, temperature 37.6°C. Otoscopy: erythematous TM, no effusion. Otherwise well.',
    suspected: 'Acute otitis media (AOM) — likely viral or mild bacterial',
    options: [
      { label: 'Watch & Wait 48–72h', aware: 'A', damage: 2, resistanceRisk: 0.0, reasoning: 'Most AOM in this age group resolves without antibiotics. Watchful waiting is guideline-recommended.' },
      { label: 'Amoxicillin (high dose)', aware: 'A', damage: 1, resistanceRisk: 0.1, reasoning: 'Reasonable if caregiver cannot return, but watchful waiting preferred for mild AOM.' },
      { label: 'Co-amoxiclav 7 days', aware: 'A', damage: 1, resistanceRisk: 0.2, reasoning: 'Broader spectrum than needed for empiric first-line. Reserve for treatment failure.' },
      { label: 'Ciprofloxacin ear drops + Oral Azithromycin', aware: 'W', damage: 0, resistanceRisk: 0.5, reasoning: 'Ear drops not indicated without perforation. Azithromycin drives S. pneumoniae macrolide resistance.' }
    ],
    correct: 0,
    takeaway: 'Viral AOM resolves spontaneously 80% of the time. Prescribing antibiotics for every ear infection accelerates resistance in communities.'
  },
  {
    id: 'case-005',
    ward: 'Obstetrics',
    hospital: 'LUTH (Lagos)',
    name: 'Mrs Bello, 28, 36 weeks pregnant',
    presentation: 'Painful urination, urine culture: E. coli >10⁵ CFU/mL, sensitive to nitrofurantoin and cephalexin.',
    suspected: 'Uncomplicated UTI in pregnancy',
    options: [
      { label: 'Nitrofurantoin 5 days', aware: 'A', damage: 2, resistanceRisk: 0.05, reasoning: 'First-line for UTI in pregnancy (avoid after 36 weeks due to neonatal risk — but 36 wks is borderline).' },
      { label: 'Cephalexin (oral) 7 days', aware: 'A', damage: 2, resistanceRisk: 0.08, reasoning: 'Safe in pregnancy, effective per sensitivity results. Acceptable choice at this gestation.' },
      { label: 'Ciprofloxacin 3 days', aware: 'W', damage: 0, resistanceRisk: 0.35, reasoning: 'Fluoroquinolones are contraindicated in pregnancy — risk of arthropathy to fetus.' },
      { label: 'Trimethoprim alone', aware: 'A', damage: 0, resistanceRisk: 0.2, reasoning: 'Avoid in first trimester (folate antagonism) and third trimester. High resistance rates in Nigeria.' }
    ],
    correct: 1,
    takeaway: 'Always check culture sensitivities. Ciprofloxacin is CONTRAINDICATED in pregnancy. At 36+ weeks, cephalexin is safer than nitrofurantoin.'
  },
  {
    id: 'case-006',
    ward: 'General Medicine',
    hospital: 'UITH (Ilorin)',
    name: 'Chidi, 19, University Student',
    presentation: 'Sore throat, fever 37.8°C, mild. Rapid antigen test: Group A Strep NEGATIVE.',
    suspected: 'Viral pharyngitis (most likely)',
    options: [
      { label: 'Supportive care only (analgesia, fluids)', aware: 'A', damage: 2, resistanceRisk: 0.0, reasoning: 'Viral pharyngitis does not benefit from antibiotics. Paracetamol and hydration is correct.' },
      { label: 'Amoxicillin 500mg × 10 days', aware: 'A', damage: 0, resistanceRisk: 0.4, reasoning: 'No indication — negative Strep test. Contributes to community resistance.' },
      { label: 'Azithromycin 3-day pack', aware: 'W', damage: 0, resistanceRisk: 0.6, reasoning: 'Z-pack overuse drives macrolide resistance. Completely inappropriate here.' },
      { label: 'Benzylpenicillin IM', aware: 'A', damage: 0, resistanceRisk: 0.5, reasoning: 'Injections for viral sore throat? Painful, no benefit, generates needless resistance pressure.' }
    ],
    correct: 0,
    takeaway: '90% of sore throats are viral. Giving antibiotics for every sore throat is the fastest way to breed resistant streptococci in campus communities.'
  },
  {
    id: 'case-007',
    ward: 'Neonatal ICU',
    hospital: 'UCH (Ibadan)',
    name: 'Neonate Adaeze, Day 2',
    presentation: 'Poor feeding, temperature 36°C (hypothermia), WBC 3,200. High suspicion for early-onset neonatal sepsis.',
    suspected: 'Early-onset neonatal sepsis (Group B Strep or Gram-negative)',
    options: [
      { label: 'Ampicillin + Gentamicin (IV)', aware: 'A', damage: 2, resistanceRisk: 0.1, reasoning: 'WHO-recommended first-line for neonatal sepsis. Ampicillin covers GBS + Listeria; Gentamicin covers Gram-negatives.' },
      { label: 'Ceftriaxone alone (IV)', aware: 'W', damage: 1, resistanceRisk: 0.3, reasoning: 'Avoid cephalosporins as monotherapy in neonates — risk of Candida superinfection and misses Listeria.' },
      { label: 'Meropenem + Vancomycin', aware: 'R', damage: 0, resistanceRisk: 0.8, reasoning: 'Reserve carbapenem + glycopeptide for culture-proven MRSA or carbapenem-resistant organisms. Empiric overkill.' },
      { label: 'Oral Amoxicillin', aware: 'A', damage: 0, resistanceRisk: 0.5, reasoning: 'Critically ill neonates need IV therapy. Oral route inadequate for sepsis.' }
    ],
    correct: 0,
    takeaway: 'Ampicillin + Gentamicin remains the WHO standard for neonatal sepsis. Reserve meropenem/vancomycin only after culture guidance.'
  },
  {
    id: 'case-008',
    ward: 'Surgery',
    hospital: 'EKSUTH (Ado-Ekiti)',
    name: 'Mr Taiwo, 55',
    presentation: 'Scheduled appendectomy. No signs of perforation. Requesting prophylactic antibiotics.',
    suspected: 'Surgical prophylaxis — clean-contaminated surgery',
    options: [
      { label: 'Cefazolin IV (single dose, 30min pre-op)', aware: 'A', damage: 2, resistanceRisk: 0.05, reasoning: 'Single-dose cephalosporin prophylaxis is the gold standard for abdominal surgery.' },
      { label: 'Metronidazole + Ciprofloxacin × 5 days (post-op)', aware: 'W', damage: 0, resistanceRisk: 0.6, reasoning: 'Post-op prophylaxis extension beyond 24h does not reduce infection and promotes resistance.' },
      { label: 'Meropenem × 3 days (pre and post-op)', aware: 'R', damage: 0, resistanceRisk: 0.9, reasoning: 'Using a carbapenem for routine surgical prophylaxis is a catastrophic waste of a last-resort drug.' },
      { label: 'No antibiotics needed', aware: 'A', damage: 0, resistanceRisk: 0.1, reasoning: 'Clean-contaminated surgery like appendectomy does require prophylaxis to prevent wound infection.' }
    ],
    correct: 0,
    takeaway: 'The key rule: single pre-operative dose, correct drug (cefazolin), correct timing (30 min before). Stop after 24h maximum.'
  }
]

export const WARDS = [
  { id: 'general', name: 'General Medicine', icon: '🏥', unlocked: true },
  { id: 'emergency', name: 'Emergency', icon: '🚨', unlocked: true },
  { id: 'paediatrics', name: 'Paediatrics', icon: '👶', unlocked: true },
  { id: 'icu', name: 'ICU', icon: '💉', unlocked: true },
  { id: 'obstetrics', name: 'Obstetrics', icon: '🤰', unlocked: true },
  { id: 'surgery', name: 'Surgery', icon: '🔪', unlocked: true },
]
