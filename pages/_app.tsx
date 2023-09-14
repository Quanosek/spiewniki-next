import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import { Analytics } from "@vercel/analytics/react";

import "the-new-css-reset/css/reset.css";
import "@/styles/globals.scss";
import "@/styles/themes.scss";

export default function App({ Component, pageProps }: AppProps) {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  useEffect(() => {
    // set global color theme
    const theme =
      localStorage.getItem("colorTheme") || (unlocked ? "black" : "light");

    document.documentElement.className = `${
      unlocked ? "accent_blue" : "accent_orange"
    } ${theme}`;

    // prevent screen from sleeping
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.error(err);
      }
    };

    if ("wakeLock" in navigator) requestWakeLock();

    return () => {
      if (wakeLock !== null) wakeLock.release();
    };
  }, [unlocked]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />
      </Head>

      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
