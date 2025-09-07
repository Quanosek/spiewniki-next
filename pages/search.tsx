import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import Highlighter from 'react-highlight-words'
import axios, { AxiosResponse } from 'axios'
import { bookShortcut, booksList } from '@/utils/books'
import randomHymn from '@/utils/randomHymn'
import simplifyText from '@/utils/simplifyText'
import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/search.module.scss'

interface HymnWithLyrics extends Hymn {
  lyrics?: string[]
}

export default function SearchPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

  // Router queries
  const router = useRouter()
  const book = router.query.book as string

  // Data fetching
  const [rawData, setRawData] = useState<Hymn[]>()
  const [data, setData] = useState<HymnWithLyrics[]>()
  const [isLoading, setLoading] = useState(true)

  // Dynamic search-box input
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  // Searching algorithm
  const Search = (data: Hymn[], input: string) => {
    const NamesCollector: HymnWithLyrics[] = []
    const LyricsCollector: HymnWithLyrics[] = []

    // Safe localStorage access
    let contextSearch = false
    try {
      const settings = localStorage.getItem('settings')
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        contextSearch = parsedSettings.contextSearch
      }
    } catch (error) {
      console.error('Error parsing settings:', error)
    }

    data.forEach((hymn) => {
      const { id, book, name, song } = hymn

      const formattedName = new simplifyText(name).format()
      const formattedInput = new simplifyText(input).format()

      if (formattedName.includes(formattedInput)) {
        // Title found
        NamesCollector.push({ id, book, name, song })
      } else if (contextSearch) {
        // Lyrics found
        const lyrics = Object.values(song.lyrics)
          .flat()
          .filter((verse) => verse.startsWith(' '))
          .map((verse) => verse.slice(1))

        lyrics.forEach((verse, index) => {
          if (input.match(/^[0-9]+$/)) return

          const formattedVerse = new simplifyText(verse).format()

          if (formattedVerse.includes(formattedInput)) {
            LyricsCollector.push({
              id,
              book,
              name,
              song,
              lyrics: [
                lyrics[index - 1]
                  ? `${lyrics[index - 2] ? '...' : ''} ${lyrics[index - 1]}`
                  : '',
                verse,
                lyrics[index + 1] ? lyrics[index + 1] : '',
                lyrics[index + 2]
                  ? `${lyrics[index + 2]} ${lyrics[index + 3] ? '...' : ''}`
                  : '',
              ],
            })
          }
        })
      }
    })

    // Merge Collectors
    const Collector = [...NamesCollector, ...LyricsCollector].filter(
      (value, index, self) => {
        return index === self.findIndex((x) => x.name === value.name)
      }
    )

    setData(Collector)
  }

  useEffect(() => {
    if (!router.isReady) return

    // Focus search-box on load
    const focusSearchBox = localStorage.getItem('focusSearchBox')
    if (focusSearchBox) inputRef.current?.focus()
    localStorage.removeItem('focusSearchBox')

    // Fast-search input value
    let quickSearch = false
    let prevSearch = null

    try {
      const settings = localStorage.getItem('settings')

      if (settings) {
        const parsedSettings = JSON.parse(settings)
        quickSearch = parsedSettings.quickSearch
      }

      const prevSearchData = localStorage.getItem('prevSearch')
      if (prevSearchData) prevSearch = JSON.parse(prevSearchData)
    } catch (error) {
      console.error('Error parsing localStorage data:', error)
    }

    if (quickSearch && prevSearch?.search) setInputValue(prevSearch.search)

    // Init data load function
    const loadData = (fetchData: Hymn[]) => {
      setRawData(fetchData)

      if (prevSearch?.search) Search(fetchData, prevSearch.search || '')
      else setData(fetchData)
    }

    // Hymns from all books
    if (!book) {
      const fetchAllBooks = async () => {
        try {
          const responses = await Promise.all(
            booksList().map((bookName) =>
              axios.get<Hymn[]>(`database/${bookName}.json`).catch((err) => {
                console.error(err)
                return null
              })
            )
          )

          const validResponses = responses.filter(
            (response): response is AxiosResponse<Hymn[]> => response !== null
          )

          const hymns = validResponses
            .flatMap((response) => {
              return response.data
            })
            .sort((a, b) => {
              return a.name.localeCompare(b.name, undefined, { numeric: true })
            })

          loadData(hymns)
        } catch (error) {
          console.error(error)
          router.push('/404')
        }
      }

      fetchAllBooks()

      // Hymns from selected book
    } else {
      axios
        .get(`database/${book}.json`)
        .then(({ data }) => loadData(data))
        .catch((err) => {
          console.error(err)
          router.push('/404')
        })
    }
  }, [router, book])

  // Clear input button
  const [showClearBtn, setShowClearBtn] = useState(false)

  useEffect(() => {
    if (inputValue) setShowClearBtn(true)
    else setShowClearBtn(false)

    // Select search when input value on init
    if (inputValue && !rawData) inputRef.current?.select()

    // Data update on input change
    if (rawData) {
      if (inputValue) {
        const timeout = setTimeout(() => {
          return Search(rawData, inputValue || '')
        }, 100)
        return () => clearTimeout(timeout)
      } else {
        setData(rawData)
      }
    }
  }, [inputValue, rawData])

  // Infinite scroll handler
  const [renderPage, setRenderPage] = useState(0)
  const [renderedData, setRenderedData] = useState<HymnWithLyrics[]>([])

  // Scroll-to-top button
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    const scrollEvent = () => {
      // Increase render array index
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setRenderPage((page) => page + 1)
      }

      // Show scroll-to-top button
      setShowTopBtn(window.scrollY > 350)
    }

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [])

  // Href link to hymn
  const hymnLink = (hymn: HymnWithLyrics) => {
    return {
      pathname: '/hymn',
      query: {
        book: bookShortcut(hymn.book),
        title: hymn.name,
      },
    }
  }

  // Clear input and restore results
  const cleanUp = useCallback(() => {
    setInputValue('')
    inputRef.current?.focus()

    setData(rawData)
    setRenderPage(0)
    localStorage.removeItem('prevSearch')
  }, [rawData])

  // Keyboard shortcuts
  useEffect(() => {
    const KeyupEvent = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.metaKey ||
        router.query.menu
      ) {
        return
      }

      if (document.activeElement === inputRef.current) {
        // Search-box shortcuts
        if (e.key === 'Escape') inputRef.current?.blur()
        if (e.key === 'Enter') {
          const hymn = data && data[0]
          if (hymn) router.push(hymnLink(hymn))
          else cleanUp()
        }
      } else {
        const key = e.key.toUpperCase()

        // Global shortcuts
        if (key === '/') inputRef.current?.focus()
        if (key === 'B') router.push(unlocked ? '/books' : '/')
        if (key === 'R') randomHymn(bookShortcut(book))
      }
    }

    document.addEventListener('keyup', KeyupEvent)
    return () => document.removeEventListener('keyup', KeyupEvent)
  }, [router, data, cleanUp, unlocked, book])

  // Set rendered data
  useEffect(() => {
    if (!data) return

    // Split data into 30 elements arrays
    const results = []
    for (let i = 0; i < data.length; i += 30) {
      results.push(data.slice(i, i + 30))
    }

    // Render content
    const array = results.slice(0, renderPage + 1).flat()
    setRenderedData(array)

    setLoading(false)
  }, [data, renderPage])

  // Quick actions on result hover
  const [resultHovered, setResultHovered] = useState<number>()

  const SearchResult = ({
    hymn,
    index,
  }: {
    hymn: HymnWithLyrics
    index: number
  }) => {
    let isFavorite = Boolean(
      localStorage.getItem('favorites')?.includes(hymn.name)
    )

    return (
      <div
        className={styles.hymn}
        onMouseEnter={() => setResultHovered(index)}
        onMouseLeave={() => setResultHovered(undefined)}
      >
        <Link
          href={hymnLink(hymn)}
          className={styles.result}
          onClick={() => {
            const { quickSearch } = JSON.parse(
              localStorage.getItem('settings') as string
            )

            localStorage.setItem(
              'prevSearch',
              JSON.stringify({
                book,
                search: quickSearch ? inputValue : '',
              })
            )
          }}
        >
          <h2>
            {unlocked ? (
              <Highlighter
                autoEscape={true}
                highlightClassName={styles.highlight}
                searchWords={[inputValue]}
                textToHighlight={hymn.name}
              />
            ) : (
              hymn.name
            )}
          </h2>

          {hymn.lyrics && (
            <div className={styles.lyrics}>
              {hymn.lyrics.map((verse, index) => (
                <p key={index}>
                  {unlocked ? (
                    <Highlighter
                      autoEscape={true}
                      highlightClassName={styles.highlight}
                      searchWords={[inputValue]}
                      textToHighlight={verse.toString()}
                    />
                  ) : (
                    verse
                  )}
                </p>
              ))}
            </div>
          )}
        </Link>

        <div className={styles.quickActions}>
          {unlocked && (
            <button
              title='Otwórz pokaz slajdów'
              className={styles.onHover}
              style={{
                display: resultHovered === index ? 'flex' : '',
              }}
              onClick={() => {
                const book = bookShortcut(hymn.book)
                const title = hymn.name

                const presWindow = localStorage.getItem('presWindow')

                if (!presWindow) {
                  // Fullscreen mode
                  const elem = document.documentElement
                  if (elem.requestFullscreen) {
                    elem.requestFullscreen()
                  }

                  router.push({
                    pathname: '/presentation',
                    query: { book, title },
                  })
                } else {
                  // Open new window
                  const params = new URLSearchParams()
                  params.append('book', book)
                  params.append('title', title)

                  window.open(
                    `/presentation?${params.toString()}`,
                    'presentation',
                    'width=960,height=540'
                  )

                  localStorage.setItem('presWindow', 'true')
                }
              }}
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
          )}

          {isFavorite && (
            <button
              title='Usuń pieśń z ulubionych'
              onClick={() => {
                if (!confirm('Czy chcesz usunąć wybraną pieśń z ulubionych?')) {
                  return
                }

                let favorites = JSON.parse(
                  localStorage.getItem('favorites') || '[]'
                )

                favorites = favorites.filter(
                  (elem: { book: string; id: number }) => {
                    return (
                      elem.book !== bookShortcut(hymn.book) ||
                      elem.id !== hymn.id
                    )
                  }
                )

                isFavorite = false
                localStorage.setItem('favorites', JSON.stringify(favorites))
              }}
            >
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

  return (
    <>
      <Head>
        <title>Wyszukiwanie / Śpiewniki</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.title}>
          <Link href='/'>
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
          </Link>

          {!isLoading && <h1>{bookShortcut(book || 'all')}</h1>}

          {unlocked && (
            <Link href='/books'>
              <p>Zmień śpiewnik</p>
              <Image
                className='icon'
                alt='filter'
                src='/icons/filter.svg'
                width={22}
                height={22}
                draggable={false}
              />
            </Link>
          )}
        </div>

        <div className={styles.searchBox}>
          <div className={styles.searchIcon}>
            <Image
              className='icon'
              alt='search'
              src='/icons/search.svg'
              width={25}
              height={25}
              draggable={false}
            />
          </div>

          <input
            ref={inputRef}
            name='search-box'
            title='Kliknij, lub użyj [/] na klawiaturze, aby rozpocząć wyszukiwanie'
            placeholder={
              'Rozpocznij wyszukiwanie ' +
              (data?.length ? `(${data?.length})` : '')
            }
            autoComplete='off'
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value
              setInputValue(value)
              setRenderPage(0)

              // Saving search values
              try {
                const settings = localStorage.getItem('settings')
                let quickSearch = false

                if (settings) {
                  const parsedSettings = JSON.parse(settings)
                  quickSearch = parsedSettings.quickSearch
                }

                localStorage.setItem(
                  'prevSearch',
                  JSON.stringify({ book, search: quickSearch ? value : '' })
                )
              } catch (error) {
                console.error('Error saving search data:', error)
              }

              // easter-egg
              if (unlocked && value === '2137') {
                localStorage.removeItem('prevSearch')

                router.push({
                  pathname: '/hymn',
                  query: {
                    book: 'C',
                    title: '7C. Pan kiedyś stanął nad brzegiem',
                  },
                })
              }
            }}
            onFocus={(e) => e.target.select()}
          />

          {showClearBtn ? (
            <button
              title='Wyczyść wyszukiwanie'
              className={styles.clearButton}
              onClick={cleanUp}
            >
              <Image
                className='icon'
                alt='clear'
                src='/icons/close.svg'
                width={25}
                height={25}
                draggable={false}
              />
            </button>
          ) : (
            <button
              title='Otwórz losową pieśń [R]'
              className={styles.randomButton}
              onClick={() => randomHymn(bookShortcut(book))}
            >
              <Image
                className='icon'
                alt='dice'
                src='/icons/dice.svg'
                width={25}
                height={25}
                draggable={false}
              />
            </button>
          )}
        </div>

        <div className={styles.results}>
          {isLoading ||
            (!renderedData.length ? (
              <p className={styles.noResults}>Brak wyników wyszukiwania</p>
            ) : (
              renderedData.map((hymn, index, row) => (
                <div key={index}>
                  <SearchResult hymn={hymn} index={index} />
                  {index + 1 !== row.length && <hr />}
                </div>
              ))
            ))}
        </div>

        <button
          title='Powróć na górę strony'
          className={`${showTopBtn && styles.show} ${styles.scrollButton}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Image
            alt='up'
            src='/icons/arrow.svg'
            width={25}
            height={25}
            draggable={false}
          />
        </button>
      </main>
    </>
  )
}
