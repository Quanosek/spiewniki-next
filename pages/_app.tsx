import type { AppProps } from "next/app";
import Head from "next/head";

import "the-new-css-reset/css/reset.css";
import "@styles/theme.scss";
import "@styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
