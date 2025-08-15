export default interface HymnTypes {
  id: number
  book: string
  name: string
  lyrics?: string[][]
  song: {
    title: string
    lyrics: string[][]
    copyright?: string
    author?: string
    presentation?: string
    linked_songs?: {
      book: string
      title: string
    }[]
  }
}
