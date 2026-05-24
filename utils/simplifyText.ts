const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll('ą', 'a')
    .replaceAll('ć', 'c')
    .replaceAll('ę', 'e')
    .replaceAll('ł', 'l')
    .replaceAll('ń', 'n')
    .replaceAll('ó', 'o')
    .replaceAll('ś', 's')
    .replaceAll('ż', 'z')
    .replaceAll('ź', 'z')
    .replace(/[^\w\s]/gi, '')
}

const slugifyText = (text: string) => {
  const formattedText = normalizeText(text)
  return formattedText.replaceAll(' ', '-')
}

export { normalizeText, slugifyText }
