import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import Highlighter from 'react-highlight-words'
import axios from 'axios'

import { defaultSettings } from '@/components/menu/settings'
import HamburgerIcon from '@/components/mobile-menu/hamburger-icon'
import MenuModal from '@/components/mobile-menu/menu-modal'
import MobileNavbar from '@/components/mobile-navbar'

import { bookShortcut, booksList } from '@/utils/books'
import { SEARCH_PREFIXES } from '@/utils/enums'
import { getRandomHymn } from '@/utils/getRandomHymn'
import { reformatText } from '@/utils/simplifyText'

import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/search.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

interface ProcessedHymn extends Omit<Hymn, 'song'> {
  song: Hymn['song']
  matchPosition?: number
  matchType?: 'name' | 'lyrics' | 'author' | 'keywords'
  lyrics?: string[]
  dedupeKey: string
  numberPrefix: number
  hasLetterSuffix: boolean
  lyricsPlain: string[]
  author?: string
  copyright?: string
}

const matchNames = (hymn: ProcessedHymn, formattedInput: string): ProcessedHymn | null => {
  const formattedName = reformatText(hymn.name)
  if (!formattedName.includes(formattedInput)) return null

  return {
    ...hymn,
    matchPosition: formattedName.indexOf(formattedInput),
    matchType: 'name',
  }
}

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

      matchPosition: formattedVerse.indexOf(formattedInput),
      matchType: 'lyrics',
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
    })
  })

  return results
}

const matchAuthors = (hymn: ProcessedHymn, formattedInput: string): ProcessedHymn | null => {
  if (!hymn.author) return null

  const formattedAuthor = reformatText(hymn.author)
  if (!formattedAuthor.includes(formattedInput)) return null

  return {
    ...hymn,
    matchPosition: formattedAuthor.indexOf(formattedInput),
    matchType: 'author',
  }
}

const matchKeywords = (hymn: ProcessedHymn, formattedInput: string): ProcessedHymn | null => {
  if (!hymn.copyright) return null

  const formattedKeywords = reformatText(hymn.copyright)
  if (!formattedKeywords.includes(formattedInput)) return null

  return {
    ...hymn,
    matchPosition: formattedKeywords.indexOf(formattedInput),
    matchType: 'keywords',
  }
}

// Final ordering of search results when searching across all books
const compareAllBooks = (unlocked: boolean) => (a: ProcessedHymn, b: ProcessedHymn) => {
  const order = booksList(unlocked)
  const matchTypeOrder = { name: 0, author: 1, keywords: 2, lyrics: 3 }

  const aTypeOrder = matchTypeOrder[a.matchType as keyof typeof matchTypeOrder] ?? 4
  const bTypeOrder = matchTypeOrder[b.matchType as keyof typeof matchTypeOrder] ?? 4
  if (aTypeOrder !== bTypeOrder) return aTypeOrder - bTypeOrder

  const pa = a.matchPosition ?? Number.MAX_SAFE_INTEGER
  const pb = b.matchPosition ?? Number.MAX_SAFE_INTEGER
  if (pa !== pb) return pa - pb

  const na = a.numberPrefix
  const nb = b.numberPrefix
  const aHasNumber = Number.isFinite(na)
  const bHasNumber = Number.isFinite(nb)
  if (aHasNumber && bHasNumber && na !== nb) return na - nb
  if (aHasNumber !== bHasNumber) return aHasNumber ? -1 : 1

  if (aHasNumber && bHasNumber && na === nb) {
    if (a.hasLetterSuffix !== b.hasLetterSuffix) return a.hasLetterSuffix ? 1 : -1
  }

  const ia = order.indexOf(bookShortcut(a.book))
  const ib = order.indexOf(bookShortcut(b.book))
  if (ia !== ib) return ia - ib

  const nameCmp = a.name.localeCompare(b.name, undefined, { numeric: true })
  if (nameCmp !== 0) return nameCmp

  return 0
}

