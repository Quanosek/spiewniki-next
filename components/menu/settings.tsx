import Image from 'next/image'
import { useEffect, useState, useCallback, ReactElement } from 'react'
import { useTheme } from 'next-themes'

import { hiddenMenuQuery } from '../menu'

import styles from '@/styles/components/menu.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

interface Settings {
  fontSize: number
  showChords: boolean
  contextSearch: boolean
  quickSearch: boolean
}

export const defaultSettings = {
  fontSize: 21,
  showChords: false,
  contextSearch: true,
  quickSearch: true,
}

export default function SettingsMenu() {
  const { theme, setTheme } = useTheme()
  const defaultTheme = unlocked ? 'black' : 'white'

  const settings: Settings = JSON.parse(
    localStorage.getItem('settings') as string
  )

  // Dynamic states
  const [{ fontSize, showChords, contextSearch, quickSearch }, setState] =
    useState(settings || defaultSettings)

  // Save settings to local storage
  const saveSettings = useCallback(() => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        fontSize,
        showChords,
        contextSearch,
        quickSearch,
      })
    )
  }, [fontSize, showChords, contextSearch, quickSearch])

  // Save settings on change
  useEffect(() => {
    saveSettings()
  }, [saveSettings])

  // Theme colors labels
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

    return <form className={styles.themeSelection}>{themes}</form>
  }

  // Quick settings options buttons
  const ToggleSwitch = ({
    title,
    description,
    name,
    state,
  }: {
    title: string
    description: string
    name: keyof Settings
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

  return (
    <>
      <h2>Ustawienia</h2>

      <div className={styles.content}>
        {/* THEME COLOR */}
        <div className={styles.settingsSection}>
          <h3>Motyw kolorów:</h3>

          {unlocked
            ? Themes(['black', 'gray', 'white', 'reading'])
            : Themes(['white', 'reading', 'gray', 'black'])}
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
            description:
              'Symbole akordów gitarowych bezpośrednio nad liniami tekstu pieśni',
            name: 'showChords',
            state: showChords,
          })}

          {ToggleSwitch({
            title: 'Rozszerzone wyszukiwanie',
            description: 'Wyszukiwanie pieśni po treści tekstu',
            // description: "Wyszukiwanie pieśni po treści tekstu, autorze (@) i słowach kluczowych (#)",
            name: 'contextSearch',
            state: contextSearch,
          })}

          {ToggleSwitch({
            title: 'Szybkie wyszukiwanie',
            description:
              'Przywrócenie ostatniego wyszukiwania po powrocie do listy',
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
            if (
              !confirm('Czy na pewno chcesz przywrócić ustawienia domyślne?')
            ) {
              return
            }

            setState({ ...defaultSettings })
            setTheme(defaultTheme)
          }}
        >
          <p>Przywróć domyślne</p>
        </button>

        <button onClick={() => hiddenMenuQuery(undefined)}>
          <p>Zamknij</p>
        </button>
      </div>
    </>
  )
}
