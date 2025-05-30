/** @type {import('next').NextConfig} */

import withPWAInit from "@ducanh2912/next-pwa";

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

const lockedFiles = new Array();

[
  "Śpiewniczek Młodzieżowy",
  "Śpiewnik Koziański",
  "Śpiewnik Poznański",
  "Pieśni Chóru Syloe",
  "Śpiewnik Międzynarodowy (IC)",
  "Różne pieśni",
].forEach((book) => lockedFiles.push(`!database/${book}.json`));

const excludes = ["!libraries/**/*", "!pdf/**/*"].concat(
  unlocked ? [] : lockedFiles
);

// PWA options
const withPWA = withPWAInit({
  disable: process.env.NODE_ENV === "development",
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: { disableDevLogs: true },
  publicExcludes: excludes,
});

// Next.js settings
export default withPWA({
  reactStrictMode: true,
  swcMinify: true,
  images: { minimumCacheTTL: 60 },
});
