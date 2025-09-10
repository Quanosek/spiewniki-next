import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import type Hymn from '@/types/hymn'
import styles from '@/styles/components/presentation.module.scss'

export default function PresentationPage() {
  const router = useRouter()
  const [hymn, setHymn] = useState<Hymn>()

  const ic = hymn && hymn.song.title.includes('IC')
  const [order, setOrder] = useState<string[]>([])
  const [slide, setSlide] = useState(ic ? 1 : 0)
  const [verse, setVerse] = useState<string[]>()
  const [showCursor, setShowCursor] = useState(false)
  const [alwaysShowCursor, setAlwaysShowCursor] = useState(false)

  const linesWidth = useRef<HTMLParagraphElement>(null)
  const cursorHideTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!router.isReady) return
    const { book, title } = router.query

    axios
      .get(`database/${book}.json`)
      .then(({ data }) => {
        const hymn = data.find((elem: { name: string }) => elem.name === title)
        setHymn(hymn)
      })
      .catch((err) => console.error(err))

    const fullscreenChangeHandler = () => {
      if (!document.fullscreenElement) return router.back()
    }

    const beforeUnloadHandler = () => localStorage.removeItem('presWindow')

    document.addEventListener('fullscreenchange', fullscreenChangeHandler)
    window.addEventListener('beforeunload', beforeUnloadHandler)

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler)
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }
  }, [router])

  useEffect(() => {
    if (!hymn) return
    let order: string[] = []

    if (hymn.song.presentation) {
      order = hymn.song.presentation
        .split(' ')
        .filter((item: string) => item !== '')
    } else {
      order = Object.keys(hymn.song.lyrics)
    }

    setOrder(order)
    setSlide(ic ? 1 : 0)
  }, [hymn, ic])

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
  }, [slide, ic])

  const nextSlide = useCallback(() => {
    const maxSlide = order.length + 1

    if (slide < maxSlide) {
      setSlide(slide + 1)
    } else {
      if (document.fullscreenElement) document.exitFullscreen()
      else closePresentation()
    }
  }, [order, slide, closePresentation])

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
        .filter((line) => line !== '' && line !== ' ')
    )
  }, [hymn, order, slide, ic])

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
      lines?.style.setProperty('font-size', '3.2vw')
    } else if (lineCount === 8) {
      lines?.style.setProperty('font-size', '3.6vw')
    } else if (lineCount === 7) {
      lines?.style.setProperty('font-size', '4.0vw')
    }
  }, [ic, verse])

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

      if (
        ['ArrowLeft', 'ArrowUp'].includes(KeyboardEvent.key) ||
        endPosition < 0
      ) {
        prevSlide()
      }
      if (
        [' ', 'ArrowRight', 'ArrowDown'].includes(KeyboardEvent.key) ||
        endPosition >= 0
      ) {
        nextSlide()
      }

      if (KeyboardEvent.key === 'Escape') closePresentation()
      if (KeyboardEvent.key === 'L') setSlide(ic ? 1 : -1)
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
  }, [router, alwaysShowCursor, prevSlide, nextSlide, closePresentation, ic])

  useEffect(() => {
    const KeyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return
      if (e.key === 'Escape') router.back()
    }

    document.addEventListener('keyup', KeyupEvent)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keyup', KeyupEvent)
      document.body.style.overflow = ''
    }
  }, [router])

  return (
    <>
      <Head>
        <title>Pokaz slajdów / Śpiewniki</title>
      </Head>

      <div className={styles.fullscreen}>
        {hymn && (
          <div
            className={styles.component}
            style={{ cursor: showCursor ? 'default' : 'none' }}
          >
            <div
              className={`
                ${styles.content}
                ${!ic && slide === 0 && styles.first}
                ${slide > order.length && styles.last}
              `}
            >
              {!ic && (
                <div className={styles.title}>
                  <h1>{hymn.name}</h1>
                  <h2>{hymn.book}</h2>
                </div>
              )}

              {ic && slide === 1 && (
                <h1 className={styles.icTitle}>{hymn.song.title}</h1>
              )}

              <div
                ref={linesWidth}
                className={`${styles.verse} ${ic && styles.international} ${
                  ic && slide === 1 && styles.grid
                }`}
              >
                {verse &&
                  verse.map((line, index) => {
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
                <button
                  title='Poprzedni slajd. Użyj klawiszy [←] [↑] lub kółka myszy w górę.'
                  onClick={prevSlide}
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
                  title='Następny slajd. Użyj spacji, klawiszy [→] [↓] lub kółka myszy w dół.'
                  onClick={nextSlide}
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

                <button
                  title='Wyjdź z pokazu slajdów [Escape]'
                  onClick={closePresentation}
                >
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

              <div className={styles.progressBar}>
                <div
                  style={{
                    width: `${(() => {
                      if ((ic && slide === 1) || (!ic && slide === 0)) return 0
                      const totalSlides = ic ? order.length : order.length
                      const currentSlide = ic ? slide - 1 : slide
                      return (100 / totalSlides) * currentSlide
                    })()}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
