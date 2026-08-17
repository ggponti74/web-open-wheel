import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Motorsport Dashboard',
        short_name: 'Motorsport',
        description: 'Standings, next race, and news for F1, F2, F3, IndyCar, and Formula E',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // cache the scraped/live JSON data so the app works offline
        // with the last successfully fetched standings/news
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'motorsport-data' }
          }
        ]
      }
    })
  ]
});
