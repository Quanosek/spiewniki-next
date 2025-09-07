import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

  return (
    <Html lang='pl'>
      <Head>
        <meta name='theme-color' content='#000000' />
        <meta httpEquiv='content-type' content='text/html; charset=utf-8' />
        <meta
          name='description'
          content='Zebrane w jednym miejscu różne śpiewniki i pieśni religijne. Wszelkie prawa zastrzeżone &#169; 2022-2024'
        />

        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-title' content='Śpiewniki' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />

        {unlocked ? (
          <>
            {/* https://spiewniki.klalo.pl */}

            <meta name='robots' content='none' />

            <link rel='icon' href='/logo/blue/favicon.ico' sizes='any' />
            <link rel='icon' href='/logo/blue/icon.svg' type='image/svg+xml' />
            <link rel='apple-touch-icon' href='/logo/blue/apple-icon.png' />

            <link rel='manifest' href='/manifest-blue.json' />
          </>
        ) : (
          <>
            {/* https://spiewniki.nastrazy.org */}

            <link rel='icon' href='/logo/orange/favicon.ico' sizes='any' />
            <link
              rel='icon'
              href='/logo/orange/icon.svg'
              type='image/svg+xml'
            />
            <link rel='apple-touch-icon' href='/logo/orange/apple-icon.png' />

            <link rel='manifest' href='/manifest-orange.json' />
          </>
        )}
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
