import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'

import MobileNavbar from '@/components/mobile-navbar'
import { bookShortcut } from '@/utils/books'
import randomHymn from '@/utils/randomHymn'
import shareButton from '@/utils/shareButton'
import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/hymn.module.scss'

interface HymnWithLyrics extends Hymn {
  lyrics: string[][]
}

interface ProcessedHymn extends HymnWithLyrics {
  song: Hymn['song'] & {
    linked_songs?: Array<{
      book: string
      title: string
    }>
  }
}

interface HymnFiles {
  pdf?: {
    book: string
    id: string
  }
  mp3?: {
    book: string
    id: string
  }
}

interface Settings {
  showChords?: boolean
  fontSize?: number
}

const DEFAULT_SETTINGS: Required<Settings> = {
  fontSize: 21,
  showChords: false,
}

const useSettings = (reloadKey?: unknown) => {
  const [settings, setSettings] = useState<Required<Settings>>(DEFAULT_SETTINGS)

  useEffect(() => {
    let loadedSettings: Settings = {}
    try {
      const settingsString = localStorage.getItem('settings')
      loadedSettings = settingsString ? JSON.parse(settingsString) : {}
    } catch (error) {
      console.error('Error parsing settings:', error)
    }
    setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings })
  }, [reloadKey])

  return settings
}

