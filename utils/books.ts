const bookShortcut = (input: string) => {
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

  if (booksMap[input]) {
    return booksMap[input]
  } else {
    const reversedMap: Record<string, string> = {}

    for (const key in booksMap) {
      if (booksMap.hasOwnProperty(key)) {
        reversedMap[booksMap[key]] = key
      }
    }

    const shortcut = reversedMap[input]
    return shortcut
  }
}

const booksList = () => {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

  const list = unlocked
    ? ['B', 'C', 'N', 'K', 'P', 'E', 'S', 'M', 'R']
    : ['B', 'C', 'N']

  return list
}

export { bookShortcut, booksList }
