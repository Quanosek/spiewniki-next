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

const HYMNBOOKS = unlocked
  ? ['B', 'C', 'N', 'K', 'P', 'M', 'IC', 'E', 'S', 'R']
  : ['B', 'C', 'N', 'IC']

const ADDITIONAL_HYMNBOOKS: string[] = HYMNBOOKS.filter((book) => ['M', 'S', 'R'].includes(book))
// 'IC' (Śpiewnik Międzynarodowy) is a primary hymnbook but sits alongside 'M' (Chór
// Międzynarodowy) which is now in the additional list — pin IC to the end so the two
// international entries stay together across the section boundary.
const GLOBAL_SEARCH_HYMNBOOKS = [
  ...HYMNBOOKS.filter((book) => !ADDITIONAL_HYMNBOOKS.includes(book) && book !== 'IC'),
  ...(HYMNBOOKS.includes('IC') ? ['IC'] : []),
]

const PDF_BOOKS = ['B', 'C', 'N', 'E']

const SEARCH_PREFIXES = [null, '@', '#']

const SHOW_MP3 = ['N']

const SHOW_PDF = ['B', 'C', 'N', 'M', 'S', 'R']

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
  ADDITIONAL_HYMNBOOKS,
  DEFAULT_SETTINGS,
  EXCLUDED_HYMNS,
  GLOBAL_SEARCH_HYMNBOOKS,
  HYMNBOOKS,
  PDF_BOOKS,
  SEARCH_PREFIXES,
  SHOW_PDF,
  SHOW_MP3,
  THEMES,
}
