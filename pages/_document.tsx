import { Html, Head, Main, NextScript } from 'next/document'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function Document() {
  const color = unlocked ? 'blue' : 'orange'

  return (
    <Html lang='pl'>
      <Head>
        <meta name='theme-color' content='#000000' />
        <meta httpEquiv='content-type' content='text/html; charset=utf-8' />
        <meta
          name='description'
          content='Zebrane w jednym miejscu różne śpiewniki i pieśni religijne. Wszelkie prawa zastrzeżone © 2022-2025'
        />

        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-title' content='Śpiewniki' />
        <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />

        <link rel='icon' href={`/logo/${color}/favicon.ico`} sizes='any' />
        <link rel='icon' href={`/logo/${color}/icon.svg`} type='image/svg+xml' />
        <link rel='apple-touch-icon' href={`/logo/${color}/apple-icon.png`} />
        <link rel='manifest' href={`/manifest-${color}.json`} />

        {/* Disable indexing for unlocked version of the app */}
        {unlocked && <meta name='robots' content='none' />}
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
