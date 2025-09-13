import Image from 'next/image'
import { useRouter } from 'next/router'

import { bookShortcut } from '@/utils/books'
import shareButton from '@/utils/shareButton'
import randomHymn from '@/utils/randomHymn'
import { hiddenMenuQuery } from './menu'

export default function MobileNavbarComponent({
  unlocked,
}: {
  unlocked: boolean
}) {
  const router = useRouter()

  let moreButtons = true
  if (!unlocked && router.pathname === '/') moreButtons = false

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

      <button
        onClick={async () => {
          const book = router.query.book as string
          const hymn = await randomHymn(unlocked, book)
          if (hymn) {
            router.push({
              pathname: '/hymn',
              query: {
                book: bookShortcut(hymn.book),
                title: hymn.name,
              },
            })
          }
        }}
      >
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
