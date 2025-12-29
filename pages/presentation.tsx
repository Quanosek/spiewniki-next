import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'

import type Hymn from '@/types/hymn'

import styles from '@/styles/pages/presentation.module.scss'

// const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function PresentationPage() {
  const router = useRouter()

  const [hymn, setHymn] = useState<Hymn>()
  const ic = hymn?.song.title.includes('IC')

  const [order, setOrder] = useState<string[]>([])
  const [slide, setSlide] = useState(ic ? 1 : 0)
  const [verse, setVerse] = useState<string[]>()
  const [alwaysShowCursor, setAlwaysShowCursor] = useState(false)

  const handleInit = useCallback(async (book: string, title: string) => {
    const abortController = new AbortController()
    try {
      const { data } = await axios.get(`database/${book}.json`, { signal: abortController.signal })

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

    if (!presWindow) {
      document.exitFullscreen()
    } else {
      window.close()
    }
  }, [])

  const prevSlide = useCallback(() => {
    if (ic && slide > 1) setSlide(slide - 1)
    else if (!ic && slide > 0) setSlide(slide - 1)
  }, [ic, slide])

  const nextSlide = useCallback(() => {
    const maxSlide = ic ? order.length + 1 : order.length + 1

    if (slide < maxSlide) {
      setSlide(slide + 1)
    } else {
      if (document.fullscreenElement) document.exitFullscreen()
      else closePresentation()
    }
  }, [ic, slide, closePresentation, order.length])

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

  // Adjust font size based on window width and verse length
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

  // Hide cursor visibility
  const [showCursor, setShowCursor] = useState(false)
  const cursorHideTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const mouseMoveEvent = (event: MouseEvent) => {
      if ((event.movementX && event.movementY) === 0) return

      setShowCursor(true)
      clearTimeout(cursorHideTimeout.current)

      if (!alwaysShowCursor) {
        cursorHideTimeout.current = setTimeout(() => {
          return setShowCursor(false)
        }, 1500)
      }
    }

    // Slides custom navigation
    let startPosition: number
    let endPosition: number

    const handleEvent = (event: Event) => {
      const TouchEvent = event as TouchEvent
      const KeyboardEvent = event as KeyboardEvent

      if (event.type === 'touchstart') {
        startPosition = TouchEvent.touches[0].clientX
      }
      if (event.type === 'touchend') {
        endPosition = TouchEvent.changedTouches[0].clientX - startPosition
      }

      if (
        KeyboardEvent.ctrlKey ||
        KeyboardEvent.shiftKey ||
        KeyboardEvent.altKey ||
        KeyboardEvent.metaKey
      ) {
        return
      }

      if (['ArrowLeft', 'ArrowUp'].includes(KeyboardEvent.key) || endPosition < -50) {
        prevSlide()
      }
      if ([' ', 'ArrowRight', 'ArrowDown'].includes(KeyboardEvent.key) || endPosition >= 0) {
        nextSlide()
      }

      if (KeyboardEvent.key === 'Escape') closePresentation()
    }

    const eventTypes: Array<string> = ['keyup', 'touchstart', 'touchend']

    document.addEventListener('mousemove', mouseMoveEvent)
    eventTypes.forEach((eventType) => {
      return document.addEventListener(eventType, handleEvent)
    })

    return () => {
      document.removeEventListener('mousemove', mouseMoveEvent)
      eventTypes.forEach((eventType) => {
        return document.removeEventListener(eventType, handleEvent)
      })
    }
  }, [alwaysShowCursor, nextSlide, prevSlide, closePresentation])

  // Hide default scrollbar
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [router])

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
            {!ic && (
              <div className={styles.title}>
                <h1>{hymn?.name}</h1>
                <h2>{hymn?.book}</h2>
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
              className={`${styles.navigation} ${showCursor && styles.show}`}
              onMouseEnter={() => setAlwaysShowCursor(true)}
              onMouseLeave={() => setAlwaysShowCursor(false)}
            >
              <button title='Przejdź do poprzedniego slajdu [←] [↑]' onClick={prevSlide}>
                <Image
                  className={`${styles.prev} icon`}
                  alt='previous'
                  src='/icons/arrow.svg'
                  width={50}
                  height={50}
                  draggable={false}
                />
              </button>

              <button title='Przejdź do następnego slajdu [Spacja] [→] [↓]' onClick={nextSlide}>
                <Image
                  className={`${styles.next} icon`}
                  alt='next'
                  src='/icons/arrow.svg'
                  width={50}
                  height={50}
                  draggable={false}
                />
              </button>

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
            </div>

            <div
              className={styles.progressBar}
              style={{
                opacity:
                  (ic && slide === 1) || (!ic && slide === 0) || slide > order.length ? 0 : 1,
              }}
            >
              <div
                style={{
                  width: `${(() => {
                    if ((ic && slide === 1) || (!ic && slide === 0)) return 0
                    const totalSlides = ic ? order.length - 1 : order.length
                    const currentSlide = ic ? slide - 1 : slide
                    return Math.min(100, (100 / totalSlides) * currentSlide)
                  })()}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
