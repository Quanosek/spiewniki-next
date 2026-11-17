export default interface Hymn {
  id: number
  book: string
  name: string
  song: {
    title: string
    lyrics: Record<string, string[]>
    author?: string
    copyright?: string
    // Hymnbook number
    hymn_number?: string
    presentation?: string
    // CCLI identifier
    ccli?: string
    capo: {
      $: {
        print: 'true' | 'false'
        sharp: 'true' | 'false'
      }
    }
    // Musical key
    key?: string
    // Alternate title
    aka?: string
    // Key line
    key_line?: string
    // Themes
    theme?: string
    linked_songs?: {
      linked_song: string
    }
    tempo?: 'Bardzo wolno' | 'Wolno' | 'Umiarkowanie' | 'Szybko' | 'Bardzo szybko'
    // Time signature
    time_sig?: string
    backgrounds: {
      $: {
        resize: string
        keep_aspect: string
        link: string
        background_as_text: string
      }
    }
  }
}

export interface ProcessedHymn extends Omit<Hymn, 'song'> {
  song: Hymn['song']
  collection?: string
  matchPosition?: number
  matchType?: 'name' | 'lyrics' | 'author' | 'keywords'
  lyrics?: string[]
  dedupeKey: string
  numberPrefix: number
  hasLetterSuffix: boolean
  lyricsPlain: string[]
  author?: string
  copyright?: string
}

export type HymnDetailSong = Omit<Hymn['song'], 'linked_songs'> & {
  linked_songs?: {
    book: string
    title: string
  }[]
}

export interface HymnDetail extends Omit<Hymn, 'song'> {
  song: HymnDetailSong
  lyrics: string[][]
}
