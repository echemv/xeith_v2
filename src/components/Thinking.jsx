import { useTranslation } from 'react-i18next'

// Loading indicator: rotating red spiky microbe icon.
export default function Thinking() {
  const { t } = useTranslation()
  return (
    <div className="thinking" role="status" aria-label={t('Thinking')}>
      <img
        src="/thinking-icon.png"
        width={38}
        height={38}
        className="spin"
        style={{ objectFit: 'contain' }}
        alt=""
        aria-hidden="true"
      />
    </div>
  )
}
