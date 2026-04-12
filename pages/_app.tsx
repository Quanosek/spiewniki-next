import type { AppProps } from 'next/app'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
// import { useEffect, useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { ThemeProvider } from 'next-themes'

import Menu, { hiddenMenuQuery } from '@/components/menu/_handler'
import { defaultSettings } from '@/components/menu/settings'
import { THEMES } from '@/utils/enums'

import 'the-new-css-reset/css/reset.css'
import '@/styles/globals.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

// interface BeforeInstallPromptEvent extends Event {
//   prompt: () => Promise<void>
//   userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
// }

// interface NavigatorStandalone extends Navigator {
//   standalone?: boolean
// }

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    try {
      const settings = localStorage.getItem('settings')
      if (!settings) {
        localStorage.setItem('settings', JSON.stringify(defaultSettings))
      }
    } catch (error) {
      console.error('Error parsing settings:', error)
      localStorage.setItem('settings', JSON.stringify(defaultSettings))
    }

    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && !THEMES.includes(savedTheme)) {
      const fallbackTheme = unlocked ? 'dark' : 'light'
      localStorage.setItem('theme', fallbackTheme)
      router.reload()
    }

    document.documentElement.className = unlocked ? 'accent-blue' : 'accent-orange'

    // Keep screen awake
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
          wakeLock.addEventListener('release', () => {
            // console.log('Wake Lock released')
          })
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
  }, [router])

  // // PWA install prompt
  // const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  // const [showInstallButton, setShowInstallButton] = useState(false)

  // useEffect(() => {
  //   // Skip if already running as PWA
  //   const isStandalone =
  //     window.matchMedia('(display-mode: standalone)').matches ||
  //     window.matchMedia('(display-mode: fullscreen)').matches ||
  //     window.matchMedia('(display-mode: minimal-ui)').matches ||
  //     (window.navigator as NavigatorStandalone).standalone ||
  //     document.referrer.includes('android-app://')

  //   if (isStandalone) {
  //     setShowInstallButton(false)
  //     return
  //   }

  //   // Capture install prompt
  //   const handleBeforeInstallPrompt = (e: Event) => {
  //     e.preventDefault()
  //     setDeferredPrompt(e as BeforeInstallPromptEvent)
  //     setShowInstallButton(true)
  //   }

  //   window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  //   return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  // }, [])

  // // Trigger PWA install
  // const handleInstallClick = async () => {
  //   if (!deferredPrompt) return

  //   deferredPrompt.prompt()
  //   await deferredPrompt.userChoice

  //   setDeferredPrompt(null)
  //   setShowInstallButton(false)
  // }

  const defaultTheme = unlocked ? 'dark' : 'light'

  return (
    <>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width, user-scalable=no' />
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

              {/* {unlocked && showInstallButton && (
                <button onClick={handleInstallClick} className='installButton'>
                  <Image
                    className='icon'
                    src='/icons/download.svg'
                    alt='Install PWA'
                    width={18}
                    height={18}
                    draggable={false}
                  />
                  <p>Zainstaluj</p>
                </button>
              )} */}
            </div>

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
