class simplifyText {
  text: string

  constructor(text: string) {
    this.text = text
  }

  format() {
    return this.text
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

  modify() {
    const formattedText = this.format()
    const modifiedText = formattedText.replaceAll(' ', '-')
    return modifiedText
  }
}

export default simplifyText
