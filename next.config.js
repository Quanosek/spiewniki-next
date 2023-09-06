import withPWA from "next-pwa";

export default withPWA({
  // PWA settings
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})({
  // Next.js settings
  reactStrictMode: true,
});
