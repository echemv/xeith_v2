import { tx } from '../i18n'

/**
 * Layperson-friendly, progressive AMR curriculum.
 * Starts from foundational concepts (what microbes and pathogens are, what AMR means in everyday life),
 * then introduces the 4 main pathogen families (Bacteria, Viruses, Fungi, Parasites),
 * and gradually builds up to infection prevention, One Health (farms/food/water), and drug quality/disposal.
 */
export const TIERS = [
  {
    id: 'beginner',
    level: 1,
    title: tx('The Basics: Microbes, Germs & What AMR Means'),
    subtitle: tx('Start here! Learn what microbes and pathogens are, how germ-fighting medicines work, and what happens when germs become resistant.'),
    badge: tx('Beginner Explorer'),
    icon: '🌱',
    color: '#176B65',
    moduleIds: ['intro-pathogens', 'what-is-amr']
  },
  {
    id: 'intermediate',
    level: 2,
    title: tx('Meet the 4 Germs: Bacteria, Viruses, Fungi & Parasites'),
    subtitle: tx('Understand each type of germ one by one, which medicine treats which infection, and common everyday myths to avoid.'),
    badge: tx('Pathogen Detective'),
    icon: '🔬',
    color: '#0284C7',
    moduleIds: ['bacteria', 'virus', 'fungi', 'parasites']
  },
  {
    id: 'advanced',
    level: 3,
    title: tx('Stepping Up: Stopping Spread, Farms & Safe Medicines'),
    subtitle: tx('See the bigger picture: how clean hands and vaccines stop superbugs, how farm antibiotics reach our food, and how to spot fake drugs.'),
    badge: tx('AMR Champion'),
    icon: '🌍',
    color: '#7C3AED',
    moduleIds: ['human-spread', 'one-health', 'systems-quality']
  }
]

