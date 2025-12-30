import { useRouter } from 'next/router'

import { hiddenMenuQuery } from './_handler'

import styles from '@/styles/components/menu.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

interface ShortcutProps {
  keyup: string
  action: string
}

export default function ShortcutsMenu() {
  const router = useRouter()

  const Shortcut = ({ keyup, action }: ShortcutProps) => (
    <div className={styles.shortcut}>
      <span className={styles.keyUp}>
        <p>{keyup}</p>
      </span>

      <p className={styles.action}>{action}</p>
    </div>
  )

  const route = router.route
  const isHome = route === '/'
  const isBooks = route === '/books'
  const isSearch = route === '/search'
  const isHymn = route === '/hymn'

  return (
    <>
      <h2>Skróty klawiszowe strony</h2>

      <div className={styles.content}>
        <Shortcut
          keyup='Esc'
          action={'Wyjście z widoku menu' + (!isHome ? ' / powrót po poprzedniej strony' : '')}
        />
        <Shortcut
          keyup='/'
          action={
            isSearch ? 'Powrót do paska wyszukiwania' : 'Wyszukiwanie we wszystkich śpiewnikach'
          }
        />

        {!isBooks && (
          <Shortcut
            keyup='B'
            action={unlocked ? 'Lista wszystkich śpiewników' : 'Wybór śpiewników'}
          />
        )}

        {!isBooks && !isHymn && (
          <Shortcut
            keyup='R'
            action={`Losowa pieśń${!isHome && !isBooks ? ' z wybranego śpiewnika' : ''}`}
          />
        )}
      </div>

      {isHymn && (
        <>
          <div className={styles.content}>
            <Shortcut keyup='R' action='Losowa pieśń z wybranego śpiewnika' />
            <Shortcut keyup='←' action='Poprzednia pieśń' />
            <Shortcut keyup='→' action='Następna pieśń' />
          </div>

          <div className={styles.content}>
            <Shortcut keyup='P' action='Włączenie trybu prezentacji' />
            <Shortcut keyup='F' action='Dodanie/usunięcie pieśni z listy ulubionych' />
            <Shortcut keyup='D' action='Dokument PDF wybranej pieśni (jeśli istnieje)' />
            {unlocked && <Shortcut keyup='M' action='Melodia wybranej pieśni (jeśli istnieje)' />}
            <Shortcut keyup='K' action='Treść pieśni do druku' />
            <Shortcut keyup='S' action='Udostępnienie linku do pieśni' />
          </div>
        </>
      )}

      <div className={styles.buttons}>
        <button onClick={() => hiddenMenuQuery(undefined)}>
          <p>Zamknij</p>
        </button>
      </div>
    </>
  )
}
