/** @type {import('next').NextConfig} */

import withPWAInit from '@ducanh2912/next-pwa'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'
const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60

const variantPublicExcludes = unlocked
  ? ['!logo/orange/**/*', '!manifest-orange.json']
  : [
      '!logo/blue/**/*',
      '!manifest-blue.json',
      '!icons/download.svg',
      '!icons/filter.svg',
      '!icons/play.svg',

      '!database/Śpiewnik Koziański.json',
      '!database/Śpiewnik Poznański.json',
      '!database/Śpiewniczek Młodzieżowy.json',
      '!database/Prosławmo Hospoda Piśniamy (UA).json',
      '!database/Chór Międzynarodowy (IC)/**/*',
      '!database/Pieśni Chóru Syloe.json',
      '!database/Różne pieśni.json',
    ]

const publicExcludes = ['!pdf/**/*', '!mp3/**/*', '!libraries/**/*', ...variantPublicExcludes]

const runtimeCaching = [
  {
    urlPattern: /^\/covers\/.*\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'cover-image-assets',
      expiration: {
        maxEntries: 400,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'google-fonts',
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
    },
  },
  {
    urlPattern: /\.(?:js|css|less|eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-assets',
      expiration: {
        maxEntries: 256,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
    },
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-image-assets',
      expiration: {
        maxEntries: 256,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
    },
  },
  {
    urlPattern: /\/_next\/image\?url=.+$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-image',
      expiration: {
        maxEntries: 256,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
    },
  },
  {
    urlPattern: /\.(?:json|xml|csv)$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'static-data-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: {
      cacheName: 'pages',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
      networkTimeoutSeconds: 3,
    },
  },
]

const withPWA = withPWAInit({
  cacheOnFrontEndNav: unlocked,
  cacheStartUrl: unlocked,
  disable: !unlocked || process.env.NODE_ENV === 'development',
  dest: 'public',
  publicExcludes,
  workboxOptions: {
    runtimeCaching,
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    disableDevLogs: true,
    navigationPreload: true,
    skipWaiting: true,
  },
})

const nextConfig = {
  reactStrictMode: true,
}

export default withPWA(nextConfig)
