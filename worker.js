import * as chat from './functions/api/chat.js'
import * as account from './functions/api/account.js'
import * as challenges from './functions/api/challenges.js'
import * as facts from './functions/api/facts.js'
import * as map from './functions/api/map.js'

const ROUTES = [
  ['/api/chat', chat],
  ['/api/account', account],
  ['/api/challenges', challenges],
  ['/api/facts', facts],
  ['/api/map', map],
]

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), payment=()',
}

function withSecurityHeaders(res) {
  if (!res) return res
  const headers = new Headers(res.headers)
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(k)) headers.set(k, v)
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  })
}

function getHandler(mod, method) {
  const cap = method[0].toUpperCase() + method.slice(1).toLowerCase()
  return mod['onRequest' + cap] || mod.onRequest || null
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)

    for (const [prefix, mod] of ROUTES) {
      if (pathname === prefix || pathname.startsWith(prefix + '/')) {
        const handler = getHandler(mod, request.method)
        if (!handler) {
          return withSecurityHeaders(new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
          }))
        }
        const res = await handler({ request, env, ctx, params: {} })
        return withSecurityHeaders(res)
      }
    }

    const assetRes = await env.ASSETS.fetch(request)
    return withSecurityHeaders(assetRes)
  },
}
