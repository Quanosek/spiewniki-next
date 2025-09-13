import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { bookShortcut } from '@/utils/books'
import { modifyText } from '@/utils/simplifyText'

type Data = {
  pdf?: { book: string; id: string } | null
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { title } = req.query as { [key: string]: string }

  let { book } = req.query as { [key: string]: string }
  book = bookShortcut(book)

  try {
    let id = ''
    const match = title.match(/^\d+[a-zA-Z]?/)

    if (match) id = match[0]
    else id = modifyText(title)

    const locateFile = (category: string) => {
      try {
        const files = fs.readdirSync(
          path.join(process.cwd(), 'public', category, book)
        )

        // First try exact match (without extension)
        let file = files.find((a) => {
          const nameWithoutExt = a.replace(/\.[^/.]+$/, '')
          return nameWithoutExt === id
        })

        // If no exact match, try startsWith but ensure it's followed by a non-alphanumeric character or end of string
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

    const locateMusicFile = (category: string) => {
      try {
        const files = fs.readdirSync(
          path.join(process.cwd(), 'public', category, book)
        )

        // First try exact match (without extension)
        let file = files.find((a) => {
          const nameWithoutExt = a.replace(/\.[^/.]+$/, '')
          return nameWithoutExt === id
        })

        // If no exact match, try startsWith but ensure it's followed by a non-alphanumeric character or end of string
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
      mp3: locateMusicFile('mp3'),
    }

    return res.status(200).json(results)

    // handle error
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
