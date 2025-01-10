import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/team-builder/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['soccer-192.png', 'soccer-512.png', 'screenshot-desktop.png', 'screenshot-mobile.png'],
      manifest: {
        name: 'Soccer Team Builder',
        short_name: 'Team Builder',
        description: 'Build and balance soccer teams with skill-based distribution',
        theme_color: '#2E7D32',
        background_color: '#F5F5F5',
        display: 'standalone',
        start_url: '/team-builder/',
        scope: '/team-builder/',
        icons: [
          {
            src: 'soccer-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'soccer-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'soccer-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'soccer-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Soccer Team Builder on Desktop'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '1080x1920',
            type: 'image/png',
            label: 'Soccer Team Builder on Mobile'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
