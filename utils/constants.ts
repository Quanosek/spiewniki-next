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

// ! Keep these title prefixes aligned with the locked-build access policy
const EXCLUDED_HYMNS = ['359a.', '389a.', '392a.', '394a.', '397a.', '418a.', '425a.', '484a.']

// ! Keep these shortcuts aligned with getBookShortcut and public database folders
const HYMNBOOKS = unlocked
  ? ['B', 'C', 'N', 'K', 'P', 'E', 'IC', 'U', 'M', 'S', 'R']
  : ['B', 'C', 'N', 'IC']

const ADDITIONAL_HYMNBOOKS: string[] = HYMNBOOKS.filter((book) =>
  ['U', 'M', 'S', 'R'].includes(book)
)

const GLOBAL_SEARCH_HYMNBOOKS = [
  ...HYMNBOOKS.filter((book) => !ADDITIONAL_HYMNBOOKS.includes(book) && book !== 'IC'),
  ...(HYMNBOOKS.includes('IC') ? ['IC'] : []),
]

// ! Keep book-level PDF links aligned with files under public/pdf
const PDF_BOOKS = ['B', 'C', 'N', 'E', 'U']

// ! Keep search parsing and result matching aligned with these prefixes
const SEARCH_PREFIXES = [null, '@', '#']

// ! Keep per-hymn asset flags aligned with files under public/pdf and public/mp3
const SHOW_MP3 = ['N']

const SHOW_PDF = ['B', 'C', 'N', 'U', 'S', 'R']

// ! Add a matching theme selector and palette to styles/_themes.scss
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
