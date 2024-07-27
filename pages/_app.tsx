import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { defaultSettings } from "@/components/menu/settings";
import Layout from "@/components/layout";

import "the-new-css-reset/css/reset.css";
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
    const settings = JSON.parse(localStorage.getItem("settings") as string);

    //  default settings params
    if (!settings) {
      localStorage.setItem("settings", JSON.stringify(defaultSettings));
      window.location.reload();
    }

    // global theme
    document.documentElement.className = `${
      unlocked ? "accent_blue" : "accent_orange" // default color accent
    } ${settings?.themeColor}`; // user theme

    // prevent screen from sleeping
    if (navigator.wakeLock) {
      navigator.wakeLock.request("screen").catch((err) => console.error(err));
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1, width=device-width, user-scalable=no"
        />
      </Head>

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
