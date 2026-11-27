import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'
import regions from '../data/regions.json'
import { AMRIS_URL } from '../config'
import NigeriaMap from '../components/NigeriaMap'

const el = (tag, text, cls) => {
  const n = document.createElement(tag)
  if (text) n.textContent = text
  if (cls) n.className = cls
  return n
}

export default function MapPage() {
  const { t } = useTranslation()
  const [mapMode, setMapMode] = useState('stylized') // 'stylized' | 'leaflet'
  const [selectedId, setSelectedId] = useState('sw') // Default to South West or first
  const leafletRef = useRef(null)
  const mapInstance = useRef(null)

  const selectedRegion = regions.find((r) => r.id === selectedId) || regions[0]

  // Initialize or teardown Leaflet only when in 'leaflet' mode
  useEffect(() => {
    if (mapMode !== 'leaflet') {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
      return
    }

    if (!leafletRef.current) return

    const map = L.map(leafletRef.current, { minZoom: 5, maxZoom: 10 }).setView([8.8, 8.7], 6)
    mapInstance.current = map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    regions.forEach((r, idx) => {
      const animDelay = `${(idx * 0.85).toFixed(2)}s`
      const pinHtml = `
        <div class="leaflet-3d-pin-wrap">
          <div class="pin-3d-rotator" style="animation-delay: ${animDelay};">
            <img src="/pin-3d.png" class="pin-3d-img" alt="" draggable="false" />
          </div>
          <div class="pin-ground-shadow" style="animation-delay: ${animDelay};"></div>
        </div>
      `

      const m = L.marker([r.lat, r.lng], {
        icon: L.divIcon({
          className: 'leaflet-3d-marker',
          html: pinHtml,
          iconSize: [44, 64],
          iconAnchor: [22, 58],
          popupAnchor: [0, -58]
        })
      }).addTo(map)

      const tag = el('div', null, 'maptag')
      const img = el('img')
      img.src = r.image
      img.alt = ''
      img.width = 28
      img.height = 28
      tag.append(img, el('b', r.name))
      m.bindTooltip(tag, { direction: 'top', offset: [0, -28] })

      const pop = el('div', null, 'mappop')
      pop.append(el('b', r.name))
      pop.append(el('p', r.summary || 'Regional information is being compiled.'))
      r.sources.forEach((s) => {
        const a = el('a', s.label)
        a.href = s.url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        pop.append(a, document.createElement('br'))
      })
      const more = el('a', 'amris.online')
      more.href = AMRIS_URL
      more.target = '_blank'
      more.rel = 'noopener noreferrer'
      pop.append(more)
      m.bindPopup(pop)
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [mapMode])

  return (
    <div className="map-page-wrap">
      <div className="map-page-header">
        <div>
          <h1>{t('Regional AMR Surveillance')}</h1>
          <p className="lead">
            {t('Explore antimicrobial resistance profiles, sentinel teaching hospitals, and verified surveillance data across Nigeria.')}
          </p>
        </div>

        {/* View Mode Toggle: Stylized (Cute) vs Classic Leaflet GIS */}
        <div className="map-view-toggle" role="group" aria-label={t('Map Style Toggle')}>
          <button
            type="button"
            className={`map-toggle-btn ${mapMode === 'stylized' ? 'active' : ''}`}
            onClick={() => setMapMode('stylized')}
          >
            🎨 {t('Stylized Map')}
          </button>
          <button
            type="button"
            className={`map-toggle-btn ${mapMode === 'leaflet' ? 'active' : ''}`}
            onClick={() => setMapMode('leaflet')}
          >
            🗺️ {t('Classic GIS Map')}
          </button>
        </div>
      </div>

      {/* Main Map Presentation */}
      {mapMode === 'stylized' ? (
        <div className="stylized-map-layout">
          {/* Animated SVG Map */}
          <NigeriaMap
            regions={regions}
            selectedId={selectedId}
            onSelectRegion={(id) => setSelectedId(id)}
          />

          {/* Active Region Feature Card */}
          {selectedRegion && (
            <div className="selected-region-card">
              <div className="selected-region-top">
                <span className="region-badge">{selectedRegion.name}</span>
                <span className="region-update-time">
                  {t('Surveillance')} · {selectedRegion.updated || '2026'}
                </span>
              </div>
              <h2 className="selected-region-title">{selectedRegion.name} Geopolitical Zone</h2>
              <p className="selected-region-summary">{selectedRegion.summary}</p>

              <div className="selected-region-sources">
                <span className="sources-label">{t('Verified Data Sources')}:</span>
                {selectedRegion.sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-chip-link"
                  >
                    ↗ {s.label}
                  </a>
                ))}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Link
                  to={selectedRegion.id === 'sw' ? '/learn?module=one-health' : '/learn?module=bacteria'}
                  className="btn ghost"
                  style={{ fontSize: '.8rem', padding: '6px 12px' }}
                >
                  📖 {selectedRegion.id === 'sw' ? t('Study Ogun & One Health →') : t('Study Bacterial AMR →')}
                </Link>
                <Link to="/play" className="btn ghost" style={{ fontSize: '.8rem', padding: '6px 12px' }}>
                  🧪 {t('Practice in The AMR Lab →')}
                </Link>
                <Link to="/chat" className="btn ghost" style={{ fontSize: '.8rem', padding: '6px 12px' }}>
                  💬 {t('Ask XEITH →')}
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="leaflet-map-wrapper">
          <div ref={leafletRef} className="map" />
          <p className="muted">{t('The classic GIS map requires an internet connection for OpenStreetMap tiles.')}</p>
        </div>
      )}

      {/* External AMRIS Link */}
      <div className="map-actions-bar">
        <a className="btn ghost" href={AMRIS_URL} target="_blank" rel="noopener noreferrer">
          {t('Open regional data on amris.online')} ↗
        </a>
      </div>

      {/* Offline Regional Cards Grid */}
      <div className="section-head">
        <h2>{t('All Geopolitical Zones')}</h2>
        <p>{t('Complete regional summaries and sentinel data available offline.')}</p>
      </div>

      <div className="grid">
        {regions.map((r) => {
          const isSelected = r.id === selectedId
          return (
            <div
              key={r.id}
              className={`card ${isSelected ? 'highlight-card' : ''}`}
              onClick={() => setSelectedId(r.id)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{r.name}</h3>
              <p>{r.summary || t('Regional information is being compiled.')}</p>
              {r.sources.map((s, idx) => (
                <p key={idx} className="muted">
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </p>
              ))}
              {r.updated && (
                <p className="muted">
                  {t('Updated')}: {r.updated}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