export const LESSONS = [
  {
    id: 'intro-pathogens',
    tier: 'beginner',
    tierLevel: tx('Level 1: The Basics'),
    tierIcon: '🌱',
    order: 1,
    category: tx('START HERE · MICROBES 101'),
    badge: 'Foundational Guide',
    readTime: '3 min read',
    title: tx('Introduction to Microbes & Pathogens'),
    subtitle: tx('What microbes are, friendly germs vs. disease-causing pathogens, and the 4 main types of germs'),
    summary: tx('Before learning about drug resistance, let’s start at the beginning: what are the tiny living things around us, which ones actually make us sick, and why does each type need a different medicine?'),
    steps: [
      {
        stepNum: 1,
        heading: tx('What Are Microbes? (Not All Tiny Organisms Are Bad!)'),
        content: tx('All around us—in the air, soil, water, and even inside our own bodies—live trillions of tiny living things called microbes (or microorganisms). They are so small that you cannot see them with your eyes; you need a microscope.\n\nHere is a surprising fact: most microbes are actually our friends! Your body is home to trillions of helpful microbes (often called your "microbiome") that live peacefully in your stomach and on your skin. They help you digest food, make vitamins, and crowd out harmful germs.\n\nOnly a small fraction of microbes cause sickness. When a microbe is capable of making a person, animal, or plant sick, scientists call it a pathogen—or in everyday words, a harmful germ.'),
        caseStudy: tx('Think of your stomach like a busy market square: friendly microbes are the regular shopkeepers keeping order. When you take strong medicines you do not need, you sweep away those friendly shopkeepers and leave space for troublemakers to move in.'),
        takeaway: tx('Microbes are tiny microscopic organisms. Most are helpful to our bodies; only the disease-causing ones are called pathogens (germs).')
      },
      {
        stepNum: 2,
        heading: tx('Meet the 4 Main Types of Pathogens'),
        content: tx('When people fall sick with an infection, the culprit usually belongs to one of four main families of pathogens:\n\n• 1. Bacteria: Tiny single-celled living creatures that can multiply on their own. Some cause illnesses like typhoid fever, strep throat, or urinary tract infections (UTIs).\n\n• 2. Viruses: Even smaller than bacteria! Viruses are not even full cells—they are tiny packets of genetic code that must invade our body cells to make copies of themselves. They cause the common cold (catarrh), flu, measles, and COVID-19.\n\n• 3. Fungi: This group includes yeasts and molds. While some fungi give us bread and mushrooms, pathogenic fungi can cause itchy skin infections like ringworm, athlete’s foot, or yeast infections (thrush).\n\n• 4. Parasites: Organisms that live in or on a host and feed at its expense. The most famous example in Nigeria is the malaria parasite (Plasmodium), which enters the blood through a mosquito bite.'),
        caseStudy: tx('In Nigeria, many people call every fever "malaria" or every cough "bacterial infection," even though four completely different types of germs can cause similar feelings of tiredness or fever.'),
        takeaway: tx('Bacteria, viruses, fungi, and parasites are four completely different kinds of germs—just as different from one another as a fish, a bird, and a tree.')
      },
      {
        stepNum: 3,
        heading: tx('One Key, One Lock: Matching the Right Medicine to the Right Germ'),
        content: tx('Because the four types of germs are built so differently, one single type of medicine cannot kill them all. Doctors call the whole family of germ-fighting medicines antimicrobials, and each branch targets a specific germ:\n\n• Antibiotics fight Bacteria only.\n• Antivirals fight Viruses.\n• Antifungals fight Fungi.\n• Antiparasitics (like antimalarials) fight Parasites.\n\nThink of these medicines like keys and locks. An antibiotic is a key made specifically for a bacterial lock. If you take an antibiotic for a viral cold or for malaria, the key will not fit the lock—it will not cure your illness at all!'),
        caseStudy: tx('When someone takes an antibiotic capsule for a simple cold or takes malaria tablets without testing, they are using the wrong key on the wrong lock—wasting money while exposing their body to unnecessary side effects.'),
        takeaway: tx('Antimicrobials are not all-purpose painkillers. Antibiotics only treat bacteria—never viruses, fungi, or malaria parasites.')
      }
    ],
    checks: [
      {
        q: tx('What do we call the tiny fraction of microbes that actually cause disease in humans or animals?'),
        options: [
          tx('Pathogens (harmful germs)'),
          tx('Vitamins'),
          tx('White blood cells')
        ],
        answer: 0,
        why: tx('Most microbes are harmless or helpful; the specific microbes that cause infections and illness are called pathogens.')
      },
      {
        q: tx('Which four main groups make up the pathogens that cause human infections?'),
        options: [
          tx('Bacteria, Viruses, Fungi, and Parasites'),
          tx('Antibiotics, Painkillers, Syrups, and Vaccines'),
          tx('Dust, Cold Air, Mosquitoes, and Water')
        ],
        answer: 0,
        why: tx('The four major families of disease-causing germs are bacteria, viruses, fungi, and parasites.')
      },
      {
        q: tx('If a person has an infection caused by a virus (such as the common cold or flu), will an antibiotic cure it?'),
        options: [
          tx('No—antibiotics only work on bacteria, not on viruses'),
          tx('Yes—antibiotics kill all four types of germs equally'),
          tx('Yes—if you take two capsules at once')
        ],
        answer: 0,
        why: tx('Antibiotics are designed specifically to target bacteria. They cannot unlock or stop viral infections.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2023',
        title: 'Antimicrobial Resistance: Key Facts for the Public',
        journal: 'WHO Fact Sheets, Geneva',
        url: 'https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance',
        stat: 'Explains the difference between bacteria, viruses, fungi, and parasites and the medicines that treat them'
      },
      {
        author: 'Centers for Disease Control and Prevention (CDC)',
        year: '2024',
        title: 'About Antimicrobial Resistance & How Germs Work',
        journal: 'CDC National Center for Emerging and Zoonotic Infectious Diseases',
        url: 'https://www.cdc.gov/antimicrobial-resistance/about/index.html',
        stat: 'Clear public guide on microbes, helpful microbiome bacteria, and pathogens'
      }
    ]
  },
  {
    id: 'what-is-amr',
    tier: 'beginner',
    tierLevel: tx('Level 1: The Basics'),
    tierIcon: '🌱',
    order: 2,
    category: tx('START HERE · AMR BASICS'),
    badge: 'Core Concept',
    readTime: '3 min read',
    title: tx('What Is Antimicrobial Resistance (AMR)?'),
    subtitle: tx('How germs learn to defeat our medicines, why it is the germ that becomes resistant (not you), and how superbugs are born'),
    summary: tx('A clear, plain-language guide to what happens when germs stop responding to medicine, how everyday habits create "superbugs," and why AMR affects every household.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('AMR in Plain Words: When Germs Outsmart Our Medicines'),
        content: tx('Antimicrobial Resistance (shortened to AMR) happens when germs—bacteria, viruses, fungi, or parasites—change over time and learn how to defend themselves against the medicines meant to kill them.\n\nWhen this happens, standard medicines stop working. An infection that used to clear up easily with a simple course of tablets becomes much harder, more expensive, or sometimes impossible to treat.\n\nOne of the most important things to remember is this: IT IS THE GERM THAT BECOMES RESISTANT, NOT YOUR BODY. Even if you rarely take antibiotics yourself, you can still catch a drug-resistant germ from someone else or from contaminated water or food.'),
        caseStudy: tx('Many people say, "My body is used to that antibiotic, so it doesn’t work on me anymore." In reality, your body didn’t change—the bacteria causing the infection learned how to block that antibiotic!'),
        takeaway: tx('AMR means the germ has changed so the medicine can no longer kill it. Germs become resistant—not people.')
      },
      {
        stepNum: 2,
        heading: tx('How "Superbugs" Are Born: The Unfinished Dose Problem'),
        content: tx('How does a normal germ turn into a drug-resistant "superbug"? Imagine a crowd of 1,000 harmful bacteria causing an infection in your body. Just like people in a crowd, not every single bacterium is identical—most are weak, a few are tougher, and one or two happen to have a natural shield against a drug.\n\nWhen a doctor prescribes a full 5-day or 7-day course of antibiotics, the medicine stays strong long enough to wipe out the weak bacteria AND overwhelm the tougher ones so your immune system can finish the job.\n\nBut if you buy just 2 or 3 loose capsules and stop as soon as you feel slightly better on Day 2, you only kill the weakest bacteria! The toughest survivors—the ones with shields—are left alive with plenty of room to multiply. Soon, the entire new army of bacteria has that shield. Next time you take that same medicine, it will not work at all.'),
        caseStudy: tx('Across Nigerian communities and campuses, stopping medicine halfway ("I already feel fine, let me keep the rest for next time") is one of the fastest ways ordinary germs are trained into resistant superbugs.'),
        takeaway: tx('Stopping antimicrobial medicine early kills only the weakest germs and trains the strongest survivors to become drug-resistant superbugs.')
      },
      {
        stepNum: 3,
        heading: tx('Why AMR Matters to You, Your Family & Your Community'),
        content: tx('Why should we care if germs become resistant? Because resistant germs do not stay locked inside one person. They travel on unwashed hands, shared surfaces, food, and water.\n\nWorldwide, drug-resistant bacterial infections directly claim over 1.27 million lives every year—and West Africa faces the highest burden of any region in the world.\n\nWhen our everyday antibiotics stop working:\n• Simple illnesses like urinary infections, skin wounds, or pneumonia take weeks instead of days to heal.\n• Families spend far more money on expensive hospital stays and stronger backup injections.\n• Everyday hospital care—like childbirth, C-sections, and treating newborn babies—becomes much riskier.'),
        caseStudy: tx('In Nigerian hospitals, doctors frequently see patients arrive with infections that already resist three or four common affordable antibiotics, forcing families to pay for costly last-resort hospital injections.'),
        takeaway: tx('Protecting our medicines is a team effort. Every time we use antibiotics wisely, we keep them working for our families and neighbors.')
      }
    ],
    checks: [
      {
        q: tx('When antimicrobial resistance (AMR) happens, what has actually become resistant to the medicine?'),
        options: [
          tx('The microbe/germ (such as the bacteria or parasite), NOT the person taking the medicine'),
          tx('The human patient’s blood and muscles'),
          tx('The plastic bottle holding the tablets')
        ],
        answer: 0,
        why: tx('It is the germ itself that adapts and becomes resistant to the drug, not the human body.')
      },
      {
        q: tx('What happens inside the body when someone takes only 2 days of an antibiotic prescription and stops early because they feel better?'),
        options: [
          tx('Only the weakest bacteria die, leaving the toughest survivors alive to multiply into drug-resistant superbugs'),
          tx('The remaining bacteria peacefully turn into vitamins'),
          tx('The body stores the leftover medicine for next year')
        ],
        answer: 0,
        why: tx('Stopping early removes the weakest germs first and gives partially resistant survivors the chance to multiply and take over.')
      },
      {
        q: tx('Can a person who never misuses antibiotics still catch an antibiotic-resistant infection?'),
        options: [
          tx('Yes—because resistant germs themselves can spread from person to person, or through food and water'),
          tx('No—only people who swallow too many pills can ever get a resistant germ'),
          tx('No—resistant germs cannot leave the hospital')
        ],
        answer: 0,
        why: tx('Because resistance lives inside the germ (not the person), a resistant superbug can spread to anyone just like a normal germ.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2023',
        title: 'Antimicrobial Resistance Fact Sheet',
        journal: 'World Health Organization, Geneva',
        url: 'https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance',
        stat: 'AMR occurs when bacteria, viruses, fungi and parasites no longer respond to antimicrobial medicines'
      },
      {
        author: 'Murray CJL, Ikuta KS, Sharara F, et al. (GRAM Project)',
        year: '2022',
        title: 'Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis',
        journal: 'The Lancet, 399(10325): 629-655',
        url: 'https://doi.org/10.1016/S0140-6736(21)02724-0',
        stat: '1.27M direct deaths worldwide; West Africa experiences the highest regional burden'
      }
    ]
  },
  {
    id: 'bacteria',
    tier: 'intermediate',
    tierLevel: tx('Level 2: Meet the 4 Germs'),
    tierIcon: '🔬',
    order: 3,
    category: tx('GERM #1 · BACTERIA & ANTIBIOTICS'),
    badge: 'WHO AWaRe Guide',
    readTime: '3.5 min read',
    title: tx('What Are Bacteria & How Do Antibiotics Work?'),
    subtitle: tx('Understanding bacterial infections, how bacteria share resistance tricks, and the WHO Traffic-Light rule for antibiotics'),
    summary: tx('Now that you know the basics of AMR, let’s look closely at Germ #1: Bacteria. Learn how antibiotics clear bacterial infections, how bacteria pass resistance to each other, and why buying loose chemist capsules is risky.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('What Are Bacteria & How Do Antibiotics Defeat Them?'),
        content: tx('Bacteria are single-celled living organisms. Unlike viruses, a bacterium is a complete little cell with an outer protective wall and its own machinery for eating, growing, and dividing into two.\n\nWhile most bacteria in our gut and on our skin are helpful, harmful bacteria can enter the body through contaminated food, water, or wounds—causing illnesses like typhoid fever, bacterial pneumonia, skin boils, or urinary tract infections (UTIs).\n\nAntibiotics are medicines designed specifically to attack bacterial cells. Some antibiotics (like Amoxicillin) break down the bacterium’s outer wall so it bursts; others stop the bacterium from building proteins or copying its DNA. Because human cells do not have bacterial walls, antibiotics can kill bacteria without harming our own body cells.'),
        caseStudy: tx('When a doctor confirms you have a true bacterial infection like typhoid or a bacterial UTI, the right antibiotic taken in full acts like a targeted wrecking ball against the bacterial cells.'),
        takeaway: tx('Bacteria are complete single-celled organisms. Antibiotics work by breaking bacterial cell walls or stopping bacteria from multiplying.')
      },
      {
        stepNum: 2,
        heading: tx('How Bacteria Fight Back & Share "Cheat Codes"'),
        content: tx('Bacteria are masters of survival. When exposed to antibiotics—especially weak or incomplete doses—surviving bacteria use clever defenses:\n• Shielding their walls so the antibiotic cannot get inside.\n• Building tiny pumps ("efflux pumps") that spit the antibiotic back out before it can work.\n• Producing special enzymes that chop the antibiotic molecule apart.\n\nEven more importantly, bacteria can share these defenses with each other! Through a process called Horizontal Gene Transfer, one resistant bacterium can pass a tiny loop of DNA (a "cheat code" called a plasmid) directly to a neighboring bacterium—even one of a completely different species. That means a harmless gut bacterium can hand over drug-resistance skills to a dangerous typhoid or E. coli germ!'),
        caseStudy: tx('In Nigerian teaching hospitals, over 65% of certain severe bloodstream bacteria now carry enzymes that destroy common antibiotics, because resistance genes have been passed around like shared notes in a classroom.'),
        takeaway: tx('Bacteria don’t just keep resistance to themselves—they can pass resistance genes directly to other bacteria nearby.')
      },
      {
        stepNum: 3,
        heading: tx('The Traffic-Light Guide to Antibiotics: WHO Access, Watch & Reserve'),
        content: tx('To help doctors and communities protect our antibiotics, the World Health Organization (WHO) groups all antibiotics into three traffic-light categories called AWaRe:\n\n• 🟢 Access (Green — Everyday First Choice): Safe, targeted antibiotics (like Amoxicillin) used for common bacterial infections. At least 60% of all antibiotics used in a country should come from this group.\n\n• 🟡 Watch (Yellow — Use with Caution): Stronger, broader antibiotics (like Ciprofloxacin, Azithromycin, or Ceftriaxone) that trigger resistance much faster. These should only be prescribed for specific, more serious infections.\n\n• 🔴 Reserve (Red — Emergency Last Resort): Powerful backup drugs (like Colistin or Linezolid) kept strictly locked in hospitals for life-threatening superbug infections when nothing else works.'),
        caseStudy: tx('In many Nigerian neighbourhoods, people buy "Watch" antibiotics like Ciprofloxacin ("Cipro") over the counter for minor stomach aches—using a Yellow-light hospital drug where it isn’t needed and speeding up resistance.'),
        takeaway: tx('Think of antibiotics like a traffic light: Green (Access) first when needed, Yellow (Watch) with caution, and Red (Reserve) saved strictly for life-or-death emergencies.')
      },
      {
        stepNum: 4,
        heading: tx('Everyday Reality: Saying No to Loose "Cut-and-Join" Capsules'),
        content: tx('Across Nigerian communities and university campuses, studies show that more than half of antibiotic use happens without a prescription—often bought from local Patent and Proprietary Medicine Vendors (PPMVs or "chemists").\n\nPeople often ask for "two red-and-yellow capsules" or buy a mixed sachet of loose tablets for 2 days because of tight budgets, stopping as soon as pain or fever drops.\n\nWhy is this so dangerous? Because 2 days of loose capsules is almost never enough to clear a real bacterial infection. Instead, it acts like a training gym for the bacteria in your body—wiping out the weak ones and leaving you carrying a stronger, drug-resistant strain that can come back worse than before.'),
        caseStudy: tx('At university health clinics, doctors regularly treat young adults whose urinary tract infections no longer respond to Ciprofloxacin because they took 2-day loose doses from off-campus shops earlier in the year.'),
        takeaway: tx('Never buy loose, unlabelled antibiotic capsules or take a 2-day shortcut. Only take antibiotics prescribed by a qualified healthcare worker, and finish the full course.')
      }
    ],
    checks: [
      {
        q: tx('A student with burning urination buys 3 loose tablets of Ciprofloxacin from a local chemist "just to calm it down." Why is this dangerous?'),
        options: [
          tx('A short 3-tablet dose kills only the weakest bacteria and trains the surviving bacteria to become resistant to that antibiotic'),
          tx('Ciprofloxacin only works if mixed with hot tea'),
          tx('Three tablets will turn a bacterium into a virus')
        ],
        answer: 0,
        why: tx('Taking incomplete doses exposes bacteria to weak drug levels, killing sensitive germs while leaving resistant survivors to multiply.')
      },
      {
        q: tx('In the WHO AWaRe "traffic-light" classification of antibiotics, what is the "Reserve" (Red) group meant for?'),
        options: [
          tx('Last-resort emergency antibiotics saved strictly for life-threatening multidrug-resistant superbugs'),
          tx('Everyday coughs, colds, and mild headaches'),
          tx('Mixing into animal feed on poultry farms')
        ],
        answer: 0,
        why: tx('Reserve antibiotics are our final emergency safety net and must be protected for severe infections when standard drugs fail.')
      },
      {
        q: tx('How can a harmless bacterium in your stomach make a dangerous Salmonella bacterium drug-resistant?'),
        options: [
          tx('By passing a small loop of resistance DNA ("cheat code") directly to its neighbor through Horizontal Gene Transfer'),
          tx('By sneezing on the Salmonella cell'),
          tx('Bacteria can never share resistance with each other')
        ],
        answer: 0,
        why: tx('Bacteria can transfer resistance genes directly to neighboring bacteria through plasmid DNA exchange (Horizontal Gene Transfer).')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2023',
        title: 'The WHO AWaRe Antibiotic Book and 2023 AWaRe Classification',
        journal: 'WHO Guidelines Approved by the Guidelines Review Committee, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240062382',
        stat: 'Global target: at least 60% of national antibiotic use should be from the Access group'
      },
      {
        author: 'Nigeria Centre for Disease Control (NCDC)',
        year: '2024',
        title: "Nigeria's Second National Action Plan on Antimicrobial Resistance (AMR NAP 2.0: 2024–2028)",
        journal: 'Federal Ministry of Health & Social Welfare, Abuja, Nigeria',
        url: 'https://ncdc.gov.ng',
        stat: 'National roadmap addressing over-the-counter antibiotic sales and clinical stewardship'
      },
      {
        author: 'Auta A, Hadi MA, Oga E, et al.',
        year: '2019',
        title: 'Global access to antibiotics without prescription in community pharmacies and patent medicine stores',
        journal: 'The Lancet Infectious Diseases, 19(4): 391-402',
        url: 'https://doi.org/10.1016/S1473-3099(18)30610-8',
        stat: 'Unprescribed over-the-counter dispensing drives over 60% of community antibiotic consumption'
      }
    ]
  },
  {
    id: 'virus',
    tier: 'intermediate',
    tierLevel: tx('Level 2: Meet the 4 Germs'),
    tierIcon: '🔬',
    order: 4,
    category: tx('GERM #2 · VIRUSES & COLDS'),
    badge: 'Cold & Flu Myths',
    readTime: '3 min read',
    title: tx('What Are Viruses & Why Antibiotics Don’t Cure Colds'),
    subtitle: tx('How viruses differ from bacteria, why taking antibiotics for catarrh or flu backfires, and the truth about yellow mucus'),
    summary: tx('Explore Germ #2: Viruses. See why antibiotics have zero power against colds, flu, and most sore throats—and why thick yellow mucus is actually a sign of your immune system working.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('What Is a Virus? (The Tiny Cell Hijacker)'),
        content: tx('If a bacterium is a full living house with walls and doors, a virus is just a tiny envelope with an instruction note inside. Viruses are 10 to 100 times smaller than bacteria and are not even complete cells.\n\nA virus has no cell wall and cannot eat or multiply on its own. Instead, it sneaks inside your own human cells (like the cells lining your nose or throat) and tricks them into making thousands of new virus copies.\n\nCommon illnesses caused by viruses include:\n• The common cold (catarrh / runny nose)\n• Influenza (the flu) and COVID-19\n• Most coughs, acute bronchitis, and sore throats\n• Measles and chickenpox'),
        caseStudy: tx('Every rainy and harmattan season in Nigeria, millions of capsules of Ampiclox (ampicillin-cloxacillin) and Amoxicillin are swallowed for runny noses and viral coughs—even though viruses caused the illness.'),
        takeaway: tx('Viruses have no bacterial cell walls or machinery. Because antibiotics only attack bacterial parts, they have zero effect on viruses.')
      },
      {
        stepNum: 2,
        heading: tx('Why Taking Antibiotics for a Cold Actually Hurts You'),
        content: tx('Some people think, "Even if my cold is a virus, what is the harm in taking an antibiotic just in case?"\n\nIn truth, taking an antibiotic when you have a virus causes real harm inside your body:\n1. It does not shorten your cold by even one hour.\n2. While the virus ignores the antibiotic, the antibiotic travels to your stomach and kills off billions of friendly, helpful gut bacteria that protect your digestion and immunity.\n3. With your friendly bacteria wiped out, troublemaking germs can take over—causing stomach upset, diarrhea, or yeast infections (thrush), while training any surviving bacteria in your body to become antibiotic-resistant.'),
        caseStudy: tx('Studies show that even a single 5-day course of unnecessary broad antibiotics can disturb the balance of friendly bacteria in your gut for months afterward.'),
        takeaway: tx('Taking an antibiotic for a virus gives you zero benefit while wiping out your helpful gut bacteria and breeding superbugs.')
      },
      {
        stepNum: 3,
        heading: tx('Busting the Myth: "My Mucus Turned Yellow or Green!"'),
        content: tx('One of the biggest myths in everyday life is that if your nasal mucus (catarrh) or phlegm turns thick yellow or green, "the cold has turned into a bacterial infection and now needs an antibiotic."\n\nHere is what actually happens: when you catch a cold virus, your immune system sends millions of white blood cells (called neutrophils) to your nose to fight the virus. Those white blood cells contain a natural greenish-iron enzyme. As they clear out the virus, they turn your mucus yellow or green!\n\nSo yellow or green mucus during a cold is actually proof that your immune system is fighting hard and doing its job—not proof that you need an antibiotic. Rest, plenty of fluids, warm steam, and simple fever/pain relief are what help your body finish clearing a viral cold. (Of course, if you have a high fever that refuses to come down after several days or trouble breathing, always see a doctor.)'),
        caseStudy: tx('When community pharmacists explain that yellow catarrh is just white blood cells clearing a cold virus, most patients are relieved to save their money and skip unnecessary antibiotics.'),
        takeaway: tx('Yellow or green mucus during a cold is a normal sign of your white blood cells fighting a virus—not a reason to take antibiotics.')
      }
    ],
    checks: [
      {
        q: tx('A friend wakes up with a runny nose, sneezing, mild cough, and thick yellow mucus. Why should they NOT rush to buy an antibiotic?'),
        options: [
          tx('Yellow mucus is a normal sign of white blood cells fighting a cold virus; antibiotics do nothing against viruses and harm friendly gut bacteria'),
          tx('Antibiotics only work when mucus turns bright blue'),
          tx('They should take three different antibiotics at the same time instead')
        ],
        answer: 0,
        why: tx('Colored mucus during a cold comes from immune white blood cells clearing a viral infection, which antibiotics cannot treat.')
      },
      {
        q: tx('Why are antibiotics physically unable to kill viruses?'),
        options: [
          tx('Antibiotics target bacterial cell walls and machinery, which viruses completely lack'),
          tx('Viruses are too large for antibiotics to reach'),
          tx('Viruses eat antibiotics as food')
        ],
        answer: 0,
        why: tx('Viruses are not cells and have no bacterial cell walls or bacterial ribosomes for an antibiotic to attack.')
      }
    ],
    references: [
      {
        author: 'Centers for Disease Control and Prevention (CDC)',
        year: '2023',
        title: 'Common Cold and Runny Nose: When Antibiotics Work (And When They Don’t)',
        journal: 'CDC Antibiotic Prescribing and Use Guidelines',
        url: 'https://www.cdc.gov/antibiotic-use/colds.html',
        stat: 'Antibiotics do not relieve symptoms or speed up recovery from viral colds, flu, or most sore throats'
      },
      {
        author: 'Zaura E, Brandt BW, Teixeira de Mattos MJ, et al.',
        year: '2015',
        title: 'Long-term Gut Microbiome Disruption Following a Single Course of Antibiotics',
        journal: 'mBio, 6(6): e01693-15',
        url: 'https://doi.org/10.1128/mBio.01693-15',
        stat: 'Even one unnecessary course of antibiotics can disrupt protective gut bacteria for months'
      }
    ]
  },
  {
    id: 'fungi',
    tier: 'intermediate',
    tierLevel: tx('Level 2: Meet the 4 Germs'),
    tierIcon: '🔬',
    order: 5,
    category: tx('GERM #3 · FUNGI & ANTIFUNGALS'),
    badge: 'WHO Fungal Priority',
    readTime: '3.5 min read',
    title: tx('What Are Fungi & Antifungal Resistance?'),
    subtitle: tx('Understanding fungal infections like ringworm and thrush, why antifungal medicines are rare, and the rise of Candida auris'),
    summary: tx('Meet Germ #3: Fungi. Learn the difference between everyday fungal skin infections and dangerous hospital super-fungi, why we have very few antifungal drugs, and how farm sprays affect human medicine.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('What Are Fungi & Why Do We Have So Few Antifungal Medicines?'),
        content: tx('Fungi are their own kingdom of life, separate from plants, animals, and bacteria. They include familiar things like mushrooms, the yeast used to bake bread, and the fuzzy mold that grows on old bread.\n\nIn people, microscopic fungi most often cause surface infections like ringworm (despite the name, it is a fungus, not a worm!), athlete’s foot, fungal nail infections, or yeast infections (thrush). However, in hospital patients with very weak immune systems, fungi can enter the blood and cause life-threatening illness.\n\nTo treat fungal infections, we use antifungals (like Fluconazole or Clotrimazole)—never antibiotics! And because fungal cells are biologically much more similar to human cells than bacteria are, it is very hard for scientists to make drugs that kill a fungus without harming human organs. As a result, modern medicine relies on only four main classes of antifungal drugs for serious infections.'),
        caseStudy: tx('In Nigeria, many people buy "triple-action" skin creams that mix a strong steroid, an antibiotic, and an antifungal together for any skin rash—often making fungal ringworm spread wider and become harder to cure!'),
        takeaway: tx('Fungal infections need proper antifungal medicines, not antibiotics or mixed steroid creams. We only have four main classes of systemic antifungals, so we must protect them.')
      },
      {
        stepNum: 2,
        heading: tx('Candida auris: The Emerging Hospital Fungal Superbug'),
        content: tx('Just as bacteria can become resistant to antibiotics, fungi are now becoming resistant to antifungal medicines.\n\nIn 2022, the World Health Organization published its first-ever Fungal Priority Pathogens List and placed a yeast called Candida auris in the highest alert group ("Critical Priority").\n\nWhy are doctors around the world worried about Candida auris?\n• Over 90% of strains resist Fluconazole, our most common antifungal pill, and many resist multiple antifungal classes at once.\n• Unlike ordinary yeasts, it clings stubbornly to hospital bed rails, blood pressure cuffs, and plastic surfaces for weeks, surviving many normal cleaning sprays.\n• In fragile intensive-care patients, a bloodstream infection with Candida auris can be fatal if antifungals fail.'),
        caseStudy: tx('Hospitals worldwide have had to temporarily close entire intensive care rooms for special deep-cleaning after Candida auris spread across shared medical thermometers and bedside equipment.'),
        takeaway: tx('Candida auris is a drug-resistant fungal superbug that can survive on hospital surfaces and resist our main antifungal medicines.')
      },
      {
        stepNum: 3,
        heading: tx('The Surprising Link Between Farm Crop Sprays & Human Fungal Infections'),
        content: tx('How do fungi become resistant before a patient ever takes an antifungal pill? One major reason comes from agriculture.\n\nTo stop mold from spoiling crops like grains, fruits, and vegetables, large farms spray thousands of tons of chemical fungicides (especially "azole" fungicides). Those farm sprays have almost the exact same chemical structure as the "azole" antifungal pills doctors use to save human lives in hospitals!\n\nWhen common soil molds (like Aspergillus) are sprayed repeatedly on farms, they evolve resistance to azoles. If a person with weak lungs or low immunity breathes in those resistant mold spores from the air, the infection is already resistant to hospital antifungal medicine on Day 1.'),
        caseStudy: tx('Doctors have found patients with severe lung mold infections that already resist hospital azole drugs—even though the patient had never taken an antifungal pill in their life, having breathed in resistant spores from the environment.'),
        takeaway: tx('Overusing antifungal sprays on farm crops and misusing antifungal creams on skin both speed up antifungal resistance in humans.')
      }
    ],
    checks: [
      {
        q: tx('Which type of medicine is used to treat a fungal infection like ringworm or a yeast infection?'),
        options: [
          tx('An antifungal medicine (antibiotics do not kill fungi)'),
          tx('An antibacterial antibiotic like Amoxicillin'),
          tx('An antimalarial tablet')
        ],
        answer: 0,
        why: tx('Fungi are completely different from bacteria and require specific antifungal medicines.')
      },
      {
        q: tx('Why is the fungus Candida auris listed by the World Health Organization as a "Critical Priority" threat?'),
        options: [
          tx('It frequently resists our main antifungal drugs and clings to hospital surfaces, threatening fragile patients'),
          tx('It causes the common cold every winter'),
          tx('It turns tap water green')
        ],
        answer: 0,
        why: tx('Candida auris is multidrug-resistant, survives on hospital equipment, and causes severe infections in hospitalized patients.')
      },
      {
        q: tx('How can spraying "azole" fungicides on farm crops affect a human patient in a hospital?'),
        options: [
          tx('Molds in the soil become resistant to the farm spray and then resist the matching "azole" antifungal medicines used in hospitals'),
          tx('Farm fungicides turn crops into bacteria'),
          tx('It has no connection to human medicine')
        ],
        answer: 0,
        why: tx('Agricultural azole fungicides and hospital azole drugs share the same chemical target, so environmental molds develop cross-resistance.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2022',
        title: 'WHO fungal priority pathogens list to guide research, development and public health action',
        journal: 'WHO Department of Antimicrobial Resistance, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240060241',
        stat: 'Designates Candida auris and Aspergillus fumigatus as Critical Priority fungal threats'
      },
      {
        author: 'Centers for Disease Control and Prevention (CDC)',
        year: '2024',
        title: 'About Candida auris & Antifungal Resistance',
        journal: 'CDC Fungal Diseases Branch',
        url: 'https://www.cdc.gov/fungal/candida-auris/index.html',
        stat: 'Over 90% of C. auris isolates resist fluconazole and persist on healthcare surfaces'
      }
    ]
  },
  {
    id: 'parasites',
    tier: 'intermediate',
    tierLevel: tx('Level 2: Meet the 4 Germs'),
    tierIcon: '🔬',
    order: 6,
    category: tx('GERM #4 · PARASITES & MALARIA'),
    badge: 'Test Before You Treat',
    readTime: '3.5 min read',
    title: tx('What Are Parasites & Protecting Malaria Medicines'),
    subtitle: tx('How malaria parasites work, the true story of how we lost Chloroquine, and why you must always test before taking ACTs'),
    summary: tx('Meet Germ #4: Parasites. Learn why malaria is caused by a microscopic blood parasite, why not every fever in Nigeria is malaria, and how the "Test Before You Treat" rule keeps our malaria tablets working.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('What Are Parasites? (Understanding Malaria)'),
        content: tx('A parasite is an organism that lives inside or on another living creature (the host) and takes nourishment from it. Some parasites are larger, like intestinal worms, while others are microscopic single-celled organisms called protozoa.\n\nIn Nigeria and across sub-Saharan Africa, the most important parasite to know is Plasmodium falciparum—the microscopic blood parasite that causes malaria. When an infected female Anopheles mosquito bites a person, it injects these tiny parasites into the bloodstream, where they travel to the liver and red blood cells, causing fever, chills, headache, and body weakness.\n\nBecause malaria is caused by a parasite (not a bacterium or a virus), antibiotics cannot cure malaria. Instead, we rely on special antiparasitic medicines called antimalarials.'),
        caseStudy: tx('Nigeria carries roughly 27% of the entire world’s malaria cases—meaning protecting our malaria medicines from resistance is a matter of life and death for millions of Nigerian children and families.'),
        takeaway: tx('Malaria is caused by a microscopic parasite spread by mosquitoes, and it requires specific antimalarial medicines.')
      },
      {
        stepNum: 2,
        heading: tx('A Real Warning from History: How We Lost Chloroquine'),
        content: tx('Have you ever wondered why our parents and grandparents used to take Chloroquine for malaria, yet doctors rarely use it for malaria in Nigeria today?\n\nFor decades, Chloroquine was a cheap, miracle cure for malaria. Because it was so popular, people swallowed it for every single fever or headache without testing, and often stopped after a couple of tablets. Over time, malaria parasites evolved a genetic pump that spat Chloroquine right out! By the 1980s and 1990s, Chloroquine failed in over 70% of cases across Africa, leading to a tragic rise in child deaths.\n\nTo save lives, scientists introduced Artemisinin-based Combination Therapies (ACTs—like Artemether-Lumefantrine). An ACT combines TWO different malaria medicines in one tablet: a fast-acting drug that clears most parasites quickly, plus a longer-acting partner drug that mops up any stragglers so neither drug easily faces resistance alone.'),
        caseStudy: tx('Warning signs of partial resistance to artemisinin have already begun appearing in parts of East Africa (like Rwanda and Uganda). While ACTs still work very well in Nigeria today, misusing them could bring that resistance here.'),
        takeaway: tx('We already lost Chloroquine to parasite resistance once. Modern ACT malaria tablets combine two drugs to protect each other—and we must use them carefully.')
      },
      {
        stepNum: 3,
        heading: tx('The Golden Rule: "Test Before You Treat" & Finish All 6 Doses'),
        content: tx('In Nigeria, almost every fever, headache, or body ache is automatically called "malaria." Yet health surveys show that more than 60% of people who buy malaria medicine at a chemist actually test NEGATIVE for malaria when their blood is checked (their fever was caused by a simple virus or stress instead).\n\nThat is why Nigeria’s National Malaria Guidelines have a simple two-part rule for everyone:\n\n1. Test Before You Treat: Before swallowing any malaria tablet, ask for a quick blood test—either a 15-minute Rapid Diagnostic Test (RDT) strip at a pharmacy/clinic or a lab blood test.\n2. If Positive, Finish the Full 3-Day Course: Standard ACT tablets are taken twice a day for 3 full days (6 doses in total), ideally with food or milk so your body absorbs the medicine well. Never stop on Day 2 just because the fever went down—finishing Day 3 kills the last hiding parasites so they cannot become resistant!'),
        caseStudy: tx('When community pharmacies in Ogun State started offering quick 15-minute RDT finger-prick tests before selling malaria medicine, unnecessary ACT use dropped by over half!'),
        takeaway: tx('Not every fever is malaria! Always confirm with a quick RDT blood test first, and if it is positive, complete every single dose across all 3 days.')
      }
    ],
    checks: [
      {
        q: tx('You feel feverish and tired after a long week. What should you do BEFORE buying or taking an ACT malaria medicine?'),
        options: [
          tx('Do a quick Rapid Diagnostic Test (RDT) or lab blood test to confirm that malaria parasites are actually causing the fever'),
          tx('Swallow half a pack of malaria tablets and half a pack of antibiotics together'),
          tx('Skip testing and take only 1 day of malaria tablets')
        ],
        answer: 0,
        why: tx('More than 60% of fevers treated as malaria are actually caused by other things like viruses. Testing first prevents wasted medicine and protects ACTs from resistance.')
      },
      {
        q: tx('Why do modern ACT malaria tablets combine two different antimalarial drugs inside one treatment?'),
        options: [
          tx('The fast drug clears most parasites quickly while the partner drug eliminates remaining stragglers, protecting both drugs from resistance'),
          tx('One drug is for malaria and the other is for the common cold'),
          tx('To make the tablets taste sweeter')
        ],
        answer: 0,
        why: tx('Using a SINGLE drug alone (like Chloroquine in the past) made it easy for parasites to develop resistance; combining two drugs protects both.')
      },
      {
        q: tx('If your malaria RDT test is positive and you start a 3-day ACT course, what should you do on Day 2 if your fever is completely gone?'),
        options: [
          tx('Keep taking the remaining doses through Day 3 until all 6 doses are finished, so no surviving parasites are left behind'),
          tx('Stop immediately and save the Day 3 tablets for a family member'),
          tx('Switch to an antibiotic on Day 3')
        ],
        answer: 0,
        why: tx('Stopping on Day 2 leaves surviving parasites exposed to fading drug levels in your blood, which trains them to become drug-resistant.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2023',
        title: 'World Malaria Report 2023 & Strategy to Respond to Antimalarial Drug Resistance in Africa',
        journal: 'WHO Global Malaria Programme, Geneva',
        url: 'https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2023',
        stat: 'Nigeria accounts for ~27% of global malaria cases; protecting ACT effectiveness is critical'
      },
      {
        author: 'Federal Ministry of Health, Nigeria (FMOH / NMEP)',
        year: '2021',
        title: 'National Guidelines for Diagnosis and Treatment of Malaria',
        journal: 'National Malaria Elimination Programme, Abuja, Nigeria',
        url: 'https://nmep.gov.ng',
        stat: 'Mandates parasitological confirmation via RDT or microscopy before starting ACT treatment'
      }
    ]
  },
  {
    id: 'human-spread',
    tier: 'advanced',
    tierLevel: tx('Level 3: Stepping Up'),
    tierIcon: '🌍',
    order: 7,
    category: tx('PREVENTION · STOPPING THE SPREAD'),
    badge: 'Hygiene & Vaccines',
    readTime: '3.5 min read',
    title: tx('How Superbugs Spread & How to Stop Them'),
    subtitle: tx('How resistant germs travel on hands and surfaces, and why clean water, soap, and vaccines are the best defense'),
    summary: tx('Now that you know all 4 germ types, let’s look at how resistant germs travel between people in hostels, homes, and hospitals—and why preventing an infection is even better than treating one.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('How Superbugs Hide on Everyday Surfaces (Meet the ESKAPE Group)'),
        content: tx('Drug-resistant germs do not float around by magic—they hitch rides on everyday surfaces. In hospitals and crowded spaces like hostels, doctors keep a close watch on six notorious bacterial superbugs nicknamed the ESKAPE group (including drug-resistant Staph/MRSA, Klebsiella, and E. coli), named because they "escape" common antibiotics.\n\nThese tough bacteria can form an invisible, sticky protective layer (called a biofilm) on frequently touched objects:\n• Door handles and staircase rails\n• Shared water taps and bucket handles\n• Mobile phone screens\n• Hospital bed rails and medical equipment\n\nInside that sticky layer, superbugs can survive on a dry surface for days or even weeks, waiting for the next hand to touch them.'),
        caseStudy: tx('Hospital checks in Nigeria show that shared ward equipment and tap handles are often the main stepping stones that carry resistant bacteria from one patient’s bed to another.'),
        takeaway: tx('Superbugs can survive for days on shared surfaces like door handles, taps, and phone screens.')
      },
      {
        stepNum: 2,
        heading: tx('Hands Are the #1 Highway—And Soap Is the Roadblock'),
        content: tx('More than 80% of common infections are spread directly by human hands. When you touch a contaminated door handle or tap and then rub your eyes, eat food, or touch a small cut, you give those germs a free ride into your body.\n\nThe good news? Simple hand hygiene breaks this chain in seconds:\n• Soap and clean running water (rubbing for 20–30 seconds) lifts germs off your skin and breaks apart their outer coats.\n• Alcohol-based hand sanitizer (with at least 70% alcohol) deactivates germs on the spot when you are away from a sink.\n\nWashing your hands before eating, after using the toilet, and after visiting a clinic or crowded market is the simplest, cheapest way to stop superbugs in their tracks.'),
        caseStudy: tx('When clinics in Ogun State placed simple locally made alcohol hand-rub bottles beside every patient bed, post-surgery wound infections dropped by more than a third!'),
        takeaway: tx('Washing hands with soap and clean water for 20 seconds—or using 70% alcohol sanitizer—stops over 80% of touch-spread germs.')
      },
      {
        stepNum: 3,
        heading: tx('The Best Antibiotic Is the Infection That Never Happens'),
        content: tx('Think about this: if you never catch an infection in the first place, how many antibiotics do you need to take? Zero! And when zero antibiotics are used, germs get zero chance to learn resistance.\n\nBeyond handwashing, two community tools prevent millions of infections before they ever start:\n1. Vaccines: Routine vaccines—like the Typhoid vaccine, Pneumonia (Pneumococcal) vaccine, and childhood immunizations—train your immune system in advance so dangerous bacteria and viruses cannot make you sick.\n2. Clean Water & Safe Food (WASH): Safe drinking water, clean toilets, and washing/cooking food properly stop typhoid, cholera, and diarrhea germs from spreading—cutting down one of the biggest reasons people take antibiotics in Nigeria.'),
        caseStudy: tx('Public health studies estimate that improving clean water, sanitation, and routine vaccination in developing countries can prevent over 750,000 drug-resistant infection deaths every year.'),
        takeaway: tx('Every infection prevented by clean water, handwashing, or a vaccine is one less antibiotic prescription needed.')
      }
    ],
    checks: [
      {
        q: tx('Why do health experts say that vaccines (like the Typhoid and Pneumonia vaccines) are powerful tools against antimicrobial resistance?'),
        options: [
          tx('Because preventing an illness means you never need to take antibiotics for it, giving germs no chance to develop resistance'),
          tx('Because vaccines are actually liquid antibiotics'),
          tx('Because vaccines make tap water cleaner')
        ],
        answer: 0,
        why: tx('An infection that is prevented requires zero antibiotic treatment, directly reducing antibiotic overuse and resistance.')
      },
      {
        q: tx('What is the number-one way resistant bacteria travel from person to person in hostels, homes, and hospitals?'),
        options: [
          tx('Unwashed hands touching shared surfaces like door handles, taps, and phones'),
          tx('Looking at someone across a room'),
          tx('Sunlight shining through windows')
        ],
        answer: 0,
        why: tx('Over 80% of cross-infections in communities and clinics are carried by hands touching contaminated surfaces.')
      }
    ],
    references: [
      {
        author: 'World Health Organization (WHO)',
        year: '2022',
        title: 'Global Report on Infection Prevention and Control (IPC)',
        journal: 'WHO Infection Prevention and Control Global Unit, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240051164',
        stat: 'Good hand hygiene and infection control can prevent up to 70% of healthcare-associated infections'
      },
      {
        author: 'Nigeria Centre for Disease Control (NCDC)',
        year: '2023',
        title: 'Turn Nigeria Orange: National Hand Hygiene and Infection Prevention Programme',
        journal: 'NCDC Division of IPC, Abuja, Nigeria',
        url: 'https://ncdc.gov.ng',
        stat: 'Nationwide initiative promoting handwashing, clean water, and hospital hygiene across Nigeria'
      }
    ]
  },
  {
    id: 'one-health',
    tier: 'advanced',
    tierLevel: tx('Level 3: Stepping Up'),
    tierIcon: '🌍',
    order: 8,
    category: tx('BIG PICTURE · FARMS, FOOD & WATER'),
    badge: 'One Health Nigeria',
    readTime: '4 min read',
    title: tx('One Health: How Farm Antibiotics Reach Our Food & Water'),
    subtitle: tx('Why giving human antibiotics to healthy farm animals creates superbugs that return to us through food and water'),
    summary: tx('Did you know that most antibiotics in the world are given to farm animals rather than sick people? Learn what "One Health" means and how protecting animal and environmental health protects our own families.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('What Does "One Health" Mean?'),
        content: tx('When we think about antibiotics, we usually picture a person swallowing a capsule from a pharmacy. But globally, over 70% of all medically important antibiotics are actually used in animal farming—given to poultry (chickens), cattle, pigs, and farmed fish!\n\n"One Health" is a simple but powerful idea: the health of people, the health of animals, and the health of our environment (water, soil, and crops) are all connected in one single loop.\n\nIf we misuse antibiotics on farms, resistant superbugs grow inside the animals, wash into rivers and soil through animal waste, contaminate vegetables and drinking water, and end up right back in human kitchens and hospitals.'),
        caseStudy: tx('Southwestern Nigeria (especially Ogun and Oyo States) is a major poultry and fish-farming hub, where farms, rivers, markets, and residential neighborhoods sit right next to one another.'),
        takeaway: tx('One Health means human health, animal health, and a clean environment are connected. We cannot stop AMR in hospitals if we ignore farms and water.')
      },
      {
        stepNum: 2,
        heading: tx('Why Giving Last-Resort Human Antibiotics to Healthy Chickens Is Dangerous'),
        content: tx('Of course, when a farm animal is genuinely sick, a veterinarian should treat it properly. The problem happens when antibiotics are mixed into the daily drinking water or feed of thousands of completely HEALTHY chicks every day just to make them grow faster or to cover up crowded, unhygienic cages.\n\nEven worse, some farms use soluble antibiotic powders containing Colistin—a "Reserve" (Red-light) last-resort human antibiotic that ICU doctors rely on to save patients dying from severe superbug infections.\n\nWhen healthy chickens drink small doses of Colistin every day, bacteria in their guts evolve a mobile resistance gene (called mcr-1) that renders Colistin useless. If that resistant bacterium spreads to a human patient, our final emergency hospital medicine fails.'),
        caseStudy: tx('Field surveys in poultry farms and live-bird markets across Ogun State have found bacteria carrying multi-drug resistance genes linked directly to routine, unprescribed antibiotic mixing in poultry drinking water.'),
        takeaway: tx('Human last-resort antibiotics like Colistin should never be given to healthy farm animals as growth boosters or daily tonics.')
      },
      {
        stepNum: 3,
        heading: tx('From Farm Runoff to Our Kitchens—And How Communities Can Help'),
        content: tx('Up to 80% of the antibiotics swallowed by livestock pass straight through their bodies into their manure and wastewater. When raw manure is washed by rain into streams or spread onto vegetable beds, both the leftover drug chemicals and the resistant bacteria enter our water supply and food chain.\n\nHow do we fix this together under Nigeria’s National Action Plan on AMR (NAP 2.0)?\n• For Farmers: Keep coops clean, well-ventilated, and uncrowded, and use poultry vaccines (like Newcastle and Gumboro vaccines) instead of daily antibiotics—and consult a qualified vet before medicating flocks.\n• For Households: Always wash fresh fruits and salad vegetables with clean water, cook meat, poultry, and fish thoroughly (heat kills bacteria!), and wash your hands and cutting boards after handling raw meat.'),
        caseStudy: tx('Nigeria’s 2024–2028 National Action Plan on AMR (NAP 2.0) brings together the Ministries of Health, Agriculture, and Environment to phase out using critical human antibiotics as animal growth promoters.'),
        takeaway: tx('Clean animal housing and animal vaccines reduce farm antibiotic needs, while thorough cooking and washing raw produce protect your family at home.')
      }
    ],
    checks: [
      {
        q: tx('What is the core idea behind the "One Health" approach to antimicrobial resistance?'),
        options: [
          tx('Human health, animal health, and the environment (water, soil, food) are all connected, so we must protect antibiotics across all three'),
          tx('Only one hospital in each state should prescribe antibiotics'),
          tx('Animals can never pass bacteria to humans')
        ],
        answer: 0,
        why: tx('One Health recognizes that resistant germs and antibiotics move freely between people, farm animals, and the environment.')
      },
      {
        q: tx('Why is mixing a last-resort human antibiotic like Colistin into the daily water of healthy poultry flocks so dangerous?'),
        options: [
          tx('It trains bacteria in the chickens to resist Colistin, destroying one of the final emergency medicines doctors have to save human lives in ICUs'),
          tx('It makes chicken eggs taste salty'),
          tx('It turns chickens into vegetarian animals')
        ],
        answer: 0,
        why: tx('Colistin is a Reserve last-resort antibiotic for life-threatening human infections; routine farm use breeds transferable resistance genes.')
      },
      {
        q: tx('What everyday kitchen habit helps protect your family from any resistant bacteria that might be on raw meat or market vegetables?'),
        options: [
          tx('Cooking meat, poultry, and fish thoroughly and washing hands, knives, and raw vegetables with clean water'),
          tx('Sprinkling antibiotic powder over raw meat before cooking'),
          tx('Leaving raw chicken in the sun for two hours')
        ],
        answer: 0,
        why: tx('Thorough cooking heat kills bacteria on meat—including antibiotic-resistant bacteria—and clean washing prevents cross-contamination.')
      }
    ],
    references: [
      {
        author: 'Nigeria Centre for Disease Control (NCDC) & Federal Ministry of Agriculture',
        year: '2024',
        title: "Nigeria's Second National Action Plan on Antimicrobial Resistance (AMR NAP 2.0: 2024–2028)",
        journal: 'One Health Multisectoral Strategic Blueprint, Abuja, Nigeria',
        url: 'https://ncdc.gov.ng',
        stat: 'Unites human health, veterinary agriculture, and environmental protection across Nigeria'
      },
      {
        author: 'Founou LL, Founou RC, Allam M, et al.',
        year: '2021',
        title: 'Antibiotic use and resistance in poultry farms and live bird markets in Ogun State, Nigeria',
        journal: 'Frontiers in Public Health, 9: 647908',
        url: 'https://doi.org/10.3389/fpubh.2021.647908',
        stat: 'Documents multidrug-resistant bacteria linked to unprescribed poultry antibiotic use in Ogun State'
      }
    ]
  },
  {
    id: 'systems-quality',
    tier: 'advanced',
    tierLevel: tx('Level 3: Stepping Up'),
    tierIcon: '🌍',
    order: 9,
    category: tx('EVERYDAY ACTION · FAKE DRUGS & DISPOSAL'),
    badge: 'NAFDAC MAS & Safe Disposal',
    readTime: '4 min read',
    title: tx('Fake Medicines, Safe Disposal & Protecting Future Healthcare'),
    subtitle: tx('How to spot fake or sun-damaged drugs with NAFDAC MAS, why new antibiotics are rare, and what to do with leftover pills'),
    summary: tx('Finish your pathway with practical life skills: why fake or heat-damaged medicines breed superbugs even when you finish the pack, how to verify your medicine via SMS, and why you should never flush leftover antibiotics.'),
    steps: [
      {
        stepNum: 1,
        heading: tx('How Fake or Sun-Baked Medicines Breed Superbugs (And How to Check with NAFDAC MAS)'),
        content: tx('Imagine doing everything right: you visit a doctor, get a proper prescription, and finish every single tablet in the pack—yet the infection still becomes drug-resistant. How could that happen?\n\nBecause of fake (counterfeit) or heat-damaged (substandard) medicines! A counterfeit pill may contain chalk and only a tiny pinch of real medicine. Even a genuine antibiotic left sitting on an open market tray under the hot 35°C Nigerian sun can break down until only half of its active ingredient remains.\n\nSwallowing a half-strength pill has the exact same effect as stopping your dose halfway: it is too weak to kill the tough germs, so it trains them to become resistant!\n\nHow to protect yourself in Nigeria:\n1. Only buy medicines from licensed, shaded/cooled pharmacies.\n2. Check for the NAFDAC Registration Number and scratch the silver NAFDAC Mobile Authentication Service (MAS) panel on the pack. Text the PIN to the free SMS number printed on the pack to confirm in seconds that your medicine is genuine before swallowing the first dose!'),
        caseStudy: tx('NAFDAC requires the Mobile Authentication Service (MAS) scratch-and-text code on antibiotics and antimalarial packs in Nigeria so anyone with a basic phone can verify authenticity for free.'),
        takeaway: tx('Buy antimicrobials only from licensed pharmacies, keep them out of extreme heat, and verify the NAFDAC MAS scratch code via SMS.')
      },
      {
        stepNum: 2,
        heading: tx('Why Can’t Scientists Just Invent New Antibiotics Every Year?'),
        content: tx('A common question people ask is: "If bacteria become resistant to old antibiotics, why don’t scientists simply invent new ones?"\n\nUnfortunately, discovering a safe new antibiotic is extraordinarily hard and takes 10 to 15 years of laboratory testing. Out of thousands of chemical compounds tested, almost none can kill tough superbugs without being toxic to the human liver or kidneys.\n\nAccording to the World Health Organization’s global pipeline report, there are only 4 truly new, innovative antibiotics in clinical trials worldwide that target the world’s most dangerous "Critical Priority" superbugs! Furthermore, many big drug companies stopped researching antibiotics because a 5-day antibiotic pill makes far less money than lifelong daily tablets for blood pressure or diabetes.\n\nThat means no cavalry of brand-new miracle drugs is coming anytime soon—taking care of the antibiotics we already have is our best defense.'),
        caseStudy: tx('Between 2017 and 2023, only two genuinely new chemical classes of antibiotics were approved worldwide—showing how rare new antibiotic discoveries truly are.'),
        takeaway: tx('Very few new antibiotics are being invented. We cannot rely on future replacements—we must protect the medicines we have today.')
      },
      {
        stepNum: 3,
        heading: tx('What Is at Stake—And How to Safely Dispose of Leftover Medicines'),
        content: tx('Working antibiotics are the invisible safety net underneath all of modern healthcare. Without effective antibiotics to prevent and treat infections:\n• Everyday surgeries—like Caesarean sections (C-sections) during childbirth, appendix removals, or fixing broken bones—become dangerously risky.\n• Newborns, burn victims, and cancer patients (whose immune systems are weakened by treatment) are left defenseless against common infections.\n\nFinally, what should you do if a doctor changes your treatment or you find expired antibiotics at home?\n• NEVER share leftovers with friends or family.\n• NEVER flush antibiotics down the toilet, sink, or gutter, or toss loose pills into open waste dumps! Sewage systems do not remove antibiotic chemicals; flushed pills flow straight into rivers and soil, where they train wild bacteria to become resistant.\n• Instead, return expired or leftover medicines to a hospital pharmacy or licensed community pharmacy for safe disposal.'),
        caseStudy: tx('Environmental water tests near open waste dumps and hospital drains show that improperly discarded antibiotics continuously breed resistant bacteria in local streams.'),
        takeaway: tx('Never share or flush leftover antibiotics into toilets, drains, or open trash. Return unused or expired medicines to a pharmacy or clinic for safe disposal.')
      }
    ],
    checks: [
      {
        q: tx('Why can a fake or sun-damaged antibiotic cause drug resistance even when the patient finishes every tablet in the pack?'),
        options: [
          tx('Because degraded or counterfeit pills deliver weak, half-strength drug levels that kill only weak germs and leave tougher survivors to multiply'),
          tx('Because sunlight turns tablets into sugar that feeds viruses'),
          tx('Fake pills only affect people who take them at night')
        ],
        answer: 0,
        why: tx('Substandard or counterfeit tablets contain too little active medicine to clear the infection, exposing germs to weak doses that breed resistance.')
      },
      {
        q: tx('How can a patient in Nigeria quickly check whether a pack of antibiotics or antimalarials is genuine before taking it?'),
        options: [
          tx('Scratch the NAFDAC Mobile Authentication Service (MAS) panel on the pack and send the PIN via free SMS to verify authenticity'),
          tx('Drop the tablet into cold water to see if it floats'),
          tx('Smell the plastic wrapper')
        ],
        answer: 0,
        why: tx('NAFDAC MAS allows anyone to text the unique PIN under the scratch panel via toll-free SMS to verify that the medicine is genuine.')
      },
      {
        q: tx('What is the safest thing to do with expired or leftover antibiotics found at home?'),
        options: [
          tx('Return them to a licensed pharmacy or hospital clinic for safe disposal—never share them or flush them down the toilet/drain'),
          tx('Flush them down the toilet or pour them into the gutter'),
          tx('Keep them to give to a friend next time someone has a cough')
        ],
        answer: 0,
        why: tx('Flushing or dumping antibiotics pollutes water and soil with drug residues that train environmental bacteria to become resistant.')
      }
    ],
    references: [
      {
        author: 'National Agency for Food and Drug Administration and Control (NAFDAC)',
        year: '2023',
        title: 'Mobile Authentication Service (MAS) Scheme for Antibiotics and Antimalarials',
        journal: 'NAFDAC Pharmacovigilance & Post-Marketing Surveillance, Abuja, Nigeria',
        url: 'https://nafdac.gov.ng',
        stat: 'Free SMS scratch-code verification protecting Nigerians from counterfeit and substandard antimicrobials'
      },
      {
        author: 'World Health Organization (WHO)',
        year: '2024',
        title: ' Antibacterial agents in clinical and preclinical development: an overview and analysis',
        journal: 'WHO Department of Antimicrobial Resistance, Geneva',
        url: 'https://www.who.int/publications/i/item/9789240094000',
        stat: 'Highlights the critical shortage of truly novel antibiotics in the global R&D pipeline'
      },
      {
        author: 'World Health Organization (WHO)',
        year: '2018',
        title: 'Substandard and Falsified Medical Products & Their Impact on Antimicrobial Resistance',
        journal: 'WHO Global Surveillance and Monitoring System, Geneva',
        url: 'https://www.who.int/news-room/fact-sheets/detail/substandard-and-falsified-medical-products',
        stat: 'Under-dosed and degraded antimicrobials directly accelerate drug resistance in communities'
      }
    ]
  }
]
