// changing text to more useful form for local files directories
class simplifyText {
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  // unify text by removing diacritics and special characters
  format() {
    return this.text
      .toLowerCase()
      .replaceAll("ą", "a")
      .replaceAll("ć", "c")
      .replaceAll("ę", "e")
      .replaceAll("ł", "l")
      .replaceAll("ń", "n")
      .replaceAll("ó", "o")
      .replaceAll("ś", "s")
      .replaceAll("ż", "z")
      .replaceAll("ź", "z")
      .replace(/[^\w\s]/gi, "");
  }

  // replace spaces with underscores
  modify() {
    const formattedText = this.format();
    const modifiedText = formattedText.replaceAll(" ", "_");

    return modifiedText;
  }
}

// export class as default
export default simplifyText;
