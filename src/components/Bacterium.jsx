import { MASCOT_SRC } from '../config'

// XEITH green bacterium mascot (extracted image + matching crisp vector SVG fallback).
export default function Bacterium({ size = 64, spin = false, custom = true, style }) {
  if (custom && MASCOT_SRC) {
    return (
      <img
        src={MASCOT_SRC}
        width={size}
        height={size}
        className={spin ? 'spin' : ''}
        style={{ objectFit: 'contain', ...style }}
        alt=""
        aria-hidden="true"
      />
    )
  }
  return (
    <svg viewBox="0 0 120 110" width={size} height={size} className={spin ? 'spin' : ''} style={style} aria-hidden="true">
      {/* 14 knobbed stalks around the oval body matching the bottom-left green mascot */}
      {[
        [60, 22, 60, 9],
        [43, 24, 39, 11],
        [28, 30, 20, 19],
        [18, 41, 8, 35],
        [15, 55, 5, 55],
        [18, 69, 9, 77],
        [29, 80, 22, 91],
        [44, 86, 40, 99],
        [60, 88, 60, 101],
        [76, 86, 80, 99],
        [91, 80, 98, 91],
        [102, 69, 111, 77],
        [105, 55, 115, 55],
        [102, 41, 112, 35],
        [92, 30, 100, 19],
        [77, 24, 81, 11],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#92B84B" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx={x2} cy={y2} r="5.2" fill="#92B84B" />
        </g>
      ))}
      {/* Main green horizontal oval body */}
      <ellipse cx="60" cy="55" rx="44" ry="32" fill="#92B84B" />
      {/* Darker green organic spots */}
      <ellipse cx="36" cy="40" rx="8.5" ry="6" transform="rotate(-18 36 40)" fill="#7A9E3A" />
      <ellipse cx="83" cy="42" rx="7" ry="5" transform="rotate(15 83 42)" fill="#7A9E3A" />
      <circle cx="88" cy="66" r="3.2" fill="#7A9E3A" />
      <circle cx="53" cy="76" r="2.4" fill="#7A9E3A" />
      {/* Pink oval cheeks */}
      <ellipse cx="36" cy="63" rx="8" ry="4.5" fill="#F4A3B4" />
      <ellipse cx="84" cy="63" rx="8" ry="4.5" fill="#F4A3B4" />
      {/* Cute black eyes with white catchlights */}
      <circle cx="48" cy="54" r="5" fill="#111111" />
      <circle cx="46.4" cy="52.4" r="1.7" fill="#FFFFFF" />
      <circle cx="72" cy="54" r="5" fill="#111111" />
      <circle cx="70.4" cy="52.4" r="1.7" fill="#FFFFFF" />
      {/* Smiling mouth */}
      <path d="M54.5 60.5 Q60 67.5 65.5 60.5" stroke="#111111" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}
