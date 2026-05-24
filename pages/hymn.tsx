import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

import HamburgerIcon from '@/components/hamburger-icon'
import MenuModal from '@/components/menu-modal'
import MobileNavbar from '@/components/mobile-navbar'
import HymnData from '@/components/hymn/hymn-data'

import { detectHymnKey, detectHymnUseSharps, transposeChord } from '@/utils/chords'
import { DEFAULT_SETTINGS, SHOW_MP3, SHOW_PDF } from '@/utils/constants'
import { getBookShortcut } from '@/utils/getBookShortcut'
import { getRandomHymn } from '@/utils/getRandomHymn'
import { isHymnAccessible } from '@/utils/hymnValidation'
import { getQueryParam } from '@/utils/queryParam'
import { shareButton } from '@/utils/shareButton'
import { useOnlineStatus } from '@/utils/useOnlineStatus'

import type Hymn from '@/types/hymn'
import type { HymnDetail } from '@/types/hymn'

import styles from '@/styles/pages/hymn.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

interface HymnFiles {
  pdf: {
    book: string
    id: string
  }
  mp3: {
    book: string
    id: string
  }
}

export default function HymnPage() {
  const router = useRouter()
  const isOnline = useOnlineStatus()

  const book = getQueryParam(router.query, 'book')
  const title = getQueryParam(router.query, 'title')
  const menu = getQueryParam(router.query, 'menu')

  const [hymn, setHymn] = useState<HymnDetail>()

  useEffect(() => {
    if (!(router.isReady && book && title)) return

    const abortController = new AbortController()

    axios
      .get(`/database/${book}.json`, { signal: abortController.signal })
      .then(({ data }) => {
        const hymn = data.find((elem: Hymn) => elem.name === title)

        if (!hymn) {
          router.push('/404')
          return
        }

        hymn.lyrics = Object.values(hymn.song.lyrics)

        if (hymn.song.linked_songs) {
          hymn.song.linked_songs = Object.values(hymn.song.linked_songs).map((song) => {
            const songStr = song as string
            const splitSong = songStr.split('\\')

            return {
              book: getBookShortcut(splitSong[0]),
              title: splitSong[1],
            }
          })
        }

        setHymn(hymn)
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        console.error(err)
        router.push('/404')
      })

    return () => abortController.abort()
  }, [router, book, title])

  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    try {
      const settingsString = localStorage.getItem('settings')
      const loadedSettings = settingsString ? JSON.parse(settingsString) : {}
      setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings })
    } catch (err) {
      console.error('Error parsing settings:', err)
      setSettings({ ...DEFAULT_SETTINGS })
    }
  }, [menu])

  const { fontSize, showChords, chordNotation } = settings

  const hasChords = hymn?.lyrics.some((array: string[]) => {
    return array.some((verse: string) => verse.startsWith('.'))
  })

  const [semitones, setSemitones] = useState(0)
  const [useSharps, setUseSharps] = useState(true)

  useEffect(() => {
    if (!hymn) return

    const detectedUseSharps = detectHymnUseSharps(hymn.song.lyrics)
    const sourceUseSharps = detectedUseSharps ?? true

    setSemitones(0)
    setUseSharps(sourceUseSharps)
  }, [hymn])

  const hymnKey = hymn ? (hymn.song.key ?? detectHymnKey(hymn.song.lyrics)) : null
  const displayedKey = hymnKey
    ? transposeChord(hymnKey, { semitones, useSharps, notation: chordNotation })
    : null

  const [hideControls, setHideControls] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const scrollEvent = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollDelta = currentScrollY - lastScrollY

          if (scrollDelta > 15 && !hideControls) {
            setHideControls(true)
          } else if ((scrollDelta < -10 || currentScrollY < 30) && hideControls) {
            setHideControls(false)
          }

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [hideControls])

  const [hamburgerMenu, setHamburgerMenu] = useState(false)

  useEffect(() => {
    if (!hamburgerMenu) return

    const leftScroll = document.documentElement.scrollLeft
    const topScroll = document.documentElement.scrollTop

    const scrollEvent = () => window.scrollTo(leftScroll, topScroll)

    window.addEventListener('scroll', scrollEvent)
    return () => window.removeEventListener('scroll', scrollEvent)
  }, [hamburgerMenu])

  const handleBackToSearch = useCallback(() => {
    try {
      const prevSearch = localStorage.getItem('prevSearch')
      if (prevSearch) {
        const parsed = JSON.parse(prevSearch)

        if (!parsed.scrollY) {
          localStorage.setItem('focusSearchBox', 'true')
        }

        const { book } = parsed

        if (book) {
          router.push({
            pathname: '/search',
            query: { book },
          })
        } else router.push('/search')
      } else {
        localStorage.setItem('focusSearchBox', 'true')
        router.push('/search')
      }
    } catch (err) {
      console.error('Error parsing prevSearch:', err)
      localStorage.setItem('focusSearchBox', 'true')
      router.push('/search')
    }
  }, [router])

  const handleBooksSelect = useCallback(() => {
    localStorage.removeItem('prevSearch')
    router.push(unlocked ? '/books' : '/')
  }, [router])

  const resetPrevSearch = useCallback(() => {
    try {
      const prevSearch = localStorage.getItem('prevSearch')
      if (!prevSearch) return

      const json = JSON.parse(prevSearch)
      json.value = ''
      json.prefix = null
      json.scrollY = 0
      json.renderPage = 0
      localStorage.setItem('prevSearch', JSON.stringify(json))

      const cacheKey = `searchCache_${json.book || 'all'}`
      sessionStorage.removeItem(cacheKey)
    } catch (err) {
      console.error('Error updating prevSearch:', err)
    }
  }, [])

  const handleChangeHymn = useCallback(
    (id: number) => {
      if (!hymn) return

      resetPrevSearch()

      if (id < 0) return

      const abortController = new AbortController()

      axios
        .get(`/database/${getBookShortcut(hymn.book)}.json`, { signal: abortController.signal })
        .then(({ data }) => {
          if (id >= data.length) return

          const direction = id > hymn.id ? 1 : -1
          let currentId = id
          let targetHymn = null

          while (currentId >= 0 && currentId < data.length) {
            const candidate = data.find((elem: { id: number }) => elem.id === currentId)
            if (candidate && isHymnAccessible(candidate.name)) {
              targetHymn = candidate
              break
            }
            currentId += direction
          }

          if (!targetHymn) return

          router.push({
            pathname: '/hymn',
            query: {
              book: getBookShortcut(targetHymn.book),
              title: targetHymn.name,
            },
          })
        })
        .catch((err) => {
          if (axios.isCancel(err)) return
          console.error(err)
          router.back()
        })
    },
    [router, hymn, resetPrevSearch]
  )

  const handleRandomHymn = useCallback(async () => {
    resetPrevSearch()

    const foundHymn = await getRandomHymn(book)
    if (foundHymn) {
      router.push({
        pathname: '/hymn',
        query: { book: foundHymn.book, title: foundHymn.title },
      })
    }
  }, [book, router, resetPrevSearch])

  const [presOptions, setPresOptions] = useState(false)

  const handlePresentation = useCallback(() => {
    if (!hymn) return

    const elem = document.documentElement
    if (elem.requestFullscreen) elem.requestFullscreen()

    router.push({
      pathname: '/presentation',
      query: { book: getBookShortcut(hymn.book), title: hymn.name },
    })
  }, [hymn, router])

  const handleExternalPresentation = () => {
    if (!book || !title) return

    const params = new URLSearchParams()
    params.append('book', book)
    params.append('title', title)

    window.open(`/presentation?${params.toString()}`, 'presentation', 'width=960,height=540')

    localStorage.setItem('presWindow', 'true')
  }

  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!hymn) return

    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const bookName = getBookShortcut(hymn.book)
      setIsFavorite(
        favorites.some((elem: { book: string; id: number }) => {
          return elem.book === bookName && elem.id === hymn.id
        })
      )
    } catch (err) {
      console.error('Error parsing favorites:', err)
    }
  }, [hymn, book])

  const handleToggleFavorite = useCallback(() => {
    if (!hymn) return

    try {
      const bookName = getBookShortcut(hymn.book)
      let favorites = JSON.parse(localStorage.getItem('favorites') || '[]')

      if (
        favorites.some((elem: { book: string; id: number }) => {
          return elem.book === bookName && elem.id === hymn.id
        })
      ) {
        setIsFavorite(false)
        favorites = favorites.filter((elem: { book: string; id: number }) => {
          return elem.book !== bookName || elem.id !== hymn.id
        })
      } else {
        setIsFavorite(true)
        favorites = [
          {
            book: bookName,
            id: hymn.id,
            title: hymn.name,
            timestamp: Date.now(),
          },
        ].concat(favorites)
      }

      localStorage.setItem('favorites', JSON.stringify(favorites))
    } catch (err) {
      console.error('Error handling favorites:', err)
    }
  }, [hymn])

  const [hymnFiles, setHymnFiles] = useState<HymnFiles>({} as HymnFiles)
  const [isFilesLoading, setIsFilesLoading] = useState(true)

  useEffect(() => {
    if (!hymn) return

    setIsFilesLoading(true)

    axios
      .get('/api/hymnFiles', { params: { book: hymn.book, title: hymn.song.title } })
      .then(({ data }) => setHymnFiles(data))
      .catch((err) => console.error(err))
      .finally(() => setIsFilesLoading(false))
  }, [hymn])

  const handleDocument = useCallback(
    (file?: HymnFiles['pdf']) => {
      if (!file) return
      if (!isOnline) return
      const { book, id } = file

      router.push({ pathname: '/document', query: { book, id } })
    },
    [router, isOnline]
  )

  const handlePlay = useCallback((file?: HymnFiles['mp3']) => {
    if (!file) return
    const { book, id } = file

    window.open(`/mp3/${book}/${id}.mp3`, '_blank', 'noopener,noreferrer')
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleShare = useCallback(() => {
    shareButton()
  }, [])

  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || router.query.menu || !hymn) {
        return
      }

      if (e.key === 'Escape') handleBackToSearch()

      if (e.key === '/') {
        localStorage.removeItem('prevSearch')
        localStorage.setItem('focusSearchBox', 'true')
        router.push('/search')
      }

      if (e.key === 'ArrowLeft') handleChangeHymn(hymn.id - 1)
      if (e.key === 'ArrowRight') handleChangeHymn(hymn.id + 1)

      const key = e.key.toUpperCase()

      if (key === 'B') handleBooksSelect()
      if (unlocked && key === 'R') handleRandomHymn()
      if (key === 'P') handlePresentation()
      if (key === 'F') handleToggleFavorite()
      if (key === 'D') handleDocument(hymnFiles.pdf)
      if (unlocked && key === 'M') handlePlay(hymnFiles.mp3)
      if (key === 'K') handlePrint()
      if (key === 'S') handleShare()
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [
    router,
    handleBackToSearch,
    hymn,
    handleChangeHymn,
    handleBooksSelect,
    handleRandomHymn,
    handlePresentation,
    handleToggleFavorite,
    hymnFiles,
    handleDocument,
    handlePlay,
    handlePrint,
    handleShare,
  ])

  return (
    <>
      <Head>
        <title>{hymn ? `${title} / Śpiewniki` : 'Śpiewniki'}</title>
      </Head>

      <main style={{ padding: 0 }}>
        {hymn && (
          <>
            <div className={styles.title}>
              <button onClick={handleBackToSearch}>
                <Image
                  style={{ rotate: '90deg' }}
                  className='icon'
                  alt='back'
                  src='/icons/arrow.svg'
                  width={25}
                  height={25}
                  draggable={false}
                />
              </button>

              <div className={styles.titleActions}>
                {unlocked && showChords && hasChords && displayedKey && (
                  <div className={styles.transposeTopBar}>
                    <button
                      disabled={semitones <= -5}
                      onClick={() => setSemitones((prev) => Math.max(-5, prev - 1))}
                    >
                      {'-'}
                    </button>

                    <button
                      className={`${styles.topBarKeyValueButton} ${semitones !== 0 ? styles.keyChanged : ''}`}
                      onClick={() => setSemitones(0)}
                    >
                      <span className={styles.topBarKeyValue}>{displayedKey}</span>
                    </button>

                    <button
                      disabled={semitones >= 6}
                      onClick={() => setSemitones((prev) => Math.min(6, prev + 1))}
                    >
                      {'+'}
                    </button>

                    <button onClick={() => setUseSharps((prev) => !prev)}>
                      {useSharps ? '♯' : '♭'}
                    </button>
                  </div>
                )}

                {unlocked && hymnFiles.mp3 && (
                  <button onClick={() => handlePlay(hymnFiles.mp3)}>
                    <Image
                      className='icon'
                      alt='mp3'
                      src='/icons/play.svg'
                      width={25}
                      height={25}
                      draggable={false}
                    />
                  </button>
                )}

                {hymnFiles.pdf && (
                  <button onClick={() => handleDocument(hymnFiles.pdf)} disabled={!isOnline}>
                    <Image
                      className='icon'
                      alt='pdf'
                      src='/icons/document.svg'
                      width={25}
                      height={25}
                      draggable={false}
                    />
                  </button>
                )}

                <button onClick={handleToggleFavorite}>
                  <Image
                    className='icon'
                    alt='favorite'
                    src={`/icons/star-${isFavorite ? 'filled' : 'empty'}.svg`}
                    width={25}
                    height={25}
                    draggable={false}
                  />
                </button>

                {(unlocked && (
                  <button onClick={handleShare}>
                    <Image
                      className='icon'
                      alt='share'
                      src={`/icons/share.svg`}
                      width={25}
                      height={25}
                      draggable={false}
                    />
                  </button>
                )) || <HamburgerIcon active={hamburgerMenu} setActive={setHamburgerMenu} />}
              </div>
            </div>

            {unlocked || <MenuModal active={hamburgerMenu} />}

            <div className={styles.container}>
              <div className={styles.options}>
                <button title='Powróć do wyników wyszukiwania [Esc]' onClick={handleBackToSearch}>
                  <Image
                    className='icon'
                    alt='search'
                    src='/icons/search.svg'
                    width={22}
                    height={22}
                    draggable={false}
                  />
                  <p>Powrót do wyszukiwania</p>
                </button>

                <button
                  title={
                    unlocked
                      ? 'Otwórz listę wszystkich śpiewników [B]'
                      : 'Powróć do wyboru śpiewników [B]'
                  }
                  onClick={handleBooksSelect}
                >
                  <Image
                    className='icon'
                    alt='book'
                    src='/icons/book.svg'
                    width={22}
                    height={22}
                    draggable={false}
                  />
                  <p>Wybór śpiewników</p>
                </button>
              </div>

              <div className={styles.center}>
                <div className={styles.content} style={{ fontSize }}>
                  {!hasChords && showChords && (
                    <span className={styles.noChords}>Brak akordów do wyświetlenia</span>
                  )}

                  <HymnData
                    hymn={hymn}
                    notation={chordNotation}
                    showChords={showChords}
                    semitones={semitones}
                    useSharps={useSharps}
                    displayedKey={displayedKey}
                    onTransposeDown={() => setSemitones((prev) => Math.max(-5, prev - 1))}
                    onTransposeUp={() => setSemitones((prev) => Math.min(6, prev + 1))}
                    onTransposeReset={() => setSemitones(0)}
                    onToggleSharps={() => setUseSharps((prev) => !prev)}
                  />
                </div>

                <div className={styles.controls}>
                  <button
                    title='Przejdź do poprzedniej pieśni [←]'
                    className={hideControls ? styles.hide : ''}
                    onClick={() => handleChangeHymn(hymn.id - 1)}
                  >
                    <Image
                      className={`${styles.previous} icon`}
                      alt='left'
                      src='/icons/arrow.svg'
                      width={14}
                      height={14}
                      draggable={false}
                    />
                    <p>Poprzednia</p>
                  </button>

                  {unlocked && (
                    <button
                      title='Otwórz losową pieśń z wybranego śpiewnika [R]'
                      className={styles.randomButton}
                      onClick={handleRandomHymn}
                    >
                      <p>Wylosuj pieśń</p>
                    </button>
                  )}

                  <button
                    title='Przejdź do następnej pieśni [→]'
                    className={hideControls ? styles.hide : ''}
                    onClick={() => handleChangeHymn(hymn.id + 1)}
                  >
                    <p>Następna</p>
                    <Image
                      className={`${styles.next} icon`}
                      alt='right'
                      src='/icons/arrow.svg'
                      width={14}
                      height={14}
                      draggable={false}
                    />
                  </button>
                </div>

                <div className={styles.controlsMobile}>
                  <button
                    className={hideControls ? styles.hide : ''}
                    onClick={() => handleChangeHymn(hymn.id - 1)}
                  >
                    <Image
                      className={`${styles.previous} icon`}
                      alt='left'
                      src='/icons/chevron.svg'
                      width={14}
                      height={14}
                      draggable={false}
                    />
                  </button>

                  <button
                    className={hideControls ? styles.hide : ''}
                    onClick={() => handleChangeHymn(hymn.id + 1)}
                  >
                    <Image
                      className={`${styles.next} icon`}
                      alt='right'
                      src='/icons/chevron.svg'
                      width={14}
                      height={14}
                      draggable={false}
                    />
                  </button>
                </div>
              </div>

              <div className={styles.options}>
                <div
                  className={styles.presentationButton}
                  onMouseLeave={() => setPresOptions(false)}
                >
                  <button
                    title='Włącz tryb prezentacji dla wybranej pieśni [P]'
                    className={styles.default}
                  >
                    <div className={styles.buttonText} onClick={handlePresentation}>
                      <Image
                        className='icon'
                        alt='presentation'
                        src='/icons/monitor.svg'
                        width={20}
                        height={20}
                        draggable={false}
                      />
                      <p>Pokaz slajdów</p>
                    </div>

                    <div
                      className={styles.showMore}
                      onClick={() => setPresOptions((prev) => !prev)}
                    >
                      <Image
                        className='icon'
                        alt='more'
                        src='/icons/dots.svg'
                        width={18}
                        height={18}
                        draggable={false}
                      />
                    </div>
                  </button>

                  <div className={`${styles.list} ${presOptions ? styles.active : ''}`}>
                    <button tabIndex={-1} onClick={handleExternalPresentation}>
                      <p>Otwórz w nowym oknie</p>
                    </button>
                  </div>
                </div>

                <button
                  title={
                    isFavorite
                      ? 'Usuń pieśń z listy ulubionych [F]'
                      : 'Dodaj pieśń do listy ulubionych [F]'
                  }
                  onClick={handleToggleFavorite}
                >
                  <Image
                    className='icon'
                    alt='favorite'
                    src={`/icons/${isFavorite ? 'star-filled' : 'star-empty'}.svg`}
                    width={20}
                    height={20}
                    draggable={false}
                  />
                  <p>{isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}</p>
                </button>

                {SHOW_PDF.includes(book || '') && (
                  <button
                    tabIndex={hymnFiles.pdf && isOnline ? 0 : -1}
                    title='Pokaż zapis nutowy wybranej pieśni [D]'
                    className={hymnFiles.pdf && isOnline ? '' : 'disabled'}
                    onClick={() => handleDocument(hymnFiles.pdf)}
                  >
                    <Image
                      className='icon'
                      alt='pdf'
                      src='/icons/document.svg'
                      width={20}
                      height={20}
                      draggable={false}
                    />
                    <p>
                      {isFilesLoading
                        ? 'Ładowanie...'
                        : hymnFiles.pdf
                          ? 'Pokaż nuty'
                          : 'Brak pliku PDF'}
                    </p>
                  </button>
                )}

                {unlocked && SHOW_MP3.includes(book || '') && (
                  <button
                    tabIndex={hymnFiles.mp3 && isOnline ? 0 : -1}
                    title='Odtwórz melodię wybranej pieśni [M]'
                    className={hymnFiles.mp3 && isOnline ? '' : 'disabled'}
                    onClick={() => handlePlay(hymnFiles.mp3)}
                  >
                    <Image
                      className='icon'
                      alt='mp3'
                      src='/icons/play.svg'
                      width={20}
                      height={20}
                      draggable={false}
                    />
                    <p>
                      {isFilesLoading
                        ? 'Ładowanie...'
                        : hymnFiles.mp3
                          ? 'Odtwórz melodię'
                          : 'Brak pliku MP3'}
                    </p>
                  </button>
                )}

                <button title='Wydrukuj tekst wybranej pieśni [K]' onClick={handlePrint}>
                  <Image
                    className='icon'
                    alt='print'
                    src='/icons/printer.svg'
                    width={20}
                    height={20}
                    draggable={false}
                  />
                  <p>Drukuj</p>
                </button>

                <button title='Skopiuj link do wybranej pieśni [S]' onClick={handleShare}>
                  <Image
                    className='icon'
                    alt='share'
                    src='/icons/share.svg'
                    width={20}
                    height={20}
                    draggable={false}
                  />
                  <p>Udostępnij</p>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <MobileNavbar unlocked={unlocked} />
    </>
  )
}
