import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

import { bookShortcut } from '@/utils/books'
import getRandomHymn from '@/utils/getRandomHymn'
import shareButton from '@/utils/shareButton'
import { hiddenMenuQuery } from './menu'

export default function MobileNavbarComponent({
  unlocked,
}: {
  unlocked: boolean
}) {
  const router = useRouter()
  const { book } = router.query as { [key: string]: string }

  // Random hymn function
  const randomHymn = useCallback(async () => {
    const hymn = await getRandomHymn(unlocked, book)
    if (hymn) {
      router.push({
        pathname: '/hymn',
        query: {
          book: bookShortcut(hymn.book),
          title: hymn.name,
        },
      })
    }
  }, [unlocked, book, router])

  const moreButtons = !unlocked && router.pathname === '/'

  return (
    <nav>
      {moreButtons && (
        <button
          onClick={() => {
            localStorage.removeItem('prevSearch')
            router.push(unlocked ? '/books' : '/')
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
      )}

      <button onClick={() => hiddenMenuQuery('favorites')}>
        <Image
          className='icon'
          alt='list'
          src='/icons/list.svg'
          width={25}
          height={25}
          draggable={false}
        />
        <p>Ulubione</p>
      </button>

      <button onClick={randomHymn}>
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

      {moreButtons && (
        <button onClick={shareButton}>
          <Image
            className='icon'
            alt='share'
            src='/icons/link.svg'
            width={25}
            height={25}
            draggable={false}
          />
          <p>Udostępnij</p>
        </button>
      )}
    </nav>
  )
}
