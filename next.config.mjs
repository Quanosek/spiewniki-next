/** @type {import('next').NextConfig} */

import withPWAInit from '@ducanh2912/next-pwa'

const excludedIconsArray = ['download.svg', 'filter.svg', 'play.svg']
const excludedIcons = excludedIconsArray.map((icon) => `!icons/${icon}`)

const excludedBooks = ['K', 'P', 'E', 'S', 'R']
const excludedList = excludedBooks.map((book) => `!database/${book}.json`)

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'
const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60

const publicExcludes = ['!pdf/**/*', '!pdf/*.pdf', '!mp3/**/*', '!*.mp3', '!libraries/**/*'].concat(
  unlocked ? [] : [...excludedIcons, ...excludedList]
)

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
    urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'next-data',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
      networkTimeoutSeconds: 3,
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
    urlPattern: ({ sameOrigin, url: { pathname } }) => {
      // Exclude /api/auth/callback/* to fix OAuth workflow in Safari without having an impact on other environments
      // The above route is the default for next-auth, you may need to change it if your OAuth workflow has a different callback route
      // Issue: https://github.com/shadowwalker/next-pwa/issues/131#issuecomment-821894809
      if (!sameOrigin || pathname.startsWith('/api/auth/callback')) {
        return false
      }

      if (pathname.startsWith('/api/')) {
        return true
      }

      return false
    },
    handler: 'NetworkFirst',
    method: 'GET',
    options: {
      cacheName: 'apis',
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
      networkTimeoutSeconds: 5,
    },
  },
  {
    urlPattern: ({ request, url: { pathname }, sameOrigin }) =>
      request.headers.get('RSC') === '1' &&
      request.headers.get('Next-Router-Prefetch') === '1' &&
      sameOrigin &&
      !pathname.startsWith('/api/'),
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'pages-rsc-prefetch',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
    },
  },
  {
    urlPattern: ({ request, url: { pathname }, sameOrigin }) =>
      request.headers.get('RSC') === '1' && sameOrigin && !pathname.startsWith('/api/'),
    handler: 'NetworkFirst',
    options: {
      cacheName: 'pages-rsc',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
      networkTimeoutSeconds: 3,
    },
  },
  {
    urlPattern: ({ url: { pathname }, sameOrigin }) => sameOrigin && !pathname.startsWith('/api/'),
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
  {
    urlPattern: ({ sameOrigin }) => !sameOrigin,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'cross-origin',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: ONE_WEEK_SECONDS,
      },
      networkTimeoutSeconds: 5,
    },
  },
]

const withPWA = withPWAInit({
  cacheOnFrontEndNav: unlocked,
  aggressiveFrontEndNavCaching: unlocked,
  cacheStartUrl: unlocked,
  disable: !unlocked || process.env.NODE_ENV === 'development',
  dest: 'public',
  extendDefaultRuntimeCaching: false,
  publicExcludes,
  register: unlocked,
  reloadOnOnline: unlocked,
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
