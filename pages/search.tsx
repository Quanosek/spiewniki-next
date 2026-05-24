import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import axios from 'axios'

import HamburgerIcon from '@/components/hamburger-icon'
import MenuModal from '@/components/menu-modal'
import MobileNavbar from '@/components/mobile-navbar'
import BackToTopButton from '@/components/search/back-to-top-button'
import SearchResult from '@/components/search/search-result'
import SearchBox from '@/components/search/search-box'

import { DEFAULT_SETTINGS, HYMNBOOKS, SEARCH_PREFIXES } from '@/utils/constants'
import { getBookShortcut } from '@/utils/getBookShortcut'
import { getRandomHymn } from '@/utils/getRandomHymn'
import { isHymnAccessible } from '@/utils/hymnValidation'
import { getQueryParam } from '@/utils/queryParam'
import { normalizeText } from '@/utils/simplifyText'

import Hymn, { ProcessedHymn } from '@/types/hymn'

import styles from '@/styles/pages/search.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

const matchNames = (hymn: ProcessedHymn, formattedInput: string): ProcessedHymn | null => {
  const formattedName = normalizeText(hymn.name)
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
    const formattedVerse = normalizeText(verse)
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

  const formattedAuthor = normalizeText(hymn.author)
  if (!formattedAuthor.includes(formattedInput)) return null

  return {
    ...hymn,
    matchPosition: formattedAuthor.indexOf(formattedInput),
    matchType: 'author',
  }
}

const matchKeywords = (hymn: ProcessedHymn, formattedInput: string): ProcessedHymn | null => {
  if (!hymn.copyright) return null

  const formattedKeywords = normalizeText(hymn.copyright)
  if (!formattedKeywords.includes(formattedInput)) return null

  return {
    ...hymn,
    matchPosition: formattedKeywords.indexOf(formattedInput),
    matchType: 'keywords',
  }
}

const MATCH_TYPE_ORDER = { name: 0, author: 1, keywords: 2, lyrics: 3 } as const

