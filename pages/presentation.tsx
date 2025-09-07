import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Presentation from '@/components/presentation'
import type Hymn from '@/types/hymn'

import styles from '@/styles/components/presentation.module.scss'

export default function PresentationPage() {
  const router = useRouter()

  const [hymn, setHymn] = useState<Hymn>()

  useEffect(() => {
    if (!router.isReady) return
    const { book, title } = router.query

    // Fetch data
    axios
      .get(`database/${book}.json`)
      .then(({ data }) => {
        const hymn = data.find((elem: { name: string }) => elem.name === title)
        setHymn(hymn)
      })
      .catch((err) => console.error(err))

    // Exit on fullscreen escape
    const fullscreenChangeHandler = () => {
      if (!document.fullscreenElement) return router.back()
    }

    // Remove saved window mode
    const beforeUnloadHandler = () => localStorage.removeItem('presWindow')

    document.addEventListener('fullscreenchange', fullscreenChangeHandler)
    window.addEventListener('beforeunload', beforeUnloadHandler)

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler)
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }
  }, [router])

  // Keyboard shortcuts
  useEffect(() => {
    const KeyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return

      if (e.key === 'Escape') router.back()
    }

    document.addEventListener('keyup', KeyupEvent)
    return () => document.removeEventListener('keyup', KeyupEvent)
  }, [router])

  return (
    <>
      <Head>
        <title>Pokaz slajdów / Śpiewniki</title>
      </Head>

      <div className={styles.fullscreen}>
        {hymn && <Presentation hymn={hymn} />}
      </div>
    </>
  )
}