// Final ordering of search results when searching within a single book
const compareSingleBook = (a: ProcessedHymn, b: ProcessedHymn) => {
  const matchTypeOrder = { name: 0, author: 1, keywords: 2, lyrics: 3 }

  const aTypeOrder = matchTypeOrder[a.matchType as keyof typeof matchTypeOrder] ?? 4
  const bTypeOrder = matchTypeOrder[b.matchType as keyof typeof matchTypeOrder] ?? 4
  if (aTypeOrder !== bTypeOrder) return aTypeOrder - bTypeOrder

  const pa = a.matchPosition ?? Number.MAX_SAFE_INTEGER
  const pb = b.matchPosition ?? Number.MAX_SAFE_INTEGER
  if (pa !== pb) return pa - pb

  const na = a.numberPrefix
  const nb = b.numberPrefix
  const aHasNumber = Number.isFinite(na)
  const bHasNumber = Number.isFinite(nb)
  if (aHasNumber && bHasNumber && na !== nb) return na - nb
  if (aHasNumber !== bHasNumber) return aHasNumber ? -1 : 1

  if (aHasNumber && bHasNumber && na === nb) {
    if (a.hasLetterSuffix !== b.hasLetterSuffix) return a.hasLetterSuffix ? 1 : -1
  }

  const nameCmp = a.name.localeCompare(b.name, undefined, { numeric: true })
  if (nameCmp !== 0) return nameCmp

  return 0
}

// Extract number prefix from hymn name
const numberPrefix = (value: string) => {
  const match = value.match(/^\s*(\d+)/)
  return match ? parseInt(match[1], 10) : NaN
}

// Check if hymn name has letter suffix
const hasLetterSuffix = (value: string) => {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d+)([A-Za-z]+)/)
  return !!(match && match[2])
}

// Map raw hymn data to processed hymn data
const mapHymn = (hymn: Hymn): ProcessedHymn => {
  const lyricsPlain = Object.values(hymn.song.lyrics)
    .flat()
    .filter((verse) => verse.startsWith(' '))
    .map((verse) => verse.slice(1))

  return {
    ...hymn,
    dedupeKey: `${bookShortcut(hymn.book)}|${hymn.name}`,
    numberPrefix: numberPrefix(hymn.name),
    hasLetterSuffix: hasLetterSuffix(hymn.name),
    lyricsPlain,
    author: hymn.song.author || '',
    copyright: hymn.song.copyright || '',
  }
}

