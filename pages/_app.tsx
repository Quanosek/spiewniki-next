import type { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect } from "react";

import "the-new-css-reset/css/reset.css";
import "@/styles/themes.scss";
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // set global color theme
    const theme = localStorage.getItem("colorTheme")
      ? localStorage.getItem("colorTheme")
      : "black";
    // : "light";

    document.documentElement.className = theme as string;

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
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
