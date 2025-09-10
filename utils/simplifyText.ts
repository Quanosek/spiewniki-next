// Remove polish diacritics and convert to lowercase
const reformatText = (text: string) => {
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

// Replace spaces with hyphens
const modifyText = (text: string) => {
  const formattedText = reformatText(text)
  return formattedText.replaceAll(' ', '-')
}

export { reformatText, modifyText }
