export default function TextFormat(text: string) {
  return (
    text
      // convert to lower case
      .toLowerCase()
      //  remove polish letters
      .replaceAll("ą", "a")
      .replaceAll("ć", "c")
      .replaceAll("ę", "e")
      .replaceAll("ł", "l")
      .replaceAll("ń", "n")
      .replaceAll("ó", "o")
      .replaceAll("ś", "s")
      .replaceAll("ż", "z")
      .replaceAll("ź", "z")
      // remove special characters
      .replace(/[^\w\s]/gi, "")
  );
}
