import dynamic from 'next/dynamic'
import Router, { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import styles from '@/styles/components/menu.module.scss'

const MENU_MODULES = {
  favorites: () => import('./favorites'),
  settings: () => import('./settings'),
  shortcuts: () => import('./shortcuts'),
} as const

type MenuName = keyof typeof MENU_MODULES

// Menu navigation via hidden query param
export function setMenuQuery(name: string | undefined) {
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

export default function Menu() {
  const router = useRouter()
  const { menu, ...params } = router.query

  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    if (!router.isReady) return

    setShowMenu(Boolean(menu))

    const { scrollLeft, scrollTop } = document.documentElement
    const scrollEvent = () => menu && window.scrollTo(scrollLeft, scrollTop)

    const keyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || !menu) {
        return
      }

      if (e.key === 'Escape') setMenuQuery(undefined)
    }

    window.addEventListener('scroll', scrollEvent)
    document.addEventListener('keyup', keyupEvent)
    return () => {
      window.removeEventListener('scroll', scrollEvent)
      document.removeEventListener('keyup', keyupEvent)
    }
  }, [router, menu, params])

  const menuName = typeof menu === 'string' && menu in MENU_MODULES ? (menu as MenuName) : null

  const DynamicComponent = useMemo(
    () =>
      menuName
        ? dynamic(
            () =>
              MENU_MODULES[menuName]().catch(() => {
                setMenuQuery(undefined)
                return { default: () => null }
              }),
            {
              ssr: false,
              loading: () => <p className={styles.menuLoading}>Ładowanie…</p>,
            }
          )
        : null,
    [menuName]
  )

  return (
    <div
      className={styles.menuComponent}
      style={{
        visibility: showMenu ? 'visible' : 'hidden',
        opacity: showMenu ? 1 : 0,
        transition: '100ms ease-out',
      }}
    >
      <div className={styles.menuBackground} onClick={() => setMenuQuery(undefined)} />

      {menuName && DynamicComponent && (
        <div className={styles.menuHandler}>
          <div className={styles.menuBox}>
            <DynamicComponent />
          </div>
        </div>
      )}
    </div>
  )
}
