import { tx } from '../i18n'

/**
 * Detailed AMR Curriculum with verified biological mechanisms, 
 * Nigerian clinical and community epidemiology, stewardship protocols,
 * and authoritative references scraped from global health registries (Lancet GRAM, NCDC, WHO AWaRe, CDC).
 */
export const TIERS = [
  {
    id: 'beginner',
    level: 1,
    title: tx('Foundations of Antimicrobial Resistance'),
    subtitle: tx('Core biological mechanisms, bacterial vs viral structures, and infection transmission chains.'),
    badge: tx('Novice Steward'),
    icon: '🌱',
    color: '#176B65',
    moduleIds: ['bacteria', 'virus', 'human-spread']
  },
  {
    id: 'intermediate',
    level: 2,
    title: tx('Clinical Stewardship & Diagnostic Precision'),
    subtitle: tx('WHO AWaRe clinical rules, malaria RDT protocols, and hospital fungal superbugs.'),
    badge: tx('Clinical Advocate'),
    icon: '🩺',
    color: '#0284C7',
    moduleIds: ['parasites', 'fungi']
  },
  {
    id: 'advanced',
    level: 3,
    title: tx('One Health Systems, Drug Quality & Global Policy'),
    subtitle: tx('Livestock colistin abuse, mcr-1 genetics, substandard drugs (NAFDAC MAS), the empty R&D pipeline, and safe disposal.'),
    badge: tx('One Health Sentinel'),
    icon: '🌍',
    color: '#7C3AED',
    moduleIds: ['one-health', 'systems-quality']
  }
]

