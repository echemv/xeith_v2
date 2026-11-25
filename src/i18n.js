import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import rows from './translations'

export const LANGS = [['en', 'English'], ['pid', 'Nigerian Pidgin'], ['ha', 'Hausa'], ['yo', 'Yorùbá'], ['ig', 'Igbo'], ['fr', 'Français']]
// English text is the key. tx('text') only marks text for translation; t('text') looks it up. Missing rows show English.
export const tx = (s) => s

const OTHER = ['pid', 'ha', 'yo', 'ig', 'fr']
const resources = { en: { translation: {} } }
OTHER.forEach((c) => { resources[c] = { translation: {} } })
for (const [en, ...tr] of rows) OTHER.forEach((c, i) => { if (tr[i]) resources[c].translation[en] = tr[i] })

const saved = (() => { try { return localStorage.getItem('xeith-lang') } catch { return null } })()
const setHtmlLang = (l) => { document.documentElement.lang = l === 'pid' ? 'pcm' : l }
i18n.use(initReactI18next).init({
  resources, lng: saved && resources[saved] ? saved : 'en', fallbackLng: 'en',
  detection: { order: ['localStorage', 'navigator'] },
  interpolation: { escapeValue: false }, keySeparator: false, nsSeparator: false,
})
i18n.on('languageChanged', (l) => { setHtmlLang(l); try { localStorage.setItem('xeith-lang', l) } catch { /* storage unavailable */ } })
setHtmlLang(i18n.language)
export default i18n
