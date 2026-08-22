import fs from 'fs'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getBookShortcut } from '@/utils/getBookShortcut'

type Data = {
  collections?: string[]
  error?: string
}

const collator = new Intl.Collator('pl', { numeric: true, sensitivity: 'base' })

const isJsonFile = (name: string) => name.toLowerCase().endsWith('.json')

const removeJsonExtension = (name: string) => name.replace(/\.json$/i, '')

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { book } = req.query as { [key: string]: string }
  if (!book) {
    return res.status(400).json({ error: 'Missing book query parameter' })
  }

  const bookName = getBookShortcut(book)
  const collectionsDir = path.join(process.cwd(), 'public', 'database', bookName)

  try {
    const entries = fs.readdirSync(collectionsDir, { withFileTypes: true })

    const collections = entries
      .filter((entry) => entry.isFile() && isJsonFile(entry.name))
      .map((entry) => removeJsonExtension(entry.name))
      .sort((a, b) => collator.compare(b, a))

    return res.status(200).json({ collections })
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException)?.code

    if (errorCode === 'ENOENT') {
      return res.status(200).json({ collections: [] })
    }

    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
