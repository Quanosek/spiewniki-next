import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import "the-new-css-reset/css/reset.css";
import "@/styles/themes.scss";
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // set global color theme
    const theme = localStorage.getItem("colorTheme")
      ? localStorage.getItem("colorTheme")
      : "black";

    document.documentElement.className = theme as string;
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
