import Link from 'next/link'
import { useMemo, useState } from 'react'

import { type ChordNotation, transposeChordLine } from '@/utils/chords'

import type { HymnDetail } from '@/types/hymn'

import styles from '@/styles/pages/hymn.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function HymnData({
  hymn,
  notation,
  showChords,
  semitones,
  useSharps,
  displayedKey,
  onTransposeDown,
  onTransposeUp,
  onTransposeReset,
  onToggleSharps,
}: {
  hymn: HymnDetail
  notation: ChordNotation
  showChords: boolean
  semitones: number
  useSharps: boolean
  displayedKey: string | null
  onTransposeDown: () => void
  onTransposeUp: () => void
  onTransposeReset: () => void
  onToggleSharps: () => void
}) {
  const hymnTitle = hymn.song.title.replace(/\b(\w)\b\s/g, '$1\u00A0')

  const ic = hymn.song.title.includes('IC')
  const [language, setLanguage] = useState(3) // PL by default

  const filteredLyrics = useMemo(() => {
    const result: string[][] = []

    for (const verse of hymn.lyrics) {
      const separatorIndex = verse.findIndex((line) => line.includes('———'))

      if (separatorIndex !== -1) {
        if (separatorIndex > 0) {
          const processedVerse = verse.slice(0, separatorIndex)
          result.push(processedVerse)
        }
        break
      }

      const processedVerse = verse.map((line) =>
        line
          .replace(/\(.*?\)/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      )
      result.push(processedVerse)
    }

    return result
  }, [hymn.lyrics])

  return (
    <>
      <div className={styles.text}>
        <div className={styles.hymnTitleHandler}>
          <div className={styles.hymnTitle}>
            <p>{hymn.book}</p>
            <h1>{hymnTitle}</h1>
          </div>

          {unlocked && showChords && displayedKey && (
            <div className={styles.transpose}>
              <span className={styles.transposeTitle}>Tonacja</span>

              <div className={styles.transposeControls}>
                <button
                  type='button'
                  title='Obniż tonację o pół tonu'
                  aria-label='Obniż tonację o pół tonu'
                  disabled={semitones <= -5}
                  onClick={onTransposeDown}
                >
                  {'-'}
                </button>

                <div className={styles.keyDisplay}>
                  <button
                    type='button'
                    className={`${styles.keyValueButton} ${semitones !== 0 ? styles.keyChanged : ''}`}
                    title='Przywróć oryginalną tonację'
                    aria-label='Przywróć oryginalną tonację'
                    onClick={onTransposeReset}
                    disabled={semitones === 0}
                  >
                    <span className={styles.keyValue}>{displayedKey}</span>
                  </button>
                  <button
                    type='button'
                    className={styles.keyReset}
                    title='Przywróć oryginalną tonację'
                    aria-label='Przywróć oryginalną tonację'
                    onClick={onTransposeReset}
                    disabled={semitones === 0}
                  >
                    {semitones > 0 ? `+${semitones}` : semitones}
                  </button>
                </div>

                <button
                  type='button'
                  title='Podwyższ tonację o pół tonu'
                  aria-label='Podwyższ tonację o pół tonu'
                  disabled={semitones >= 6}
                  onClick={onTransposeUp}
                >
                  {'+'}
                </button>

                <button
                  type='button'
                  title={
                    useSharps
                      ? 'Zapisuj alteracje z bemolami (♭)'
                      : 'Zapisuj alteracje z krzyżykami (♯)'
                  }
                  aria-label='Przełącz zapis krzyżyki / bemole'
                  onClick={onToggleSharps}
                >
                  {useSharps ? '♯' : '♭'}
                </button>
              </div>
            </div>
          )}
        </div>

        {hymn.song.author && (
          <div className={styles.credits}>
            <p className={styles.author}>{hymn.song.author}</p>
          </div>
        )}

        <hr className={styles.printLine} />

        <div className={styles.lyrics}>
          {(unlocked ? hymn.lyrics : filteredLyrics).map((array, index) => {
            const id = Object.keys(hymn.song.lyrics)[index]

            return (
              <div
                key={index}
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

                    let line = verse.replace(/^[\s.]/, '')

                    if (isChord) {
                      line = transposeChordLine(line, { semitones, useSharps, notation })
                    }

                    line = line
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
          })}
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

          {hymn.song.linked_songs.map((linked, index) => {
            const { book, title } = linked

            return (
              <Link
                key={index}
                href={{
                  pathname: '/hymn',
                  query: { book, title },
                }}
                title='Przejdź do wybranej pieśni'
              >
                <p>{title}</p>
              </Link>
            )
          })}
        </span>
      )}
    </>
  )
}
