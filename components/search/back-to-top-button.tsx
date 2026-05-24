import Image from 'next/image'

import styles from '@/styles/pages/search.module.scss'

export default function BackToTopButton({ visible }: { visible: boolean }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      title='Powróć na górę strony'
      className={`${visible && styles.show} ${styles.scrollButton}`}
      onClick={scrollToTop}
    >
      <Image alt='up' src='/icons/arrow.svg' width={25} height={25} draggable={false} />
    </button>
  )
}
