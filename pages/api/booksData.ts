// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { bookShortcut, booksList } from '@/utils/books'
import simplifyText from '@/utils/simplifyText'

type Data =
  | {
      name: string
      pdf: {
        book: string
        name: string
      } | null
    }[]
  | { error: string }

// API to find connected files with list of defined books
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const results = booksList().map((book) => {
      const name = new simplifyText(bookShortcut(book)).modify()

      const locateFile = (category: string) => {
        try {
          const file = fs
            .readdirSync(path.join(process.cwd(), 'public', category))
            .find((a) => a.startsWith(name))

          if (file) return { book, name }
          else return null
        } catch (err) {
          console.error(err)
          return null
        }
      }

      return {
        name: book,
        pdf: locateFile('pdf'),
      }
    })

    return res.status(200).json(results)

    // handle error
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
