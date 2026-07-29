import type Hymn from '@/types/hymn'

import { getBookShortcut } from './getBookShortcut'
import { HYMNBOOKS } from './constants'
import { isHymnAccessible } from './hymnValidation'
import { fetchBookHymns } from './hymnDatabase'

const getRandomHymn = async (book?: string) => {
  try {
    let hymns: Hymn[] = []

    if (!book) {
      // Fetch all hymnbooks
      const responses = await Promise.all(HYMNBOOKS.map((bookName) => fetchBookHymns(bookName)))
      hymns = responses.flat()
    } else {
      // Fetch specific hymnbook
      hymns = await fetchBookHymns(book)
    }

    // Filter hymns based on accessibility and select a random one
    const accessibleHymns = hymns.filter((hymn) => isHymnAccessible(hymn.name))

    if (accessibleHymns.length > 0) {
      const randomHymn = accessibleHymns[Math.floor(Math.random() * accessibleHymns.length)]
      return {
        book: getBookShortcut(randomHymn.book),
        title: randomHymn.name,
      }
    }
  } catch (err) {
    console.error('Error fetching hymns:', err)
  }

  return null
}

export { getRandomHymn }
