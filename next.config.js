import withPWA from "next-pwa";

export default withPWA({
  // PWA settings
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  skipWaiting: true,
  publicExcludes: ["!pdf/**/*"],
})({
  // Next.js settings
  reactStrictMode: true,
});
