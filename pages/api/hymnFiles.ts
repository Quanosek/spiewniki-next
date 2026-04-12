import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

import { bookShortcut } from '@/utils/books'
import { slugifyText } from '@/utils/simplifyText'

type Data = {
  pdf?: { book: string; id: string } | null
  error?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { title } = req.query as { [key: string]: string }

  let { book } = req.query as { [key: string]: string }
  book = bookShortcut(book)

  try {
    let id = ''
    const match = title.match(/^\d+[a-zA-Z]?/)

    if (match && book !== 'S') id = match[0]
    else id = slugifyText(title)

    // Exact match first, then prefix match with word boundary
    const locateFile = (category: string) => {
      try {
        const files = fs.readdirSync(path.join(process.cwd(), 'public', category, book))

        let file = files.find((a) => {
          const nameWithoutExt = a.replace(/\.[^/.]+$/, '')
          return nameWithoutExt === id
        })

        if (!file) {
          file = files.find((a) => {
            const nameWithoutExt = a.replace(/\.[^/.]+$/, '')
            return (
              nameWithoutExt.startsWith(id) &&
              (nameWithoutExt.length === id.length ||
                !/[a-zA-Z0-9]/.test(nameWithoutExt[id.length]))
            )
          })
        }

        if (file) return { book, id }
        else return null
      } catch {
        return null
      }
    }

    const results = {
      pdf: locateFile('pdf'),
      mp3: locateFile('mp3'),
    }

    return res.status(200).json(results)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
