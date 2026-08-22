import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import MobileNavbar from '@/components/mobile-navbar'
import { ADDITIONAL_HYMNBOOKS, GLOBAL_SEARCH_HYMNBOOKS, PDF_BOOKS } from '@/utils/constants'
import { getBookShortcut } from '@/utils/getBookShortcut'
import {
  GLOBAL_SEARCH_HYMNBOOKS_EVENT,
  getGlobalSearchHymnbooks,
  setGlobalSearchHymnbooks,
} from '@/utils/globalSearchHymnbooks'
import { getBookCollections } from '@/utils/hymnDatabase'
import { useOnlineStatus } from '@/utils/useOnlineStatus'

import styles from '@/styles/pages/books.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

function BookListItem({
  book,
  choirCollections,
  isOnline,
  isChoirExpanded,
  onToggleChoir,
  isSelected,
  onToggleSelected,
  showDivider,
}: {
  book: string
  choirCollections: string[]
  isOnline: boolean
  isChoirExpanded: boolean
  onToggleChoir: () => void
  isSelected: boolean
  onToggleSelected: () => void
  showDivider: boolean
}) {
  return (
    <>
      <div className={styles.bookListItem}>
        <label className={styles.searchCheckbox} title='Uwzględnij w wyszukiwaniu wszystkich'>
          <input type='checkbox' checked={isSelected} onChange={onToggleSelected} />
          <span aria-hidden='true' />
        </label>

        {book === 'M' ? (
          <div className={styles.bookAccordion}>
            <button
              className={styles.accordionToggle}
              title='Pokaż lub ukryj dostępne albumy Chóru Międzynarodowego'
              onClick={onToggleChoir}
            >
              <h2>{getBookShortcut(book)}</h2>
              <Image
                className={`icon ${styles.chevron} ${isChoirExpanded ? styles.expanded : ''}`}
                alt='expand'
                src='/icons/chevron.svg'
                width={18}
                height={18}
                draggable={false}
              />
            </button>

            <div
              className={`${styles.collectionsList} ${isChoirExpanded ? styles.open : ''}`}
              aria-hidden={!isChoirExpanded}
            >
              {choirCollections.map((collection) => {
                return (
                  <div key={collection} className={styles.collectionRow}>
                    <Link
                      href={{
                        pathname: '/search',
                        query: { book, collection },
                      }}
                      className={styles.collectionItem}
                    >
                      <h2
                        className={
                          /^Koncert\s\d{4}$/.test(collection) ? styles.collectionKoncertTitle : ''
                        }
                      >
                        {collection}
                      </h2>
                    </Link>

                    {collection && (
                      <Link
                        href={{
                          pathname: '/document',
                          query: { d: collection, book },
                        }}
                        title={
                          isOnline
                            ? 'Pokaż śpiewnik w formacie PDF'
                            : 'Podgląd PDF jest niedostępny w trybie offline'
                        }
                        className={`${styles.pdfFile} ${isOnline ? '' : styles.disabled}`}
                        aria-disabled={!isOnline}
                        onClick={(e) => {
                          if (!isOnline) e.preventDefault()
                        }}
                      >
                        <p>Otwórz PDF</p>
                        <Image
                          className='icon'
                          alt='pdf'
                          src='/icons/document.svg'
                          width={25}
                          height={25}
                          draggable={false}
                        />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className={styles.book}>
            <Link href={{ pathname: '/search', query: { book } }} className={styles.result}>
              <h2>{getBookShortcut(book)}</h2>
            </Link>

            {PDF_BOOKS.includes(book) && (
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
                className={`${styles.pdfFile} ${isOnline ? '' : styles.disabled}`}
                aria-disabled={!isOnline}
                onClick={(e) => {
                  if (!isOnline) e.preventDefault()
                }}
              >
                <p>Otwórz PDF</p>
                <Image
                  className='icon'
                  alt='pdf'
                  src='/icons/document.svg'
                  width={25}
                  height={25}
                  draggable={false}
                />
              </Link>
            )}
          </div>
        )}
      </div>

      {showDivider && <hr />}
    </>
  )
}

export default function BooksPage() {
  const router = useRouter()
  const isOnline = useOnlineStatus()
  const [isChoirExpanded, setIsChoirExpanded] = useState(false)
  const [choirCollections, setChoirCollections] = useState<string[]>([])
  const [selectedHymnbooks, setSelectedHymnbooks] = useState(GLOBAL_SEARCH_HYMNBOOKS)

  useEffect(() => {
    let isMounted = true

    getBookCollections('M').then((collections) => {
      if (isMounted) setChoirCollections(collections)
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const sync = () => setSelectedHymnbooks(getGlobalSearchHymnbooks())
    sync()
    window.addEventListener(GLOBAL_SEARCH_HYMNBOOKS_EVENT, sync)
    return () => window.removeEventListener(GLOBAL_SEARCH_HYMNBOOKS_EVENT, sync)
  }, [])

  const toggleGlobalSearchHymnbook = (book: string) => {
    setSelectedHymnbooks((currentHymnbooks) => {
      const updatedHymnbooks = currentHymnbooks.includes(book)
        ? currentHymnbooks.filter((currentBook) => currentBook !== book)
        : [...currentHymnbooks, book]

      setGlobalSearchHymnbooks(updatedHymnbooks)
      return updatedHymnbooks
    })
  }

  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || router.query.menu) {
        return
      }

      if (e.key === 'Escape') router.back()
      if (e.key === '/') {
        localStorage.setItem('focusSearchBox', 'true')
        router.push('/search')
      }
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [router])

  return (
    <>
      <Head>
        <title>Lista śpiewników / Śpiewniki</title>
      </Head>

      <main>
        <div className={styles.title}>
          <button title='Powróć do poprzedniej strony [Esc]' onClick={() => router.back()}>
            <Image
              style={{ rotate: '90deg' }}
              className='icon'
              alt='back'
              src='/icons/arrow.svg'
              width={16}
              height={16}
              draggable={false}
            />
            <p>Powrót</p>
          </button>

          <h1>Lista śpiewników</h1>
        </div>

        <div className={styles.searchAction}>
          <span className={styles.searchIcon}>
            <Image
              className='icon'
              alt='search'
              src='/icons/search.svg'
              width={25}
              height={25}
              draggable={false}
            />
          </span>
          <Link href='/search' className={styles.all}>
            <h2>Wyszukaj wybrane śpiewniki</h2>
          </Link>
        </div>

        <h2 className={styles.listTitle}>Śpiewniki podstawowe</h2>

        <div className={styles.list}>
          {GLOBAL_SEARCH_HYMNBOOKS.map((book, index) => (
            <BookListItem
              key={book}
              book={book}
              choirCollections={choirCollections}
              isOnline={isOnline}
              isChoirExpanded={isChoirExpanded}
              onToggleChoir={() => setIsChoirExpanded((prev) => !prev)}
              isSelected={selectedHymnbooks.includes(book)}
              onToggleSelected={() => toggleGlobalSearchHymnbook(book)}
              showDivider={index + 1 !== GLOBAL_SEARCH_HYMNBOOKS.length}
            />
          ))}
        </div>

        {unlocked && <h2 className={styles.listTitle}>Zobacz więcej</h2>}

        <div className={styles.list}>
          {ADDITIONAL_HYMNBOOKS.map((book, index) => (
            <BookListItem
              key={book}
              book={book}
              choirCollections={choirCollections}
              isOnline={isOnline}
              isChoirExpanded={isChoirExpanded}
              onToggleChoir={() => setIsChoirExpanded((prev) => !prev)}
              isSelected={selectedHymnbooks.includes(book)}
              onToggleSelected={() => toggleGlobalSearchHymnbook(book)}
              showDivider={index + 1 !== ADDITIONAL_HYMNBOOKS.length}
            />
          ))}
        </div>
      </main>

      <MobileNavbar unlocked={unlocked} />
    </>
  )
}
