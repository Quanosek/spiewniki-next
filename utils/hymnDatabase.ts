import axios from 'axios'

import type Hymn from '@/types/hymn'

import { getBookShortcut } from './getBookShortcut'

const MULTI_COLLECTION_BOOKS: Record<string, string[]> = {
  M: ['Koncert 2026'],
}

const MULTI_COLLECTION_PDF_NAMES: Record<string, Record<string, string>> = {
  M: {
    'Koncert 2026': 'Koncert 2026',
  },
}

type HymnWithCollection = Hymn & { collection?: string }

const getBookCollections = (book: string) => {
  return MULTI_COLLECTION_BOOKS[book] || []
}

const getBookDatabaseUrls = (book: string, collection?: string) => {
  const bookName = getBookShortcut(book)
  const collections = getBookCollections(book)

  if (!collections.length) {
    return [`/database/${bookName}.json`]
  }

  if (collection) {
    return [`/database/${bookName}/${collection}.json`]
  }

  return collections.map((name) => `/database/${bookName}/${name}.json`)
}

const getCollectionPdfName = (book: string, collection?: string) => {
  if (!collection) return null
  return MULTI_COLLECTION_PDF_NAMES[book]?.[collection] || collection
}

const fetchBookHymns = async (
  book: string,
  collection?: string,
  signal?: AbortSignal
): Promise<HymnWithCollection[]> => {
  const urls = getBookDatabaseUrls(book, collection)
  const responses = await Promise.all(urls.map((url) => axios.get(url, { signal })))

  return responses.flatMap((response, index) => {
    const currentCollection = getBookCollections(book).length
      ? collection || getBookCollections(book)[index]
      : undefined

    return (response.data || []).map((hymn: Hymn) => ({
      ...hymn,
      collection: currentCollection,
    }))
  })
}

export { getBookCollections, getBookDatabaseUrls, getCollectionPdfName, fetchBookHymns }
export type { HymnWithCollection }