export default function SearchPage() {
  const router = useRouter()
  const book = Array.isArray(router.query.book) ? router.query.book[0] : router.query.book

  // Get local settings data on page load
  const [localSettings, setLocalSettings] = useState<typeof defaultSettings>()

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    setLocalSettings(settings)
  }, [router])

  // Main search algorithm
  const [data, setData] = useState<ProcessedHymn[]>()
  const lastSearchRef = useRef<string>('')

  const Search = useCallback(
    (
      data: ProcessedHymn[],
      input: string = '',
      prefix: (typeof SEARCH_PREFIXES)[number] = null
    ) => {
      const authorSearch = prefix === '@' || (!prefix && input.startsWith('@'))
      const keywordSearch = prefix === '#' || (!prefix && input.startsWith('#'))
      const prefixSearchMode = authorSearch || keywordSearch

      const formattedInput = reformatText(input)

      const contextSearch = localSettings?.contextSearch ?? false

      const NamesCollector: ProcessedHymn[] = []
      const LyricsCollector: ProcessedHymn[] = []
      const AuthorsCollector: ProcessedHymn[] = []
      const KeywordsCollector: ProcessedHymn[] = []

      data.forEach((hymn) => {
        if (!prefixSearchMode) {
          const nameMatch = matchNames(hymn, formattedInput)
          if (nameMatch) {
            NamesCollector.push(nameMatch)
            return
          }
        }

        if (contextSearch) {
          if (!prefixSearchMode) {
            const lyricMatches = matchLyrics(hymn, input, formattedInput)
            LyricsCollector.push(...lyricMatches)
          } else if (unlocked) {
            if (authorSearch) {
              const authorMatch = matchAuthors(hymn, formattedInput)
              if (authorMatch) AuthorsCollector.push(authorMatch)
              return
            }

            if (keywordSearch) {
              const keywordMatch = matchKeywords(hymn, formattedInput)
              if (keywordMatch) KeywordsCollector.push(keywordMatch)
              return
            }
          }
        }
      })

      const allMatches = [
        ...NamesCollector,
        ...LyricsCollector,
        ...AuthorsCollector,
        ...KeywordsCollector,
      ]

      // Deduplicate by hymn book + name
      const collectorMap = new Map<string, ProcessedHymn>()

      allMatches.forEach((hymn) => {
        if (!collectorMap.has(hymn.dedupeKey)) collectorMap.set(hymn.dedupeKey, hymn)
      })

      const result = Array.from(collectorMap.values())
      result.sort(book ? compareSingleBook : compareAllBooks(unlocked))

      setData(result)
      lastSearchRef.current = input
    },
    [localSettings, book]
  )

  // Define search function reference
  const searchRef =
    useRef<
      (data: ProcessedHymn[], input: string, prefix?: (typeof SEARCH_PREFIXES)[number]) => void
    >()

  searchRef.current = Search

  // Load dynamic data on page load
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [activePrefix, setActivePrefix] = useState<(typeof SEARCH_PREFIXES)[number]>(null)
  const [rawData, setRawData] = useState<ProcessedHymn[]>()

  useEffect(() => {
    if (!router.isReady) return

    // Handle focus searchbox localStorage flag
    const focusSearchBox = JSON.parse(localStorage.getItem('focusSearchBox') || 'false')
    if (focusSearchBox) inputRef.current?.focus()
    localStorage.removeItem('focusSearchBox')

    // Get back previous search if enabled and exists
    const quickSearch = localSettings?.quickSearch || false
    const prevSearch = JSON.parse(localStorage.getItem('prevSearch') || '{"value": ""}')

    if (quickSearch) {
      if (prevSearch?.value) setInputValue(prevSearch.value)
      if (prevSearch?.prefix) setActivePrefix(prevSearch.prefix)
    }

    // Load data from database
    const loadData = (fetchData: Hymn[]) => {
      const rawData = fetchData.map(mapHymn)
      setRawData(rawData)

      const prevSearchValue = prevSearch?.value || ''
      const prevSearchPrefix = prevSearch?.prefix || null

      searchRef.current?.(rawData, prevSearchValue, prevSearchPrefix)
    }

    // Initialize data fetch
    if (!book) {
      const fetchAllBooks = async () => {
        try {
          const responses = await Promise.all(
            booksList(unlocked).map((bookName) => axios.get(`database/${bookName}.json`))
          )

          loadData(responses.flatMap((response) => response.data))
        } catch (err) {
          console.error(err)
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
  }, [router, localSettings, book])

  // Clears search box and restores initial data view
  const [showClearBtn, setShowClearBtn] = useState(false)

  const cleanUp = useCallback(() => {
    localStorage.removeItem('prevSearch')
    setInputValue('')
    setActivePrefix(null)
    inputRef.current?.focus()
    setRenderPage(0)

    if (rawData) searchRef.current?.(rawData, '', null)
    else setData(rawData)
  }, [rawData])

  // Run search on input or raw data change
  useEffect(() => {
    console.log('input reload React.useEffect')

    setShowClearBtn(!!inputValue || activePrefix !== null)

    if (inputValue && !rawData) inputRef.current?.select() // focus input on load

    if (rawData) {
      const searchInput = activePrefix ? activePrefix + inputValue : inputValue
      if (searchInput === lastSearchRef.current) return // skip duplicate searches

      // Update search results with delay
      const timeout = setTimeout(() => {
        searchRef.current?.(rawData, searchInput, activePrefix)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [inputValue, activePrefix, rawData])

  // Handle page scrolling event
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

  // Load and paginate rendered data
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

  // Builds link to hymn detail page
  const hymnLink = (hymn: ProcessedHymn) => ({
    pathname: '/hymn',
    query: {
      book: bookShortcut(hymn.book),
      title: hymn.name,
    },
  })

  // Handle custom random hymn function
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
    // Handle result quick actions buttons
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
                value: quickSearch ? inputValue : '',
                prefix: quickSearch ? activePrefix : null,
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

          {hymn.matchType === 'author' && hymn.author ? (
            <div style={{ opacity: 0.65, margin: '6px 0' }}>
              <p>
                {unlocked ? (
                  <Highlighter
                    autoEscape={true}
                    highlightClassName={styles.highlight}
                    highlightStyle={{
                      backgroundColor: 'rgba(255, 255, 0, 0.4)',
                      color: '#ffff00',
                    }}
                    searchWords={[inputValue]}
                    textToHighlight={hymn.author}
                  />
                ) : (
                  hymn.author
                )}
              </p>
            </div>
          ) : hymn.matchType === 'keywords' && hymn.copyright ? (
            <div style={{ opacity: 0.65, margin: '6px 0' }}>
              <p>
                {unlocked ? (
                  <Highlighter
                    autoEscape={true}
                    highlightClassName={styles.highlight}
                    highlightStyle={{
                      backgroundColor: 'rgba(0, 255, 0, 0.4)',
                      color: '#00ff00',
                    }}
                    searchWords={[inputValue]}
                    textToHighlight={hymn.copyright}
                  />
                ) : (
                  hymn.copyright
                )}
              </p>
            </div>
          ) : hymn.lyrics ? (
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
          ) : null}
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

  // Prevent scrolling on active hamburger menu
  const [hamburgerMenu, showHamburgerMenu] = useState(false)

  useEffect(() => {
    if (unlocked || !hamburgerMenu) return

    const leftScroll = document.documentElement.scrollLeft
    const topScroll = document.documentElement.scrollTop

    const scrollEvent = () => window.scrollTo(leftScroll, topScroll)

    document.addEventListener('scroll', scrollEvent)
    return () => document.removeEventListener('scroll', scrollEvent)
  }, [hamburgerMenu])

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

          {activePrefix && (
            <div
              className={`${styles.prefixOverlay} ${
                activePrefix === '@'
                  ? styles.authorPrefix
                  : activePrefix === '#'
                    ? styles.keywordPrefix
                    : ''
              }`}
            >
              {activePrefix}
            </div>
          )}

          <input
            ref={inputRef}
            name='search-box'
            className={`${
              activePrefix === '@'
                ? styles.authorSearch
                : activePrefix === '#'
                  ? styles.keywordSearch
                  : ''
            }`}
            value={inputValue}
            autoComplete='off'
            placeholder={
              activePrefix === '@'
                ? `Wyszukaj autora ${data?.length ? `(${data?.length})` : ''}`
                : activePrefix === '#'
                  ? `Wyszukaj słowa kluczowe ${data?.length ? `(${data?.length})` : ''}`
                  : `Rozpocznij wyszukiwanie ${data?.length ? `(${data?.length})` : ''}`
            }
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && activePrefix && inputValue === '') {
                setActivePrefix(null)

                const fromStorage = localStorage.getItem('prevSearch')
                if (fromStorage) {
                  const json = JSON.parse(fromStorage)
                  json.prefix = null
                  localStorage.setItem('prevSearch', JSON.stringify(json))
                }
              }
            }}
            onChange={(e) => {
              console.log('input reload HTML.onChange')

              const inputValue = e.target.value

              // easter-egg
              if (unlocked && !activePrefix && inputValue === '2137') {
                localStorage.removeItem('prevSearch')
                router.push({
                  pathname: '/hymn',
                  query: {
                    book: 'C',
                    title: '7C. Pan kiedyś stanął nad brzegiem',
                  },
                })
              }

              const startsWithAuthor = inputValue.startsWith('@')
              const startsWithKeyword = inputValue.startsWith('#')

              let inputPrefix = null
              let formattedInput = inputValue

              if (unlocked && localSettings?.contextSearch) {
                if (startsWithAuthor && !activePrefix) {
                  inputPrefix = '@'
                  formattedInput = inputValue.slice(1).trim()
                } else if (startsWithKeyword && !activePrefix) {
                  inputPrefix = '#'
                  formattedInput = inputValue.slice(1).trim()
                } else {
                  formattedInput = inputValue
                }

                if (inputPrefix) setActivePrefix(inputPrefix)
              }

              setInputValue(formattedInput)
              setRenderPage(0)

              localStorage.setItem(
                'prevSearch',
                JSON.stringify({
                  book,
                  value: formattedInput,
                  prefix: activePrefix || inputPrefix,
                })
              )
            }}
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
