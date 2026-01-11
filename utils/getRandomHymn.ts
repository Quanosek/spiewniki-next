import axios from 'axios'

import { bookShortcut } from '@/utils/books'
import { isHymnAccessible } from '@/utils/hymnValidation'

import { booksList } from './books'

const getRandomHymn = async (unlocked: boolean, book?: string) => {
  if (!book) {
    // No specific book, get random from all
    try {
      const responses = await Promise.all(
        booksList(unlocked).map((bookName) => axios.get(`/database/${bookName}.json`))
      )

      const hymns = responses.flatMap((response) => response?.data ?? [])
      const accessibleHymns = hymns.filter((hymn: { name: string }) => isHymnAccessible(hymn.name))

      if (accessibleHymns.length > 0) {
        const randomHymn = accessibleHymns[Math.floor(Math.random() * accessibleHymns.length)]
        return {
          book: bookShortcut(randomHymn.book),
          title: randomHymn.name,
        }
      }
    } catch (error) {
      console.error('Error fetching hymns:', error)
    }
  } else {
    // Specific book, get random from that book
    try {
      const { data } = await axios.get(`/database/${book}.json`)
      const accessibleHymns = data.filter((hymn: { name: string }) => isHymnAccessible(hymn.name))

      if (accessibleHymns.length > 0) {
        const randomHymn = accessibleHymns[Math.floor(Math.random() * accessibleHymns.length)]
        return {
          book: bookShortcut(randomHymn.book),
          title: randomHymn.name,
        }
      }
    } catch (error) {
      console.error('Error fetching hymns:', error)
    }
  }

  return null
}

export { getRandomHymn }
