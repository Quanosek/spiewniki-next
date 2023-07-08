import withPWA from "next-pwa";

export default withPWA({
  // PWA settings
  disable: process.env.NODE_ENV === "development",
  dest: "public",
  register: true,
  skipWaiting: true,
  sw: "sw.js",
})({
  // Next.js settings
  reactStrictMode: true,
});
