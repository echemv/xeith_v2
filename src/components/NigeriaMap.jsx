import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Precise relative positions on the hand-drawn illustrated map
const REGIONS_ON_MAP = [
  {
    id: 'nw',
    name: 'North West',
    left: '36%',
    top: '20%',
    hub: 'Kano (AKTH)',
    states: 'Sokoto, Kano, Kaduna, Katsina, Kebbi, Zamfara, Jigawa'
  },
  {
    id: 'ne',
    name: 'North East',
    left: '77%',
    top: '24%',
    hub: 'Maiduguri (UMTH)',
    states: 'Borno, Yobe, Adamawa, Bauchi, Gombe, Taraba'
  },
  {
    id: 'nc',
    name: 'North Central',
    left: '43%',
    top: '46%',
    hub: 'Abuja (National Hospital)',
    states: 'FCT Abuja, Niger, Kwara, Kogi, Plateau, Nasarawa, Benue'
  },
  {
    id: 'sw',
    name: 'South West',
    left: '18%',
    top: '64%',
    hub: 'Lagos & Ibadan (LUTH / UCH)',
    states: 'Lagos, Oyo, Ogun, Osun, Ondo, Ekiti'
  },
  {
    id: 'se',
    name: 'South East',
    left: '50%',
    top: '73%',
    hub: 'Enugu (UNTH)',
    states: 'Enugu, Anambra, Imo, Abia, Ebonyi'
  },
  {
    id: 'ss',
    name: 'South South',
    left: '42%',
    top: '84%',
    hub: 'Port Harcourt (UPTH)',
    states: 'Rivers, Delta, Bayelsa, Akwa Ibom, Cross River, Edo'
  }
]

export default function NigeriaMap({ regions, selectedId, onSelectRegion }) {
  const { t } = useTranslation()
  const [hoveredId, setHoveredId] = useState(null)

  const activeId = selectedId || hoveredId

  return (
    <div className="illustrated-map-card">
      <div className="illustrated-map-wrapper">
        {/* Hand-drawn Illustrated Map Image */}
        <img
          src="/nigeria-illustrated-map.jpg"
          alt={t('Illustrated Hand-Drawn Map of Nigeria')}
          className="illustrated-map-img"
          draggable="false"
        />

        {/* 3D Animated Floating Pins Layer */}
        <div className="map-pins-layer" aria-label={t('Regional AMR Sentinel Sites')}>
          {REGIONS_ON_MAP.map((r, idx) => {
            const isSelected = activeId === r.id
            // Offset rotation start so each pin rotates with organic phase difference
            const animDelay = `${(idx * 0.85).toFixed(2)}s`

            return (
              <div
                key={r.id}
                className={`pin-marker-anchor ${isSelected ? 'is-selected' : ''}`}
                style={{
                  left: r.left,
                  top: r.top,
                  zIndex: isSelected ? 30 : 10 + idx
                }}
                onClick={() => onSelectRegion(r.id)}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
                aria-label={`${r.name} - ${r.hub}`}
              >
                {/* 3D Bouncy & Rotating Pin */}
                <div
                  className="pin-3d-rotator"
                  style={{ animationDelay: animDelay }}
                >
                  <img
                    src="/pin-3d.png"
                    alt=""
                    className="pin-3d-img"
                    draggable="false"
                  />
                </div>

                {/* Ground Shadow underneath the 3D pin tip */}
                <div
                  className="pin-ground-shadow"
                  style={{ animationDelay: animDelay }}
                />

                {/* Sentinel Hub Floating Pill Badge */}
                <div className="pin-tooltip-pill">
                  <span className="pin-zone-label">{r.name}</span>
                  <span className="pin-hub-label">{r.hub}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="illustrated-map-caption">
        <span className="caption-icon">✨</span>
        <span>{t('Tap any bouncing 3D pin to inspect regional AMR findings and sentinel data.')}</span>
      </div>
    </div>
  )
}
