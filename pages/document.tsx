import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { modifyText } from '@/utils/simplifyText'

import styles from '@/styles/pages/document.module.scss'

export interface DocumentPageProps {
  libraryPath: string
}

export default function DocumentPage({ libraryPath }: DocumentPageProps) {
  const router = useRouter()

  // Determine PDF document path
  const [documentPath, setDocumentPath] = useState('')

  useEffect(() => {
    if (!router.isReady) return

    const { d, book, id } = router.query

    if (typeof d === 'string' && d.trim()) {
      setDocumentPath(`/pdf/${modifyText(d)}.pdf`)
    } else if (
      typeof book === 'string' &&
      book.trim() &&
      typeof id === 'string' &&
      id.trim()
    ) {
      setDocumentPath(`/pdf/${book}/${id}.pdf`)
    } else {
      router.back()
    }
  }, [router])

  // Keyboard shortcuts
  useEffect(() => {
    const keyupEvent = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.metaKey ||
        router.query.menu
      ) {
        return
      }

      if (e.key === 'Escape') router.back()
    }

    document.addEventListener('keyup', keyupEvent)
    return () => document.removeEventListener('keyup', keyupEvent)
  }, [router])

  return (
    <>
      <Head>
        <title>Dokument PDF / Śpiewniki</title>
      </Head>

      <main style={{ padding: 0 }}>
        <div className={styles.backButton}>
          <button
            title='Powróć do poprzedniej strony [Esc]'
            onClick={() => router.back()}
          >
            <Image
              style={{ rotate: '90deg' }}
              className='icon'
              alt='back'
              src='/icons/arrow.svg'
              width={16}
              height={16}
              draggable={false}
            />
            <p>Powrót</p>
          </button>
        </div>

        <div className={styles.document}>
          <iframe
            src={`${libraryPath}?file=${encodeURIComponent(documentPath)}`}
            sandbox='allow-scripts allow-same-origin'
            title='PDF Document Viewer'
          />
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<DocumentPageProps> = async () => {
  const fs = await import('fs')
  const path = await import('path')

  const libDir = path.join(process.cwd(), 'public', 'libraries')
  const entries = await fs.promises.readdir(libDir)
  const pdfjsFolder = entries.find((name) => name.startsWith('pdfjs-'))

  if (!pdfjsFolder) {
    throw new Error('PDF.js library folder not found in public/libraries')
  }

  return {
    props: {
      libraryPath: `/libraries/${pdfjsFolder}/web/viewer.html`,
    },
  }
}
