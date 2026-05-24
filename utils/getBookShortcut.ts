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

const getBookShortcut = (input: string) => {
  return booksMap[input] || reversedBooksMap[input]
}

export { getBookShortcut }
