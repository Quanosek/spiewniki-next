/** @type {import('next').NextConfig} */
import withPWAInit from '@ducanh2912/next-pwa'

const lockedFiles = []
const excludedBooks = [
  'Śpiewnik Koziański',
  'Śpiewnik Poznański',
  'Śpiewniczek Młodzieżowy',
  'Śpiewnik Międzynarodowy (IC)',
  'Pieśni Chóru Syloe',
  'Różne pieśni',
]

excludedBooks.forEach((book) => lockedFiles.push(`!database/${book}.json`))

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

const excludes = ['!libraries/**/*', '!mp3/**/*', '!pdf/**/*'].concat(
  unlocked ? [] : lockedFiles
)

const withPWA = withPWAInit({
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: { disableDevLogs: true },
  publicExcludes: excludes,
})

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
}

export default withPWA(nextConfig)
