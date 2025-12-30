import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import HamburgerIcon from '@/components/mobile-menu/hamburger-icon'
import MenuModal from '@/components/mobile-menu/menu-modal'

import styles from '@/styles/pages/error.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function ErrorPage() {
  const router = useRouter()

  // Redirect countdown
  const [seconds, setSeconds] = useState(10) // 10 seconds

  useEffect(() => {
    const counter = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(counter)
  }, [router])

  // Prevent scrolling on active hamburger menu
  const [hamburgerMenu, showHamburgerMenu] = useState(false)

  useEffect(() => {
    if (!hamburgerMenu) return

    const leftScroll = document.documentElement.scrollLeft
    const topScroll = document.documentElement.scrollTop

    const scrollEvent = () => window.scrollTo(leftScroll, topScroll)

    document.addEventListener('scroll', scrollEvent)
    return () => document.removeEventListener('scroll', scrollEvent)
  }, [hamburgerMenu])

  return (
    <>
      <Head>
        <title>Nie znaleziono strony / Śpiewniki</title>
      </Head>

      <main>
        <div className={`${styles.title} ${unlocked && styles.center}`}>
          <Link
            href='/'
            title={unlocked ? 'Powróć do strony głównej' : 'Powróć do wyboru śpiewników'}
            className={styles.logotype}
          >
            <Image
              className='icon'
              alt='bpsw'
              src='/logo/bpsw.svg'
              width={40}
              height={40}
              draggable={false}
              priority
            />
            <h1>Śpiewniki</h1>
          </Link>

          {unlocked || <HamburgerIcon active={hamburgerMenu} setActive={showHamburgerMenu} />}
        </div>

        {unlocked || <MenuModal active={hamburgerMenu} />}

        <div className={styles.content}>
          <h1>Strona napotkała problem</h1>

          <p>
            <Link href='/'>Kliknij tutaj</Link>, aby powrócić do{' '}
            {unlocked ? 'strony głównej' : 'wyboru śpiewników'}
            {'. '}
            <span>[{seconds}]</span>
          </p>
        </div>
      </main>
    </>
  )
}
