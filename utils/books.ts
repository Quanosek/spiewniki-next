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
const booksList = (unlocked: boolean) => {
  const booksList = ['B', 'C', 'N', 'K', 'P', 'E', 'S', 'M', 'R']
  const lockedBooksList = ['B', 'C', 'N', 'M']
  const list = unlocked ? booksList : lockedBooksList

  return list
}

export { bookShortcut, booksList }
