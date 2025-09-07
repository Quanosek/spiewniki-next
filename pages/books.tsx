import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { bookShortcut, booksList } from '@/utils/books'

import styles from '@/styles/pages/books.module.scss'

export default function BooksPage() {
  const router = useRouter()

  const Book = ({ book }: { book: string }) => {
    const hasPDF = ['B', 'C', 'N', 'E']

    return (
      <div className={styles.book}>
        <Link
          href={{ pathname: '/search', query: { book } }}
          className={styles.result}
        >
          <h2>{bookShortcut(book)}</h2>
        </Link>

        {hasPDF.includes(book) && (
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

  return (
    <>
      <Head>
        <title>Lista śpiewników / Śpiewniki</title>
      </Head>

      <main>
        <div className={styles.title}>
          <button onClick={() => router.back()}>
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

          {booksList().map((book, index, row) => (
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
