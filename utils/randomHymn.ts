import Router from 'next/router'
import axios from 'axios'
import type Hymn from '@/types/hymn'

import { bookShortcut, booksList } from './books'

const randomHymn = async (book: string | undefined) => {
  if (!book) {
    localStorage.removeItem('prevSearch')

    try {
      const responses = await Promise.all(
        booksList().map((bookName) => {
          return axios
            .get<Hymn[]>(`database/${bookName}.json`)
            .catch(() => null)
        })
      )

      const hymns = responses
        .filter((response) => response !== null)
        .flatMap((response) => response!.data)

      if (hymns.length > 0) {
        const selectedHymn = hymns[Math.floor(Math.random() * hymns.length)]

        Router.push({
          pathname: '/hymn',
          query: {
            book: bookShortcut(selectedHymn.book),
            title: selectedHymn.name,
          },
        })
      }
    } catch (error) {
      console.error('Error fetching hymns:', error)
    }
  } else {
    const fromStorage = localStorage.getItem('prevSearch')

    if (fromStorage) {
      const json = JSON.parse(fromStorage)
      json.search = ''
      localStorage.setItem('prevSearch', JSON.stringify(json))
    }

    try {
      const { data } = await axios.get<Hymn[]>(`/database/${book}.json`)

      if (data.length > 0) {
        const selectedHymn = data[Math.floor(Math.random() * data.length)]

        Router.push({
          pathname: '/hymn',
          query: {
            book: bookShortcut(selectedHymn.book),
            title: selectedHymn.name,
          },
        })
      }
    } catch (error) {
      console.error('Error fetching hymn:', error)
    }
  }
}

export default randomHymn
