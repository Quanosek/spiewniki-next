const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

// List of hymn numbers excluded in restricted mode
const EXCLUDED = ['359a.', '389a.', '392a.', '394a.', '397a.', '418a.', '425a.', '484a.']

export const isHymnAccessible = (hymnName: string): boolean => {
  if (unlocked) return true

  const name = hymnName.toLowerCase().trim()
  return !EXCLUDED.some((prefix) => name.startsWith(prefix))
}
