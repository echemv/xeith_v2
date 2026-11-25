import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/fraunces/600.css'
import './i18n'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>)
