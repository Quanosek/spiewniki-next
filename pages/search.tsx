import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import Highlighter from 'react-highlight-words'
import { bookShortcut, booksList } from '@/lib/availableBooks'
import { randomHymn } from '@/lib/buttons'
import HymnTypes from '@/lib/hymnTypes'
import simplifyText from '@/lib/simplifyText'

import styles from '@/styles/pages/search.module.scss'

export default function SearchPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == 'true'

  // router queries
  const router = useRouter()
  const book = router.query.book as string

  // data fetching
  const [rawData, setRawData] = useState<HymnTypes[]>()
  const [data, setData] = useState<HymnTypes[]>()
  const [isLoading, setLoading] = useState(true)

  // dynamic search-box input
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  // searching algorithm
  const Search = (data: HymnTypes[], input: string) => {
    const NamesCollector: any[] = []
    const LyricsCollector: any[] = []

    const { contextSearch } = JSON.parse(
      localStorage.getItem('settings') as string
    )

    data.map((hymn: HymnTypes) => {
      const { id, book, name, song } = hymn

      const formattedName = new simplifyText(name).format()
      const formattedInput = new simplifyText(input).format()

      if (formattedName.includes(formattedInput)) {
        // title found
        NamesCollector.push({ id, book, name })
      } else if (contextSearch) {
        // lyrics found
        const lyrics = Object.values(song.lyrics)
          .flat()
          .filter((verse) => verse.startsWith(' '))
          .map((verse) => verse.slice(1))

        lyrics.map((verse, index) => {
          if (input.match(/^[0-9]+$/)) return

          const formattedVerse = new simplifyText(verse).format()

          if (formattedVerse.includes(formattedInput)) {
            LyricsCollector.push({
              id,
              book,
              name,
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

    // merge Collectors
    const Collector = [...NamesCollector, ...LyricsCollector].filter(
      (value, index, self) => {
        return index === self.findIndex((x) => x.name === value.name)
      }
    )

    setData(Collector)
  }

  useEffect(() => {
    if (!router.isReady) return

    // wrong book name error
    if (book && !bookShortcut(book)) router.push('/404')

    // focus search-box on load
    if (localStorage.getItem('focusSearchBox')) inputRef.current?.focus()
    localStorage.removeItem('focusSearchBox')

    // fast-search input value
    const { quickSearch } = JSON.parse(
      localStorage.getItem('settings') as string
    )
    const prevSearch = JSON.parse(localStorage.getItem('prevSearch') as string)
    if (quickSearch && prevSearch?.search) setInputValue(prevSearch.search)

    // init data load function
    const loadData = (fetchData: HymnTypes[]) => {
      setRawData(fetchData)

      if (prevSearch?.search) Search(fetchData, prevSearch.search || '')
      else setData(fetchData)
    }

    // hymns from all books
    if (!book) {
      const Collector: any[] = []

      booksList().map(async (book) => {
        Collector.push(
          await axios
            .get(`database/${bookShortcut(book)}.json`)
            .catch((err) => {
              console.error(err)
              router.push('/404')
            })
        )

        if (Collector.length === booksList().length) {
          let hymns: any[] = []

          Collector.map(({ data }) => hymns.push(...data))
          hymns = hymns.sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, { numeric: true })
          })

          loadData(hymns)
        }
      })

      // hymns from selected book
    } else {
      axios
        .get(`database/${bookShortcut(book)}.json`)
        .then(({ data }) => loadData(data))
        .catch((err) => {
          console.error(err)
          router.push('/404')
        })
    }
  }, [router, book])

  // clear input button
  const [showClearBtn, setShowClearBtn] = useState(false)

  useEffect(() => {
    if (inputValue) setShowClearBtn(true)
    else setShowClearBtn(false)

    // select search when input value on init
    if (inputValue && !rawData) inputRef.current?.select()

    // data update on input change
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

  // infinite scroll handler
  const [renderPage, setRenderPage] = useState(0)
  const [renderedData, setRenderedData] = useState<HymnTypes[]>([])

  // scroll-to-top button
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    const scrollEvent = () => {
      // increase render array index
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setRenderPage((page) => page + 1)
      }

      // show scroll-to-top button
      setShowTopBtn(window.scrollY > 350)
    }

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [])

  // href link to hymn
  const hymnLink = (hymn: HymnTypes) => {
    return {
      pathname: '/hymn',
      query: {
        book: bookShortcut(hymn.book),
        title: hymn.name,
      },
    }
  }

  // clear input and restore results
  const cleanUp = useCallback(() => {
    setInputValue('')
    inputRef.current?.focus()

    setData(rawData)
    setRenderPage(0)
    localStorage.removeItem('prevSearch')
  }, [rawData])

  // keyboard shortcuts
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
        // search-box shortcuts
        if (e.key === 'Escape') inputRef.current?.blur()
        if (e.key === 'Enter') {
          const hymn = data && data[0]
          if (hymn) router.push(hymnLink(hymn))
          else cleanUp()
        }
      } else {
        const key = e.key.toUpperCase()

        // global shortcuts
        if (key === '/') inputRef.current?.focus()
        if (key === 'B') router.push(unlocked ? '/books' : '/')
        if (key === 'R') randomHymn(bookShortcut(book))
      }
    }

    document.addEventListener('keyup', KeyupEvent)
    return () => document.removeEventListener('keyup', KeyupEvent)
  }, [router, data, cleanUp, unlocked, book])

  // set rendered data
  useEffect(() => {
    if (!data) return

    // split data into 30 elements arrays
    const results = []
    for (let i = 0; i < data.length; i += 30) {
      results.push(data.slice(i, i + 30))
    }

    // render content
    const array = results.slice(0, renderPage + 1).flat()
    setRenderedData(array)

    setLoading(false)
  }, [data, renderPage])

  // quick actions on result hover
  const [resultHovered, setResultHovered] = useState<number | undefined>()

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

              // saving search values
              const { quickSearch } = JSON.parse(
                localStorage.getItem('settings') as string
              )

              localStorage.setItem(
                'prevSearch',
                JSON.stringify({ book, search: quickSearch ? value : '' })
              )

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
              renderedData.map((hymn, index, row) => {
                let isFavorite = Boolean(
                  localStorage.getItem('favorites')?.includes(hymn.name)
                )

                return (
                  <div key={index}>
                    <div
                      className={styles.hymn}
                      onMouseEnter={() => setResultHovered(index)}
                      onMouseLeave={() => setResultHovered(undefined)}
                    >
                      <Link
                        className={styles.result}
                        href={hymnLink(hymn)}
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
                            {hymn.lyrics.map((verse, i) => (
                              <p key={i}>
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

                              const presWindow =
                                localStorage.getItem('presWindow')

                              if (!presWindow) {
                                // fullscreen mode
                                const elem = document.documentElement
                                if (elem.requestFullscreen) {
                                  elem.requestFullscreen()
                                }

                                router.push({
                                  pathname: '/presentation',
                                  query: { book, title },
                                })
                              } else {
                                // open new window
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
                              if (
                                !confirm(
                                  'Czy chcesz usunąć wybraną pieśń z ulubionych?'
                                )
                              ) {
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
                              localStorage.setItem(
                                'favorites',
                                JSON.stringify(favorites)
                              )
                            }}
                          >
                            <Image
                              className='icon'
                              alt='favorite'
                              src='/icons/star_filled.svg'
                              width={25}
                              height={25}
                              draggable={false}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {index + 1 !== row.length && <hr />}
                  </div>
                )
              })
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
