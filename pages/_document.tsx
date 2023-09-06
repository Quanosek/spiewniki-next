import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";
import Image from "next/image";

import { Footer } from "@/components/elements";

export default function Document() {
  return (
    <Html lang="pl">
      <Head>
        {/* default setup */}
        <meta httpEquiv="content-type" content="text/html; charset=utf-8" />
        <meta name="theme-color" content="#000000" />

        <meta
          name="description"
          content="Zebrane w jednym miejscu śpiewniki i pieśni religijne. | Wszelkie prawa zastrzeżone &#169; 2023"
        />

        {/* prevent indexing */}
        <meta name="robots" content="none" />

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

        {/* working PWA */}
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>

      <body>
        <header>
          <div className="container">
            <Link
              href="/"
              title="Zebrane w jednym miejscu śpiewniki i pieśni religijne."
            >
              <Image
                className="icon"
                alt="logotype"
                src="./logo/bpsw.svg"
                width={40}
                height={40}
                draggable={false}
              />

              <h1>Śpiewniki</h1>
            </Link>

            <Link
              className="externalLink"
              href="https://www.nastrazy.org/"
              target="_blank"
            >
              <p>Na straży.org</p>

              <Image
                className="icon"
                alt="link"
                src="/icons/external_link.svg"
                width={16}
                height={16}
                draggable={false}
              />
            </Link>
          </div>
        </header>

        <div className="container">
          <Main />
        </div>

        <footer>
          <Footer />
        </footer>

        <NextScript />
      </body>
    </Html>
  );
}
