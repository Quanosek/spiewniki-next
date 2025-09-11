import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { bookShortcut, booksList } from '@/utils/books'

import styles from '@/styles/pages/books.module.scss'

export default function BooksPage() {
  const router = useRouter()

  // Get books list
  const allBooks = booksList()
  const booksWithPdf = ['B', 'C', 'N', 'E']

  // Keyboard shortcuts
  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.metaKey ||
        router.query.menu
      ) {
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
          <button
            title='Powróć do poprzedniej strony [Esc]'
            onClick={() => router.back()}
          >
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

          {allBooks.map((book, index) => (
            <div key={book}>
              <div className={styles.book}>
                <Link
                  href={{ pathname: '/search', query: { book } }}
                  className={styles.result}
                >
                  <h2>{bookShortcut(book)}</h2>
                </Link>

                {booksWithPdf.includes(book) && (
                  <Link
                    href={{
                      pathname: '/document',
                      query: { d: bookShortcut(book) },
                    }}
                    title='Pokaż śpiewnik w formacie PDF'
                    className={styles.pdfFile}
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

              {index + 1 !== allBooks.length && <hr />}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
