import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import simplifyText from '@/utils/simplifyText'

import styles from '@/styles/pages/document.module.scss'

export default function DocumentPage() {
  const router = useRouter()

  const libraryPath = '/libraries/pdfjs-4.10.38-legacy-dist/web/viewer.html'
  const [documentPath, setDocumentPath] = useState('')

  useEffect(() => {
    if (!router.isReady) return
    const { d, book, id } = router.query

    // Get document
    if (typeof d === 'string' && d.trim()) {
      setDocumentPath(`/pdf/${new simplifyText(d).modify()}.pdf`)
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
    const KeyupEvent = (e: KeyboardEvent) => {
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

    document.addEventListener('keyup', KeyupEvent)
    return () => document.removeEventListener('keyup', KeyupEvent)
  }, [router])

  return (
    <>
      <Head>
        <title>Dokument PDF / Śpiewniki</title>
      </Head>

      <main style={{ padding: 0 }}>
        <div className={styles.backButton}>
          <button
            title='Kliknij, lub użyj przycisku [Esc]'
            onClick={() => router.back()}
          >
            <Image
              style={{ transform: 'rotate(90deg)' }}
              className='icon'
              alt='back'
              src='/icons/arrow.svg'
              width={20}
              height={20}
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