// Sort results, optionally including cross-book ordering when not scoped to a single book
const compareHymns = (includeBookOrder: boolean) => (a: ProcessedHymn, b: ProcessedHymn) => {
  const aTypeOrder = MATCH_TYPE_ORDER[a.matchType as keyof typeof MATCH_TYPE_ORDER] ?? 4
  const bTypeOrder = MATCH_TYPE_ORDER[b.matchType as keyof typeof MATCH_TYPE_ORDER] ?? 4
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

  if (includeBookOrder) {
    const ia = HYMNBOOKS.indexOf(getBookShortcut(a.book))
    const ib = HYMNBOOKS.indexOf(getBookShortcut(b.book))
    if (ia !== ib) return ia - ib
  }

  const nameCmp = a.name.localeCompare(b.name, undefined, { numeric: true })
  if (nameCmp !== 0) return nameCmp

  return 0
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

// Map raw hymn to searchable format
const mapHymn = (hymn: Hymn): ProcessedHymn => {
  let lyricsPlain: string[]

  if (unlocked) {
    const entries = Object.entries(hymn.song.lyrics) as [string, string[]][]

    const filteredVerses = entries.filter(([key]) => !key.includes('T')).map(([, verse]) => verse)

    lyricsPlain = filteredVerses
      .flat()
      .filter((verse) => verse.startsWith(' '))
      .map((verse) => verse.slice(1))
  } else {
    const entries = Object.entries(hymn.song.lyrics) as [string, string[]][]
    const filteredLines: string[] = []

    for (const [key, verse] of entries) {
      if (key.includes('T')) continue

      const separatorIndex = verse.findIndex((line) => line.includes('———'))

      // Stop at separator
      if (separatorIndex !== -1) {
        if (separatorIndex > 0) {
          verse.slice(0, separatorIndex).forEach((line) => {
            if (line.startsWith(' ')) {
              const processed = line
                .slice(1)
                .replace(/\(.*?\)/g, '')
                .replace(/\s+/g, ' ')
                .trim()
              if (processed) filteredLines.push(processed)
            }
          })
        }
        break
      }

      verse.forEach((line) => {
        if (line.startsWith(' ')) {
          const processed = line
            .slice(1)
            .replace(/\(.*?\)/g, '')
            .replace(/\s+/g, ' ')
            .trim()
          if (processed) filteredLines.push(processed)
        }
      })
    }

    lyricsPlain = filteredLines
  }

  return {
    ...hymn,
    dedupeKey: `${getBookShortcut(hymn.book)}|${hymn.name}`,
    numberPrefix: numberPrefix(hymn.name),
    hasLetterSuffix: hasLetterSuffix(hymn.name),
    lyricsPlain,
    author: hymn.song.author || '',
    copyright: hymn.song.copyright || '',
  }
}

export default function SearchPage() {
  const router = useRouter()
  const book = getQueryParam(router.query, 'book')

  const [localSettings, setLocalSettings] = useState<typeof DEFAULT_SETTINGS>()

  useEffect(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}')
      setLocalSettings(settings)
    } catch {
      setLocalSettings(DEFAULT_SETTINGS)
    }
  }, [router])

  const [data, setData] = useState<ProcessedHymn[]>()
  const [searchDuration, setSearchDuration] = useState(0)
  const lastSearchRef = useRef<string>('')

  const runSearch = useCallback(
    (
      data: ProcessedHymn[],
      input: string = '',
      prefix: (typeof SEARCH_PREFIXES)[number] = null
    ) => {
      const startTime = performance.now()

      const authorSearch = prefix === '@' || (!prefix && input.startsWith('@'))
      const keywordSearch = prefix === '#' || (!prefix && input.startsWith('#'))
      const prefixSearchMode = authorSearch || keywordSearch

      const formattedInput = normalizeText(input)

      const contextSearch = localSettings?.contextSearch ?? false

      const nameMatches: ProcessedHymn[] = []
      const lyricsMatches: ProcessedHymn[] = []
      const authorMatches: ProcessedHymn[] = []
      const keywordMatches: ProcessedHymn[] = []

      data.forEach((hymn) => {
        if (!prefixSearchMode) {
          const nameMatch = matchNames(hymn, formattedInput)
          if (nameMatch) {
            nameMatches.push(nameMatch)
            return
          }
        }

        if (contextSearch) {
          if (!prefixSearchMode) {
            const matches = matchLyrics(hymn, input, formattedInput)
            lyricsMatches.push(...matches)
          } else if (unlocked) {
            if (authorSearch) {
              const match = matchAuthors(hymn, formattedInput)
              if (match) authorMatches.push(match)
              return
            }

            if (keywordSearch) {
              const match = matchKeywords(hymn, formattedInput)
              if (match) keywordMatches.push(match)
              return
            }
          }
        }
      })

      const allMatches = [...nameMatches, ...lyricsMatches, ...authorMatches, ...keywordMatches]

      // Deduplicate results
      const dedupedMatches = new Map<string, ProcessedHymn>()

      allMatches.forEach((hymn) => {
        if (!dedupedMatches.has(hymn.dedupeKey)) dedupedMatches.set(hymn.dedupeKey, hymn)
      })

      const result = Array.from(dedupedMatches.values())
      result.sort(compareHymns(!book))

      setData(result)
      lastSearchRef.current = input

      // Cache for instant restore
      try {
        const cacheKey = `searchCache_${book || 'all'}`
        sessionStorage.setItem(cacheKey, JSON.stringify(result))
      } catch {
        // Ignore
      }

      const durationMs = performance.now() - startTime
      setSearchDuration(durationMs)
    },
    [localSettings, book]
  )

  const searchRef =
    useRef<
      (data: ProcessedHymn[], input: string, prefix?: (typeof SEARCH_PREFIXES)[number]) => void
    >()

  searchRef.current = runSearch

  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [activePrefix, setActivePrefix] = useState<(typeof SEARCH_PREFIXES)[number]>(null)
  const [rawData, setRawData] = useState<ProcessedHymn[]>()
  const scrollRestoredRef = useRef(false)

  // Restore cached results before first paint
  useLayoutEffect(() => {
    if (scrollRestoredRef.current) return
    try {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}')
      if (!settings.quickSearch) return

      const prevSearch = JSON.parse(localStorage.getItem('prevSearch') || '{}')
      const hasSavedSearch =
        typeof prevSearch?.value === 'string' ||
        prevSearch?.prefix === '@' ||
        prevSearch?.prefix === '#'
      if (!hasSavedSearch) return

      // Skip restore on book change
      const urlBook = new URLSearchParams(window.location.search).get('book') || undefined
      if ((prevSearch?.book || undefined) !== urlBook) return

      const cacheKey = `searchCache_${prevSearch?.book || 'all'}`
      const cached = sessionStorage.getItem(cacheKey)
      if (!cached) return

      const cachedData = JSON.parse(cached) as ProcessedHymn[]
      const pages = prevSearch?.renderPage || 0

      setData(cachedData)
      setRenderData(cachedData.slice(0, (pages + 1) * 30))
      setRenderPage(pages)
      setIsLoading(false)
      if (prevSearch?.value) setInputValue(prevSearch.value)
      if (prevSearch?.prefix) setActivePrefix(prevSearch.prefix)

      // Mark search ref so "input change" effect won't re-trigger search
      lastSearchRef.current = prevSearch?.prefix
        ? prevSearch.prefix + prevSearch.value
        : prevSearch?.value || ''

      scrollRestoredRef.current = true

      if (prevSearch?.scrollY) {
        requestAnimationFrame(() => window.scrollTo(0, prevSearch.scrollY))
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    if (!router.isReady) return

    let focusSearchBox = false
    try {
      focusSearchBox = JSON.parse(localStorage.getItem('focusSearchBox') || 'false')
    } catch {
      // Ignore
    }
    if (focusSearchBox) inputRef.current?.focus()
    localStorage.removeItem('focusSearchBox')

    // Restore previous search if quick search enabled
    const quickSearch = localSettings?.quickSearch || false
    let prevSearch: { value?: string; prefix?: '@' | '#' | null; renderPage?: number } = {
      value: '',
    }
    try {
      prevSearch = JSON.parse(localStorage.getItem('prevSearch') || '{"value": ""}')
    } catch {
      prevSearch = { value: '' }
    }

    if (quickSearch && !scrollRestoredRef.current) {
      if (prevSearch?.value) setInputValue(prevSearch.value)
      if (prevSearch?.prefix) setActivePrefix(prevSearch.prefix)
      if (prevSearch?.renderPage) setRenderPage(prevSearch.renderPage)
    }

    const loadData = (fetchData: Hymn[]) => {
      const filteredData = fetchData.filter((hymn) => isHymnAccessible(hymn.name))

      const rawData = filteredData.map(mapHymn)
      setRawData(rawData)

      // Skip if cache already restored
      if (scrollRestoredRef.current) return

      const prevSearchValue = prevSearch?.value || ''
      const prevSearchPrefix = prevSearch?.prefix || null

      searchRef.current?.(rawData, prevSearchValue, prevSearchPrefix)
    }

    if (!book) {
      const fetchAllBooks = async () => {
        try {
          const responses = await Promise.all(
            HYMNBOOKS.map((bookName) => axios.get(`/database/${bookName}.json`))
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
        .get(`/database/${book}.json`)
        .then(({ data }) => loadData(data))
        .catch((err) => {
          console.error(err)
          router.push('/404')
        })
    }
  }, [router, localSettings, book])

  // Re-run search after the input settles, but skip if we already have the same query.
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (inputValue && !rawData && !isMobile) inputRef.current?.select() // focus input on load

    if (rawData) {
      const searchInput = activePrefix ? activePrefix + inputValue : inputValue
      if (searchInput === lastSearchRef.current) return // skip duplicate searches

      // Debounce search
      const timeout = setTimeout(() => {
        searchRef.current?.(rawData, searchInput, activePrefix)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [inputValue, activePrefix, rawData])

  const [renderData, setRenderData] = useState<ProcessedHymn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [renderPage, setRenderPage] = useState(0)

  useEffect(() => {
    if (!data) return

    const results = []
    for (let i = 0; i < data.length; i += 30) {
      results.push(data.slice(i, i + 30))
    }

    const array = results.slice(0, renderPage + 1).flat()
    setRenderData(array)

    setIsLoading(false)
  }, [data, renderPage])

  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const scrollEvent = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setRenderPage((page) => page + 1)
      }

      setShowBackToTop(window.scrollY > 350)
    }

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [])

  const [hamburgerMenu, setHamburgerMenu] = useState(false)

  useEffect(() => {
    if (!hamburgerMenu) return

    const leftScroll = document.documentElement.scrollLeft
    const topScroll = document.documentElement.scrollTop

    const scrollEvent = () => window.scrollTo(leftScroll, topScroll)

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [hamburgerMenu])

  const handleClear = useCallback(() => {
    localStorage.removeItem('prevSearch')
    setInputValue('')
    setActivePrefix(null)
    inputRef.current?.focus()
    setRenderPage(0)

    if (rawData) searchRef.current?.(rawData, '', null)
    else setData(rawData)
  }, [rawData])

  // Random hymn handler
  const handleRandomHymn = useCallback(async () => {
    const foundHymn = await getRandomHymn(book)

    if (foundHymn) {
      router.push({
        pathname: '/hymn',
        query: { book: foundHymn.book, title: foundHymn.title },
      })
    }
  }, [book, router])

  const currentBook = typeof router.query.book === 'string' ? router.query.book : undefined

  const saveSearchState = useCallback(() => {
    localStorage.setItem(
      'prevSearch',
      JSON.stringify({
        book: currentBook,
        value: localSettings?.quickSearch ? inputValue : '',
        prefix: localSettings?.quickSearch ? activePrefix : null,
        scrollY: localSettings?.quickSearch ? window.scrollY : 0,
        renderPage: localSettings?.quickSearch ? renderPage : 0,
      })
    )
  }, [activePrefix, currentBook, inputValue, localSettings, renderPage])

  // Handle favorite state for return hymns
  const [favoritesState, setFavoritesState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!data) return

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const states = Object.fromEntries(
      data.map((hymn) => [
        hymn.dedupeKey,
        favorites.some(
          (elem: { book: string; id: number }) =>
            elem.book === getBookShortcut(hymn.book) && elem.id === hymn.id
        ),
      ])
    )

    setFavoritesState(states)
  }, [data])

  // Handle page keyboard shortcuts
  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || router.query.menu) {
        return
      }

      if (document.activeElement === inputRef.current) {
        if (e.key === 'Escape') inputRef.current?.blur()
        if (e.key === 'Enter') {
          const hymn = data && data[0]
          if (hymn && inputValue) {
            router.push({
              pathname: '/hymn',
              query: { book: getBookShortcut(hymn.book), title: hymn.name },
            })
          } else {
            handleClear()
          }
        }
      } else {
        if (e.key === 'Escape') router.push('/')
        if (e.key === '/') inputRef.current?.focus()

        const key = e.key.toUpperCase()

        if (key === 'B') router.push(unlocked ? '/books' : '/')
        if (key === 'R') handleRandomHymn()
      }
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [router, data, inputValue, handleClear, handleRandomHymn])

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

          {isLoading || <h1>{getBookShortcut(book || 'all')}</h1>}

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
            <HamburgerIcon active={hamburgerMenu} setActive={setHamburgerMenu} />
          )}
        </div>

        {unlocked || <MenuModal active={hamburgerMenu} />}

        <SearchBox
          inputRef={inputRef}
          setInputValue={setInputValue}
          inputValue={inputValue}
          setActivePrefix={setActivePrefix}
          activePrefix={activePrefix}
          localSettings={localSettings}
          resultCount={data?.length}
          setRenderPage={setRenderPage}
          handleClear={handleClear}
          handleRandomHymn={handleRandomHymn}
        />

        {unlocked && inputValue && !isLoading && (
          <h2 className={styles.resultCount}>
            Znaleziono {data?.length} wyników ({(searchDuration / 1000).toFixed(3)}s)
          </h2>
        )}

        <div className={styles.results}>
          {isLoading ||
            (!renderData.length ? (
              <p className={styles.noResults}>Brak wyników wyszukiwania</p>
            ) : (
              renderData.map((hymn, index, row) => {
                const isFavorite = favoritesState[hymn.dedupeKey] || false

                return (
                  <div key={`${hymn.book}-${hymn.id}`}>
                    <SearchResult
                      inputValue={inputValue}
                      hymn={hymn}
                      saveSearchState={saveSearchState}
                      isFavorite={isFavorite}
                      setFavoritesState={setFavoritesState}
                    />

                    {index + 1 !== row.length && <hr />}
                  </div>
                )
              })
            ))}
        </div>

        <BackToTopButton visible={showBackToTop} />
      </main>

      <MobileNavbar unlocked={unlocked} />
    </>
  )
}
