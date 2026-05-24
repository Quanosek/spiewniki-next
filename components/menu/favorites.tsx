import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'

import { HYMNBOOKS } from '@/utils/constants'
import { getBookShortcut } from '@/utils/getBookShortcut'

import { setMenuQuery } from './_handler'

import styles from '@/styles/components/menu.module.scss'

interface Favorite {
  book: string
  id: number
  title: string
  timestamp: number
}

export default function FavoritesMenu() {
  const router = useRouter()

  const favoritesData = (() => {
    try {
      const raw = localStorage.getItem('favorites')
      return raw ? (JSON.parse(raw) as Favorite[]) : null
    } catch {
      return null
    }
  })()
  const [favorites, setFavorites] = useState<Favorite[]>(favoritesData || [])

  const [elemHovered, setElemHovered] = useState<number>()

  const removeFromList = (index: number) => {
    const newArray = favorites.filter((fav) => fav !== favorites[index])

    setFavorites(newArray)
    localStorage.setItem('favorites', JSON.stringify(newArray))
  }

  return (
    <>
      <h2>Lista ulubionych</h2>

      <div className={`${styles.content} ${styles.favorites}`}>
        <div className={styles.settings}>
          <span>
            {(favorites.length === 1 && 'dodano 1 pieśń') || `dodano ${favorites.length} pieśni`}
          </span>

          <button className={!favorites.length ? 'disabled' : ''}>
            <select
              name='sort'
              defaultValue='timestamp'
              onChange={(e) => {
                const option = e.target.value
                const sortedItems = [...favorites]

                if (option === 'timestamp') {
                  sortedItems.sort((a, b) => {
                    return b.timestamp - a.timestamp
                  })
                }

                if (option === 'alphabetic') {
                  sortedItems.sort((a, b) => {
                    return a.title.localeCompare(b.title, undefined, {
                      numeric: true,
                    })
                  })
                }

                if (option === 'books') {
                  sortedItems.sort((a, b) => {
                    return a.title.localeCompare(b.title, undefined, {
                      numeric: true,
                    })
                  })
                  sortedItems.sort((a, b) => HYMNBOOKS.indexOf(a.book) - HYMNBOOKS.indexOf(b.book))
                }

                setFavorites(sortedItems)
              }}
            >
              <option value='timestamp'>Według czasu dodania</option>
              <option value='alphabetic'>Według tytułu</option>
              <option value='books'>Według śpiewnika</option>
            </select>

            <p>Sortuj</p>

            <Image
              className='icon'
              alt='options'
              src='/icons/chevron.svg'
              width={16}
              height={16}
              draggable={false}
            />
          </button>
        </div>

        {!favorites.length ? (
          <p className={styles.placeholder}>Brak pozycji do wyświetlenia</p>
        ) : (
          favorites.map((fav, index) => (
            <div
              key={index}
              className={styles.favorite}
              onMouseEnter={() => setElemHovered(index)}
              onMouseLeave={() => setElemHovered(undefined)}
            >
              <Link
                href={{
                  pathname: '/hymn',
                  query: { book: fav.book, title: fav.title },
                }}
                onClick={async () => {
                  try {
                    // Validate book
                    if (!HYMNBOOKS.includes(fav.book)) {
                      removeFromList(index)
                      throw new Error()

                      // Validate title
                    } else {
                      const { data } = await axios.get(`/database/${fav.book}.json`)

                      if (
                        !data.find((elem: { name: string }) => {
                          return elem.name === fav.title
                        })
                      ) {
                        removeFromList(index)
                        throw new Error()
                      }
                    }
                  } catch (err) {
                    console.log(err)
                    router.back()

                    window.alert(
                      'Nie znaleziono wybranej pieśni! Pozycja została usunięta z listy ulubionych.'
                    )
                  }
                }}
              >
                <p>{fav.title}</p>

                <div className={styles.info}>
                  <p>
                    {getBookShortcut(fav.book)}
                    {' • '}
                    <span>
                      {new Date(fav.timestamp).toLocaleString('pl-PL', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',

                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </p>
                </div>
              </Link>

              <button
                className={styles.removeButton}
                style={{ display: elemHovered === index ? 'flex' : '' }}
                onClick={() => removeFromList(index)}
              >
                <Image
                  className='icon'
                  alt='delete'
                  src='/icons/close.svg'
                  width={20}
                  height={20}
                  draggable={false}
                />
              </button>
            </div>
          ))
        )}
      </div>

      <div className={styles.buttons}>
        <button
          className={styles.alert}
          onClick={() => {
            if (!favorites.length) return

            if (!confirm('Czy na pewno chcesz wyczyścić listę ulubionych?')) {
              return
            }

            setFavorites([])
            localStorage.removeItem('favorites')
          }}
        >
          <p>Wyczyść listę</p>
        </button>

        <button onClick={() => setMenuQuery(undefined)}>
          <p>Zamknij</p>
        </button>
      </div>
    </>
  )
}
