// @ts-check

import withPWA from "next-pwa";

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

const lockedFiles = new Array();
[
  "Śpiewniczek Młodzieżowy",
  "Śpiewnik Koziański",
  "Śpiewnik Poznański",
  "Różne pieśni",
  "Pieśni Chóru Syloe",
].forEach((book) => {
  return lockedFiles.push(`!database/${book}.json`);
});

const excludes = ["!pdf/**/*", "!libraries/**/*"].concat(
  unlocked ? [] : lockedFiles
);

export default withPWA({
  // PWA settings
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  skipWaiting: true,
  publicExcludes: excludes,
})({
  // Next.js settings
  reactStrictMode: true,
});
