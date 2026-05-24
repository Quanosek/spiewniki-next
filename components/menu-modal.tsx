import Link from 'next/link'

import { shareButton } from '@/utils/shareButton'

import styles from '@/styles/components/mobile-menu.module.scss'

export default function MenuModal({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className={styles.menu}>
      <button onClick={shareButton}>
        <p>Udostępnij</p>
      </button>

      <Link href='https://nastrazy.org'>
        <p>
          <b>Nastrazy.org</b>
        </p>
      </Link>
    </div>
  )
}
