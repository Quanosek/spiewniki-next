import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import MobileNavbar from '@/components/mobile-navbar'
import { HYMNBOOKS, PDF_BOOKS } from '@/utils/constants'
import { getBookShortcut } from '@/utils/getBookShortcut'
import { getBookCollections, getCollectionPdfName } from '@/utils/hymnDatabase'
import { useOnlineStatus } from '@/utils/useOnlineStatus'

import styles from '@/styles/pages/books.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function BooksPage() {
  const router = useRouter()
  const isOnline = useOnlineStatus()
  const choirCollections = getBookCollections('M')
  const [isChoirExpanded, setIsChoirExpanded] = useState(false)

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

          <h1>Wybierz śpiewnik:</h1>
        </div>

        <div className={styles.list}>
          <Link href='/search' className={styles.all}>
            <h2>Wszystkie śpiewniki</h2>
          </Link>

          <hr />

          {HYMNBOOKS.map((book, index) => (
            <div key={book}>
              {book === 'M' ? (
                <div className={styles.bookAccordion}>
                  <button
                    className={styles.accordionToggle}
                    title='Pokaż lub ukryj dostępne albumy Chóru Międzynarodowego'
                    onClick={() => setIsChoirExpanded((prev) => !prev)}
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
                      const collectionPdf = getCollectionPdfName(book, collection)

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
                                collection === 'Koncert 2026' ? styles.collectionKoncertTitle : ''
                              }
                            >
                              {collection}
                            </h2>
                          </Link>

                          {collectionPdf && (
                            <Link
                              href={{
                                pathname: '/document',
                                query: { d: collectionPdf },
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

              {index + 1 !== HYMNBOOKS.length && <hr />}
            </div>
          ))}
        </div>
      </main>

      <MobileNavbar unlocked={unlocked} />
    </>
  )
}
