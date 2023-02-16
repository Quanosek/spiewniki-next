import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="pl">
      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-HCQEGEJ39Q"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-HCQEGEJ39Q');
      `}
      </Script>

      <Head>
        {/* meta */}
        <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
        <meta name="theme-color" content="#000000" />

        {/* apple */}
        <meta name="mobile-wep-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="white" />
        <meta name="apple-mobile-web-app-title" content="Śpiewniki" />

        {/* favicon */}
        <link rel="icon" href="/logo/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo/apple-180x180.png" />

        {/* manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />

        <footer>
          <div>
            <p>
              Stworzone przez{" "}
              <a href="https://github.com/Krist0f0l0s">
                Krzysztofa Olszewskiego
              </a>{" "}
              i <a href="https://github.com/Quanosek">Jakuba Kłało</a>.
            </p>
            <p>
              Wszelkie prawa zastrzeżone &#169; 2023 │ domena{" "}
              <a href="https://www.klalo.pl">klalo.pl</a>
            </p>
          </div>
        </footer>

        <NextScript />
      </body>
    </Html>
  );
}
