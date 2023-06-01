import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import "the-new-css-reset/css/reset.css";
import "@/styles/themes.scss";
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // set theme
    let theme = localStorage.getItem("theme");
    if (!theme) theme = "light"; // default theme
    document.documentElement.className = theme;
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
