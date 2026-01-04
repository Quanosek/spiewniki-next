import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

import getRandomHymn from '@/utils/getRandomHymn'

import { hiddenMenuQuery } from './menu/_handler'

import styles from '@/styles/components/mobile-navbar.module.scss'

export default function MobileNavbarComponent({ unlocked }: { unlocked: boolean }) {
  const router = useRouter()
  const book = Array.isArray(router.query.book) ? router.query.book[0] : router.query.book

  // Random hymn function
  const randomHymn = useCallback(async () => {
    const foundHymn = await getRandomHymn(unlocked, book)
    if (foundHymn) {
      const { book, title } = foundHymn
      router.push({
        pathname: '/hymn',
        query: { book, title },
      })
    }
  }, [unlocked, book, router])

  return (
    <nav className={styles.navbar}>
      {(unlocked && (
        <>
          <button
            onClick={() => {
              localStorage.removeItem('prevSearch')
              router.push('/')
            }}
          >
            <Image
              className='icon'
              alt='books'
              src='/icons/book.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Śpiewniki</p>
          </button>

          <Link href='/search'>
            <Image
              className='icon'
              alt='search'
              src='/icons/search.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Wyszukiwanie</p>
          </Link>

          <button onClick={randomHymn} className={styles.randomButton}>
            <Image
              className='icon'
              alt='dice'
              src='/icons/dice.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Wylosuj</p>
          </button>

          <button onClick={() => hiddenMenuQuery('favorites')}>
            <Image
              className='icon'
              alt='list'
              src='/icons/favorites.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Ulubione</p>
          </button>

          <button onClick={() => hiddenMenuQuery('settings')}>
            <Image
              className='icon'
              alt='settings'
              src='/icons/settings.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Ustawienia</p>
          </button>
        </>
      )) || (
        <>
          <button
            onClick={() => {
              localStorage.removeItem('prevSearch')
              router.push('/books')
            }}
          >
            <Image
              className='icon'
              alt='books'
              src='/icons/book.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Śpiewniki</p>
          </button>

          <Link href='/search'>
            <Image
              className='icon'
              alt='search'
              src='/icons/search.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Wyszukiwanie</p>
          </Link>

          <button onClick={() => hiddenMenuQuery('favorites')}>
            <Image
              className='icon'
              alt='list'
              src='/icons/favorites.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Ulubione</p>
          </button>

          <button onClick={() => hiddenMenuQuery('settings')}>
            <Image
              className='icon'
              alt='settings'
              src='/icons/settings.svg'
              width={25}
              height={25}
              draggable={false}
            />
            <p>Ustawienia</p>
          </button>
        </>
      )}
    </nav>
  )
}
