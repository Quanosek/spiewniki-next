import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { bookShortcut, booksList } from '@/utils/books'

import styles from '@/styles/pages/books.module.scss'

interface BookData {
  name: string
  pdf: boolean
}

export default function BooksPage() {
  const router = useRouter()

  const [data, setData] = useState<BookData[]>([])

  // Fetch all books data
  useEffect(() => {
    if (!router.isReady) return

    fetch('/api/booksData')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err))
  }, [router])

  const Book = ({ book }: { book: string }) => {
    const pdfFile = data.find((file) => file.name === book && file.pdf)

    return (
      <div className={styles.book}>
        <Link
          href={{ pathname: '/search', query: { book } }}
          className={styles.result}
        >
          <h2>{bookShortcut(book)}</h2>
        </Link>

        {pdfFile && (
          <Link
            href={{
              pathname: '/document',
              query: { d: bookShortcut(book) },
            }}
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
    )
  }

  const books = booksList()

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
          <Link href='/search' className={styles.all}>
            <h2>Wszystkie śpiewniki</h2>
          </Link>

          <hr />

          {books.map((book, index, row) => (
            <div key={index}>
              <Book book={book} />
              {index + 1 !== row.length && <hr />}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
