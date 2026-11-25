import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'XEITH', short_name: 'XEITH', description: 'Learn about antimicrobial resistance (AMR) in a language you understand.',
        theme_color: '#102D3A', background_color: '#F5F3EC', display: 'standalone', start_url: '/',
        icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [{
          urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/,
          handler: 'CacheFirst',
          options: { cacheName: 'osm-tiles', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } },
        }],
      },
    }),
  ],
})
