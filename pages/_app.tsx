import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import Layout from "@/components/layout";

import "the-new-css-reset/css/reset.css";
import "@/styles/globals.scss";
import "@/styles/themes.scss";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

    // set global coloring
    document.documentElement.className = `${
      unlocked ? "accent_blue" : "accent_orange" // version color accent
    } ${localStorage.getItem("colorTheme") || (unlocked ? "black" : "light")}`; // default user theme

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
