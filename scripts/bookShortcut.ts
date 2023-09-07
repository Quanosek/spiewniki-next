export default function bookShortcut(input: string) {
  const booksMap: Record<string, string> = {
    all: "Wszystkie śpiewniki",
    B: "Pieśni Brzasku Tysiąclecia",
    C: "Uwielbiajmy Pana (Cegiełki)",
    N: "Śpiewajcie Panu Pieśń Nową",
  };

  if (booksMap[input]) {
    return booksMap[input];
  } else {
    const reversedMap: Record<string, string> = {};

    for (const key in booksMap) {
      if (booksMap.hasOwnProperty(key)) {
        reversedMap[booksMap[key]] = key;
      }
    }

    const shortcut = reversedMap[input];
    return shortcut;
  }
}

export function bookList() {
  // all included books databases
  return ["B", "C", "N"];
}

export function pdfBooks() {
  // all includes pdf files
  return ["B", "C", "N"];
}
