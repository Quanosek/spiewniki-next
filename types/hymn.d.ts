export default interface Hymn {
  id: number
  book: string
  name: string
  song: {
    title: string
    lyrics: Record<string, string[]>
    author?: string
    copyright?: string
    presentation?: string
    capo: {
      $: {
        print: string
        sharp: string
      }
    }
    linked_songs?: {
      linked_song: string
    }
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
