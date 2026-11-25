import { MASCOT_SRC } from '../config'

// Cute placeholder avatar. Set MASCOT_SRC in config.js to use your own image.
export default function Bacterium({ size = 64, spin = false, custom = true }) {
  if (custom && MASCOT_SRC) return <img src={MASCOT_SRC} width={size} height={size} alt="" />
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={spin ? 'spin' : ''} aria-hidden="true">
      {[14, 24, 40, 50].map((x) => <line key={x} x1={x} y1="19" x2={x - (x < 32 ? 3 : -3)} y2="9" stroke="#176B65" strokeWidth="3" strokeLinecap="round" />)}
      <rect x="8" y="18" width="48" height="30" rx="15" fill="#2A8F86" stroke="#176B65" strokeWidth="3" />
      <circle cx="25" cy="31" r="3.2" fill="#102D3A" /><circle cx="39" cy="31" r="3.2" fill="#102D3A" />
      <circle cx="19" cy="38" r="3" fill="#D6A84B" opacity=".7" /><circle cx="45" cy="38" r="3" fill="#D6A84B" opacity=".7" />
      <path d="M27 38q5 4.5 10 0" stroke="#102D3A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}
