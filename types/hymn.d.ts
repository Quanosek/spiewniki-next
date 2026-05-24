export default interface Hymn {
  id: number
  book: string
  name: string
  song: {
    title: string
    lyrics: Record<string, string[]>
    author?: string
    copyright?: string
    hymn_number?: string // Numer w śpiewniku
    presentation?: string
    ccli?: string // Numer w CCLI
    capo: {
      $: {
        print: 'true' | 'false'
        sharp: 'true' | 'false'
      }
    }
    key?: string // Tonacja
    aka?: string // Inny tytuł
    key_line?: string // Klucz
    theme?: string // Tematy
    linked_songs?: {
      linked_song: string
    }
    tempo?: 'Bardzo wolno' | 'Wolno' | 'Umiarkowanie' | 'Szybko' | 'Bardzo szybko'
    time_sig?: string // Metrum
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
