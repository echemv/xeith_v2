import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Intro from './components/Intro'
import Welcome from './components/Welcome'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Play from './pages/Play'
import Challenges from './pages/Challenges'
import MapPage from './pages/MapPage'
import Chat from './pages/Chat'
import Account from './pages/Account'

const get = (s, k) => { try { return s.getItem(k) } catch { return null } }
const put = (s, k) => { try { s.setItem(k, '1') } catch { /* storage unavailable */ } }

// Flow: intro animation (once per session) -> first-visit language screen (once ever) -> app.
export default function App() {
  const next = () => (get(localStorage, 'xeith-seen') ? 'app' : 'welcome')
  const [stage, setStage] = useState(get(sessionStorage, 'xeith-intro') ? next() : 'intro')
  if (stage === 'intro') return <Intro onDone={() => { put(sessionStorage, 'xeith-intro'); setStage(next()) }} />
  if (stage === 'welcome') return <Welcome onDone={() => { put(localStorage, 'xeith-seen'); setStage('app') }} />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Learn />} />
        <Route path="play" element={<Play />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="map" element={<MapPage />} />
        <Route path="chat" element={<Chat />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
