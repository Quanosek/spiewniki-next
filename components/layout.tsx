import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { GoogleAnalytics } from 'nextjs-google-analytics'

import Menu, { hiddenMenuQuery } from './menu'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function LayoutComponent({ children }: { children: ReactNode }) {
  return (
    <>
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
              unlocked
                ? 'Zebrane w jednym miejscu śpiewniki i pieśni religijne.'
                : ''
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

            <button
              className='desktopOnly'
              onClick={() => hiddenMenuQuery('shortcuts')}
            >
              <p>Skróty klawiszowe</p>
            </button>

            {!unlocked && (
              <Link href='https://nastrazy.org/'>
                <p>Nastrazy.org</p>
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}
    </>
  )
}
