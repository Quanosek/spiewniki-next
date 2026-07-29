import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

import { getBookShortcut } from '@/utils/getBookShortcut'
import { getCollectionPdfName } from '@/utils/hymnDatabase'
import { slugifyText } from '@/utils/simplifyText'

type Data = {
  pdf?: { book: string; id: string } | null
  mp3?: { book: string; id: string } | null
  collectionPdf?: string | null
  error?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { title, collection } = req.query as { [key: string]: string }

  let { book } = req.query as { [key: string]: string }
  book = getBookShortcut(book)

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

    const locateCollectionPdf = () => {
      if (book !== 'M' || !collection) return null

      const pdfName = getCollectionPdfName('M', collection)
      if (!pdfName) return null

      const filename = `${slugifyText(pdfName)}.pdf`
      const filePath = path.join(process.cwd(), 'public', 'pdf', filename)

      if (fs.existsSync(filePath)) return pdfName
      return null
    }

    const results = {
      pdf: locateFile('pdf'),
      mp3: locateFile('mp3'),
      collectionPdf: locateCollectionPdf(),
    }

    return res.status(200).json(results)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
