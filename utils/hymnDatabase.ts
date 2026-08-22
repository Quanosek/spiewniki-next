import axios from 'axios'

import type Hymn from '@/types/hymn'

import { getBookShortcut } from './getBookShortcut'

const collectionCache = new Map<string, string[]>()

type HymnWithCollection = Hymn & { collection?: string }

const getBookCollections = async (book: string): Promise<string[]> => {
  const cachedCollections = collectionCache.get(book)
  if (cachedCollections) return cachedCollections

  try {
    const response = await axios.get<{ collections?: unknown }>('/api/bookCollections', {
      params: { book },
    })
    const apiCollections = Array.isArray(response.data?.collections)
      ? response.data.collections.filter(
          (collection): collection is string => typeof collection === 'string'
        )
      : []

    collectionCache.set(book, apiCollections)
    return apiCollections
  } catch {
    collectionCache.set(book, [])
    return []
  }
}

const getBookDatabaseUrls = async (book: string, collection?: string) => {
  const bookName = getBookShortcut(book)
  const collections = await getBookCollections(book)

  if (collection) {
    return [`/database/${bookName}/${collection}.json`]
  }

  if (!collections.length) {
    return [`/database/${bookName}.json`]
  }

  return collections.map((name) => `/database/${bookName}/${name}.json`)
}

const fetchBookHymns = async (
  book: string,
  collection?: string,
  signal?: AbortSignal
): Promise<HymnWithCollection[]> => {
  const collections = await getBookCollections(book)
  const urls = await getBookDatabaseUrls(book, collection)
  const responses = await Promise.all(urls.map((url) => axios.get(url, { signal })))

  return responses.flatMap((response, index) => {
    const currentCollection = collections.length ? collection || collections[index] : undefined

    return (response.data || []).map((hymn: Hymn) => ({
      ...hymn,
      collection: currentCollection,
    }))
  })
}

export { getBookCollections, getBookDatabaseUrls, fetchBookHymns }
export type { HymnWithCollection }
