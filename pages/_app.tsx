import type { AppProps } from 'next/app'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { ThemeProvider } from 'next-themes'

import { defaultSettings } from '@/components/menu/settings'
import Menu, { hiddenMenuQuery } from '@/components/menu'

import 'the-new-css-reset/css/reset.css'
import '@/styles/globals.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // Initialize settings in localStorage
    try {
      const settings = localStorage.getItem('settings')
      if (!settings) {
        localStorage.setItem('settings', JSON.stringify(defaultSettings))
      }
    } catch (error) {
      console.error('Error parsing settings:', error)
      localStorage.setItem('settings', JSON.stringify(defaultSettings))
    }

    // Set global accent color
    document.documentElement.className = unlocked ? 'accent_blue' : 'accent_orange'

    // Screen Wake Lock API
    navigator.wakeLock?.request('screen').catch(console.error)
  }, [])

  const defaultTheme = unlocked ? 'black' : 'white'

  return (
    <>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width, user-scalable=no' />
      </Head>

      <ThemeProvider
        defaultTheme={defaultTheme}
        enableColorScheme={false}
        themes={['black', 'dark-blue', 'gray', 'white', 'reading', 'light-blue', 'light-purple']}
      >
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics
            trackPageViews
            gaMeasurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string}
          />
        )}

        <Menu />

        <header>
          <div className='container'>
            <Link
              href='/'
              title={
                router.pathname === '/'
                  ? 'Zebrane w jednym miejscu różne śpiewniki i pieśni religijne'
                  : unlocked
                    ? 'Powróć do strony głównej'
                    : 'Powróć do wyboru śpiewników'
              }
              className='title'
            >
              <Image
                className='icon'
                alt='bpsw'
                src='/logo/bpsw.svg'
                width={36}
                height={36}
                draggable={false}
                priority
              />
              <h1>Śpiewniki</h1>
            </Link>

            <div className='buttons'>
              <button onClick={() => hiddenMenuQuery('favorites')}>
                <p>Lista ulubionych</p>
              </button>

              <button onClick={() => hiddenMenuQuery('settings')}>
                <p>Ustawienia</p>
              </button>

              <button className='desktopOnly' onClick={() => hiddenMenuQuery('shortcuts')}>
                <p>Skróty klawiszowe</p>
              </button>

              {!unlocked && (
                <Link href='https://nastrazy.org'>
                  <p>Nastrazy.org</p>
                </Link>
              )}
            </div>
          </div>
        </header>

        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}
