import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Bacterium from './Bacterium'

export default function PageLoader() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger loading sequence on route navigation
    setVisible(true)
    setProgress(30)

    const timer1 = setTimeout(() => {
      setProgress(75)
    }, 120)

    const timer2 = setTimeout(() => {
      setProgress(100)
    }, 280)

    const timer3 = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 450)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname])

  if (!visible && progress === 0) return null

  return (
    <div className="page-loader-root" aria-hidden={!visible}>
      {/* Top glowing progress line */}
      <div
        className="top-progress-bar"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0
        }}
        role="progressbar"
        aria-label={t('Loading page')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      />

      {/* Floating cute microbe loading pill badge */}
      {visible && progress < 100 && (
        <div className="page-loading-badge" role="status" aria-live="polite">
          <Bacterium size={18} spin custom={false} />
          <span className="badge-text">{t('Loading...')}</span>
        </div>
      )}
    </div>
  )
}
