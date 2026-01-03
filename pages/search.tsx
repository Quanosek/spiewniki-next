import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import Highlighter from 'react-highlight-words'
import axios, { AxiosResponse } from 'axios'

import { defaultSettings } from '@/components/menu/settings'
import HamburgerIcon from '@/components/mobile-menu/hamburger-icon'
import MenuModal from '@/components/mobile-menu/menu-modal'
import MobileNavbar from '@/components/mobile-navbar'

import { bookShortcut, booksList } from '@/utils/books'
import getRandomHymn from '@/utils/getRandomHymn'
import { reformatText } from '@/utils/simplifyText'

import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/search.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

interface ProcessedHymn extends Omit<Hymn, 'song'> {
  song: Hymn['song']
  lyrics?: string[]
  matchPosition?: number
  matchType?: 'name' | 'lyrics'
  formattedName: string
  numberPrefix: number
  hasLetterSuffix: boolean
  lyricsPlain: string[]
  dedupeKey: string
}

const numberPrefix = (value: string) => {
  const match = value.match(/^\s*(\d+)/)
  return match ? parseInt(match[1], 10) : NaN
}

const hasLetterSuffix = (value: string) => {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d+)([A-Za-z]+)/)
  return !!(match && match[2])
}

const mapHymn = (hymn: Hymn): ProcessedHymn => {
  const formattedName = reformatText(hymn.name)
  const lyricsPlain = Object.values(hymn.song.lyrics)
    .flat()
    .filter((verse) => verse.startsWith(' '))
    .map((verse) => verse.slice(1))

  return {
    ...hymn,
    formattedName,
    numberPrefix: numberPrefix(hymn.name),
    hasLetterSuffix: hasLetterSuffix(hymn.name),
    lyricsPlain,
    dedupeKey: `${bookShortcut(hymn.book)}|${hymn.name}`,
  }
}

// Match hymn titles against search query and return results with match position
const matchNames = (hymn: ProcessedHymn, formattedInput: string): ProcessedHymn | null => {
  if (!hymn.formattedName.includes(formattedInput)) return null

  return {
    ...hymn,
    matchPosition: hymn.formattedName.indexOf(formattedInput),
    matchType: 'name',
  }
}

// Match hymn lyrics against search query (only if contextSearch enabled)
const matchLyrics = (
  hymn: ProcessedHymn,
  input: string,
  formattedInput: string
): ProcessedHymn[] => {
  if (input.match(/^[0-9]+$/)) return []

  const results: ProcessedHymn[] = []

  hymn.lyricsPlain.forEach((verse, index) => {
    const formattedVerse = reformatText(verse)
    if (!formattedVerse.includes(formattedInput)) return

    results.push({
      ...hymn,
      lyrics: [
        hymn.lyricsPlain[index - 1]
          ? `${hymn.lyricsPlain[index - 2] ? '...' : ''} ${hymn.lyricsPlain[index - 1]}`
          : '',
        verse,
        hymn.lyricsPlain[index + 1] ? hymn.lyricsPlain[index + 1] : '',
        hymn.lyricsPlain[index + 2]
          ? `${hymn.lyricsPlain[index + 2]} ${hymn.lyricsPlain[index + 3] ? '...' : ''}`
          : '',
      ],
      matchPosition: formattedVerse.indexOf(formattedInput),
      matchType: 'lyrics',
    })
  })

  return results
}

