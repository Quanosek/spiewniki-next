import { Html, Head, Main, NextScript } from "next/document";
import Image from "next/image";
import Link from "next/link";

export default function Document() {
  return (
    <Html lang="pl">
      <Head>
        {/* meta */}
        <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
        <meta name="theme-color" content="#000000" />

        {/* apple */}
        <meta name="mobile-wep-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Śpiewniki" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* favicon */}
        <link rel="icon" href="/logo/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo/apple-180x180.png" />

        {/* manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <body>
        <header>
          <div className="container">
            <h1>Śpiewniki</h1>

            <Link href="https://www.nastrazy.org/" target="_blank">
              Na Straży.org
              <Image
                className="icon"
                alt="link"
                src="/icons/external_link.svg"
                width={20}
                height={20}
              />
            </Link>
          </div>
        </header>

        <div className="container">
          <Main />
        </div>

        <footer>
          <div className="container">
            <p>Wszelkie prawa zastrzeżone &#169; 2023</p>
          </div>
        </footer>

        <NextScript />
      </body>
    </Html>
  );
}
