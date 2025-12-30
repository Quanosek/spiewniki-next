import Link from 'next/link'

import { hiddenMenuQuery } from '@/components/menu/_handler'

import shareButton from '@/utils/shareButton'

import styles from '@/styles/components/mobile-menu.module.scss'

export default function MenuModal({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className={styles.menu}>
      <button onClick={() => hiddenMenuQuery('favorites')}>
        <p>Lista ulubionych</p>
      </button>

      <button onClick={() => hiddenMenuQuery('settings')}>
        <p>Ustawienia</p>
      </button>

      <button onClick={shareButton}>
        <p>Udostępnij</p>
      </button>

      <Link href='https://nastrazy.org'>
        <p>Nastrazy.org</p>
      </Link>
    </div>
  )
}
