import { useTranslation } from 'react-i18next'
import Bacterium from './Bacterium'

// Loading indicator: a rotating bacterium, like the thinking icon in Claude.
export default function Thinking() {
  const { t } = useTranslation()
  return <div className="thinking" role="status" aria-label={t('Thinking')}><Bacterium size={34} spin custom={false} /></div>
}