export default function HymnPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'
  const router = useRouter()

  const book = typeof router.query.book === 'string' ? router.query.book : ''
  const title = typeof router.query.title === 'string' ? router.query.title : ''
  const menu =
    typeof router.query.menu === 'string' ? router.query.menu : undefined

  const [hymn, setHymn] = useState<ProcessedHymn>()
  const [isLoading, setLoading] = useState(true)
  const [hideControls, setHideControls] = useState(false)
  const [hymnFiles, setHymnFiles] = useState<HymnFiles>({})
  const [isFavorite, setFavorite] = useState(false)
  const [presOptions, showPresOptions] = useState(false)

  const settings = useSettings(menu)

  const includesChords = hymn
    ? hymn.lyrics.some((array: string[]) =>
        array.some((verse: string) => verse.startsWith('.'))
      )
    : false
  const noChords = Boolean(settings.showChords && hymn && !includesChords)
  const fontSize = settings.fontSize

  useEffect(() => {
    if (!router.isReady || !book || !title) return

    document.body.setAttribute('data-page', 'hymn')

    axios
      .get(`database/${book}.json`)
      .then(({ data }) => {
        const hymn = data.find((elem: Hymn) => elem.name === title)
        if (!hymn) {
          router.push('/404')
          return
        }

        hymn.lyrics = Object.values(hymn.song.lyrics)

        if (hymn.song.linked_songs) {
          hymn.song.linked_songs = Object.values(hymn.song.linked_songs).map(
            (song: unknown) => {
              const songStr = song as string
              const splitSong = songStr.split('\\')

              return {
                book: bookShortcut(splitSong[0]),
                title: splitSong[1],
              }
            }
          )
        }

        setHymn(hymn)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        router.push('/404')
      })

    if (typeof window === 'undefined') return

    let lastScrollY = window.scrollY
    let ticking = false

    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY - lastScrollY > 50) {
            setHideControls(true)
          }
          if (lastScrollY - window.scrollY > 65 || window.scrollY < 30) {
            setHideControls(false)
          }
          ticking = false
        })
        ticking = true
      }
    }

    const scrollEndHandler = () => {
      lastScrollY = window.scrollY
    }

    document.addEventListener('scroll', scrollHandler, { passive: true })
    document.addEventListener('scrollend', scrollEndHandler, { passive: true })

    return () => {
      document.removeEventListener('scroll', scrollHandler)
      document.removeEventListener('scrollend', scrollEndHandler)
      document.body.removeAttribute('data-page')
    }
  }, [router, book, title])

  useEffect(() => {
    if (!hymn) return

    fetch(`/api/hymnFiles?book=${hymn.book}&title=${hymn.song.title}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => setHymnFiles(data))
      .catch((err) => console.error(err))

    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavorite(
        favorites.some((elem: { book: string; id: number }) => {
          return elem.book === book && elem.id === hymn.id
        })
      )
    } catch (error) {
      console.error('Error parsing favorites:', error)
    }
  }, [hymn, book])

  const openPrevSearch = useCallback(() => {
    if (typeof window !== 'undefined') {
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
      } catch (error) {
        console.error('Error parsing prevSearch:', error)
        router.push('/search')
      }
    } else {
      router.push('/search')
    }
  }, [router])

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
    } catch (error) {
      console.error('Error handling favorites:', error)
    }
  }, [hymn])

  const openDocument = useCallback((file: HymnFiles['pdf'] | undefined) => {
    if (!file) return
    const { book, id } = file
    Router.push({ pathname: '/document', query: { book, id } })
  }, [])

  const playMusic = useCallback((file: HymnFiles['mp3'] | undefined) => {
    if (!file) return
    const { book, id } = file
    if (typeof window === 'undefined') return
    const url = `/mp3/${book}/${id}.mp3`
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.focus()
  }, [])

  const changeHymn = useCallback((hymn: ProcessedHymn, id: number) => {
    try {
      const fromStorage = localStorage.getItem('prevSearch')
      if (fromStorage) {
        const json = JSON.parse(fromStorage)
        json.search = ''
        localStorage.setItem('prevSearch', JSON.stringify(json))
      }
    } catch (error) {
      console.error('Error updating prevSearch:', error)
    }

    if (id < 0) {
      setLoading(false)
      return alert('To jest pierwsza pieśń w tym śpiewniku!')
    }

    axios
      .get(`database/${bookShortcut(hymn.book)}.json`)
      .then(({ data }) => {
        if (id >= data.length) {
          return alert('To jest ostatnia pieśń w tym śpiewniku!')
        }

        const hymn = data.find((elem: { id: number }) => elem.id === id)

        Router.push({
          pathname: '/hymn',
          query: {
            book: bookShortcut(hymn.book),
            title: hymn.name,
          },
        })
      })
      .catch((err) => {
        console.error(err)
        Router.back()
      })
  }, [])

  const showPresentation = useCallback(
    (hymn: ProcessedHymn) => {
      const elem = document.documentElement
      if (elem.requestFullscreen) elem.requestFullscreen()

      router.push({
        pathname: '/presentation',
        query: { book: bookShortcut(hymn.book), title: hymn.name },
      })
    },
    [router]
  )

  useEffect(() => {
    const KeyupEvent = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.metaKey ||
        router.query.menu ||
        !hymn
      ) {
        return
      }

      if (e.key === 'Escape') router.back()

      const key = e.key.toUpperCase()

      if (key === '/') {
        localStorage.removeItem('prevSearch')
        localStorage.setItem('focusSearchBox', 'true')
        router.push('/search')
      }
      if (key === 'B') router.push(unlocked ? '/books' : '/')
      if (key === 'R') {
        randomHymn(bookShortcut(hymn.book)).then((selectedHymn) => {
          if (selectedHymn) {
            router.push({
              pathname: '/hymn',
              query: {
                book: bookShortcut(selectedHymn.book),
                title: selectedHymn.name,
              },
            })
          }
        })
      }
      if (key === 'P') showPresentation(hymn)
      if (key === 'F') toggleFavorite()
      if (key === 'D') openDocument(hymnFiles.pdf)
      if (key === 'M') playMusic(hymnFiles.mp3)
      if (key === 'S') shareButton()
      if (key === 'K') window.print()
      if (key === 'ARROWLEFT') changeHymn(hymn, hymn.id - 1)
      if (key === 'ARROWRIGHT') changeHymn(hymn, hymn.id + 1)
    }

    document.addEventListener('keyup', KeyupEvent)
    return () => document.removeEventListener('keyup', KeyupEvent)
  }, [
    unlocked,
    router,
    hymn,
    hymnFiles,
    showPresentation,
    toggleFavorite,
    openDocument,
    playMusic,
    changeHymn,
  ])

  const HymnData = ({
    hymn,
    showChords,
  }: {
    hymn: ProcessedHymn
    showChords: boolean
  }) => {
    const hymnTitle = hymn.song.title.replace(/\b(\w)\b\s/g, '$1\u00A0')
    const [language, setLanguage] = useState(3)
    const ic = hymn.song.title.includes('IC')

    const FormattedVerse = ({
      array,
      index,
    }: {
      array: string[]
      index: number
    }) => {
      const id = Object.keys(hymn.song.lyrics)[index]

      return (
        <div
          id={id}
          className={`${styles.verse} ${id.includes('T') && styles.italic}`}
        >
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

    const LinkedSong = ({
      linked,
    }: {
      linked: { book: string; title: string }
    }) => {
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

    return (
      <>
        <div className={styles.text}>
          <div className={styles.hymnTitle}>
            <p>{hymn.book}</p>
            <h1>{hymnTitle}</h1>
          </div>

          <hr className={styles.printLine} />

          <div className={styles.lyrics}>
            {hymn.lyrics.map((array, index) => (
              <FormattedVerse key={index} array={array} index={index} />
            ))}
          </div>

          {(hymn.song.copyright || hymn.song.author) && (
            <div className={styles.credits}>
              {hymn.song.copyright && <p>{hymn.song.copyright}</p>}
              {hymn.song.author && <p>{hymn.song.author}</p>}
            </div>
          )}
        </div>

        {hymn.song.linked_songs && (
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

  return (
    <>
      <Head>
        <title>{hymn ? `${title} / Śpiewniki` : 'Śpiewniki'}</title>
      </Head>

      <main style={{ padding: 0 }}>
        {!isLoading && (
          <>
            <div
              className={`${styles.title} ${hideControls ? styles.hide : ''}`}
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
              </div>
            </div>

            <div className={styles.container}>
              <div className={`${styles.options} ${styles.leftSide}`}>
                <button onClick={openPrevSearch}>
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
                      : 'Przejdź do okna wyboru śpiewników.'
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
                <div className={styles.content} style={{ fontSize }}>
                  {noChords && (
                    <span className={styles.noChords}>
                      Brak akordów do wyświetlenia
                    </span>
                  )}

                  {hymn && (
                    <HymnData hymn={hymn} showChords={settings.showChords} />
                  )}
                </div>

                {hymn && (
                  <div className={styles.controls}>
                    <button
                      title='Przejdź do poprzedniej pieśni [←]'
                      className={hideControls ? styles.hide : ''}
                      onClick={() => changeHymn(hymn, hymn.id - 1)}
                    >
                      <Image
                        className={`${styles.previous} icon`}
                        alt='left'
                        src='/icons/arrow.svg'
                        width={12}
                        height={12}
                        draggable={false}
                      />
                      <p>Poprzednia</p>
                    </button>

                    <button
                      title='Otwórz losową pieśń z wybranego śpiewnika [R]'
                      className={styles.randomButton}
                      onClick={async () => {
                        const selectedHymn = await randomHymn(
                          bookShortcut(hymn.book)
                        )
                        if (selectedHymn) {
                          router.push({
                            pathname: '/hymn',
                            query: {
                              book: bookShortcut(selectedHymn.book),
                              title: selectedHymn.name,
                            },
                          })
                        }
                      }}
                    >
                      <p>Wylosuj pieśń</p>
                    </button>

                    <button
                      title='Przejdź do następnej pieśni [→]'
                      className={hideControls ? styles.hide : ''}
                      onClick={() => changeHymn(hymn, hymn.id + 1)}
                    >
                      <p>Następna</p>
                      <Image
                        className={`${styles.next} icon`}
                        alt='right'
                        src='/icons/arrow.svg'
                        width={12}
                        height={12}
                        draggable={false}
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.options}>
                <div
                  className={styles.presentationButton}
                  onMouseLeave={() => showPresOptions(false)}
                >
                  <button
                    title='Włącz prezentację wybranej pieśni na pełnym ekranie [P]'
                    className={styles.default}
                  >
                    <div
                      className={styles.buttonText}
                      onClick={() => hymn && showPresentation(hymn)}
                    >
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
                        style={{ rotate: presOptions ? '180deg' : '0deg' }}
                        className='icon'
                        alt='more'
                        src='/icons/arrow.svg'
                        width={18}
                        height={18}
                        draggable={false}
                      />
                    </div>
                  </button>

                  <div
                    className={`${styles.list} ${
                      presOptions ? styles.active : ''
                    }`}
                  >
                    <button
                      tabIndex={-1}
                      onClick={() => {
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
                    src={`/icons/${
                      isFavorite ? 'star-filled' : 'star-empty'
                    }.svg`}
                    width={20}
                    height={20}
                    draggable={false}
                  />
                  <p>
                    {isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                  </p>
                </button>

                {hymn &&
                  ['B', 'C', 'N', 'S'].includes(bookShortcut(hymn.book)) && (
                    <button
                      tabIndex={hymnFiles.pdf ? 0 : -1}
                      title='Otwórz dokument PDF wybranej pieśni [D]'
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
                        {Object.keys(hymnFiles).length > 0
                          ? 'Otwórz PDF'
                          : 'Ładowanie...'}
                      </p>
                    </button>
                  )}

                {unlocked && hymn && bookShortcut(hymn.book) === 'N' && (
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
                      {Object.keys(hymnFiles).length > 0
                        ? 'Odtwórz melodię'
                        : 'Ładowanie...'}
                    </p>
                  </button>
                )}

                <button
                  title='Skopiuj link do wybranej pieśni [S]'
                  onClick={shareButton}
                >
                  <Image
                    className='icon'
                    alt='share'
                    src='/icons/link.svg'
                    width={20}
                    height={20}
                    draggable={false}
                  />
                  <p>Udostępnij</p>
                </button>

                <button
                  title='Wydrukuj tekst wybranej pieśni [K]'
                  onClick={() => !isLoading && window.print()}
                >
                  <Image
                    className='icon'
                    alt='print'
                    src='/icons/printer.svg'
                    width={20}
                    height={20}
                    draggable={false}
                  />
                  <p>Wydrukuj</p>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <MobileNavbar />
    </>
  )
}
