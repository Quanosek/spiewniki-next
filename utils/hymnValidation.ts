import { EXCLUDED_HYMNS } from './constants'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

const isHymnAccessible = (hymnName: string): boolean => {
  if (unlocked) return true

  const name = hymnName.toLowerCase().trim()
  return !EXCLUDED_HYMNS.some((prefix) => name.startsWith(prefix))
}

export { isHymnAccessible }
