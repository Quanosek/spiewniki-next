const booksMap: Record<string, string> = {
  all: 'Wszystkie śpiewniki',
  B: 'Pieśni Brzasku Tysiąclecia',
  C: 'Uwielbiajmy Pana (Cegiełki)',
  N: 'Śpiewajcie Panu Pieśń Nową',
  K: 'Śpiewnik Koziański',
  P: 'Śpiewnik Poznański',
  E: 'Śpiewniczek Młodzieżowy',
  M: 'Śpiewnik Międzynarodowy (IC)',
  S: 'Pieśni Chóru Syloe',
  R: 'Różne pieśni',
}

const reversedBooksMap: Record<string, string> = Object.fromEntries(
  Object.entries(booksMap).map(([key, value]) => [value, key])
)

// Convert any book name to shortcut and vice versa
const bookShortcut = (input: string) => {
  return booksMap[input] || reversedBooksMap[input]
}

// Get list of available books
const booksList = () => {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

  const list = unlocked
    ? ['B', 'C', 'N', 'K', 'P', 'E', 'S', 'M', 'R']
    : ['B', 'C', 'N']

  return list
}

export { bookShortcut, booksList }
