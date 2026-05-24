import type { AppProps } from 'next/app'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { ThemeProvider } from 'next-themes'

import Menu, { setMenuQuery } from '@/components/menu/_handler'
import { DEFAULT_SETTINGS, THEMES } from '@/utils/constants'
import { useInstallPWA } from '@/utils/usePwaInstall'

import 'the-new-css-reset/css/reset.css'
import '@/styles/globals.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { install, showButton } = useInstallPWA()

  const defaultTheme = unlocked ? 'dark' : 'light'

  useEffect(() => {
    // Get saved settings
    try {
      const settings = localStorage.getItem('settings')
      if (!settings) localStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS))
    } catch (err) {
      console.error('Error parsing settings:', err)
      localStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS))
    }

    // Validate saved theme
    const savedTheme = localStorage.getItem('theme') as (typeof THEMES)[number] | null
    if (savedTheme && !THEMES.includes(savedTheme)) {
      localStorage.setItem('theme', defaultTheme)
      router.reload()
    }

    // Define default accent color
    document.documentElement.className = unlocked ? 'accent-blue' : 'accent-orange'

    // Prevent screen from sleeping
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch (err) {
        console.error('Wake Lock error:', err)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      }
    }

    requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      wakeLock?.release()
    }
  }, [defaultTheme, router])

  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='initial-scale=1, width=device-width, user-scalable=no, viewport-fit=cover'
        />
      </Head>

      <ThemeProvider defaultTheme={defaultTheme} enableColorScheme={false} themes={THEMES}>
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics
            trackPageViews
            gaMeasurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string}
          />
        )}

        <Menu />

        <header>
          <div className='container'>
            <div>
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

              {unlocked && showButton && (
                <button onClick={install} className='installButton' title='Zainstaluj aplikację'>
                  <Image
                    className='icon'
                    src='/icons/download.svg'
                    alt='Pobierz'
                    width={18}
                    height={18}
                    draggable={false}
                  />
                  <p>Pobierz</p>
                </button>
              )}
            </div>

            <div className='buttons'>
              <button onClick={() => setMenuQuery('favorites')}>
                <p>Lista ulubionych</p>
              </button>

              <button onClick={() => setMenuQuery('settings')}>
                <p>Ustawienia</p>
              </button>

              <button className='desktopOnly' onClick={() => setMenuQuery('shortcuts')}>
                <p>Skróty klawiszowe</p>
              </button>

              {unlocked || (
                <Link href='https://nastrazy.org'>
                  <p>
                    <b>Nastrazy.org</b>
                  </p>
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
