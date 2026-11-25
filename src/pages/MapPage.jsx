import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslation } from 'react-i18next'
import regions from '../data/regions.json'
import { AMRIS_URL } from '../config'

const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n }

// Hover a pin for a name tag with an image; click it for the info bubble and source links.
// Data lives in src/data/regions.json. Every claim must carry a source link. Tiles need internet; the list below works offline.
export default function MapPage() {
  const { t } = useTranslation()
  const ref = useRef(null)
  useEffect(() => {
    const map = L.map(ref.current, { minZoom: 5, maxZoom: 10 }).setView([9.1, 8.7], 6)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map)
    regions.forEach((r) => {
      const m = L.marker([r.lat, r.lng], { icon: L.divIcon({ className: 'pin', html: '<span>📍</span>', iconSize: [32, 32], iconAnchor: [16, 30] }) }).addTo(map)
      const tag = el('div', null, 'maptag'); const img = el('img'); img.src = r.image; img.alt = ''; img.width = 28; img.height = 28
      tag.append(img, el('b', r.name)); m.bindTooltip(tag, { direction: 'top', offset: [0, -28] })
      const pop = el('div', null, 'mappop'); pop.append(el('b', r.name))
      pop.append(el('p', r.summary || 'Regional information is being compiled.'))
      r.sources.forEach((s) => { const a = el('a', s.label); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; pop.append(a, document.createElement('br')) })
      const more = el('a', 'amris.online'); more.href = AMRIS_URL; more.target = '_blank'; more.rel = 'noopener noreferrer'; pop.append(more)
      m.bindPopup(pop)
    })
    return () => map.remove()
  }, [])
  return (
    <>
      <h1>{t('Map')}</h1>
      <p className="lead">{t('Tap a pin to see information about that region, with links to the sources.')}</p>
      <div ref={ref} className="map" />
      <p className="muted">{t('The map needs an internet connection. The list below works offline.')}</p>
      <a className="btn" href={AMRIS_URL} target="_blank" rel="noopener noreferrer">{t('Open regional data on amris.online')}</a>
      <div className="grid">
        {regions.map((r) => (
          <div key={r.id} className="card">
            <h3>{r.name}</h3>
            <p>{r.summary || t('Regional information is being compiled.')}</p>
            {r.sources.map((s) => <p key={s.url} className="muted"><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></p>)}
            {r.updated && <p className="muted">{t('Updated')}: {r.updated}</p>}
          </div>
        ))}
      </div>
    </>
  )
}