// Comparator for all-books mode
const compareAllBooks = (unlocked: boolean) => (a: ProcessedHymn, b: ProcessedHymn) => {
  const order = booksList(unlocked)

  // Titles (name matches) before lyrics
  if (a.matchType !== b.matchType) return a.matchType === 'name' ? -1 : 1

  // Earlier match position (prefix) first
  const pa = a.matchPosition ?? Number.MAX_SAFE_INTEGER
  const pb = b.matchPosition ?? Number.MAX_SAFE_INTEGER
  if (pa !== pb) return pa - pb

  // Numeric titles grouped; sort by number value
  const na = a.numberPrefix
  const nb = b.numberPrefix
  const aHasNumber = Number.isFinite(na)
  const bHasNumber = Number.isFinite(nb)
  if (aHasNumber && bHasNumber && na !== nb) return na - nb
  if (aHasNumber !== bHasNumber) return aHasNumber ? -1 : 1

  // Within same number, plain titles (no letter suffix) before suffixed ones
  if (aHasNumber && bHasNumber && na === nb) {
    if (a.hasLetterSuffix !== b.hasLetterSuffix) return a.hasLetterSuffix ? 1 : -1
  }

  // Book order per booksList
  const ia = order.indexOf(bookShortcut(a.book))
  const ib = order.indexOf(bookShortcut(b.book))
  if (ia !== ib) return ia - ib

  // Alphabetical by name (numeric-aware) as final tiebreaker
  const nameCmp = a.name.localeCompare(b.name, undefined, { numeric: true })
  if (nameCmp !== 0) return nameCmp

  return 0
}

// Comparator for single-book mode
const compareSingleBook = (a: ProcessedHymn, b: ProcessedHymn) => {
  // Titles (name matches) before lyrics
  if (a.matchType !== b.matchType) return a.matchType === 'name' ? -1 : 1

  // Earlier match position (prefix) first
  const pa = a.matchPosition ?? Number.MAX_SAFE_INTEGER
  const pb = b.matchPosition ?? Number.MAX_SAFE_INTEGER
  if (pa !== pb) return pa - pb

  // Numeric titles grouped; sort by number value
  const na = a.numberPrefix
  const nb = b.numberPrefix
  const aHasNumber = Number.isFinite(na)
  const bHasNumber = Number.isFinite(nb)
  if (aHasNumber && bHasNumber && na !== nb) return na - nb
  if (aHasNumber !== bHasNumber) return aHasNumber ? -1 : 1

  // Within same number, plain titles (no letter suffix) before suffixed ones
  if (aHasNumber && bHasNumber && na === nb) {
    if (a.hasLetterSuffix !== b.hasLetterSuffix) return a.hasLetterSuffix ? 1 : -1
  }

  // Alphabetical by name (numeric-aware) as final tiebreaker
  const nameCmp = a.name.localeCompare(b.name, undefined, { numeric: true })
  if (nameCmp !== 0) return nameCmp

  return 0
}

