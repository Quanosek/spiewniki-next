import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'

import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/presentation.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function PresentationPage() {
  const router = useRouter()

  const [hymn, setHymn] = useState<Hymn>()

  const ic = hymn?.song.title.includes('IC')

  const [order, setOrder] = useState<string[]>([])
  const [slide, setSlide] = useState(ic ? 1 : 0)
  const [verse, setVerse] = useState<string[]>()
  const [alwaysShowCursor, setAlwaysShowCursor] = useState(false)

  const [overlay, setOverlay] = useState<'white' | 'black' | 'logo' | null>(null)
  const customView = overlay !== null

  const toggleOverlay = useCallback((mode: 'white' | 'black' | 'logo') => {
    setOverlay((prev) => (prev === mode ? null : mode))
  }, [])

  const handleInit = useCallback(async (book: string, title: string) => {
    const abortController = new AbortController()
    try {
      const { data } = await axios.get(`/database/${book}.json`, { signal: abortController.signal })

      const foundHymn = data.find((elem: { name: string }) => elem.name === title)

      setHymn(foundHymn)

      const hymnOrder =
        foundHymn?.song.presentation?.split(' ').filter(Boolean) ??
        Object.keys(foundHymn.song.lyrics)

      setOrder(hymnOrder)
      setSlide(foundHymn.song.title.includes('IC') ? 1 : 0)
    } catch (error) {
      if (!axios.isCancel(error)) console.error(error)
    }
    return () => abortController.abort()
  }, [])

  useEffect(() => {
    if (!router.isReady) return
    const book = Array.isArray(router.query.book) ? router.query.book[0] : router.query.book
    const title = Array.isArray(router.query.title) ? router.query.title[0] : router.query.title
    if (book && title) handleInit(book, title)
  }, [router.isReady, router.query.book, router.query.title, handleInit])

  useEffect(() => {
    const beforeUnloadHandler = () => localStorage.removeItem('presWindow')

    const fullscreenChangeHandler = () => {
      if (!document.fullscreenElement) router.back()
    }

    window.addEventListener('beforeunload', beforeUnloadHandler)
    document.addEventListener('fullscreenchange', fullscreenChangeHandler)

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler)
    }
  }, [router])

  const closePresentation = useCallback(() => {
    const presWindow = localStorage.getItem('presWindow')

    // Close if opened in new window
    if (presWindow) {
      window.close()
      return
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen()
      return
    }

    // Fallback: go back
    router.back()
  }, [router])

  const prevSlide = useCallback(() => {
    if (ic && slide > 1) setSlide(slide - 1)
    else if (!ic && slide > 0) setSlide(slide - 1)
  }, [ic, slide])

  const nextSlide = useCallback(() => {
    const maxSlide = order.length + 1

    if (slide < maxSlide) {
      setSlide(slide + 1)
    } else {
      closePresentation()
    }
  }, [slide, closePresentation, order.length])

  useEffect(() => {
    if (!hymn || !order.length) return

    const slideIndex = slide - 1
    const verse = hymn.song.lyrics[order[slideIndex]]
    if (!verse) return

    setVerse(
      verse
        .filter((line) => line.startsWith(' '))
        .map((line) => line.slice(1))
        .map((line) => line.replace(/\(.*?\)/g, ''))
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .map((line) => line.replace(/\s+([.,;:!?])/g, '$1'))
        .filter((line) => line !== '')
    )
  }, [hymn, order, slide])

  // Auto-resize font based on content width and line count
  const linesWidth = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const lines = linesWidth.current
    lines?.style.removeProperty('font-size')

    const paragraph = lines?.clientWidth
    if (!paragraph) return

    const margin = paragraph - window.innerWidth
    const lineCount = verse?.length || 0

    if (margin < -300) {
      lines?.style.setProperty('font-size', ic ? '5.0vw' : '4.5vw')
    }

    if (margin > -40) {
      lines?.style.setProperty('font-size', ic ? '3.8vw' : '3.5vw')
    } else if (margin > -20) {
      lines?.style.setProperty('font-size', ic ? '3.6vw' : '3.3vw')
    } else if (margin > 0) {
      lines?.style.setProperty('font-size', ic ? '3.4vw' : '3.1vw')
    } else if (margin > 20) {
      lines?.style.setProperty('font-size', ic ? '3.2vw' : '2.9vw')
    } else if (margin > 40) {
      lines?.style.setProperty('font-size', ic ? '3.0vw' : '2.7vw')
    }

    if (lineCount >= 9) {
      lines?.style.setProperty('font-size', '3.5vw')
    } else if (lineCount === 8) {
      lines?.style.setProperty('font-size', '3.8vw')
    } else if (lineCount === 7) {
      lines?.style.setProperty('font-size', '4.1vw')
    }
  }, [verse, ic])

  const [showCursor, setShowCursor] = useState(false)
  const cursorHideTimeout = useRef<NodeJS.Timeout>()
  const readyRef = useRef(false)

  // Delay cursor tracking to prevent false triggers on page load
  useEffect(() => {
    const readyTimeout = setTimeout(() => {
      readyRef.current = true
    }, 850)
    return () => clearTimeout(readyTimeout)
  }, [])

  useEffect(() => {
    const mouseMoveEvent = (event: MouseEvent) => {
      if ((event.movementX && event.movementY) === 0) return
      if (!readyRef.current) return

      setShowCursor(true)
      clearTimeout(cursorHideTimeout.current)

      if (!alwaysShowCursor) {
        cursorHideTimeout.current = setTimeout(() => {
          return setShowCursor(false)
        }, 1500)
      }
    }

    // Prevent space from activating focused buttons
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === ' ') event.preventDefault()
    }

    // Keyboard navigation
    const handleKeyup = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
        return
      }

      if (!overlay) {
        if (['ArrowLeft', 'ArrowUp'].includes(event.key)) prevSlide()
        if ([' ', 'ArrowRight', 'ArrowDown'].includes(event.key)) nextSlide()
      }

      if (event.key === 'Escape') {
        setOverlay(null)
        closePresentation()
      }
    }

    // Touch swipe navigation
    let startPosition = 0

    const handleTouchStart = (event: TouchEvent) => {
      startPosition = event.touches[0].clientX
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (overlay) return
      const endPosition = event.changedTouches[0].clientX - startPosition

      if (endPosition < -50) nextSlide()
      else if (endPosition > 50) prevSlide()
    }

    document.addEventListener('mousemove', mouseMoveEvent)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keyup', handleKeyup)
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', mouseMoveEvent)
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keyup', handleKeyup)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [overlay, prevSlide, nextSlide, alwaysShowCursor, closePresentation])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [router])

  const getProgressWidth = () => {
    if ((ic && slide === 1) || (!ic && slide === 0)) return 0
    const totalSlides = ic ? order.length - 1 : order.length
    const currentSlide = ic ? slide - 1 : slide
    return Math.min(100, (100 / totalSlides) * currentSlide)
  }

  return (
    <>
      <Head>
        <title>Tryb prezentacji / Śpiewniki</title>
      </Head>

      <div className={styles.fullscreen}>
        <div className={styles.component} style={{ cursor: showCursor ? 'default' : 'none' }}>
          <div
            className={`
                ${styles.content}
                ${!ic && slide === 0 && styles.first}
                ${slide > order.length && styles.last}
              `}
            style={{
              opacity: hymn ? 1 : 0,
              transition: 'opacity 200ms ease-in',
            }}
          >
            {ic || (
              <div className={styles.title}>
                <h1>{hymn?.name}</h1>
                <h2>{hymn?.book}</h2>

                {slide === 0 && hymn?.song.author && (
                  <div className={styles.credits}>
                    {hymn.song.author && <p>{hymn.song.author}</p>}
                    {hymn.song.author && hymn?.song.copyright && <p>{hymn.song.copyright}</p>}
                  </div>
                )}
              </div>
            )}

            {ic && slide === 1 && <h1 className={styles.icTitle}>{hymn?.song.title}</h1>}

            <div
              ref={linesWidth}
              className={`${styles.verse} ${ic && styles.international} ${
                ic && slide === 1 && styles.grid
              }`}
            >
              {verse?.map((line, index) => {
                const formattedLine = line
                  .replace(/\b(\w)\b\s/g, '$1\u00A0')
                  .replace(/(?<=\[:) | (?=:\])/g, '\u00A0')

                return <p key={index}>{formattedLine}</p>
              })}
            </div>

            <div
              className={`${styles.navigation} ${showCursor && styles.show} ${
                overlay === 'white' ? styles.navOnWhite : ''
              } ${overlay === 'black' ? styles.navOnBlack : ''}`}
              onMouseEnter={() => setAlwaysShowCursor(true)}
              onMouseLeave={() => setAlwaysShowCursor(false)}
            >
              <button title='Wyjdź z trybu pokazu slajdów [Esc]' onClick={closePresentation}>
                <Image
                  className='icon'
                  alt='exit'
                  src='/icons/close.svg'
                  width={50}
                  height={50}
                  draggable={false}
                />
              </button>

              <button
                title='Przejdź do poprzedniego slajdu [←] [↑]'
                className={customView ? styles.disabled : ''}
                onClick={() => !customView && prevSlide()}
              >
                <Image
                  className={`${styles.prev} icon`}
                  alt='previous'
                  src='/icons/arrow.svg'
                  width={50}
                  height={50}
                  draggable={false}
                />
              </button>

              <button
                title='Przejdź do następnego slajdu [Spacja] [→] [↓]'
                className={customView ? styles.disabled : ''}
                onClick={() => !customView && nextSlide()}
              >
                <Image
                  className={`${styles.next} icon`}
                  alt='next'
                  src='/icons/arrow.svg'
                  width={50}
                  height={50}
                  draggable={false}
                />
              </button>

              {unlocked && (
                <>
                  <div className={styles.separator} />

                  <button
                    title='Biały ekran'
                    className={overlay === 'white' ? styles.active : ''}
                    onClick={() => toggleOverlay('white')}
                  >
                    <span className={styles.screenIcon} style={{ backgroundColor: '#ffffff' }} />
                  </button>

                  <button
                    title='Czarny ekran'
                    className={overlay === 'black' ? styles.active : ''}
                    onClick={() => toggleOverlay('black')}
                  >
                    <span className={styles.screenIcon} style={{ backgroundColor: '#000000' }} />
                  </button>

                  <button
                    title='Logo'
                    className={overlay === 'logo' ? styles.active : ''}
                    onClick={() => toggleOverlay('logo')}
                  >
                    <Image
                      className={`${styles.logo} icon`}
                      alt='logo'
                      src='/logo/bpsw.svg'
                      width={50}
                      height={50}
                      draggable={false}
                    />
                  </button>
                </>
              )}
            </div>

            <div
              className={styles.progressBar}
              style={{
                opacity:
                  (ic && slide === 1) || (!ic && slide === 0) || slide > order.length ? 0 : 1,
              }}
            >
              <div style={{ width: `${getProgressWidth()}%` }} />
            </div>

            {overlay && (
              <div
                className={`${styles.overlay} ${
                  overlay === 'white' ? styles.overlayWhite : ''
                } ${overlay === 'black' ? styles.overlayBlack : ''} ${
                  overlay === 'logo'
                    ? slide > order.length
                      ? styles.overlayLogoDark
                      : styles.overlayLogo
                    : ''
                }`}
                onClick={() => setOverlay(null)}
              >
                {overlay === 'logo' && (
                  <Image
                    className='icon'
                    alt='logo'
                    src='/logo/bpsw.svg'
                    width={300}
                    height={300}
                    draggable={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
