import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Highlighter from 'react-highlight-words'
import axios, { AxiosResponse } from 'axios'

import { defaultSettings } from '@/components/menu/settings'
import { bookShortcut, booksList } from '@/utils/books'
import randomHymn from '@/utils/randomHymn'
import { reformatText } from '@/utils/simplifyText'
import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/search.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

interface HymnWithLyrics extends Hymn {
  lyrics?: string[]
}

export default function SearchPage() {
  const router = useRouter()
  const book = router.query.book as string

  const [localSettings, setLocalSettings] = useState<typeof defaultSettings>()
  const [rawData, setRawData] = useState<Hymn[]>()
  const [data, setData] = useState<HymnWithLyrics[]>()
  const [inputValue, setInputValue] = useState('')
  const [showClearBtn, setShowClearBtn] = useState(false)
  const [renderPage, setRenderPage] = useState(0)
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [renderData, setRenderData] = useState<HymnWithLyrics[]>([])
  const [isLoading, setLoading] = useState(true)
  const [favoritesState, setFavoritesState] = useState<Record<string, boolean>>(
    {}
  )

  const inputRef = useRef<HTMLInputElement>(null)

  const Search = (data: Hymn[], input: string) => {
    const NamesCollector: HymnWithLyrics[] = []
    const LyricsCollector: HymnWithLyrics[] = []
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    const contextSearch = settings.contextSearch || false

    data.forEach((hymn) => {
      const { id, book, name, song } = hymn
      const formattedName = reformatText(name)
      const formattedInput = reformatText(input)

      if (formattedName.includes(formattedInput)) {
        NamesCollector.push({ id, book, name, song })
      } else if (contextSearch) {
        const lyrics = Object.values(song.lyrics)
          .flat()
          .filter((verse) => verse.startsWith(' '))
          .map((verse) => verse.slice(1))

        lyrics.forEach((verse, index) => {
          if (input.match(/^[0-9]+$/)) return

          const formattedVerse = reformatText(verse)
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

    const collectorMap = new Map()
    const allHymns = [...NamesCollector, ...LyricsCollector]

    allHymns.forEach((hymn) => {
      if (!collectorMap.has(hymn.name)) {
        collectorMap.set(hymn.name, hymn)
      }
    })

    setData(Array.from(collectorMap.values()))
  }

  const cleanUp = useCallback(() => {
    localStorage.removeItem('prevSearch')
    setInputValue('')
    inputRef.current?.focus()
    setRenderPage(0)
    setData(rawData)
  }, [rawData])

  const hymnLink = (hymn: HymnWithLyrics) => ({
    pathname: '/hymn',
    query: {
      book: bookShortcut(hymn.book),
      title: hymn.name,
    },
  })

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    setLocalSettings(settings)
  }, [])

  useEffect(() => {
    if (!router.isReady) return

    const focusSearchBox = JSON.parse(
      localStorage.getItem('focusSearchBox') || 'false'
    )
    if (focusSearchBox) inputRef.current?.focus()
    localStorage.removeItem('focusSearchBox')

    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    const quickSearch = settings.quickSearch || false
    const prevSearch = JSON.parse(
      localStorage.getItem('prevSearch') || '{"search": null}'
    )

    if (quickSearch && prevSearch?.search) setInputValue(prevSearch.search)
  }, [router.isReady])

  useEffect(() => {
    if (!router.isReady) return

    const prevSearch = JSON.parse(
      localStorage.getItem('prevSearch') || '{"search": null}'
    )

    const loadData = (fetchData: Hymn[]) => {
      setRawData(fetchData)
      if (prevSearch?.search) Search(fetchData, prevSearch.search || '')
      else setData(fetchData)
    }

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
            .flatMap((response) => response.data)
            .sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true })
            )

          loadData(hymns)
        } catch (error) {
          console.error(error)
          router.push('/404')
        }
      }

      fetchAllBooks()
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

  useEffect(() => {
    setShowClearBtn(!!inputValue)

    if (inputValue && !rawData) inputRef.current?.select()

    if (rawData) {
      if (inputValue) {
        const timeout = setTimeout(() => {
          if (rawData) Search(rawData, inputValue || '')
        }, 100)
        return () => clearTimeout(timeout)
      } else {
        setData(rawData)
      }
    }
  }, [inputValue, rawData])

  useEffect(() => {
    const scrollEvent = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setRenderPage((page) => page + 1)
      }
      setShowTopBtn(window.scrollY > 350)
    }

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [])

  useEffect(() => {
    if (!data) return

    const results = []
    for (let i = 0; i < data.length; i += 30) {
      results.push(data.slice(i, i + 30))
    }

    const array = results.slice(0, renderPage + 1).flat()
    setRenderData(array)
    setLoading(false)
  }, [data, renderPage])

  useEffect(() => {
    if (!data) return

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const states = Object.fromEntries(
      data.map((hymn) => [
        hymn.name,
        favorites.some(
          (elem: { book: string; id: number }) =>
            elem.book === bookShortcut(hymn.book) && elem.id === hymn.id
        ),
      ])
    )

    setFavoritesState(states)
  }, [data])

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

      if (document.activeElement === inputRef.current) {
        if (e.key === 'Escape') inputRef.current?.blur()
        if (e.key === 'Enter') {
          const hymn = data && data[0]
          if (hymn && inputValue) router.push(hymnLink(hymn))
          else cleanUp()
        }
      } else {
        if (e.key === '/') inputRef.current?.focus()
        if (e.key === 'Escape') router.back()

        const key = e.key.toUpperCase()

        if (key === 'B') router.push(unlocked ? '/books' : '/')
        if (key === 'R') {
          randomHymn(book).then((hymn) => {
            if (hymn) {
              router.push({
                pathname: '/hymn',
                query: {
                  book: bookShortcut(hymn.book),
                  title: hymn.name,
                },
              })
            }
          })
        }
      }
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [router, data, cleanUp, book, inputValue])

  const SearchResult = ({
    hymn,
    quickSearch,
    isFavorite,
  }: {
    hymn: HymnWithLyrics
    quickSearch: boolean | undefined
    isFavorite: boolean
  }) => {
    const [resultHovered, setResultHovered] = useState(false)

    return (
      <div
        className={styles.hymn}
        onMouseEnter={() => setResultHovered(true)}
        onMouseLeave={() => setResultHovered(false)}
      >
        <Link
          href={hymnLink(hymn)}
          className={styles.result}
          onClick={() => {
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
                <p key={`${verse}-${index}`}>
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
              style={{ display: resultHovered ? 'flex' : '' }}
              onClick={() => {
                const book = bookShortcut(hymn.book)
                const title = hymn.name
                const presWindow = JSON.parse(
                  localStorage.getItem('presWindow') || 'false'
                )

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
              title='Usuń pieśń z listy ulubionych'
              onClick={() => {
                if (
                  !confirm(
                    'Czy chcesz usunąć wybraną pieśń z listy ulubionych?'
                  )
                ) {
                  return
                }

                const bookName = bookShortcut(hymn.book)
                const favorites = JSON.parse(
                  localStorage.getItem('favorites') || '[]'
                )

                const newFavorites = favorites.filter(
                  (elem: { book: string; id: number }) => {
                    return elem.book !== bookName || elem.id !== hymn.id
                  }
                )

                localStorage.setItem('favorites', JSON.stringify(newFavorites))
                setFavoritesState((prev) => ({
                  ...prev,
                  [hymn.name]: false,
                }))
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
          <Link
            href='/'
            title={
              unlocked
                ? 'Powróć do strony głównej [Esc]'
                : 'Powróć do wyboru śpiewników [Esc]'
            }
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
          </Link>

          {!isLoading && <h1>{bookShortcut(book || 'all')}</h1>}

          {unlocked && (
            <Link href='/books' title='Wybierz inny śpiewnik [B]'>
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

              localStorage.setItem(
                'prevSearch',
                JSON.stringify({
                  book,
                  search: localSettings?.quickSearch ? value : '',
                })
              )

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
              title='Wyczyść wyszukiwanie [Backspace]'
              className={styles.clearButton}
              onClick={cleanUp}
            >
              <Image
                className='icon'
                alt='clear'
                src='/icons/close.svg'
                width={23}
                height={23}
                draggable={false}
              />
            </button>
          ) : (
            <button
              title='Otwórz losową pieśń [R]'
              className={styles.randomButton}
              onClick={async () => {
                const hymn = await randomHymn(book)
                if (hymn) {
                  router.push({
                    pathname: '/hymn',
                    query: {
                      book: bookShortcut(hymn.book),
                      title: hymn.name,
                    },
                  })
                }
              }}
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
            (!renderData.length ? (
              <p className={styles.noResults}>Brak wyników wyszukiwania</p>
            ) : (
              renderData.map((hymn, index, row) => (
                <div key={`${hymn.book}-${hymn.id}`}>
                  <SearchResult
                    hymn={hymn}
                    quickSearch={localSettings?.quickSearch}
                    isFavorite={favoritesState[hymn.name] || false}
                  />

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