export default function SearchPage() {
  const router = useRouter()
  const book = Array.isArray(router.query.book) ? router.query.book[0] : router.query.book

  // Builds link to hymn detail page
  const hymnLink = (hymn: ProcessedHymn) => ({
    pathname: '/hymn',
    query: {
      book: bookShortcut(hymn.book),
      title: hymn.name,
    },
  })

  // Search related state
  const [rawData, setRawData] = useState<ProcessedHymn[]>()
  const [data, setData] = useState<ProcessedHymn[]>()
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const lastSearchRef = useRef<string>('')
  const searchRef = useRef<(data: ProcessedHymn[], input: string) => void>()

  // Main search algorithm: collect matches from names/lyrics, dedupe, and sort
  const Search = useCallback(
    (data: ProcessedHymn[], input: string) => {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}')
      const contextSearch = settings.contextSearch ?? false
      const formattedInput = reformatText(input)

      // Collect all matching hymns from titles and lyrics
      const NamesCollector: ProcessedHymn[] = []
      const LyricsCollector: ProcessedHymn[] = []

      data.forEach((hymn) => {
        // Try to match in title first
        const nameMatch = matchNames(hymn, formattedInput)
        if (nameMatch) {
          NamesCollector.push(nameMatch)
          return // Skip lyrics search if title matches
        }

        // Try to match in lyrics (if enabled)
        if (contextSearch) {
          const lyricMatches = matchLyrics(hymn, input, formattedInput)
          LyricsCollector.push(...lyricMatches)
        }
      })

      // Deduplicate by hymn book + name
      const collectorMap = new Map<string, ProcessedHymn>()
      const allMatches = [...NamesCollector, ...LyricsCollector]

      allMatches.forEach((hymn) => {
        if (!collectorMap.has(hymn.dedupeKey)) {
          collectorMap.set(hymn.dedupeKey, hymn)
        }
      })

      const result = Array.from(collectorMap.values())

      // Sort results using appropriate comparator
      if (!book) {
        result.sort(compareAllBooks(unlocked))
      } else {
        result.sort(compareSingleBook)
      }

      setData(result)
      lastSearchRef.current = input
    },
    [book]
  )

  // Update search ref
  searchRef.current = Search

  // Clears search box and restores initial data view
  const [showClearBtn, setShowClearBtn] = useState(false)

  const cleanUp = useCallback(() => {
    localStorage.removeItem('prevSearch')
    setInputValue('')
    inputRef.current?.focus()
    setRenderPage(0)
    if (rawData) {
      searchRef.current?.(rawData, '')
    } else {
      setData(rawData)
    }
  }, [rawData])

  // Run search whenever input or raw data changes
  const [localSettings, setLocalSettings] = useState<typeof defaultSettings>()

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    setLocalSettings(settings)
  }, [])

  // Restore focus and previous search if needed
  useEffect(() => {
    if (!router.isReady) return

    const focusSearchBox = JSON.parse(localStorage.getItem('focusSearchBox') || 'false')
    if (focusSearchBox) inputRef.current?.focus()
    localStorage.removeItem('focusSearchBox')

    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    const quickSearch = settings.quickSearch || false
    const prevSearch = JSON.parse(localStorage.getItem('prevSearch') || '{"search": null}')

    if (quickSearch && prevSearch?.search) setInputValue(prevSearch.search)
  }, [router.isReady])

  // Fetch hymns data (all books or single) on mount/change
  useEffect(() => {
    if (!router.isReady) return

    const prevSearch = JSON.parse(localStorage.getItem('prevSearch') || '{"search": null}')

    const loadData = (fetchData: Hymn[]) => {
      const prepared = fetchData.map(mapHymn)
      setRawData(prepared)

      const initialSearch = prevSearch?.search || ''
      if (initialSearch) setInputValue(initialSearch)

      searchRef.current?.(prepared, initialSearch)
    }

    if (!book) {
      const fetchAllBooks = async () => {
        try {
          const responses = await Promise.all(
            booksList(unlocked).map((bookName) =>
              axios.get<Hymn[]>(`database/${bookName}.json`).catch((err) => {
                console.error(err)
                return null
              })
            )
          )

          const validResponses = responses.filter(
            (response): response is AxiosResponse<Hymn[]> => response !== null
          )

          const hymns = validResponses.flatMap((response) => response.data)

          loadData(hymns)
        } catch (err) {
          console.error(err)
          router.push('/404')
        }
      }

      fetchAllBooks()
    } else {
      const abortController = new AbortController()

      axios
        .get(`database/${book}.json`, { signal: abortController.signal })
        .then(({ data }) => {
          const sorted = [...data].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          )
          loadData(sorted)
        })
        .catch((err) => {
          if (axios.isCancel(err)) return
          console.error(err)
          router.push('/404')
        })

      return () => abortController.abort()
    }
  }, [router, book])

  // Run search whenever input or raw data changes
  useEffect(() => {
    setShowClearBtn(!!inputValue)

    if (inputValue && !rawData) inputRef.current?.select()

    if (rawData) {
      if (inputValue === lastSearchRef.current) return
      const timeout = setTimeout(() => {
        searchRef.current?.(rawData, inputValue || '')
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [inputValue, rawData])

  // Handle infinite scroll and back-to-top visibility
  const [renderPage, setRenderPage] = useState(0)
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    const scrollEvent = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setRenderPage((page) => page + 1)
      }
      setShowTopBtn(window.scrollY > 350)
    }

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [])

  // Paginate rendered data chunks
  const [renderData, setRenderData] = useState<ProcessedHymn[]>([])
  const [isLoading, setLoading] = useState(true)

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

  // Sync favorites flags from localStorage
  const [favoritesState, setFavoritesState] = useState<Record<string, boolean>>({})

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

  // Prevent scrolling on active hamburger menu
  const [hamburgerMenu, showHamburgerMenu] = useState(false)

  useEffect(() => {
    if (!hamburgerMenu) return

    const leftScroll = document.documentElement.scrollLeft
    const topScroll = document.documentElement.scrollTop

    const scrollEvent = () => window.scrollTo(leftScroll, topScroll)

    document.addEventListener('scroll', scrollEvent)
    return () => document.removeEventListener('scroll', scrollEvent)
  }, [hamburgerMenu])

  // Opens a random hymn
  const randomHymn = useCallback(async () => {
    const foundHymn = await getRandomHymn(unlocked, book)
    if (foundHymn) {
      const { book, title } = foundHymn
      router.push({
        pathname: '/hymn',
        query: { book, title },
      })
    }
  }, [book, router])

  // Keyboard shortcuts
  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || router.query.menu) {
        return
      }

      if (document.activeElement === inputRef.current) {
        // Input is focused
        if (e.key === 'Escape') inputRef.current?.blur()
        if (e.key === 'Enter') {
          const hymn = data && data[0]
          if (hymn && inputValue) router.push(hymnLink(hymn))
          else cleanUp()
        }
      } else {
        // Input is not focused
        if (e.key === 'Escape') router.push('/')
        if (e.key === '/') inputRef.current?.focus()

        const key = e.key.toUpperCase()

        if (key === 'B') router.push(unlocked ? '/books' : '/')
        if (key === 'R') randomHymn()
      }
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [router, data, inputValue, cleanUp, randomHymn])

  // Renders a single search result row
  const SearchResult = ({
    hymn,
    quickSearch,
    isFavorite,
  }: {
    hymn: ProcessedHymn
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
          <button
            title='Włącz tryb prezentacji dla wybranej pieśni'
            className={styles.onHover}
            style={{ display: resultHovered ? 'flex' : '' }}
            onClick={() => {
              const book = bookShortcut(hymn.book)
              const title = hymn.name
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

          {isFavorite && (
            <button
              title='Usuń pieśń z listy ulubionych'
              onClick={() => {
                if (!confirm('Czy chcesz usunąć wybraną pieśń z listy ulubionych?')) {
                  return
                }

                const bookName = bookShortcut(hymn.book)
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')

                const newFavorites = favorites.filter((elem: { book: string; id: number }) => {
                  return elem.book !== bookName || elem.id !== hymn.id
                })

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
              unlocked ? 'Powróć do strony głównej [Esc]' : 'Powróć do wyboru śpiewników [Esc]'
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

          {isLoading || <h1>{bookShortcut(book || 'all')}</h1>}

          {unlocked ? (
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
          ) : (
            <HamburgerIcon active={hamburgerMenu} setActive={showHamburgerMenu} />
          )}
        </div>

        {unlocked || <MenuModal active={hamburgerMenu} />}

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
            placeholder={'Rozpocznij wyszukiwanie ' + (data?.length ? `(${data?.length})` : '')}
            autoComplete='off'
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value
              setInputValue(value)
              setRenderPage(0)

              const settings = JSON.parse(localStorage.getItem('settings') || '{}')
              localStorage.setItem(
                'prevSearch',
                JSON.stringify({
                  book,
                  search: settings.quickSearch ? value : '',
                })
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
              title='Otwórz losową pieśń z wybranego śpiewnika [R]'
              className={styles.randomButton}
              onClick={randomHymn}
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
          <Image alt='up' src='/icons/arrow.svg' width={25} height={25} draggable={false} />
        </button>
      </main>

      <MobileNavbar unlocked={unlocked} />
    </>
  )
}
