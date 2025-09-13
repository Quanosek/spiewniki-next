import axios from 'axios'

import { booksList } from './books'

const getRandomHymn = async (unlocked: boolean, book?: string) => {
  if (!book) {
    // No specific book, get random from all
    try {
      const responses = await Promise.all(
        booksList(unlocked).map((bookName) =>
          axios.get(`/database/${bookName}.json`)
        )
      )

      const hymns = responses.flatMap((response) => response?.data ?? [])

      if (hymns.length > 0) {
        return hymns[Math.floor(Math.random() * hymns.length)]
      }
    } catch (error) {
      console.error('Error fetching hymns:', error)
    }
  } else {
    // Specific book, get random from that book
    try {
      const { data } = await axios.get(`/database/${book}.json`)

      if (data.length > 0) {
        return data[Math.floor(Math.random() * data.length)]
      }
    } catch (error) {
      console.error('Error fetching hymns:', error)
    }
  }

  return null
}

export default getRandomHymn
