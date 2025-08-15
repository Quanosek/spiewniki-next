import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { bookShortcut, booksList } from '@/lib/availableBooks'

import styles from '@/styles/pages/books.module.scss'

export default function BooksPage() {
  const router = useRouter()

  const [data, setData] = useState([])

  // fetch all books data
  useEffect(() => {
    if (!router.isReady) return

    fetch('/api/booksData')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err))
  }, [router])

  return (
    <>
      <Head>
        <title>Lista śpiewników / Śpiewniki</title>
      </Head>

      <main>
        <div className={styles.title}>
          <button onClick={() => router.back()}>
            <Image
              style={{ transform: 'rotate(90deg)' }}
              className='icon'
              alt='back'
              src='/icons/arrow.svg'
              width={20}
              height={20}
              draggable={false}
            />
            <p>Powrót</p>
          </button>

          <h1>Wybierz śpiewnik:</h1>
        </div>

        <div className={styles.list}>
          <Link className={styles.all} href='/search'>
            <h2>Wszystkie śpiewniki</h2>
          </Link>

          <hr />

          {booksList().map((book, i) => {
            const pdfFile = data.find(
              (file: { name: string; pdf: boolean }) => {
                return file.name === book && file.pdf
              }
            )

            return (
              <div key={i}>
                <div className={styles.book}>
                  <Link
                    className={styles.result}
                    href={{ pathname: '/search', query: { book } }}
                  >
                    <h2>{bookShortcut(book)}</h2>
                  </Link>

                  {pdfFile && (
                    <Link
                      className={styles.pdfFile}
                      href={{
                        pathname: '/document',
                        query: { d: bookShortcut(book) },
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

                {i + 1 !== data.length && <hr />}
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
