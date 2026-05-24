import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Highlighter from 'react-highlight-words'
import { useCallback, useState } from 'react'

import { getBookShortcut } from '@/utils/getBookShortcut'
import { ProcessedHymn } from '@/types/hymn'

import styles from '@/styles/pages/search.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function SearchResult({
  inputValue,
  hymn,
  saveSearchState,
  isFavorite,
  setFavoritesState,
}: {
  inputValue: string
  hymn: ProcessedHymn
  saveSearchState: () => void
  isFavorite: boolean
  setFavoritesState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const router = useRouter()

  const book = getBookShortcut(hymn.book)
  const title = hymn.name

  const [resultHovered, setResultHovered] = useState(false)

  const highlightClassName =
    hymn.matchType === 'author'
      ? styles.highlightAuthor
      : hymn.matchType === 'keywords'
        ? styles.highlightKeyword
        : styles.highlight

  const handlePresentation = useCallback(() => {
    const presWindow = JSON.parse(localStorage.getItem('presWindow') || 'false')

    if (!presWindow) {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      }

      router.push({
        pathname: '/presentation',
        query: { book, title },
      })
    } else {
      const params = new URLSearchParams()
      params.append('book', book)
      params.append('title', title)

      window.open(`/presentation?${params.toString()}`, 'presentation', 'width=960,height=540')

      localStorage.setItem('presWindow', 'true')
    }
  }, [router, book, title])

  const handleRemoveFavorite = useCallback(() => {
    if (!confirm('Czy chcesz usunąć wybraną pieśń z listy ulubionych?')) {
      return
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')

    const newFavorites = favorites.filter((elem: { book: string; id: number }) => {
      return elem.book !== book || elem.id !== hymn.id
    })

    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setFavoritesState((prev) => ({ ...prev, [hymn.dedupeKey]: false }))
  }, [book, hymn, setFavoritesState])

  return (
    <div
      className={styles.hymn}
      onMouseEnter={() => setResultHovered(true)}
      onMouseLeave={() => setResultHovered(false)}
    >
      <Link
        href={{ pathname: '/hymn', query: { book, title } }}
        className={styles.result}
        onClick={saveSearchState}
      >
        {/* Hymn title */}
        <h2>
          {unlocked ? (
            <Highlighter
              autoEscape={true}
              highlightClassName={highlightClassName}
              searchWords={[inputValue]}
              textToHighlight={title}
            />
          ) : (
            title
          )}
        </h2>

        {hymn.matchType === 'author' && hymn.author ? (
          // Hymn authors (@)
          <div className={styles.prefixResult}>
            <p>
              {unlocked ? (
                <Highlighter
                  autoEscape={true}
                  highlightClassName={styles.highlightAuthor}
                  searchWords={[inputValue]}
                  textToHighlight={hymn.author}
                />
              ) : (
                hymn.author
              )}
            </p>
          </div>
        ) : hymn.matchType === 'keywords' && hymn.copyright ? (
          // Hymn keywords (#)
          <div className={styles.prefixResult}>
            <p>
              {unlocked ? (
                <Highlighter
                  autoEscape={true}
                  highlightClassName={styles.highlightKeyword}
                  searchWords={[inputValue]}
                  textToHighlight={hymn.copyright}
                />
              ) : (
                hymn.copyright
              )}
            </p>
          </div>
        ) : hymn.lyrics ? (
          // Hymn lyrics lines
          <div className={styles.lyrics}>
            {hymn.lyrics.map((verse, index) => (
              <p key={`${verse}-${index}`}>
                {unlocked ? (
                  <Highlighter
                    autoEscape={true}
                    highlightClassName={styles.highlight}
                    searchWords={[inputValue]}
                    textToHighlight={verse}
                  />
                ) : (
                  verse
                )}
              </p>
            ))}
          </div>
        ) : null}
      </Link>

      {/* Right-side dynamic hymn actions */}
      <div className={styles.quickActions}>
        {/* Enable presentation mode */}
        <button
          title='Włącz tryb prezentacji dla wybranej pieśni'
          className={styles.onHover}
          style={{ display: resultHovered ? 'flex' : '' }}
          onClick={handlePresentation}
        >
          <Image
            className='icon'
            alt='presentation'
            src='/icons/monitor.svg'
            width={25}
            height={25}
            draggable={false}
          />
        </button>

        {/* Remove hymn from favorites */}
        {isFavorite && (
          <button title='Usuń pieśń z listy ulubionych' onClick={handleRemoveFavorite}>
            <Image
              className='icon'
              alt='favorite'
              src='/icons/star-filled.svg'
              width={25}
              height={25}
              draggable={false}
            />
          </button>
        )}
      </div>
    </div>
  )
}
