import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import HamburgerIcon from '@/components/hamburger-icon'
import MenuModal from '@/components/menu-modal'
import MobileNavbar from '@/components/mobile-navbar'

import { getBookShortcut } from '@/utils/getBookShortcut'
import { getRandomHymn } from '@/utils/getRandomHymn'
import { useOnlineStatus } from '@/utils/useOnlineStatus'
import { useInstallPWA } from '@/utils/usePwaInstall'

import styles from '@/styles/pages/index.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function HomePage() {
  const router = useRouter()
  const { install, showButton } = useInstallPWA()
  const isOnline = useOnlineStatus()

  useEffect(() => {
    localStorage.removeItem('prevSearch')
  }, [])

  const [hamburgerMenu, setHamburgerMenu] = useState(false)

  useEffect(() => {
    if (!hamburgerMenu) return

    const leftScroll = document.documentElement.scrollLeft
    const topScroll = document.documentElement.scrollTop

    const scrollEvent = () => window.scrollTo(leftScroll, topScroll)

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [hamburgerMenu])

  const handleRandomHymn = useCallback(async () => {
    const foundHymn = await getRandomHymn()
    if (foundHymn) {
      router.push({
        pathname: '/hymn',
        query: { book: foundHymn.book, title: foundHymn.title },
      })
    }
  }, [router])

  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || router.query.menu) {
        return
      }

      if (e.key === '/') {
        localStorage.setItem('focusSearchBox', 'true')
        router.push('/search')
      }

      const key = e.key.toUpperCase()

      if (unlocked && key === 'B') router.push('/books')
      if (key === 'R') handleRandomHymn()
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [router, handleRandomHymn])

  return (
    <>
      <Head>
        <title>Śpiewniki</title>
      </Head>

      <main className={styles.main}>
        <div className={`${styles.title} ${unlocked && styles.center}`}>
          <Link href='/' className={styles.logotype}>
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

          {unlocked || <HamburgerIcon active={hamburgerMenu} setActive={setHamburgerMenu} />}

          {unlocked && showButton && (
            <button onClick={install} className={styles.installButton}>
              <Image
                className='icon'
                alt='Pobierz'
                src='/icons/download.svg'
                width={22}
                height={22}
                draggable={false}
              />
            </button>
          )}
        </div>

        {unlocked || <MenuModal active={hamburgerMenu} />}

        <div className={styles.searchBox}>
          <div className={styles.searchIcon}>
            <Image
              className='icon'
              alt='search'
              src='/icons/search.svg'
              width={25}
              height={25}
              draggable={false}
            />
          </div>

          <Link
            href='/search'
            title='Rozpocznij wyszukiwanie we wszystkich śpiewnikach [/]'
            className={styles.search}
            onClick={() => localStorage.setItem('focusSearchBox', 'true')}
          >
            <p>Rozpocznij wyszukiwanie</p>
          </Link>

          <button title='Otwórz losową pieśń [R]' onClick={handleRandomHymn}>
            <Image
              className='icon'
              alt='dice'
              src='/icons/dice.svg'
              width={25}
              height={25}
              draggable={false}
            />
          </button>
        </div>

        <div className={styles.container}>
          <div className={styles.grid}>
            {['B', 'C', 'N'].map((book, index) => (
              <div key={index}>
                <Link href={{ pathname: '/search', query: { book } }} className={styles.book}>
                  <Image
                    alt='cover'
                    src={`/covers/${book}.webp`}
                    width={340}
                    height={480}
                    draggable={false}
                    priority
                  />
                  <p>{getBookShortcut(book)}</p>
                </Link>

                <Link
                  href={{
                    pathname: '/document',
                    query: { d: getBookShortcut(book) },
                  }}
                  title={
                    isOnline
                      ? 'Pokaż śpiewnik w formacie PDF'
                      : 'Podgląd PDF jest niedostępny w trybie offline'
                  }
                  className={`${styles.pdfIcon} ${isOnline ? '' : styles.disabled}`}
                  aria-disabled={!isOnline}
                  onClick={(e) => {
                    if (!isOnline) e.preventDefault()
                  }}
                >
                  <Image
                    className='icon'
                    alt='pdf'
                    src='/icons/document.svg'
                    width={30}
                    height={30}
                    draggable={false}
                  />
                </Link>
              </div>
            ))}
          </div>

          {unlocked ? (
            <Link href='/books' className={styles.moreButton}>
              <p>Pokaż wszystkie śpiewniki</p>
            </Link>
          ) : (
            <Link href='/search?book=M' className={styles.moreButton}>
              <p>Śpiewnik Międzynarodowy (IC)</p>
            </Link>
          )}
        </div>
      </main>

      <MobileNavbar unlocked={unlocked} />
    </>
  )
}
