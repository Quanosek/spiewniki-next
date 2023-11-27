import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import { initialState } from "@/components/menu/settings";
import Layout from "@/components/layout";

import "the-new-css-reset/css/reset.css";
import "@/styles/globals.scss";
import "@/styles/themes.scss";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
    const settings = JSON.parse(localStorage.getItem("settings") as string);

    // save default settings to local storage
    if (!settings) {
      localStorage.setItem("settings", JSON.stringify(initialState));
    }

    // remove old settings from local storage
    ["colorTheme", "fontSize", "showChords"].forEach((key) => {
      if (localStorage.getItem(key)) localStorage.removeItem(key);
    });

    // global CSS classes
    document.documentElement.className = `${
      unlocked ? "accent_blue" : "accent_orange" // version color accent
    } ${settings?.themeColor}`; // default user theme

    // prevent screen from sleeping
    if (navigator.wakeLock) {
      navigator.wakeLock
        .request("screen")
        .then(() => console.log("Screen Wake-Lock is active."))
        .catch((err) => console.log(err.name, err.message));
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
