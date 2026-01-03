import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import HamburgerIcon from '@/components/mobile-menu/hamburger-icon'
import MenuModal from '@/components/mobile-menu/menu-modal'
import MobileNavbar from '@/components/mobile-navbar'

import { bookShortcut } from '@/utils/books'
import getRandomHymn from '@/utils/getRandomHymn'

import styles from '@/styles/pages/index.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function HomePage() {
  const router = useRouter()

  // Reset previous search
  useEffect(() => {
    localStorage.removeItem('prevSearch')
  }, [])

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

  // Random hymn function
  const randomHymn = useCallback(async () => {
    const foundHymn = await getRandomHymn(unlocked)
    if (foundHymn) {
      const { book, title } = foundHymn
      router.push({
        pathname: '/hymn',
        query: { book, title },
      })
    }
  }, [router])

  // Keyboard shortcuts
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
      if (key === 'R') randomHymn()
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [router, randomHymn])

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

          {unlocked || <HamburgerIcon active={hamburgerMenu} setActive={showHamburgerMenu} />}
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

          <button title='Otwórz losową pieśń [R]' onClick={randomHymn}>
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
                  <p>{bookShortcut(book)}</p>
                </Link>

                <Link
                  href={{
                    pathname: '/document',
                    query: { d: bookShortcut(book) },
                  }}
                  title='Pokaż śpiewnik w formacie PDF'
                  className={styles.pdfIcon}
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
