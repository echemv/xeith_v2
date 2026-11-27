import { tx } from '../i18n'

// Weekly Word Ladder pools. Only the start word ships in plain text.
// Each rung answer is stored as SHA-256(`${salt}:${id}:${rung}:${WORD}`) in hex, rung = 1..7.
// The target is the rung 7 answer, so it stays hidden until the ladder is complete.
// Note: a one-letter change has at most ~100 candidates, so these hashes stop casual reading
// of the bundle, not a determined player. Scores stay unverified until a server check exists.
export const LADDER_POOLS = [
  {
    id: 'germ-heal',
    start: 'GERM',
    salt: '4eb47a364456b3262c4a7da0',
    theme: tx('From microbe to recovery: 7 daily steps, one letter at a time.'),
    hashes: [
      'c3b821b62c2867a3a3ef1517f5df026d2dd89274046eb0864d9dd3678be3f95e',
      'f497254fab6a34249ba5d4a8d4b7f7fefd90518b993f1948f67ed19babd183fb',
      '9100c75a1076cd1103c06224f469a75ebe2e0269b92f3aef71ebe46701949e6b',
      '3dae6c8cc4cdc7241e2b2e2943b78bdaed8ef6f7d72882c88267034f4d03801c',
      '5581ae9e9a7b9f926942670be8419b722e8d0ce48d591063cde0a1dfe7ce2095',
      '369cc167d9a5b43d0140f7864e6b5b7ae11cf97837ff4dba2cb5f050201646cb',
      '91d4f91a906da285b7b6de8c191c24c27a044cce4ea2bfc5aa4600a8c944d9db',
    ],
    clues: [
      tx('A specific period, or a technical word'),
      tx('To be full of or swarm with life'),
      tx('Placed on a golf tee, or prepared'),
      tx('To supply with nourishment or food'),
      tx('To perceive through touch or emotion'),
      tx('The rear part of the human foot'),
      tx('To recover and restore health'),
    ],
  },
  {
    id: 'sick-well',
    start: 'SICK',
    salt: '61d1f72ddacbe44a71926a6a',
    theme: tx('From illness to good health: 7 daily steps, one letter at a time.'),
    hashes: [
      'e395a2125f98528b417d452f61d6f9bed500f55c54741dab34e801060005b562',
      '1f3ddd2e4f71f3e24aff579667e77b60f2928b98cfde5a5b52d86c11a9ea36a7',
      'f16aa01f14b1c274bb2bcfab43c69d91ab1afdcf777ccd20bbe4f981f7940f50',
      'd9603cd088c27d797250f7fdfbbeb5052f120665447d3fbe48d2f983173f5a5d',
      '371a044a37a351f9df732d4782c9358956cf05e4ae3bada642bbb2b26919e48f',
      '0008a2bb46ab01eb9870418a382f6ee289e7163db8d73b427c79b5fd2023a2f3',
      'eb4f5e5340d0bd7c4da024fa77d9f629e5b9642efa53f617132111fb188c70f3',
    ],
    clues: [
      tx('A large bag for carrying goods'),
      tx('Went down under water'),
      tx('Where you wash your hands with soap'),
      tx('A smooth, shiny fabric'),
      tx('The ledge under a window'),
      tx('To exchange something for money'),
      tx('Healthy again'),
    ],
  },
  {
    id: 'risk-safe',
    start: 'RISK',
    salt: 'd885cf7b6d9d1093f5a2d85d',
    theme: tx('From risk to protection: 7 daily steps of stewardship.'),
    hashes: [
      'c622493cf5065ae333df5f33c1eeaad644e687ab5f1bf3316cc1d098729523d5',
      'b8f2b0d2c3849cf97521f60ee64600deb67eb281d74d7801ec692fdfbb2df63d',
      '9b70db7155e3b8a242edb6a3ad8a3821382bc875d362162cfd4ab3c4518d853b',
      'a4d1f597d754182a05459a1e354efa6d55a5cf8c52c9a499de0d27db3e4f4d03',
      '47e07ee9d7dc9d9ffa37b5ed35677b63212a69561c28ed1e4b3af1373772f22f',
      '71f5f9b509fe9b91197dbba4ebd943fd058dbc4c6d887dd37115b1211c88eb9b',
      '8b09129554237eb27baf396b39b675b2e9d15dd62882a2fefcf2fbee95d12abc',
    ],
    clues: [
      tx('To go up or get higher'),
      tx('A grain eaten across Nigeria'),
      tx('A contest of speed'),
      tx('The front of your head'),
      tx('What is destined to happen'),
      tx('To satisfy hunger fully'),
      tx('Protected from harm'),
    ],
  },
]

export const RUNG_POINTS = 10
export const REVEAL_COST = 2
export const RUNG_FLOOR = 4
export const COMPLETE_POINTS = 50

const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')

export async function hashRung(pool, rung, word) {
  const data = new TextEncoder().encode(`${pool.salt}:${pool.id}:${rung}:${word.toUpperCase()}`)
  return hex(await crypto.subtle.digest('SHA-256', data))
}

export async function checkRung(pool, rung, word) {
  return (await hashRung(pool, rung, word)) === pool.hashes[rung - 1]
}

// Finds the changed position and letter for a rung by trying every one-letter change
// of the previous word against the stored hash. Nothing in plain text is needed.
export async function solveRung(pool, rung, prev) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let pos = 0; pos < prev.length; pos++) {
    for (const ch of A) {
      if (ch === prev[pos]) continue
      const word = prev.slice(0, pos) + ch + prev.slice(pos + 1)
      if (await checkRung(pool, rung, word)) return { pos, letter: ch }
    }
  }
  return null
}
