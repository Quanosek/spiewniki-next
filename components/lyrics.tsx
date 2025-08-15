import { useState } from 'react'
import HymnTypes from '@/lib/hymnTypes'

import styles from '@/styles/pages/hymn.module.scss'

export default function LyricsComponent({ hymn }: { hymn: HymnTypes }) {
  const [language, setLanguage] = useState(3)
  const ic = hymn.song.title.includes('IC')

  if (!hymn.lyrics) return null

  return hymn.lyrics.map((array, i) => {
    const id = Object.keys(hymn.song.lyrics)[i]

    return (
      <div
        key={i}
        id={id}
        className={`${styles.verse} ${id.includes('T') && styles.italic}`}
      >
        {ic && i === 0 && (
          <select
            key={i}
            defaultValue={'3'}
            className={styles.changeLanguage}
            onChange={(e) => setLanguage(parseInt(e.target.value))}
          >
            <option value='0'>{array[0] /*US*/}</option>
            <option value='1'>{array[1] /*FR*/}</option>
            <option value='2'>{array[2] /*DE*/}</option>
            <option value='3'>{array[3] /*PL*/}</option>
            <option value='4'>{array[4] /*RO*/}</option>
          </select>
        )}

        {array.map((verse, j) => {
          if (ic) if (i === 0 || j !== language) return null

          const isChord = verse.startsWith('.')
          const { showChords } = JSON.parse(
            localStorage.getItem('settings') as string
          )

          // skip chords line if user don't want to see them
          if (isChord && !showChords) return

          const line = verse
            .replace(/^[\s.]/, '') // first space
            .replace(/\b(\w)\b\s/g, '$1\u00A0') // spaces after single letter words
            .replace(/(?<=\[:) | (?=:\])/g, '\u00A0') // spaces between repeat brackets
            .replace(/\:\]\s/g, ':]\u00A0') // space between ":]"" and "x"

          // lyrics single verse line
          return (
            <p key={j} className={isChord ? styles.chord : ''}>
              {line}
            </p>
          )
        })}
      </div>
    )
  })
}
