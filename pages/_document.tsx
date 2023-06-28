import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";
import Image from "next/image";

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
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <body>
        <header>
          <div className="container">
            <Link href="/">
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
          </div>
        </header>

        <div className="container">
          <Main />
        </div>

        <footer>
          <div className="container">
            <p>
              Stworzone z ❤️ przez{" "}
              <Link href="https://github.com/Quanosek">Jakuba Kłało</Link>
              {" i "}
              <Link href="https://github.com/Krist0f0l0s">
                Krzysztofa Olszewskiego
              </Link>
              .
            </p>

            <p>Wszelkie prawa zastrzeżone &#169; 2023</p>
          </div>
        </footer>

        <NextScript />
      </body>
    </Html>
  );
}
