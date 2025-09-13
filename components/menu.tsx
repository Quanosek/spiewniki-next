import dynamic from 'next/dynamic'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import styles from '@/styles/components/menu.module.scss'

// Menu boxes smart navigation
export function hiddenMenuQuery(name: string | undefined) {
  const params = { ...Router.query }
  delete params.menu

  Router.push(
    // url
    { query: name ? { ...params, menu: name } : { ...params } },
    // as
    { query: { ...params } },
    // options
    { scroll: false, shallow: true }
  )
}

export default function MenuComponent() {
  const router = useRouter()
  const { menu, ...params } = router.query

  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!router.isReady) return

    // Menu render
    setShowMenu(Boolean(menu))

    // Prevent scrolling
    const { scrollLeft, scrollTop } = document.documentElement
    const scrollEvent = () => menu && window.scrollTo(scrollLeft, scrollTop)

    // Keyboard shortcuts
    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || !menu) {
        return
      }

      if (e.key === 'Escape') hiddenMenuQuery(undefined)
    }

    document.addEventListener('scroll', scrollEvent)
    document.addEventListener('keyup', keyupEvent)
    return () => {
      document.removeEventListener('scroll', scrollEvent)
      document.removeEventListener('keyup', keyupEvent)
    }
  }, [router, menu, params])

  // Dynamic import menu
  const DynamicComponent = dynamic(() => import(`./menu/${menu}`), {
    ssr: false,
  })

  return (
    <div
      className={styles.menuComponent}
      style={{
        visibility: showMenu ? 'visible' : 'hidden',
        opacity: showMenu ? 1 : 0,
        transition: '100ms ease-out',
      }}
    >
      <div
        className={styles.menuBackground}
        onClick={() => hiddenMenuQuery(undefined)}
      />

      {menu && (
        <div className={styles.menuHandler}>
          <div className={styles.menuBox}>
            <DynamicComponent />
          </div>
        </div>
      )}
    </div>
  )
}
