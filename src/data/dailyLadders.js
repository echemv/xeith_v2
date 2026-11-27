import { tx } from '../i18n'

// Daily word ladders. Same scheme as weeklyLadder.js: only the start word ships in plain text;
// each step is SHA-256(`${salt}:${id}:${step}:${WORD}`) in hex, step = 1..n. The last step is the target.
// Check with checkRung() from weeklyLadder.js.
export const DAILY_LADDERS = [
  {
    id: 'daily-sick', start: 'SICK', salt: 'c36107886307815ffa600209',
    theme: tx('From feeling sick to feeling better.'),
    hashes: [
      '0df29a5f74bf40c6c6e31798945e5050b4a3131751282d8880cb28ab639cc2a8',
      '313512378453a54b5f1b2c72692f371946e8f841d9f7d17ec3cba3fd024bb871',
      '62e1f039cef822fdd33cf72ae36d5cb1ef83e571e343a8ebdb889fcd548dc6de',
      '21d1361935a554c0b3f6ecc6e7f0eada77444f11bb0afe38cd44b303f5dfbc6e',
    ],
    clues: [
      tx('A smooth, shiny fabric'),
      tx('The ledge under a window'),
      tx('To exchange something for money'),
      tx('In good health'),
    ],
  },
  {
    id: 'daily-cold', start: 'COLD', salt: '1efef0ffe67d39564f20591e',
    theme: tx('From a symptom to recovery.'),
    hashes: [
      '22d7e36747572cc808b1d2e56239d2d6b732dacccb5b7d3e55326b86e2fed863',
      '180bd70be6385e8e37e4012630ac448d93e210e78ae14b3715a33298c83ca98a',
      'e3b36f71f6842996ec519a375eff7d2515ba30f107dc25c886e30f6163b07a85',
    ],
    clues: [
      tx('A thin rope or string'),
      tx('The central part of something, like an apple’s middle'),
      tx('Recovery from an illness'),
    ],
  },
  {
    id: 'daily-mold', start: 'MOLD', salt: '9e7b042f849c31a34348aae8',
    theme: tx('From fungal mold to recovery.'),
    hashes: [
      '74ed13e193be2976475b8b24430318d7521ade990ef7784053d4beada32c74f6',
      '185c35d197ab6c48e8352f2377401a243854b6cf07ade4127e35ebd89acd4d30',
      '02dcbea606a9702bed0a5a5f1610c9a582e71c2a6e1263fc97a9c82999c46d79',
      '93df3df87eb9ab643f220a305125ad3d4ff2ce7a56a22ceb9de348b4f0bde662',
    ],
    clues: [
      tx('To grip or carry in your hands'),
      tx('Gripped or carried, in the past'),
      tx('The top part of your body'),
      tx('To recover and restore health'),
    ],
  },
  {
    id: 'daily-sore', start: 'SORE', salt: '42da77a5f57f7ef977af4d74',
    theme: tx('From a sore to recovery.'),
    hashes: [
      '6b7001489865d29aaaa49080274b6500cf56dc2a40a90d933a74cd4689c5b035',
      'd731b0c961d60ae333b8edba58821766cb3afe99bc5cedfd9db8d05093543b9c',
    ],
    clues: [
      tx('The central part of something, like an apple’s middle'),
      tx('Recovery from an illness'),
    ],
  },
  {
    id: 'daily-pill', start: 'PILL', salt: '1c6a324c0c376fad15f12571',
    theme: tx('Take medicine exactly as your prescriber says.'),
    hashes: [
      'c33d393b6fa127da530a6fc4f61bb970e21e5e25d07b930b7f718720cddf929d',
      'd35ca6b83d911cfbf135f952f9458eeec963ef877aba380a8a28c8581bcf380f',
      '7f90dcf9cc3dad92ed3d1e64c323160d422d83b8e2c018de89ea8d360b620028',
    ],
    clues: [
      tx('A vote or survey of opinions'),
      tx('The opposite of push'),
      tx('Completely filled'),
    ],
  },
]
