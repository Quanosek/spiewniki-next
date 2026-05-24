import Image from 'next/image'
import { useEffect, useState, useCallback, ReactElement, useRef } from 'react'
import { useTheme } from 'next-themes'

import { DEFAULT_SETTINGS, THEMES } from '@/utils/constants'

import { setMenuQuery } from './_handler'

import styles from '@/styles/components/menu.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function SettingsMenu() {
  const { theme, setTheme } = useTheme()
  const defaultTheme = unlocked ? 'dark' : 'light'

  const themeScrollRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollStart, setScrollStart] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const settings = (() => {
    try {
      const raw = localStorage.getItem('settings')
      return raw ? (JSON.parse(raw) as typeof DEFAULT_SETTINGS) : null
    } catch {
      return null
    }
  })()

  const [{ fontSize, showChords, chordNotation, contextSearch, quickSearch }, setState] = useState(
    settings || DEFAULT_SETTINGS
  )

  const saveSettings = useCallback(() => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        fontSize,
        showChords,
        chordNotation,
        contextSearch,
        quickSearch,
      })
    )
  }, [fontSize, showChords, chordNotation, contextSearch, quickSearch])

  useEffect(() => {
    saveSettings()
  }, [saveSettings])

  const Themes = (names: string[]) => {
    const themes: ReactElement[] = []

    names.forEach((name) => {
      themes.push(
        <label htmlFor={name} key={name}>
          <Image
            alt='text'
            src='/icons/text.svg'
            width={50}
            height={50}
            draggable={false}
            priority
          />

          <input
            type='radio'
            id={name}
            value={name}
            name='theme'
            checked={theme === name}
            onChange={() => setTheme(name)}
          />
        </label>
      )
    })

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsScrolling(true)
      setScrollStart(e.clientX - (themeScrollRef.current?.getBoundingClientRect().left || 0))
      setScrollLeft(themeScrollRef.current?.scrollLeft || 0)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isScrolling || !themeScrollRef.current) return
      e.preventDefault()
      const x = e.clientX - (themeScrollRef.current?.getBoundingClientRect().left || 0)
      const walk = (x - scrollStart) * 1.5
      themeScrollRef.current.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
      setIsScrolling(false)
    }

    return (
      <div
        ref={themeScrollRef}
        className={styles.themeSelectionWrapper}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={styles.themeSelection}>{themes}</div>
      </div>
    )
  }

  const ToggleSwitch = ({
    title,
    description,
    name,
    state,
  }: {
    title: string
    description: string
    name: keyof typeof DEFAULT_SETTINGS
    state: boolean
  }) => (
    <div className={styles.toggle}>
      <div className={styles.text}>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <label className={styles.checkbox}>
        <input
          type='checkbox'
          name='toggle-checkbox'
          checked={state}
          onChange={() => {
            setState((prev) => ({
              ...prev,
              [name]: !prev[name],
            }))
          }}
        />

        <span />
      </label>
    </div>
  )

  const ChordsNotationSelector = () => {
    const options: { label: string; value: typeof DEFAULT_SETTINGS.chordNotation }[] = [
      { label: 'Środkowoeuropejska', value: 'centralEuropean' },
      { label: 'Tradycyjna', value: 'germanTraditional' },
      { label: 'Anglosaska', value: 'angloSaxon' },
    ]

    return (
      <div className={styles.notationSelector}>
        <p className={styles.notationLabel}>Wybrana notacja akordów:</p>

        <div className={styles.notationOptions}>
          {options.map((opt) => (
            <label key={opt.value} className={chordNotation === opt.value ? styles.active : ''}>
              <input
                type='radio'
                name='chord-notation'
                value={opt.value}
                checked={chordNotation === opt.value}
                onChange={() => setState((prev) => ({ ...prev, chordNotation: opt.value }))}
              />
              <span>
                {opt.value === 'centralEuropean' && (
                  <>
                    <b>C</b>, <b>Cism</b>, <b>H</b>, <b>B</b>
                  </>
                )}

                {opt.value === 'germanTraditional' && (
                  <>
                    <b>C</b>, <b>cis</b>, <b>H</b>, <b>h</b>
                  </>
                )}

                {opt.value === 'angloSaxon' && (
                  <>
                    <b>C</b>, <b>C♯m</b>, <b>B</b>, <b>B♭</b>
                  </>
                )}
              </span>
              <small>{opt.label}</small>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <h2>Ustawienia</h2>

      <div className={styles.content}>
        {/* THEME COLOR */}
        <div className={styles.settingsSection}>
          <h3>Motyw kolorów:</h3>
          {Themes(THEMES)}
        </div>

        {/* FONT SIZE */}
        <div className={styles.settingsSection}>
          <h3>Wielkość tekstu pieśni:</h3>

          <div className={styles.fontPreview}>
            <p style={{ fontSize }}>Przykładowy tekst.</p>
          </div>

          <div className={styles.fontSlider}>
            <div className={styles.smaller}>A</div>

            <input
              type='range'
              min='14'
              max='28'
              step='0.5'
              value={fontSize}
              onChange={(e) => {
                setState((prevState) => ({
                  ...prevState,
                  fontSize: Number(e.target.value),
                }))
              }}
            />

            <div className={styles.bigger}>A</div>
          </div>
        </div>

        {/* QUICK OPTIONS SWITCHERS */}
        <div className={`${styles.settingsSection} ${styles.toggleList}`}>
          {ToggleSwitch({
            title: 'Wyświetlanie akordów',
            description: 'Symbole akordów gitarowych bezpośrednio nad liniami tekstu pieśni',
            name: 'showChords',
            state: showChords,
          })}

          {unlocked && showChords && <ChordsNotationSelector />}

          {ToggleSwitch({
            title: 'Rozszerzone wyszukiwanie',
            description:
              'Wyszukiwanie pieśni po treści tekstu' +
              (unlocked ? ', autorze (@) i słowach kluczowych (#)' : ''),
            name: 'contextSearch',
            state: contextSearch,
          })}

          {ToggleSwitch({
            title: 'Szybkie wyszukiwanie',
            description: 'Przywrócenie ostatniego wyszukiwania po powrocie do listy',
            name: 'quickSearch',
            state: quickSearch,
          })}
        </div>
      </div>

      {/* MENU BUTTONS */}
      <div className={styles.buttons}>
        <button
          className={styles.alert}
          onClick={() => {
            if (!confirm('Czy na pewno chcesz przywrócić ustawienia domyślne?')) {
              return
            }

            setState({ ...DEFAULT_SETTINGS })
            setTheme(defaultTheme)
          }}
        >
          <p>Przywróć domyślne</p>
        </button>

        <button onClick={() => setMenuQuery(undefined)}>
          <p>Zamknij</p>
        </button>
      </div>
    </>
  )
}
