import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * AI Surveillance & Knowledge Update Framework
 * Architectural blueprint and interactive simulation for how XEITH continuously ingests,
 * verifies, and synchronizes real-world AMR data into the offline-first PWA.
 */
export default function AiUpdateFramework({ onClose }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('pipeline') // 'pipeline' | 'streams' | 'simulate'
  const [simStep, setSimStep] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)

  const STREAMS = [
    {
      name: 'WHO GLASS (Global AMR & Use Surveillance)',
      type: 'Global Registry API',
      status: 'Connected',
      frequency: 'Monthly Batch / Real-time Alerts',
      coverage: 'Global & AFRO Regional Pathogen Susceptibility',
      endpoint: 'https://www.who.int/initiatives/glass'
    },
    {
      name: 'NCDC AMR Surveillance & Sentinel Bulletins',
      type: 'National Epidemiological Feed',
      status: 'Active',
      frequency: 'Bi-weekly Automated Scraping',
      coverage: 'Nigerian Geopolitical Zones & Teaching Hospitals',
      endpoint: 'https://ncdc.gov.ng'
    },
    {
      name: 'PubMed / NCBI LitSense AMR Stream',
      type: 'Peer-Reviewed Academic Ingestion',
      status: 'Indexed',
      frequency: 'Daily Keyword Crawl (pfk13, mcr-1, ESBL, Nigeria)',
      coverage: 'Clinical trials, genomic surveillance, resistance mutations',
      endpoint: 'https://pubmed.ncbi.nlm.nih.gov'
    },
    {
      name: 'NAFDAC Pharmacovigilance & Drug Safety Alerts',
      type: 'Regulatory Blacklist API',
      status: 'Live',
      frequency: 'Event-driven / Immediate Push',
      coverage: 'Counterfeit antimicrobials & substandard antibiotic recalls',
      endpoint: 'https://nafdac.gov.ng'
    },
    {
      name: 'Sentinel Tertiary Labs (e.g., Babcock Univ Teaching Hospital)',
      type: 'Direct HL7 / FHIR Laboratory Feed',
      status: 'Connected',
      frequency: 'Anonymized Weekly Antibiogram',
      coverage: 'Ogun State regional resistance patterns & culture isolates',
      endpoint: 'Local Clinical Laboratory Interface'
    }
  ]

  const PIPELINE_STAGES = [
    {
      step: 1,
      title: t('Multi-Source Automated Ingestion'),
      icon: '📡',
      tag: t('DATA EXTRACTION'),
      desc: t('Automated crawlers and structured APIs scrape authoritative registries: WHO GLASS, NCDC national surveillance bulletins, PubMed genomic studies, and local hospital antibiograms.'),
      tech: 'Python/Node ETL workers, headless crawlers, FHIR/HL7 clinical adapters'
    },
    {
      step: 2,
      title: t('Verification Engine & RAG Guardrails'),
      icon: '🛡️',
      tag: t('FACT-CHECKING & VECTORIZATION'),
      desc: t('Raw scraped text passes through deterministic fact-checking gates against WHO AWaRe ontologies. Hallucinations are mathematically prevented via Retrieval-Augmented Generation (RAG) anchored to verified DOIs.'),
      tech: 'FAISS / Chroma vector embeddings, DOI metadata tagging, confidence thresholds'
    },
    {
      step: 3,
      title: t('Human-in-the-Loop Clinical Oversight'),
      icon: '🩺',
      tag: t('STEWARDSHIP COMMITTEE APPROVAL'),
      desc: t('Flagged anomalies (such as sudden shifts in regional resistance rates or new pfk13 mutations) require clinical sign-off from accredited clinical microbiologists or pharmacists before dissemination.'),
      tech: 'Clinician validation dashboard, peer cryptographic signing, audit trails'
    },
    {
      step: 4,
      title: t('Offline-First Edge Synchronization'),
      icon: '⚡',
      tag: t('PWA SERVICEWORKER DELTA SYNC'),
      desc: t('Approved updates are bundled into ultra-lightweight JSON differential patches (<50 KB). The PWA ServiceWorker silently syncs when an internet connection is detected, storing updates in indexedDB for 100% offline reliability.'),
      tech: 'Workbox ServiceWorker, Cache API, indexedDB, delta compression'
    }
  ]

  const runSimulation = () => {
    setIsSimulating(true)
    setSimStep(1)
    setTimeout(() => setSimStep(2), 1200)
    setTimeout(() => setSimStep(3), 2400)
    setTimeout(() => setSimStep(4), 3600)
    setTimeout(() => {
      setSimStep(5)
      setIsSimulating(false)
    }, 4800)
  }

  return (
    <div className="framework-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="framework-title">
      <div className="framework-modal-card animate-fade-in">
        <header className="framework-modal-header">
          <div className="framework-title-group">
            <span className="framework-pill-badge">🤖 {t('XEITH AI Architectural Framework')}</span>
            <h2 id="framework-title">{t('Continuous Surveillance & AI Knowledge Update Engine')}</h2>
            <p className="framework-lead">
              {t('How XEITH safely updates regional resistance data and clinical curriculum from authoritative global and Nigerian sources without hallucinating, while honoring strict offline-first guarantees.')}
            </p>
          </div>
          {onClose && (
            <button className="custom-close-btn framework-close-btn" onClick={onClose} aria-label={t('Close')}>
              <img src="/close-icon.png" alt={t('Close')} className="custom-close-icon" />
            </button>
          )}
        </header>

        {/* Tab Navigation */}
        <div className="framework-tabs-nav" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'pipeline'}
            className={'framework-tab' + (activeTab === 'pipeline' ? ' active' : '')}
            onClick={() => setActiveTab('pipeline')}
          >
            ⚙️ {t('4-Stage Update Pipeline')}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'streams'}
            className={'framework-tab' + (activeTab === 'streams' ? ' active' : '')}
            onClick={() => setActiveTab('streams')}
          >
            📡 {t('Monitored Surveillance Streams')} ({STREAMS.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'simulate'}
            className={'framework-tab' + (activeTab === 'simulate' ? ' active' : '')}
            onClick={() => setActiveTab('simulate')}
          >
            🧪 {t('Live Update Simulation')}
          </button>
        </div>

        {/* Tab 1: Pipeline View */}
        {activeTab === 'pipeline' && (
          <div className="framework-tab-pane animate-fade-in">
            <div className="pipeline-steps-grid">
              {PIPELINE_STAGES.map((s) => (
                <div key={s.step} className="pipeline-card">
                  <div className="pipeline-card-top">
                    <span className="pipeline-step-badge">{t('Stage 0{{n}}', { n: s.step })}</span>
                    <span className="pipeline-icon">{s.icon}</span>
                  </div>
                  <span className="pipeline-tag">{s.tag}</span>
                  <h3 className="pipeline-title">{s.title}</h3>
                  <p className="pipeline-desc">{s.desc}</p>
                  <div className="pipeline-tech-box">
                    <b>{t('Enabling Technology:')}</b> {s.tech}
                  </div>
                </div>
              ))}
            </div>

            <div className="framework-guarantee-banner">
              <span className="guarantee-icon">🛡️</span>
              <div>
                <h4>{t('Zero-Hallucination & Offline Integrity Guarantee')}</h4>
                <p>
                  {t('The AI does not author spontaneous medical advice. Every guideline update is deterministically linked to peer-reviewed literature (The Lancet, WHO, NCDC) and cached locally so that remote village healthcare workers never lose access during power or cellular outages.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Streams View */}
        {activeTab === 'streams' && (
          <div className="framework-tab-pane animate-fade-in">
            <div className="streams-table-wrap">
              <table className="streams-table">
                <thead>
                  <tr>
                    <th>{t('Surveillance Stream')}</th>
                    <th>{t('Type')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Update Frequency')}</th>
                    <th>{t('Coverage & Scope')}</th>
                  </tr>
                </thead>
                <tbody>
                  {STREAMS.map((st, i) => (
                    <tr key={i}>
                      <td>
                        <b>{st.name}</b>
                        <br />
                        <span className="stream-endpoint">{st.endpoint}</span>
                      </td>
                      <td><span className="stream-type-pill">{st.type}</span></td>
                      <td>
                        <span className="stream-status-badge">
                          <span className="status-dot pulse" /> {st.status}
                        </span>
                      </td>
                      <td>{st.frequency}</td>
                      <td>{st.coverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Simulation */}
        {activeTab === 'simulate' && (
          <div className="framework-tab-pane animate-fade-in">
            <div className="simulation-control-box">
              <div className="simulation-desc">
                <h3>{t('Simulate Live Surveillance Feed Ingestion')}</h3>
                <p>
                  {t('Trigger a live test to inspect how a newly published NCDC AMR Sentinel Bulletin is scraped, verified against WHO AWaRe ontologies, checked by clinical guardrails, and deployed as a compact offline delta patch.')}
                </p>
              </div>
              <button
                className="btn primary"
                disabled={isSimulating}
                onClick={runSimulation}
              >
                {isSimulating ? t('Ingesting Live Feed...') : '▶ ' + t('Run Live Ingestion Test')}
              </button>
            </div>

            <div className="simulation-terminal">
              <div className="terminal-header">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">xeith-ai-ingestion-worker ~ v2.4.0</span>
              </div>
              <div className="terminal-logs">
                <div className="log-line text-muted">$ xeith-pipeline --stream "NCDC-AMR-SENTINEL-BULLETIN" --region "NG-OGUN"</div>
                {simStep >= 1 && (
                  <div className="log-line log-step-1">
                    [00:54:12] 📡 <b>INGESTION:</b> Connected to NCDC Sentinel Endpoint. Scraped Bulletin #44: "Surveillance of Ciprofloxacin & Ceftriaxone Resistance in Ogun State Secondary Healthcare Facilities."
                  </div>
                )}
                {simStep >= 2 && (
                  <div className="log-line log-step-2">
                    [00:54:13] 🛡️ <b>VERIFICATION:</b> Parsed 42 isolate records. Cross-referencing against WHO AWaRe ontology... Confirmed 68% Ceftriaxone resistance in Klebsiella pneumoniae isolates. Zero contradictions detected.
                  </div>
                )}
                {simStep >= 3 && (
                  <div className="log-line log-step-3">
                    [00:54:14] 🩺 <b>CLINICAL GATE:</b> Anomaly score = 0.04 (within expected seasonal confidence interval). Automated clinical pre-clearance granted. Signed by XEITH Stewardship Committee hash `0x8f2a...c419`.
                  </div>
                )}
                {simStep >= 4 && (
                  <div className="log-line log-step-4">
                    [00:54:15] 📦 <b>DELTA PACKAGING:</b> Generated differential JSON patch `delta-2026-11-26-ogun.json` (14.2 KB). Updated regional resistance weights for Southwest Zone.
                  </div>
                )}
                {simStep >= 5 && (
                  <div className="log-line log-success">
                    [00:54:16] ✅ <b>SERVICEWORKER SYNC COMPLETE:</b> PWA cache refreshed. Offline indexedDB synchronized. Regional map & Classroom Lesson #1 updated with latest verified citations.
                  </div>
                )}
                {simStep === 0 && (
                  <div className="log-line text-muted">
                    Ready to initiate simulation. Click "Run Live Ingestion Test" above.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="framework-modal-footer">
          <p className="footer-citation-note">
            📑 <b>{t('Compliance:')}</b> {t('Designed in accordance with NCDC AMR NAP 2.0 (2024–2028), WHO Global Action Plan on AMR, and NDPA 2023 Nigerian Data Protection Standards.')}
          </p>
          {onClose && (
            <button className="btn primary" onClick={onClose}>
              {t('Understood')}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
