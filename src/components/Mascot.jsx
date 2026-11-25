import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../store'
import Bacterium from './Bacterium'

// Floats around the screen, settles bottom right, then says something random. Tap to open the chat.
export default function Mascot() {
  const { t } = useTranslation()
  const { profile } = useApp()
  const name = profile && profile.name
  const msg = useMemo(() => {
    const list = ['Hi! What would you like to ask me today?', 'What would you like to learn about AMR today?']
    if (name) list.push('Welcome back, {{name}}! What would you like to look up today?')
    return t(list[Math.floor(Math.random() * list.length)], { name })
  }, [name, t])
  return (
    <Link to="/chat" className="mascot" aria-label={t('Ask XEITH')}>
      <span className="say">{msg}</span>
      <span className="avatar"><Bacterium size={68} /></span>
    </Link>
  )
}