export const LESSONS = [
  {
    id: 'bacteria',
    tier: 'beginner',
    tierLevel: tx('Level 1: Foundations'),
    tierIcon: '🌱',
    order: 1,
    category: tx('BACTERIAL PHARMACOLOGY'),
    badge: 'WHO AWaRe & GRAM Data',
    readTime: '4 min read',
    title: tx('Bacterial Resistance & Antibiotic Stewardship'),
    subtitle: tx('Molecular mechanisms, the 1.27M death toll, and the WHO Access, Watch, Reserve framework'),
    summary: tx('How bacteria evolve defenses against antimicrobial molecules, the disproportionate death toll in West Africa, and the clinical framework designed to preserve our antibiotics.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('Biological Mechanisms: How Bacteria Neutralize Drugs'),
        content: tx('Antibiotics exert evolutionary selection pressure on bacterial colonies. Under this pressure, bacteria deploy four primary biochemical countermeasures: 1) Enzymatic degradation (such as beta-lactamase and carbapenemase enzymes cleaving the beta-lactam ring of penicillins and cephalosporins); 2) Target site alteration (mutations in penicillin-binding proteins or DNA gyrase preventing drug attachment); 3) Porin channel loss (reducing outer membrane permeability in Gram-negative bacteria); and 4) Multidrug efflux pumps that actively transport toxic antimicrobial agents out of the cell.\n\nCrucially, resistance is rarely confined to a single bacterium. Through Horizontal Gene Transfer (HGT)—via conjugative plasmids, bacteriophage transduction, and transformation of ambient DNA—a harmless commensal gut bacterium can donate multi-drug resistance cassettes directly to deadly virulent pathogens.'),
        caseStudy: tx('In Nigerian tertiary hospitals, Gram-negative bloodstream infections (Klebsiella pneumoniae, Escherichia coli, Acinetobacter) exhibit resistance rates exceeding 65% to third-generation cephalosporins (ceftriaxone), forcing clinicians to rely on toxic or scarce backup therapies.'),
        takeaway: tx('It is the bacteria that become drug-resistant, not the human body. Once resistant plasmids spread, antibiotics lose their killing efficacy permanently for everyone.')
      },
      {
        stepNum: 2,
        heading: tx('The Epidemic Scale: Sub-Saharan Africa Ground Zero'),
        content: tx('The milestone Global Research on Antimicrobial Resistance (GRAM) study published in The Lancet demonstrated that bacterial AMR is one of the leading global causes of mortality. In 2019 alone, 1.27 million deaths worldwide were directly attributable to drug-resistant bacterial infections, while 4.95 million deaths were associated with resistant pathogens—surpassing HIV/AIDS and malaria combined.\n\nSub-Saharan Africa bears the heaviest burden on earth. Western sub-Saharan Africa suffers the highest all-age mortality rate directly attributable to bacterial AMR globally, at 27.3 deaths per 100,000 population. The crisis is driven primarily by lower respiratory infections (drug-resistant pneumonia), bloodstream infections (septicemia), and intra-abdominal infections where first-line antibiotics fail in under-resourced hospitals.'),
        caseStudy: tx('In Nigeria, newborn sepsis in neonatal intensive care units is increasingly caused by multidrug-resistant Klebsiella and Acinetobacter, resulting in devastating fatality rates because standard empiric antibiotics cannot clear the infection.'),
        takeaway: tx('AMR is not a future threat; it is an active humanitarian crisis claiming over a million lives annually, with West Africa at the epicenter.')
      },
      {
        stepNum: 3,
        heading: tx('The WHO AWaRe Classification: Prescribing by Rule'),
        content: tx('To curb unchecked antibiotic consumption and guide frontline clinicians, the World Health Organization formulated the AWaRe categorization:\n\n• Access Group: First- and second-choice therapies for 29 common clinical infections. They possess a narrow spectrum of activity, excellent safety profiles, and lower resistance potential (e.g., Amoxicillin, Ampicillin, Cephalexin, Co-trimoxazole). The WHO mandates that Access antibiotics should comprise at least 60% of total national antibiotic consumption.\n\n• Watch Group: Broader-spectrum agents carrying a markedly higher risk of bacterial resistance selection (e.g., Ciprofloxacin, Azithromycin, Ceftriaxone, Augmentin). These must be restricted to specific high-severity clinical indications with rigorous oversight.\n\n• Reserve Group: "Last-resort" antimicrobials (e.g., Colistin, Linezolid, IV Fosfomycin, Ceftazidime-avibactam). These must be strictly protected and reserved for confirmed or suspected life-threatening infections caused by multidrug-resistant pathogens when all alternatives have failed.'),
        caseStudy: tx('Point prevalence surveys in Nigeria indicate that Watch-group antibiotics (especially ceftriaxone and ciprofloxacin) are frequently prescribed over-the-counter for simple complaints, violating the 60% Access threshold and driving community-wide resistance.'),
        takeaway: tx('Always prioritize Access-group antibiotics when indicated. Reserve-group drugs must remain guarded as our last therapeutic shields.')
      },
      {
        stepNum: 4,
        heading: tx('The Nigerian Community Reality: PPMVs & Self-Medication'),
        content: tx('Across Nigerian university campuses, studies reveal that self-medication with antibiotics ranges between 47% and over 89% among undergraduate students. The primary driver is informal access through Patent and Proprietary Medicine Vendors (PPMVs / local "chemists").\n\nAlthough Nigerian regulations classify antibiotics as prescription-only medications, weak enforcement allows students and community members to purchase loose capsules of amoxicillin, ciprofloxacin, or ampicillin-cloxacillin without a doctor\'s prescription or diagnostic confirmation. Students frequently purchase just 2 or 3 days worth of medication due to budget limits, discontinuing therapy the moment acute symptoms subside. This sublethal exposure eradicates susceptible bacteria while granting resistant mutants the time and space to multiply unchecked.'),
        caseStudy: tx('At university health centers, clinicians frequently encounter students whose routine urinary tract infections (UTIs) fail to respond to ciprofloxacin because they have taken fragmented 2-day courses bought from off-campus vendors multiple times in the preceding year.'),
        takeaway: tx('Never purchase loose antibiotic capsules without a verified prescription. Never discontinue therapy midway just because you feel improved.')
      }
    ],
    checks: [
      {
        q: tx('A student with burning urination purchases 3 tablets of ciprofloxacin from a local chemist vendor "to knock it out fast." Why is this dangerous?'),
        options: [
          tx('Sub-therapeutic underdosing kills off weaker bacteria and selects for resistant mutants that can no longer be cured with fluoroquinolones'),
          tx('Taking 3 tablets causes acute kidney failure within 24 hours'),
          tx('Ciprofloxacin only works if taken with hot tea')
        ],
        answer: 0,
        why: tx('Taking incomplete courses exposes bacteria to sublethal drug concentrations, actively breeding resistant strains without eradicating the infection.')
      },
      {
        q: tx('Under the WHO AWaRe antibiotic framework, what minimum percentage of a country’s total antibiotic consumption should come from the "Access" group?'),
        options: [
          tx('At least 60% of total consumption'),
          tx('At least 25% of total consumption'),
          tx('Exactly 100% (no other groups allowed)')
        ],
        answer: 0,
        why: tx('The WHO stewardship target requires at least 60% of antibiotic use to be Access-group drugs to prevent over-reliance on broad-spectrum Watch and Reserve agents.')
      },
      {
        q: tx('Which molecular mechanism allows a harmless gut bacterium to transfer antibiotic resistance genes directly to a deadly Salmonella strain?'),
        options: [
          tx('Horizontal Gene Transfer (HGT) via conjugative plasmid exchange'),
          tx('Cellular respiration through the mitochondria'),
          tx('Binary fission during rapid freezing')
        ],
        answer: 0,
        why: tx('Horizontal gene transfer enables bacteria of different species to share plasmids carrying multi-drug resistance genes.')
      }
    ],
    references: [
      {
        author: 'Murray CJL, Ikuta KS, Sharara F, et al. (GRAM Project)',
        year: '2022',
        title: 'Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis',
        journal: 'The Lancet, 399(10325): 629-655',
        url: 'https://doi.org/10.1016/S0140-6736(21)02724-0',
        stat: '1.27M direct deaths worldwide; 27.3 attributable deaths/100k in West Africa'
      },
      {
        author: 'Nigeria Centre for Disease Control (NCDC)',
        year: '2024',
        title: "Nigeria's Second National Action Plan on Antimicrobial Resistance (AMR NAP 2.0: 2024–2028)",
        journal: 'Federal Ministry of Health & Social Welfare, Abuja, Nigeria',
        url: 'https://ncdc.gov.ng',
        stat: 'Strategic blueprint uniting human, animal, and environmental AMR governance'
      },
      {
        author: 'World Health Organization (WHO)',
        year: '2023',
        title: 'The WHO AWaRe Antibiotic Book and 2023 AWaRe Classification',
        journal: 'WHO Guidelines Approved by the Guidelines Review Committee, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240062382',
        stat: 'Global benchmark: ≥60% Access group consumption'
      },
      {
        author: 'Auta A, Hadi MA, Oga E, et al.',
        year: '2019',
        title: 'Global access to antibiotics without prescription in community pharmacies and patent medicine stores',
        journal: 'The Lancet Infectious Diseases, 19(4): 391-402',
        url: 'https://doi.org/10.1016/S1473-3099(18)30610-8',
        stat: 'Informal OTC sales drive over 60% of unprescribed antimicrobials in LMICs'
      }
    ]
  },
  {
    id: 'virus',
    tier: 'beginner',
    tierLevel: tx('Level 1: Foundations'),
    tierIcon: '🌱',
    order: 2,
    category: tx('VIRAL PATHOLOGY & DIAGNOSTIC STEWARDSHIP'),
    badge: 'Prokaryote vs Acellular',
    readTime: '3.5 min read',
    title: tx('Viruses & Antibiotic Futility'),
    subtitle: tx('Why antibacterial molecules cannot kill viruses and how misuse disrupts the human microbiome'),
    summary: tx('The molecular mismatch between antibiotics and viral particles, why green nasal mucus is not a sign of bacterial disease, and the long-term harms of antibiotic overuse for colds.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('The Cellular Mismatch: Prokaryote vs Acellular Particle'),
        content: tx('Antibacterial antibiotics function by selectively disrupting metabolic processes and structures unique to prokaryotic bacterial cells. For example, beta-lactams and glycopeptides target cross-linking in the peptidoglycan cell wall; macrolides, aminoglycosides, and tetracyclines bind bacterial 70S ribosomes to halt translation; and fluoroquinolones inhibit bacterial DNA topoisomerase and gyrase.\n\nViruses share none of these targets. A virus is an acellular particle composed strictly of genetic code (RNA or DNA) enclosed within a protein shell (capsid), and occasionally a lipid envelope. Viruses possess no cell walls, no independent ribosomes, and no autonomous metabolic machinery. They replicate exclusively by penetrating host human cells and hijacking our own eukaryotic transcription and translation enzymes. Because an antibiotic has zero biochemical binding affinity for viral proteins or human enzymes, it has absolute zero therapeutic activity against viral infections.'),
        caseStudy: tx('Every year across Nigerian schools, millions of tablets of ampicillin-cloxacillin (Ampiclox) are consumed for viral common colds, influenza, and pharyngitis—providing zero clinical benefit while exposing the user to allergic reactions and drug resistance.'),
        takeaway: tx('Antibiotics target bacterial cell walls, ribosomes, and DNA enzymes. Viruses have none of these; antibiotics can never cure or shorten a viral illness.')
      },
      {
        stepNum: 2,
        heading: tx('Collateral Damage: Decimating the Commensal Microbiome'),
        content: tx('When a patient ingests an antibiotic for a viral illness like the flu or COVID-19, the drug circulates systemically. While completely ineffective against the virus, it causes profound destruction to the trillions of beneficial commensal bacteria inhabiting the gut, respiratory tract, and skin.\n\nThis loss of "colonization resistance" creates an ecological void in the gastrointestinal tract. Opportunistic and toxin-producing pathogens (such as Clostridioides difficile) can proliferate, causing severe pseudomembranous colitis. Furthermore, studies published in Nature and mBio show that even a single 5-day course of broad-spectrum antibiotics (like ciprofloxacin or azithromycin) alters the gut microbial diversity for up to 12 months, fostering an internal reservoir of antibiotic-resistant genes (the "resistome").'),
        caseStudy: tx('University clinic data shows frequent presentations of secondary diarrhea and post-antibiotic fungal candidiasis (thrush) in students who took self-prescribed antibiotics for a 3-day viral cold.'),
        takeaway: tx('Taking an antibiotic for a virus will not cure your cold, but it will decimate your protective gut flora and cultivate resistant bacteria.')
      },
      {
        stepNum: 3,
        heading: tx('The Common Cold Fallacy: Phlegm Color & Fever Myths'),
        content: tx('A widespread misconception in both clinical practice and community folklore is that thick green or yellow nasal discharge indicates a "bacterial infection that requires antibiotics."\n\nIn reality, color change in respiratory mucus is caused by myeloperoxidase, a dark green iron-containing enzyme released by the human immune system’s neutrophils as they engulf viral particles and cellular debris. The appearance of colored phlegm is evidence of an active, healthy host immune response fighting a virus—not bacterial proliferation.\n\nOver 90% of acute bronchitis, colds, and sore throats in previously healthy youths are purely viral and self-limiting. Clinical trials demonstrate that antibiotics do not shorten symptoms by even a single day, while needlessly exposing patients to adverse drug reactions.'),
        caseStudy: tx('Patients demanding antibiotics from community pharmacists in Ogun State often cite "my catarrh turned yellow." Evidence-based education by healthcare workers is essential to de-escalate these inappropriate requests.'),
        takeaway: tx('Colored phlegm is evidence of your immune system working, not a sign of bacterial disease. Rest, hydration, and fever relief are the proven remedies.')
      }
    ],
    checks: [
      {
        q: tx('A student wakes up with nasal congestion, a mild fever, fatigue, and dark yellow mucus. Why should they NOT take an antibiotic?'),
        options: [
          tx('Yellow mucus is caused by host immune neutrophils fighting a viral cold; antibiotics have zero effect on viruses and will harm healthy gut flora'),
          tx('Antibiotics only work when mucus is completely clear and watery'),
          tx('Antibiotics can only be taken if fever lasts for more than 45 days')
        ],
        answer: 0,
        why: tx('Color in nasal mucus reflects neutrophil myeloperoxidase enzymes clearing a viral infection, which antibiotics cannot treat.')
      },
      {
        q: tx('Which bacterial structure is targeted by beta-lactam antibiotics that viruses completely lack?'),
        options: [
          tx('Peptidoglycan cell wall'),
          tx('Capsid protein spikes'),
          tx('Single-stranded viral RNA')
        ],
        answer: 0,
        why: tx('Beta-lactams inhibit peptidoglycan cell wall synthesis in bacteria. Viruses have protein capsids and no peptidoglycan.')
      }
    ],
    references: [
      {
        author: 'Centers for Disease Control and Prevention (CDC)',
        year: '2023',
        title: 'Antibiotic Prescribing and Use in Doctor’s Offices: Common Cold and Runny Nose',
        journal: 'CDC National Center for Emerging and Zoonotic Infectious Diseases',
        url: 'https://www.cdc.gov/antibiotic-use/colds.html',
        stat: 'Antibiotics do not relieve symptoms or accelerate recovery from viral respiratory infections'
      },
      {
        author: 'Zaura E, Brandt BW, Teixeira de Mattos MJ, et al.',
        year: '2015',
        title: 'Same Exposure but Two Radically Different Responses to Antibiotics: Long-term Gut Microbiome Disruption',
        journal: 'mBio, 6(6): e01693-15',
        url: 'https://doi.org/10.1128/mBio.01693-15',
        stat: 'A single course of antibiotics disrupts gut microbiome biodiversity for up to 1 year'
      },
      {
        author: 'World Health Organization (WHO)',
        year: '2022',
        title: 'Diagnostic Stewardship: A guide to implementation in antimicrobial stewardship programs',
        journal: 'WHO Document Production Services, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240058897',
        stat: 'Clinical diagnostic criteria prevent unnecessary empiric antibiotic use in viral syndromes'
      }
    ]
  },
  {
    id: 'fungi',
    tier: 'intermediate',
    tierLevel: tx('Level 2: Clinical Practice'),
    tierIcon: '🩺',
    order: 5,
    category: tx('CLINICAL MYCOLOGY & EMERGING THREATS'),
    badge: 'WHO Critical Priority (FPPL)',
    readTime: '4 min read',
    title: tx('Fungal Pathogens: The Silent Superbug Wave'),
    subtitle: tx('Candida auris, agricultural azole cross-resistance, and the 2022 WHO Fungal Priority Pathogens List'),
    summary: tx('The rising crisis of multidrug-resistant fungal species, hospital persistence, the threat to immunocompromised patients, and how crop fungicides accelerate clinical resistance.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('The Eukaryotic Dilemma: Why Antifungals Are Scarce'),
        content: tx('Fungal organisms are eukaryotes, sharing deep evolutionary homology with human cells. Their cellular machinery—including eukaryotic ribosomes, double-membrane nuclei, mitochondria, and cytoskeletal structures—mirrors our own biology.\n\nBecause fungal cells resemble human host cells so closely, discovering pharmacological compounds that kill the fungus without triggering severe toxicity in the human host is exceptionally difficult. Today, modern clinical medicine depends on only four major systemic antifungal classes: 1) Polyenes (e.g., Amphotericin B, which binds fungal ergosterol but carries high nephrotoxicity); 2) Azoles (e.g., Fluconazole, Voriconazole, which inhibit 14-alpha-demethylase); 3) Echinocandins (e.g., Caspofungin, which inhibit 1,3-beta-glucan cell wall synthesis); and 4) Pyrimidine analogs (Flucytosine). When a fungal pathogen acquires cross-resistance to azoles and echinocandins, clinicians are left with virtually no safe therapeutic options.'),
        caseStudy: tx('In immunocompromised hospital patients (such as oncology, ICU, and surgical wards in Nigeria), invasive candidiasis and cryptococcal meningitis carry mortality rates exceeding 40% when first-line azoles fail to clear the bloodstream.'),
        takeaway: tx('Because fungi share eukaryotic biology with humans, we have only four systemic antifungal drug classes. We cannot afford to lose them to resistance.')
      },
      {
        stepNum: 2,
        heading: tx('Candida auris: The Critical Priority Superbug'),
        content: tx('In October 2022, the World Health Organization published its landmark Fungal Priority Pathogens List (FPPL), classifying Candida auris in its highest tier: the "Critical Priority Group" alongside Cryptococcus neoformans, Aspergillus fumigatus, and Candida albicans.\n\nFirst identified in 2009, Candida auris exhibits alarming traits unprecedented in medical mycology: 1) Over 90% of isolates are resistant to fluconazole, and approximately 30% are multidrug-resistant across two or more antifungal classes; 2) Unlike common yeasts that colonize mucus membranes, C. auris sheds heavily onto human skin, patient bedding, and medical equipment; 3) It produces persistent biofilms that survive quaternary ammonium and common hospital disinfectants, triggering severe nosocomial outbreaks in intensive care units; and 4) Standard hospital diagnostic labs frequently misidentify it as Candida haemulonii, delaying lifesaving isolation protocols.'),
        caseStudy: tx('Hospital outbreaks in tertiary centers worldwide have forced entire ICU wards to undergo complete decontamination with vaporized hydrogen peroxide after C. auris persisted on plastic surfaces and blood pressure cuffs for months.'),
        takeaway: tx('Candida auris is an emerging multidrug-resistant fungal pathogen with high mortality (30% to 60%) and an exceptional capacity to colonize hospital environments.')
      },
      {
        stepNum: 3,
        heading: tx('The Agricultural Pipeline: How Crop Fungicides Drive Human Resistance'),
        content: tx('Antifungal resistance is not bred in hospitals alone. Demethylation inhibitor (DMI) triazole fungicides (such as tebuconazole, difenoconazole, and propiconazole) are applied by the thousands of tons across commercial agriculture to prevent mold on grains, fruits, and timber.\n\nThese agricultural chemicals share identical molecular structures and biochemical targets with clinical azoles used in human medicine (fluconazole and voriconazole). When ubiquitous environmental molds such as Aspergillus fumigatus encounter sublethal fungicide concentrations in farmland soil and compost heaps, they develop the tandem-repeat TR34/L98H mutation in the cyp51A gene.\n\nWhen immunocompromised individuals, asthma patients, or post-TB patients inhale these airborne resistant spores, they develop invasive aspergillosis that is already completely immune to hospital azole therapy before the patient has ever received a single dose of medicine.'),
        caseStudy: tx('In agricultural belts across developing nations, patients with no prior history of antifungal drug use are increasingly diagnosed with primary azole-resistant Aspergillus lung infections acquired directly from airborne farming environments.'),
        takeaway: tx('The One Health continuum links crop protection to human survival. Indiscriminate agricultural fungicide use directly destroys the efficacy of hospital antifungals.')
      }
    ],
    checks: [
      {
        q: tx('Under the 2022 World Health Organization Fungal Priority Pathogens List (FPPL), which tier is Candida auris classified under?'),
        options: [
          tx('Critical Priority Group'),
          tx('Low Priority / Benign Group'),
          tx('Experimental Tier')
        ],
        answer: 0,
        why: tx('Candida auris is placed in the Critical Priority tier due to multidrug resistance, environmental persistence, and high ICU mortality.')
      },
      {
        q: tx('How does widespread spraying of triazole fungicides on commercial agricultural crops lead to treatment failure in human hospital patients?'),
        options: [
          tx('Airborne environmental molds exposed to crop fungicides develop cyp51A resistance mutations that render clinical human azole drugs useless'),
          tx('Crop fungicides turn into human viruses when inhaled'),
          tx('Fungicides make agricultural soil too warm for plants')
        ],
        answer: 0,
        why: tx('Agricultural triazoles share the same molecular targets as human azoles; environmental exposure breeds resistant Aspergillus spores that infect human lungs.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2022',
        title: 'WHO fungal priority pathogens list to guide research, development and public health action',
        journal: 'WHO Department of Antimicrobial Resistance, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240060241',
        stat: 'First global ranking designating C. auris and A. fumigatus as Critical Priority threats'
      },
      {
        author: 'Centers for Disease Control and Prevention (CDC)',
        year: '2024',
        title: 'General Information about Candida auris and Healthcare Infection Control',
        journal: 'CDC Mycotic Diseases Branch, Atlanta, GA',
        url: 'https://www.cdc.gov/fungal/candida-auris/index.html',
        stat: 'High-level persistence on hospital surfaces with up to 60% mortality in invasive candidemia'
      },
      {
        author: 'Fisher MC, Alastruey-Izquierdo A, Berman J, et al.',
        year: '2022',
        title: 'Threats posed by the fungal kingdom to human health and food security',
        journal: 'Nature Reviews Microbiology, 20(8): 457–471',
        url: 'https://doi.org/10.1038/s41579-022-00720-1',
        stat: 'Dual impact of antifungal resistance on global food security and immunocompromised humans'
      }
    ]
  },
  {
    id: 'parasites',
    tier: 'intermediate',
    tierLevel: tx('Level 2: Clinical Practice'),
    tierIcon: '🩺',
    order: 4,
    category: tx('PARASITOLOGY & MALARIA CONTROL'),
    badge: 'PfKelch13 & RDT Protocol',
    readTime: '4 min read',
    title: tx('Parasitic Resistance: Safeguarding Malaria Therapy'),
    subtitle: tx('Plasmodium falciparum evolution, artemisinin partial resistance, and the mandatory RDT stewardship protocol'),
    summary: tx('The historical tragedy of chloroquine failure, emerging kelch13 mutations in Africa, and why diagnostic confirmation before taking ACTs is essential for child survival.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('Historical Cautionary Tale: The Catastrophic Loss of Chloroquine'),
        content: tx('In the mid-20th century, chloroquine was hailed as the definitive global cure for malaria. It was cheap, stable, and administered indiscriminately across endemic regions as monotherapy, even mixed into table salt. By the 1960s, selection pressure drove mutations in the Plasmodium falciparum chloroquine resistance transporter gene (pfcrt) on chromosome 7, enabling the parasite to pump chloroquine away from its digestive vacuole.\n\nAs chloroquine resistance swept across sub-Saharan Africa during the 1970s and 1980s, treatment failure rates soared past 70%. The loss of this single drug triggered a catastrophic doubling of malaria-attributable child mortality across the continent. To prevent history from repeating with modern medications, the global health community instituted Artemisinin-based Combination Therapies (ACTs). ACTs pair a rapid-killing, short-half-life artemisinin derivative (e.g., artemether or artesunate) with a slower-clearing partner drug (e.g., lumefantrine or amodiaquine) to destroy residual parasites and protect both chemical compounds from resistance selection.'),
        caseStudy: tx('The generation of physicians trained in Nigeria in the 1980s witnessed firsthand the deadly impact of chloroquine resistance, where previously straightforward fever cases turned into fatal cerebral malaria within 48 hours.'),
        takeaway: tx('Monotherapy and indiscriminate treatment destroyed chloroquine and doubled child malaria deaths. ACT combination stewardship is our primary barrier against repeat devastation.')
      },
      {
        stepNum: 2,
        heading: tx('The Looming Threat: Artemisinin Partial Resistance & PfKelch13'),
        content: tx('Artemisinin partial resistance—defined clinically as delayed parasite clearance following ACT therapy—is primarily driven by single nucleotide polymorphisms (SNPs) in the propeller domain of the Plasmodium falciparum kelch13 (pfk13) gene. When parasites possess validated kelch13 mutations, initial artemisinin dosing fails to clear parasites within the standard 3-day therapeutic window, shifting the entire therapeutic burden onto the partner drug and rapidly accelerating partner drug failure.\n\nValidated pfk13 resistance mutations (such as R561H, A675V, and C580Y) have established footholds in East and Central Africa (Rwanda, Uganda, Tanzania, and the Horn of Africa). In Nigeria, extensive molecular surveillance across southwestern, north-central, and northern states confirms that validated WHO resistance markers remain largely absent, and first-line ACTs retain high clinical cure rates. However, with Nigeria accounting for over 27% of the global malaria case burden, the arrival or independent emergence of resistant strains poses an unprecedented health security risk.'),
        caseStudy: tx('Continuous molecular tracking conducted by the National Malaria Elimination Programme (NMEP) and research institutes in Nigeria monitors the pfk13 gene in sentinel sites to catch any emergent resistance signals early.'),
        takeaway: tx('Artemisinin partial resistance is expanding in Africa. Nigeria’s ACTs still work effectively, but improper stewardship will accelerate the spread of resistant strains.')
      },
      {
        stepNum: 3,
        heading: tx('Diagnostic Stewardship: "Test Before You Treat" with RDTs'),
        content: tx('In Nigeria, every fever is colloquially attributed to "malaria." Surveys indicate that more than 60% of people who take antimalarials in community settings test negative for Plasmodium falciparum upon blood examination. Taking an ACT for non-malarial fevers (which are often self-limiting viral infections or other ailments) squanders scarce medical resources and exposes parasites to drug selection pressure without clinical justification.\n\nNigeria’s National Guidelines for Diagnosis and Treatment of Malaria mandate: Every suspected malaria case must be confirmed with a parasitological diagnostic test—either a Rapid Diagnostic Test (RDT) or quality-assured microscopy—before initiating treatment.\n\nIf the RDT is POSITIVE: The patient must complete the full 3-day (6-dose) course of ACT. Doses should be taken with fatty food or milk to optimize gastrointestinal absorption. Stopping therapy on Day 2 when fever subsides leaves surviving parasites exposed to declining drug levels, breeding resistant strains.\n\nIf the RDT is NEGATIVE: Do NOT prescribe or ingest an antimalarial. Investigate alternative etiologies with a healthcare provider.'),
        caseStudy: tx('Implementation of subsidized mRDTs in patent medicine stores across Ogun State has demonstrated that when vendors test first, inappropriate ACT dispensing drops by more than 50%, reserving treatments for true clinical cases.'),
        takeaway: tx('Never take an antimalarial without a confirmed positive RDT. When positive, always complete all 6 doses across all 3 days.')
      }
    ],
    checks: [
      {
        q: tx('A university student feels feverish and fatigued during exams. What is the mandatory clinical protocol before taking an Artemisinin Combination Therapy (ACT)?'),
        options: [
          tx('Perform a Rapid Diagnostic Test (RDT) or microscopy to confirm the presence of Plasmodium parasites before taking any medication'),
          tx('Take a double dose of ACT immediately and skip the test'),
          tx('Drink hot water and avoid testing to save money')
        ],
        answer: 0,
        why: tx('Over 60% of presumptive fevers are not malaria. National guidelines require parasitological confirmation via RDT before ACT administration.')
      },
      {
        q: tx('Which Plasmodium falciparum gene is monitored across Africa as the definitive molecular marker for artemisinin partial resistance?'),
        options: [
          tx('The kelch13 (pfk13) propeller domain gene'),
          tx('The insulin growth factor receptor gene'),
          tx('The bacterial 16S rRNA gene')
        ],
        answer: 0,
        why: tx('Mutations in the propeller domain of the pfk13 gene cause delayed parasite clearance and indicate artemisinin partial resistance.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2023',
        title: 'World Malaria Report 2023 & Strategy to Respond to Antimalarial Drug Resistance in Africa',
        journal: 'Global Malaria Programme, Geneva',
        url: 'https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2023',
        stat: 'Nigeria accounts for ~27% of global malaria burden; ACT efficacy must be guarded'
      },
      {
        author: 'Federal Ministry of Health, Nigeria (FMOH / NMEP)',
        year: '2021',
        title: 'National Guidelines for Diagnosis and Treatment of Malaria (6th Edition)',
        journal: 'National Malaria Elimination Programme, Abuja, Nigeria',
        url: 'https://nmep.gov.ng',
        stat: 'Mandatory RDT / microscopy testing prior to artemisinin-based combination therapy'
      },
      {
        author: 'Uwimana A, Legrand E, Stokes BH, et al.',
        year: '2020',
        title: 'Emergence and clonal expansion of in vitro artemisinin-resistant Plasmodium falciparum kelch13 R561H mutant parasites in Rwanda',
        journal: 'Nature Medicine, 26(10): 1602–1608',
        url: 'https://doi.org/10.1038/s41591-020-1005-2',
        stat: 'Clinical proof of independent artemisinin partial resistance mutations emerging within Africa'
      }
    ]
  },
  {
    id: 'human-spread',
    tier: 'beginner',
    tierLevel: tx('Level 1: Foundations'),
    tierIcon: '🌱',
    order: 3,
    category: tx('INFECTION PREVENTION & CONTROL (IPC)'),
    badge: 'ESKAPE Pathogens & Hygiene',
    readTime: '3.5 min read',
    title: tx('Transmission Vectors & Infection Control'),
    subtitle: tx('Interrupting the transmission chain of ESKAPE pathogens through institutional hygiene and community action'),
    summary: tx('How multidrug-resistant bacteria colonize hospital wards and shared student environments, the ESKAPE pathogen threat, and why infection prevention is the ultimate antibiotic.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('The ESKAPE Superbugs: Nosocomial Threats'),
        content: tx('The world’s most dangerous multidrug-resistant bacterial pathogens are designated by the clinical acronym ESKAPE:\n\n• E — Enterococcus faecium (Vancomycin-Resistant Enterococcus / VRE)\n• S — Staphylococcus aureus (Methicillin-Resistant S. aureus / MRSA)\n• K — Klebsiella pneumoniae (Extended-Spectrum Beta-Lactamase / Carbapenem-Resistant)\n• A — Acinetobacter baumannii (Carbapenem-Resistant CRAB)\n• P — Pseudomonas aeruginosa (Multidrug-Resistant MDR-PA)\n• E — Enterobacter species\n\nThese organisms are capable of "escaping" conventional antimicrobial therapies. In healthcare settings and university hostels, ESKAPE bacteria form dense protective biofilms on non-living surfaces—such as door handles, bedside lockers, tap heads, smartphone screens, and intravenous catheters—allowing them to survive in a desiccation-resistant state for weeks.'),
        caseStudy: tx('Surveillance in Nigerian secondary and tertiary hospitals highlights that intensive care units frequently harbor biofilm-forming Klebsiella and Pseudomonas on shared suction apparatus and monitoring monitors, driving secondary hospital-acquired infections.'),
        takeaway: tx('ESKAPE superbugs resist standard antibiotics and produce biofilms on surfaces that allow them to persist for weeks.')
      },
      {
        stepNum: 2,
        heading: tx('Hands as the Primary Vector: The 5 Moments of Hand Hygiene'),
        content: tx('More than 80% of all hospital- and community-acquired resistant bacterial infections are transmitted directly via human hands. A contaminated hand touching a common tap, a doorknob, or an open wound immediately seeds millions of bacterial colonies.\n\nProper hand hygiene interrupts this chain of transmission instantaneously. Thorough washing with clean running water and soap for 20 to 30 seconds mechanically removes microbes and emulsifies the lipid membranes of enveloped pathogens. Where running water is unavailable, applying an alcohol-based hand rub (ABHR with ≥70% ethanol or isopropanol) denatures microbial proteins within 15 seconds.\n\nThe WHO "5 Moments for Hand Hygiene" protocol (before touching a patient, before clean/aseptic procedures, after body fluid exposure risk, after touching a patient, and after touching patient surroundings) remains the single most cost-effective medical intervention in human history.'),
        caseStudy: tx('Hand hygiene compliance audits in healthcare facilities in Ogun State showed that installing locally produced WHO-formulation alcohol rub dispensers at patient bedsides reduced surgical site infection rates by over 35%.'),
        takeaway: tx('Friction handwashing with soap and clean water or ≥70% alcohol rub is our most effective physical barrier against spreading superbugs.')
      },
      {
        stepNum: 3,
        heading: tx('Infection Prevention as the Ultimate Stewardship Strategy'),
        content: tx('The most powerful and infallible antibiotic on earth is the infection that never happens. When an individual avoids contracting an infectious disease, the requirement for an antimicrobial prescription drops to absolute zero, eliminating any selective pressure for resistant mutations.\n\nUniversal infection prevention operates across three foundational pillars:\n1) Routine Immunization: Vaccines such as the Pneumococcal Conjugate Vaccine (PCV), Haemophilus influenzae type b (Hib), and the newly introduced Typhoid Conjugate Vaccine (TCV) prevent primary bacterial infections and eradicate the fevers that trigger unprescribed antibiotic misuse.\n2) Water, Sanitation, and Hygiene (WASH): Safe piped drinking water and dedicated sanitary sewage disposal eliminate the fecal-oral transmission of multidrug-resistant Salmonella, Shigella, and pathogenic E. coli.\n3) Barrier Precautions: Sterile wound dressings, safe injection practices, and isolation of patients carrying resistant superbugs prevent outbreaks before they start.'),
        caseStudy: tx('Global modeling published in The Lancet indicates that achieving universal WASH and vaccination coverage in low- and middle-income nations would avert over 750,000 AMR-related deaths annually.'),
        takeaway: tx('Vaccines and clean water save more lives from AMR than new drugs ever could. Preventing infection eliminates the need for antibiotics altogether.')
      }
    ],
    checks: [
      {
        q: tx('Why do public health authorities describe routine childhood vaccinations (like Pneumococcal and Typhoid vaccines) as premier tools against AMR?'),
        options: [
          tx('Preventing bacterial illnesses eliminates infections at the source, reducing the need for antibiotic prescriptions and stopping selection pressure'),
          tx('Vaccines contain concentrated liquid antibiotics that kill superbugs'),
          tx('Vaccines genetically modify bacteria into harmless plants')
        ],
        answer: 0,
        why: tx('An infection prevented requires zero antibiotics. Vaccines directly slash antibiotic consumption and eliminate the opportunity for resistance mutations.')
      },
      {
        q: tx('What is the primary physical vehicle responsible for transmitting multidrug-resistant ESKAPE pathogens across healthcare wards and student dormitories?'),
        options: [
          tx('Contaminated hands touching shared equipment, door handles, and surfaces'),
          tx('Mosquito bites carrying hospital bacteria'),
          tx('Solar ultraviolet radiation')
        ],
        answer: 0,
        why: tx('Over 80% of healthcare and institutional cross-infections are spread via unwashed or inadequately sanitized hands.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2022',
        title: 'Global Report on Infection Prevention and Control (IPC)',
        journal: 'Infection Prevention and Control Global Unit, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240051164',
        stat: 'Proper hand hygiene and IPC protocols reduce healthcare-associated infections by up to 70%'
      },
      {
        author: 'Rice LB',
        year: '2008',
        title: 'Federal funding for the study of antimicrobial resistance in nosocomial pathogens: No ESKAPE',
        journal: 'The Journal of Infectious Diseases, 197(8): 1079–1081',
        url: 'https://doi.org/10.1086/533452',
        stat: 'Foundational framework identifying the ESKAPE group of multi-drug resistant superbugs'
      },
      {
        author: 'Nigeria Centre for Disease Control (NCDC)',
        year: '2023',
        title: 'Orange Network: National Infection Prevention and Control Programme in Healthcare Facilities',
        journal: 'NCDC Division of IPC, Abuja, Nigeria',
        url: 'https://ncdc.gov.ng',
        stat: 'Dedicated nationwide network standardizing hand hygiene, WASH, and surveillance in Nigerian hospitals'
      }
    ]
  },
  {
    id: 'one-health',
    tier: 'advanced',
    tierLevel: tx('Level 3: One Health & Policy'),
    tierIcon: '🌍',
    order: 6,
    category: tx('ONE HEALTH & AGRO-ENVIRONMENTAL STEWARDSHIP'),
    badge: 'mcr-1 Colistin & Ogun Farms',
    readTime: '4.5 min read',
    title: tx('One Health: Farms, Food & Environment'),
    subtitle: tx('Poultry prophylaxis in Southwestern Nigeria, the mcr-1 colistin crisis, and environmental runoff'),
    summary: tx('The agricultural drivers of AMR in Southwestern Nigeria, veterinary antibiotic misuse, mobile colistin resistance, and how the One Health framework unites human, animal, and environmental defense.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('The Triad: Human, Animal, and Environmental Interconnection'),
        content: tx('Antimicrobial resistance does not respect jurisdictional borders or biological species boundaries. Globally, over 70% of all medically important antibiotics produced each year are consumed not by human patients, but within commercial animal agriculture—predominantly poultry, swine, cattle, and aquaculture.\n\nThe One Health approach acknowledges that human health, animal health, and environmental integrity are inseparable. Antibiotics administered to livestock select for resistant strains in the animal gut. These superbugs and residual unmetabolized antibiotic chemicals are excreted in manure, contaminating soils, surface streams, and groundwater. They subsequently re-enter human populations via the food supply, farm workers, and municipal drinking water.'),
        caseStudy: tx('Southwestern Nigeria (particularly Ogun State and Oyo State) forms the commercial poultry epicentre of the nation, where intensive poultry housing and proximity to urban centers create a high-density interface between animals, humans, and waterways.'),
        takeaway: tx('Over 70% of global antimicrobials are used in livestock. What happens in animal farming directly impacts our ability to treat human infections.')
      },
      {
        stepNum: 2,
        heading: tx('The Colistin Crisis: Destroying a Human Last-Resort Drug in Poultry'),
        content: tx('In human clinical medicine, colistin (polymyxin E) is classified by the WHO as a "Highest Priority Critically Important Antimicrobial" and a Reserve antibiotic of last resort. In hospital intensive care units, colistin is the final pharmacological safety net used to treat patients dying of carbapenem-resistant Gram-negative septicemia and pneumonia.\n\nYet in intensive commercial poultry farming in Ogun State and other agricultural hubs, studies have documented widespread, unregulated administration of colistin. It is routinely purchased over-the-counter in soluble powder formulations and administered in bulk drinking water to entire flocks of healthy chicks for routine prophylaxis (disease prevention) and growth promotion.\n\nThis continuous, sub-therapeutic exposure in poultry intestines selected for the plasmid-mediated mobilized colistin resistance gene (mcr-1). Because mcr-1 is carried on mobile conjugative plasmids rather than fixed chromosomes, it transfers freely between bacterial species—moving from avian E. coli directly into human-colonizing Enterobacterales. When a patient contracts an mcr-1 carrying infection that is also resistant to carbapenems, the infection becomes untreatable (pan-drug resistant), resulting in fatal outcomes.'),
        caseStudy: tx('Surveillance studies in poultry farms and live bird markets across Ogun State (Abeokuta, Sagamu, and Ijebu) have isolated multidrug-resistant E. coli and Salmonella strains carrying mobile resistance markers, demonstrating that prophylactic antibiotic use drastically increases the prevalence of superbug reservoirs.'),
        takeaway: tx('Administering last-resort human antibiotics like colistin to farm animals breeds the mobile mcr-1 gene, leaving human patients with zero treatment options.')
      },
      {
        stepNum: 3,
        heading: tx('Environmental Runoff: Aquatic Reservoirs & Food Contamination'),
        content: tx('Between 75% and 90% of antibiotics administered to poultry and livestock are excreted unmetabolized in urine and feces. In Southwestern Nigeria, poultry manure is routinely harvested and used directly as uncomposted organic fertilizer on vegetable farms or dumped into waterways.\n\nFurthermore, integrated farming systems (such as poultry-fish farms where battery cages are suspended directly over commercial catfish and tilapia ponds) expose aquatic microbial ecosystems to heavy antibiotic residues. Rivers such as the Ogun River and adjacent drainage basins receive continuous runoff carrying active antibiotic molecules, resistant bacteria, and naked resistance plasmids.\n\nThese water bodies serve as evolutionary incubators where ambient aquatic bacteria exchange resistance cassettes under constant antibiotic pressure. Resistant pathogens subsequently contaminate irrigation water for raw salad vegetables (cabbage, carrots, tomatoes), municipal boreholes, and commercial fish, re-entering the human food chain without the patient ever having visited a hospital or farm.'),
        caseStudy: tx('Microbiological testing of borehole water and fresh market produce in peri-urban Ogun and Lagos has confirmed the presence of extended-spectrum beta-lactamase (ESBL) producing bacteria sharing identical genetic profiles to poultry farm isolates.'),
        takeaway: tx('Antibiotics excreted by farm animals leach into rivers and crops, turning our water and food supplies into vectors for drug-resistant superbugs.')
      },
      {
        stepNum: 4,
        heading: tx('The Policy & Community Roadmap: Nigeria AMR NAP 2.0 (2024–2028)'),
        content: tx('In October 2024, the Nigeria Centre for Disease Control (NCDC), in partnership with the Federal Ministry of Agriculture and Food Security and the Federal Ministry of Environment, launched Nigeria\'s Second National Action Plan on Antimicrobial Resistance (AMR NAP 2.0: 2024–2028).\n\nBuilt squarely upon the One Health framework, NAP 2.0 mandates:\n1) Regulatory Prohibition: Banning the use of critically important human antibiotics (specifically colistin and fluoroquinolones) as animal growth promoters or routine prophylactic agents.\n2) Veterinary Prescription Gatekeeping: Enforcing strict veterinary prescription requirements at agrochemical stores and commercial feed mills.\n3) Farm Biosecurity Upgrades: Providing technical training for Nigerian poultry and livestock farmers on modern biosecurity—adequate ventilation, low flock density, clean water lines, and comprehensive flock vaccination (such as Gumboro and Newcastle disease vaccines)—enabling farmers to maintain high animal yields without relying on antibiotic crutches.\n4) Integrated Surveillance: Establishing synchronized sentinel testing across human hospitals, veterinary clinics, abattoirs, and environmental water bodies.'),
        caseStudy: tx('Student-led AMR clubs at universities like Babcock University serve as pivotal community ambassadors, educating local agricultural communities, poultry farmers, and chemistry vendors on the One Health stewardship principles outlined in NAP 2.0.'),
        takeaway: tx('Securing our medical future requires collaborative action across human clinics, livestock farms, and environmental management.')
      }
    ],
    checks: [
      {
        q: tx('A commercial poultry farmer in Ogun State adds colistin soluble powder to the daily drinking water of healthy chicks to prevent disease. Why is this perilous for human medicine?'),
        options: [
          tx('Colistin is a human antibiotic of last resort; animal prophylaxis breeds the mobile mcr-1 resistance gene, rendering life-threatening human infections untreatable'),
          tx('Colistin makes chickens grow feathers too quickly to harvest'),
          tx('Chickens become completely immune to all future veterinary vaccines')
        ],
        answer: 0,
        why: tx('Colistin is a last-resort drug for multidrug-resistant human infections. Prophylactic veterinary use breeds the plasmid-borne mcr-1 resistance gene.')
      },
      {
        q: tx('Approximately what percentage of antibiotics administered to agricultural livestock is excreted unmetabolized into animal feces, soil, and wastewater?'),
        options: [
          tx('Between 75% and 90%'),
          tx('Less than 2%'),
          tx('Exactly 50%')
        ],
        answer: 0,
        why: tx('The vast majority (75%–90%) of veterinary antibiotics are excreted unmetabolized, contaminating soils, rivers, and groundwater.')
      },
      {
        q: tx('Which multi-sectoral strategy was launched by NCDC and the Ministries of Health, Agriculture, and Environment in October 2024 to combat AMR across Nigeria?'),
        options: [
          tx('Nigeria Second National Action Plan on Antimicrobial Resistance (AMR NAP 2.0: 2024–2028)'),
          tx('The National Petrochemical Initiative'),
          tx('The Agro-Deforestation Program')
        ],
        answer: 0,
        why: tx('AMR NAP 2.0 was officially launched in October 2024 to unite human, animal, and environmental AMR governance.')
      }
    ],
    references: [
      {
        author: 'Nigeria Centre for Disease Control (NCDC) & Federal Ministry of Agriculture',
        year: '2024',
        title: "Nigeria's Second National Action Plan on Antimicrobial Resistance (AMR NAP 2.0: 2024–2028)",
        journal: 'One Health Multisectoral Strategic Blueprint, Abuja, Nigeria',
        url: 'https://ncdc.gov.ng',
        stat: 'National policy phasing out HPCIAM antibiotics as veterinary growth promoters'
      },
      {
        author: 'Liu YY, Wang Y, Walsh TR, et al.',
        year: '2016',
        title: 'Emergence of plasmid-mediated colistin resistance mechanism MCR-1 in animals and human beings: a microbiological and molecular biological study',
        journal: 'The Lancet Infectious Diseases, 16(2): 161–168',
        url: 'https://doi.org/10.1016/S1473-3099(15)00424-7',
        stat: 'Discovery of the mobile mcr-1 colistin resistance gene originating in livestock'
      },
      {
        author: 'Founou LL, Founou RC, Allam M, et al.',
        year: '2021',
        title: 'Antibiotic use and resistance in poultry farms and live bird markets in Ogun State, Nigeria: A One Health approach',
        journal: 'Frontiers in Public Health, 9: 647908',
        url: 'https://doi.org/10.3389/fpubh.2021.647908',
        stat: 'High-level multi-drug resistance documented in commercial poultry chains in Ogun State'
      },
      {
        author: 'Quadripartite (FAO, UNEP, WHO, WOAH)',
        year: '2022',
        title: 'One Health Joint Plan of Action (2022–2026): Working together for the health of humans, animals, plants and the environment',
        journal: 'United Nations Quadripartite Collaboration, Rome, Italy',
        url: 'https://www.who.int/publications/i/item/9789240059382',
        stat: 'Global framework integrating environmental runoff, veterinary use, and clinical stewardship'
      }
    ]
  },
  {
    id: 'systems-quality',
    tier: 'advanced',
    tierLevel: tx('Level 3: One Health & Policy'),
    tierIcon: '🌍',
    order: 7,
    category: tx('DRUG QUALITY, R&D PIPELINE & SAFE DISPOSAL'),
    badge: 'WHO Pipeline & NAFDAC MAS',
    readTime: '4.5 min read',
    title: tx('Fake Drugs, The Empty Pipeline & Modern Medicine'),
    subtitle: tx('Substandard antimicrobials (NAFDAC MAS), the 4-drug innovation gap, surgical dependency, and safe disposal'),
    summary: tx('Why counterfeit and degraded medicines breed resistance even in compliant patients, why Big Pharma stopped inventing new antibiotics, how surgery and chemo depend on them, and how to dispose of leftovers safely.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('Substandard & Falsified (SF) Antimicrobials: The Hidden Resistance Engine'),
        content: tx('Even when a patient sees a qualified doctor and completes every single dose on schedule, poor drug quality can still trigger antimicrobial resistance. Substandard medicines are genuine drugs that have degraded due to heat, humidity, or poor manufacturing—often containing only 30% to 50% of their stated active pharmaceutical ingredient (API). Falsified medicines are deliberate counterfeits containing chalk, starch, or minimal active drug.\n\nWhen a patient ingests a degraded or falsified antibiotic, blood concentrations never reach the lethal threshold required to eradicate the pathogen. Instead, the bacteria are bathed in a sub-therapeutic dose that kills only the weakest cells while selectively breeding drug-resistant survivors.\n\nTo combat this in Nigeria, the National Agency for Food and Drug Administration and Control (NAFDAC) mandates the Mobile Authentication Service (MAS) on antibiotics and antimalarials. Consumers scratch a silver panel on the pack and text the unique PIN via toll-free SMS to verify authenticity in seconds before taking the first dose.'),
        caseStudy: tx('Open-air drug markets across Nigeria frequently expose heat-sensitive beta-lactams and ACT antimalarials to temperatures above 35°C, rapidly degrading active ingredients even in legitimate blister packs.'),
        takeaway: tx('Always buy antimicrobials from licensed pharmacies with cool storage, and verify NAFDAC MAS scratch-code PINs via SMS before swallowing the first tablet.')
      },
      {
        stepNum: 2,
        heading: tx('The Empty Pipeline: Why Almost No New Antibiotics Are Being Invented'),
        content: tx('Many people assume scientists will simply invent replacement antibiotics whenever superbugs emerge. In reality, we face a severe multi-decade discovery void.\n\nAccording to the World Health Organization (WHO) 2023/2024 Antibacterial Pipeline Report, out of 97 clinical candidates (57 traditional antibiotics and 40 non-traditional agents), only 12 traditional drugs are genuinely innovative—and only 4 of those 12 show activity against at least one WHO "Critical Priority" pathogen (such as carbapenem-resistant Gram-negative bacteria). Between July 2017 and December 2023, only 13 new antibiotics gained approval, and just 2 belonged to a genuinely new chemical class.\n\nThe root cause is market failure: lifelong drugs for hypertension or diabetes generate billions for pharmaceutical companies, whereas a novel antibiotic is taken for only 5–7 days and immediately locked away by hospitals as a "Reserve" last-resort drug to slow resistance.'),
        caseStudy: tx('Several small biotech firms that successfully brought novel Gram-negative antibiotics to market in the past decade still went bankrupt due to low sales volumes—proving we cannot rely on new inventions to save us from misuse today.'),
        takeaway: tx('Only 4 innovative drugs in the global clinical pipeline target Critical Priority superbugs. Preserving our existing antibiotics is our only realistic defense.')
      },
      {
        stepNum: 3,
        heading: tx('Modern Medicine’s Invisible Safety Net: Surgery, Chemo & MDR-TB'),
        content: tx('Effective antibiotics are the silent foundation of almost every branch of modern medicine. Without reliable prophylactic and therapeutic antibiotics:\n\n• Routine surgeries—including Caesarean sections (C-sections), appendectomies, hip replacements, and organ transplants—carry a high risk of fatal post-operative sepsis.\n• Cancer chemotherapy and dialysis suppress the patient’s white blood cells, leaving them completely dependent on effective antibiotics to survive routine bacterial exposures.\n\nMeanwhile, major high-burden pathogens are already slipping out of reach: Multidrug-Resistant Tuberculosis (MDR-TB, resistant to rifampicin and isoniazid) turns a curable lung infection into 6–18 months of costly, toxic therapy, and extensively drug-resistant Neisseria gonorrhoeae ("super-gonorrhea") is rapidly losing susceptibility to ceftriaxone.'),
        caseStudy: tx('Nigeria carries one of the highest tuberculosis burdens in Africa; incomplete TB regimens and unmonitored antibiotic sales directly fuel rifampicin-resistant TB transmission in crowded urban centers.'),
        takeaway: tx('Losing antibiotics does not just make sore throats dangerous—it makes childbirth, cancer treatment, and routine surgery life-threatening.')
      },
      {
        stepNum: 4,
        heading: tx('The Diagnostic Gap & Safe Disposal of Leftover Drugs'),
        content: tx('Why do clinicians frequently prescribe broad-spectrum "Watch" drugs like ceftriaxone? Often it is due to the diagnostic gap: standard Culture and Antimicrobial Susceptibility Testing (AST) takes 48–72 hours and adds out-of-pocket laboratory costs, forcing doctors to start blind "empiric therapy" instead of reading a local hospital antibiogram.\n\nFinally, stewardship extends to what happens when a prescription ends. You must NEVER flush leftover or expired antibiotics down a toilet or toss them into open campus waste. Sewage systems cannot filter out antibiotic molecules, so flushed pills leach straight into rivers and groundwater—continuously training environmental bacteria to evolve resistance genes. Unused or expired medicines should be returned to a licensed pharmacy or hospital take-back bin for high-temperature incineration.'),
        caseStudy: tx('Hospital stewardship programs that publish quarterly unit-specific antibiograms allow doctors to pick narrower, Access-group drugs on Day 1 without waiting 72 hours for lab cultures.'),
        takeaway: tx('Support lab-guided diagnosis (antibiograms) where available, and never flush expired or leftover antibiotics into drains or open trash.')
      }
    ],
    checks: [
      {
        q: tx('How does taking a degraded or falsified (substandard) antibiotic breed antimicrobial resistance even if the patient completes the entire pack?'),
        options: [
          tx('Under-dosed or degraded pills deliver sub-therapeutic drug levels that fail to kill the pathogen and selectively breed resistant survivors'),
          tx('Fake pills dissolve into extra white blood cells in the stomach'),
          tx('Substandard pills only affect viruses, never bacteria')
        ],
        answer: 0,
        why: tx('Sub-therapeutic active ingredient levels fail to reach the lethal concentration needed to clear the infection, allowing partially resistant microbes to survive and multiply.')
      },
      {
        q: tx('According to the WHO 2023/2024 Antibacterial Pipeline Report, how many genuinely innovative traditional antibiotics in clinical trials target at least one WHO Critical Priority pathogen?'),
        options: [
          tx('Only 4 drugs'),
          tx('Over 250 drugs'),
          tx('Exactly 97 drugs')
        ],
        answer: 0,
        why: tx('Out of 97 total clinical agents, only 12 traditional candidates are innovative, and only 4 are active against at least one WHO Critical Priority pathogen.')
      },
      {
        q: tx('What is the safest way to dispose of expired or leftover antibiotic tablets?'),
        options: [
          tx('Return them to a licensed pharmacy or hospital take-back point for safe disposal—never flush them down the toilet'),
          tx('Flush them down the toilet so nobody finds them'),
          tx('Save them in a drawer to share with roommates next semester')
        ],
        answer: 0,
        why: tx('Flushed antibiotics enter sewage and waterways where they select for environmental resistance genes; pharmacy take-back ensures safe destruction.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2024',
        title: '2023 Antibacterial agents in clinical and preclinical development: an overview and analysis',
        journal: 'WHO Department of Antimicrobial Resistance, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240094000',
        stat: 'Only 12 innovative traditional antibiotics in clinical trials; only 4 target Critical Priority pathogens'
      },
      {
        author: 'National Agency for Food and Drug Administration and Control (NAFDAC)',
        year: '2023',
        title: 'Mobile Authentication Service (MAS) Scheme for Antibiotics and Antimalarials',
        journal: 'NAFDAC Pharmacovigilance & Post-Marketing Surveillance, Abuja, Nigeria',
        url: 'https://nafdac.gov.ng',
        stat: 'Mandated scratch-panel SMS PIN verification to combat substandard and falsified antimicrobials'
      },
      {
        author: 'World Health Organization (WHO)',
        year: '2018',
        title: 'Global Surveillance and Monitoring System for Substandard and Falsified Medical Products',
        journal: 'WHO Essential Medicines & Health Products, Geneva',
        url: 'https://www.who.int/publications/i/item/9789241513425',
        stat: 'Antimalarials and antibiotics are among the most frequently falsified essential medicines in LMICs'
      }
    ]
  }
]
