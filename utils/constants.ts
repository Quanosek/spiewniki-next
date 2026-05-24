import type { ChordNotation } from './chords'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

const DEFAULT_SETTINGS: {
  fontSize: number
  showChords: boolean
  chordNotation: ChordNotation
  contextSearch: boolean
  quickSearch: boolean
} = {
  fontSize: 21,
  showChords: false,
  chordNotation: 'centralEuropean',
  contextSearch: true,
  quickSearch: unlocked,
}

const EXCLUDED_HYMNS = ['359a.', '389a.', '392a.', '394a.', '397a.', '418a.', '425a.', '484a.']

const HYMNBOOKS = unlocked ? ['B', 'C', 'N', 'K', 'P', 'M', 'E', 'S', 'R'] : ['B', 'C', 'N', 'M']

const PDF_BOOKS = ['B', 'C', 'N', 'E']

const SEARCH_PREFIXES = [null, '@', '#']

const SHOW_MP3 = ['N']

const SHOW_PDF = ['B', 'C', 'N', 'S', 'R']

const THEMES = unlocked
  ? [
      'system',
      'dark',
      'midnight',
      'ocean',
      'crimson',
      'slate',
      'light',
      'warm',
      'sky',
      'mint',
      'lavender',
    ]
  : ['light', 'dark', 'system']

export {
  DEFAULT_SETTINGS,
  EXCLUDED_HYMNS,
  HYMNBOOKS,
  PDF_BOOKS,
  SEARCH_PREFIXES,
  SHOW_PDF,
  SHOW_MP3,
  THEMES,
}
