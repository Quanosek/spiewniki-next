import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { defaultSettings } from '@/components/menu/settings'
import Layout from '@/components/layout'

import 'the-new-css-reset/css/reset.css'
import '@/styles/themes.scss'
import '@/styles/globals.scss'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Default settings params
    const settingsString = localStorage.getItem('settings')
    let settings = null

    try {
      settings = settingsString ? JSON.parse(settingsString) : null
    } catch (error) {
      console.error('Error parsing settings:', error)
      localStorage.removeItem('settings')
    }

    if (!settings) {
      localStorage.setItem('settings', JSON.stringify(defaultSettings))
      settings = defaultSettings
    }

    // Global app theme
    const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

    document.documentElement.className = `${
      unlocked ? 'accent_blue' : 'accent_orange' // default color accent
    } ${settings?.themeColor || ''}` // user theme

    // Prevent screen from sleeping
    if (typeof navigator !== 'undefined' && navigator.wakeLock) {
      navigator.wakeLock.request('screen').catch((err) => console.error(err))
    }
  }, [])

  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='initial-scale=1, width=device-width, user-scalable=no'
        />
      </Head>

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
