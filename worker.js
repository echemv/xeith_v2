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
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return handler({ request, env, ctx, params: {} })
      }
    }

    return env.ASSETS.fetch(request)
  },
}
