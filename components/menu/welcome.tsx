import Link from 'next/link'

import { setMenuQuery } from './_handler'

import styles from '@/styles/components/menu.module.scss'

export default function WelcomeMenu() {
  return (
    <>
      <h2 className={styles.welcomeTitle}>
        XXII Konwencja Międzynarodowa
        <br />
        Badaczy Pisma Świętego
      </h2>

      <div className={`${styles.content} ${styles.welcome}`}>
        <div className={styles.welcomeText}>
          <p>
            Do aplikacji został dodany śpiewnik zgrupowania Chóru Międzynarodowego 2026. Po więcej
            informacji o trwającym wydarzeniu odwiedź stronę
            <Link
              href='https://icbiblestudents.org'
              target='_blank'
              rel='noopener noreferrer'
              className={styles.welcomeInlineLink}
            >
              icbiblestudents.org
            </Link>
            {'.'}
          </p>
        </div>

        <div className={styles.welcomeBooks}>
          <Link
            href={{
              pathname: '/search',
              query: { book: 'M', collection: 'Koncert 2026' },
            }}
            className={styles.welcomeBookButton}
          >
            Otwórz: Chór Międzynarodowy - Koncert 2026
          </Link>

          <Link
            href={{ pathname: '/search', query: { book: 'IC' } }}
            className={styles.welcomeBookButton}
          >
            Otwórz: IC - Śpiewnik Międzynarodowy
          </Link>
        </div>
      </div>

      <div className={`${styles.buttons} ${styles.welcomeButtons}`}>
        <button onClick={() => setMenuQuery(undefined)}>
          <p>Zamknij</p>
        </button>
      </div>
    </>
  )
}
