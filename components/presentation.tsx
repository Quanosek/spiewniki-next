import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState, useCallback, useRef } from 'react'
import HymnTypes from '@/lib/hymnTypes'

import styles from '@/styles/components/presentation.module.scss'

export default function PresentationComponent({ hymn }: { hymn: HymnTypes }) {
  const router = useRouter()
  const ic = hymn && hymn.song.title.includes('IC')

  // slides order
  const [order, setOrder] = useState<any>([])

  useEffect(() => {
    if (!hymn) return
    let order: string[] = []

    if (hymn.song.presentation) {
      // presentation order
      order = hymn.song.presentation
        .split(' ')
        .filter((item: string) => item !== '')
    } else {
      // counter order
      order = Object.keys(hymn.song.lyrics)
    }

    setOrder(order)
  }, [hymn, ic])

  // slides navigation buttons
  const closePresentation = useCallback(() => {
    const presWindow = localStorage.getItem('presWindow')

    if (!presWindow) {
      document.exitFullscreen()
    } else {
      window.close()
    }
  }, [])

  const [slide, setSlide] = useState(0)
  const [verse, setVerse] = useState<string[]>()

  const prevSlide = useCallback(() => {
    if (slide > 0) setSlide(slide - 1)
  }, [slide])

  const nextSlide = useCallback(() => {
    if (slide <= order.length) setSlide(slide + 1)
    else {
      if (document.fullscreenElement) document.exitFullscreen()
      else closePresentation()
    }
  }, [order, slide, closePresentation])

  useEffect(() => {
    if (!(hymn || order)) return

    const verse = hymn.song.lyrics[order[slide - 1]]
    if (!verse) return

    setVerse(
      verse
        .filter((line: string) => line.startsWith(' ')) // show only text lines
        .map((line: string) => line.slice(1)) // remove first space
        .map((line: string) => line.replace(/\(.*?\)/g, '')) // remove text in brackets
        .filter((line: string) => line !== '' && line !== ' ') // remove empty lines));
    )
  }, [hymn, order, slide])

  // detect line with and modify font size
  const linesWidth = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const lines = linesWidth.current
    lines?.style.removeProperty('font-size')

    const paragraph = lines?.clientWidth
    if (!paragraph) return

    const margin = paragraph - window.innerWidth

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
  }, [ic, verse])

  // mouse auto hide/show behavior
  const [showCursor, setShowCursor] = useState(false)
  const [alwaysShowCursor, setAlwaysShowCursor] = useState(false)
  const cursorHideTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // hide mouse cursor on idle
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

    // fullscreen navigation controls
    let startPosition: number
    let endPosition: number

    const handleEvent = (event: Event) => {
      const TouchEvent = event as TouchEvent
      const KeyboardEvent = event as KeyboardEvent

      // touch controls
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

      // navigation handlers
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
      if (KeyboardEvent.key === 'L') setSlide(-1)
    }

    // events handlers
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
  }, [router, alwaysShowCursor, prevSlide, nextSlide, closePresentation])

  return (
    <div
      className={styles.component}
      style={{ cursor: showCursor ? 'default' : 'none' }}
    >
      <div
        className={`
            ${styles.content}
            ${slide === 0 && styles.first}
            ${slide > order.length && styles.last}
          `}
      >
        {/* title name */}
        {!ic && (
          <div className={styles.title}>
            <h1>{hymn.name}</h1>
            <h2>{hymn.book}</h2>
          </div>
        )}

        {/* lyrics */}
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
            verse.map((line, i) => {
              const formattedLine = line
                .replace(/\b(\w)\b\s/g, '$1\u00A0') // spaces after single letter words
                .replace(/(?<=\[:) | (?=:\])/g, '\u00A0') // spaces between brackets

              return <p key={i}>{formattedLine}</p>
            })}
        </div>

        {/* action buttons */}
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

        {/* progress bar */}
        <div className={styles.progressBar}>
          <div style={{ width: `${(100 / order.length) * slide}%` }} />
        </div>
      </div>
    </div>
  )
}
