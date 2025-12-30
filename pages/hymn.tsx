import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

import { defaultSettings } from '@/components/menu/settings'
import HamburgerIcon from '@/components/mobile-menu/hamburger-icon'
import MenuModal from '@/components/mobile-menu/menu-modal'
import MobileNavbar from '@/components/mobile-navbar'

import { bookShortcut } from '@/utils/books'
import getRandomHymn from '@/utils/getRandomHymn'
import shareButton from '@/utils/shareButton'

import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/hymn.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

type ProcessedHymnSong = Hymn['song'] & {
  linked_songs?: {
    book: string
    title: string
  }[]
}

interface ProcessedHymn extends Omit<Hymn, 'song'> {
  lyrics: string[][]
  song: ProcessedHymnSong
}

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

  const book = Array.isArray(router.query.book) ? router.query.book[0] : router.query.book
  const title = Array.isArray(router.query.title) ? router.query.title[0] : router.query.title
  const menu = Array.isArray(router.query.menu) ? router.query.menu[0] : router.query.menu

  // Define hymn
  const [hymn, setHymn] = useState<ProcessedHymn>()

  useEffect(() => {
    if (!(router.isReady && book && title)) return

    const abortController = new AbortController()

    axios
      .get(`database/${book}.json`, { signal: abortController.signal })
      .then(({ data }) => {
        const hymn = data.find((elem: Hymn) => elem.name === title)
        if (!hymn) return router.push('/404')

        hymn.lyrics = Object.values(hymn.song.lyrics)

        if (hymn.song.linked_songs) {
          hymn.song.linked_songs = Object.values(hymn.song.linked_songs).map((song) => {
            const songStr = song as string
            const splitSong = songStr.split('\\')

            return {
              book: bookShortcut(splitSong[0]),
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

  // Refresh dedicated hymn settings
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    const settingsString = localStorage.getItem('settings')
    const loadedSettings = settingsString ? JSON.parse(settingsString) : {}
    setSettings({ ...defaultSettings, ...loadedSettings })
  }, [menu])

  const { showChords, fontSize } = settings

  // Handle hiding controls on scroll in mobile view
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

    document.addEventListener('scroll', scrollEvent, { passive: true })
    return () => document.removeEventListener('scroll', scrollEvent)
  }, [hideControls])

  // Open previous search results
  const openPrevSearch = useCallback(() => {
    localStorage.setItem('focusSearchBox', 'true')

    try {
      const prevSearch = localStorage.getItem('prevSearch')
      if (prevSearch) {
        const parsed = JSON.parse(prevSearch)
        const { book } = parsed

        if (book) {
          router.push({
            pathname: '/search',
            query: { book },
          })
        } else router.push('/search')
      } else router.push('/search')
    } catch (err) {
      console.error('Error parsing prevSearch:', err)
      router.push('/search')
    }
  }, [router])

  // Change hymn to previous/next
  const changeHymn = useCallback(
    (id: number) => {
      if (!hymn) return

      try {
        const fromStorage = localStorage.getItem('prevSearch')
        if (fromStorage) {
          const json = JSON.parse(fromStorage)
          json.search = ''
          localStorage.setItem('prevSearch', JSON.stringify(json))
        }
      } catch (err) {
        console.error('Error updating prevSearch:', err)
      }

      if (id < 0) return

      const abortController = new AbortController()

      axios
        .get(`database/${bookShortcut(hymn.book)}.json`, { signal: abortController.signal })
        .then(({ data }) => {
          if (id >= data.length) return

          const hymn = data.find((elem: { id: number }) => elem.id === id)

          router.push({
            pathname: '/hymn',
            query: {
              book: bookShortcut(hymn.book),
              title: hymn.name,
            },
          })
        })
        .catch((err) => {
          if (axios.isCancel(err)) return
          console.error(err)
          router.back()
        })
    },
    [router, hymn]
  )

  // Random hymn function
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

  // Open presentation view
  const showPresentation = useCallback(() => {
    if (!hymn) return

    const elem = document.documentElement
    if (elem.requestFullscreen) elem.requestFullscreen()

    router.push({
      pathname: '/presentation',
      query: { book: bookShortcut(hymn.book), title: hymn.name },
    })
  }, [hymn, router])

  // Handle favorite hymns
  const [isFavorite, setFavorite] = useState(false)

  useEffect(() => {
    if (!hymn) return

    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavorite(
        favorites.some((elem: { book: string; id: number }) => {
          return elem.book === book && elem.id === hymn.id
        })
      )
    } catch (err) {
      console.error('Error parsing favorites:', err)
    }
  }, [hymn, book])

  const toggleFavorite = useCallback(() => {
    if (!hymn) return

    try {
      const bookName = bookShortcut(hymn.book)
      let favorites = JSON.parse(localStorage.getItem('favorites') || '[]')

      if (
        favorites.some((elem: { book: string; id: number }) => {
          return elem.book === bookName && elem.id === hymn.id
        })
      ) {
        setFavorite(false)
        favorites = favorites.filter((elem: { book: string; id: number }) => {
          return elem.book !== bookName || elem.id !== hymn.id
        })
      } else {
        setFavorite(true)
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

  // Handle additional hymn files
  const [hymnFiles, setHymnFiles] = useState<HymnFiles>({} as HymnFiles)
  const [filesLoading, setFilesLoading] = useState(true)

  useEffect(() => {
    if (!hymn) return

    setFilesLoading(true)
    fetch(`/api/hymnFiles?book=${hymn.book}&title=${hymn.song.title}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => setHymnFiles(data))
      .catch((err) => console.error(err))
      .finally(() => setFilesLoading(false))
  }, [hymn])

  const openDocument = useCallback(
    (file: HymnFiles['pdf'] | undefined) => {
      if (!file) return
      const { book, id } = file

      router.push({ pathname: '/document', query: { book, id } })
    },
    [router]
  )

  const playMusic = useCallback((file: HymnFiles['mp3'] | undefined) => {
    if (!file) return
    const { book, id } = file

    window.open(`/mp3/${book}/${id}.mp3`, '_blank', 'noopener,noreferrer')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || router.query.menu || !hymn) {
        return
      }

      if (e.key === 'Escape') openPrevSearch()
      if (e.key === '/') {
        localStorage.removeItem('prevSearch')
        localStorage.setItem('focusSearchBox', 'true')
        router.push('/search')
      }
      if (e.key === 'ArrowLeft') changeHymn(hymn.id - 1)
      if (e.key === 'ArrowRight') changeHymn(hymn.id + 1)

      const key = e.key.toUpperCase()

      if (key === 'B') router.push(unlocked ? '/books' : '/')
      if (key === 'R') randomHymn()
      if (key === 'P') showPresentation()
      if (key === 'F') toggleFavorite()
      if (key === 'D') openDocument(hymnFiles.pdf)
      if (unlocked && key === 'M') playMusic(hymnFiles.mp3)
      if (key === 'S') shareButton()
      if (key === 'K') window.print()
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [
    router,
    hymn,
    openPrevSearch,
    changeHymn,
    randomHymn,
    showPresentation,
    toggleFavorite,
    hymnFiles,
    openDocument,
    playMusic,
  ])

  const HymnData = ({
    hymn,
    showChords,
    language,
    setLanguage,
  }: {
    hymn: ProcessedHymn
    showChords: boolean
    language: number
    setLanguage: (value: number) => void
  }) => {
    const ic = hymn.song.title.includes('IC')

    const FormattedVerse = ({ array, index }: { array: string[]; index: number }) => {
      const id = Object.keys(hymn.song.lyrics)[index]

      return (
        <div id={id} className={`${styles.verse} ${id.includes('T') && styles.italic}`}>
          {ic && index === 0 && (
            <select
              className={styles.changeLanguage}
              onChange={(e) => setLanguage(parseInt(e.target.value))}
              value={language}
            >
              <option value='0'>{array[0]}</option>
              <option value='1'>{array[1]}</option>
              <option value='2'>{array[2]}</option>
              <option value='3'>{array[3]}</option>
              <option value='4'>{array[4]}</option>
            </select>
          )}

          <p>
            {array.map((verse, j) => {
              if (ic) if (index === 0 || j !== language) return null

              const isChord = verse.startsWith('.')

              if (isChord && !showChords) return null

              const line = verse
                .replace(/^[\s.]/, '')
                .replace(/\b(\w)\b\s/g, '$1\u00A0')
                .replace(/(?<=\[:) | (?=:\])/g, '\u00A0')
                .replace(/\:\]\s/g, ':]\u00A0')

              return (
                <span key={j} className={isChord ? styles.chord : ''}>
                  {line}
                  <br />
                </span>
              )
            })}
          </p>
        </div>
      )
    }

    const LinkedSong = ({ linked }: { linked: { book: string; title: string } }) => {
      const { book, title } = linked

      return (
        <Link
          href={{
            pathname: '/hymn',
            query: { book, title },
          }}
          title='Przejdź do wybranej pieśni'
        >
          <p>{linked.title}</p>
        </Link>
      )
    }

    const hymnTitle = hymn.song.title.replace(/\b(\w)\b\s/g, '$1\u00A0')

    return (
      <>
        <div className={styles.text}>
          <div className={styles.hymnTitle}>
            <p>{hymn.book}</p>
            <h1>{hymnTitle}</h1>
          </div>

          {hymn.song.author && (
            <div className={styles.credits}>
              <p className={styles.author}>{hymn.song.author}</p>
            </div>
          )}

          <hr className={styles.printLine} />

          <div className={styles.lyrics}>
            {hymn.lyrics.map((array, index) => (
              <FormattedVerse key={index} array={array} index={index} />
            ))}
          </div>

          {hymn.song.copyright && (
            <div className={styles.credits}>
              <p className={styles.copyright}>{hymn.song.copyright}</p>
            </div>
          )}
        </div>

        {unlocked && hymn.song.linked_songs && (
          <span className={styles.linked}>
            <p className={styles.name}>Powiązane pieśni:</p>

            {hymn.song.linked_songs.map((linked, index) => (
              <LinkedSong key={index} linked={linked} />
            ))}
          </span>
        )}
      </>
    )
  }

  // Detect if hymn has chords
  const hasChords = hymn?.lyrics.some((array: string[]) => {
    return array.some((verse: string) => verse.startsWith('.'))
  })

  // Show/hide presentation options
  const [presOptions, showPresOptions] = useState(false)

  // Language selection for IC songs
  const [language, setLanguage] = useState(3)

  return (
    <>
      <Head>
        <title>{hymn ? `${title} / Śpiewniki` : 'Śpiewniki'}</title>
      </Head>

      <main style={{ padding: 0 }}>
        {hymn && (
          <>
            <div
              className={`${styles.title} ${unlocked ? '' : styles.static} ${hideControls ? styles.hide : ''}`}
            >
              <button onClick={openPrevSearch}>
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

              <div>
                {unlocked && hymnFiles.mp3 && (
                  <button onClick={() => playMusic(hymnFiles.mp3)}>
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
                  <button onClick={() => openDocument(hymnFiles.pdf)}>
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

                <button onClick={toggleFavorite}>
                  <Image
                    className='icon'
                    alt='favorite'
                    src={`/icons/star-${isFavorite ? 'filled' : 'empty'}.svg`}
                    width={25}
                    height={25}
                    draggable={false}
                  />
                </button>

                {unlocked || <HamburgerIcon active={hamburgerMenu} setActive={showHamburgerMenu} />}
              </div>
            </div>

            {unlocked || <MenuModal active={hamburgerMenu} />}

            <div className={`${styles.container} ${unlocked ? '' : styles.static}`}>
              <div className={styles.options}>
                <button title='Powróć do wyników wyszukiwania [Esc]' onClick={openPrevSearch}>
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
                  onClick={() => {
                    localStorage.removeItem('prevSearch')
                    router.push(unlocked ? '/books' : '/')
                  }}
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
                <div
                  className={`${styles.content} ${unlocked ? '' : styles.static}`}
                  style={{ fontSize }}
                >
                  {showChords && !hasChords && (
                    <span className={styles.noChords}>Brak akordów do wyświetlenia</span>
                  )}

                  <HymnData
                    hymn={hymn}
                    showChords={showChords}
                    language={language}
                    setLanguage={setLanguage}
                  />
                </div>

                <div className={styles.controls}>
                  <button
                    title='Przejdź do poprzedniej pieśni [←]'
                    className={hideControls ? styles.hide : ''}
                    onClick={() => changeHymn(hymn.id - 1)}
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

                  <button
                    title='Otwórz losową pieśń z wybranego śpiewnika [R]'
                    className={styles.randomButton}
                    onClick={randomHymn}
                  >
                    <p>Wylosuj pieśń</p>
                  </button>

                  <button
                    title='Przejdź do następnej pieśni [→]'
                    className={hideControls ? styles.hide : ''}
                    onClick={() => changeHymn(hymn.id + 1)}
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

                <div className={`${styles.controlsMobile} ${unlocked ? styles.marginBottom : ''}`}>
                  <button
                    className={hideControls ? styles.hide : ''}
                    onClick={() => changeHymn(hymn.id - 1)}
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
                    onClick={() => changeHymn(hymn.id + 1)}
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
                  onMouseLeave={() => showPresOptions(false)}
                >
                  <button
                    title='Włącz tryb prezentacji dla wybranej pieśni [P]'
                    className={styles.default}
                  >
                    <div className={styles.buttonText} onClick={showPresentation}>
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
                      className={styles.moreArrow}
                      onClick={() => showPresOptions((prev) => !prev)}
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
                    <button
                      tabIndex={-1}
                      onClick={() => {
                        if (!book || !title) return
                        const params = new URLSearchParams()
                        params.append('book', book)
                        params.append('title', title)

                        window.open(
                          `/presentation?${params.toString()}`,
                          'presentation',
                          'width=960,height=540'
                        )

                        localStorage.setItem('presWindow', 'true')
                      }}
                    >
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
                  onClick={toggleFavorite}
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

                {['B', 'C', 'N', 'S'].includes(bookShortcut(hymn.book)) && (
                  <button
                    tabIndex={hymnFiles.pdf ? 0 : -1}
                    title='Otwórz zapis nutowy wybranej pieśni [D]'
                    className={hymnFiles.pdf ? '' : 'disabled'}
                    onClick={() => openDocument(hymnFiles.pdf)}
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
                      {filesLoading
                        ? 'Ładowanie...'
                        : hymnFiles.pdf
                          ? 'Otwórz PDF'
                          : 'Brak pliku PDF'}
                    </p>
                  </button>
                )}

                {unlocked && bookShortcut(hymn.book) === 'N' && (
                  <button
                    tabIndex={hymnFiles.mp3 ? 0 : -1}
                    title='Odtwórz linię melodyjną wybranej pieśni [M]'
                    className={hymnFiles.mp3 ? '' : 'disabled'}
                    onClick={() => playMusic(hymnFiles.mp3)}
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
                      {filesLoading
                        ? 'Ładowanie...'
                        : hymnFiles.mp3
                          ? 'Odtwórz melodię'
                          : 'Brak pliku MP3'}
                    </p>
                  </button>
                )}

                <button title='Wydrukuj tekst wybranej pieśni [K]' onClick={() => window.print()}>
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

                <button title='Skopiuj link do wybranej pieśni [S]' onClick={shareButton}>
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

      {unlocked && <MobileNavbar unlocked={unlocked} />}
    </>
  )
}
