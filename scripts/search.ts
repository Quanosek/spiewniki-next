import axios from "axios";

export default async function search(book: string, input: string) {
  // read books
  let path;
  if (book === "all") path = `/api/xml`;
  else path = `/api/xml?book=${book}`;

  const list = await axios.get(path).then(({ data }) => data);

  // create results
  let titlesCollector = new Array();
  let lyricsCollector = new Array();

  list.map((hymn: { book: string; title: string; lyrics: string[] }) => {
    if (textFormat(hymn.title).includes(textFormat(input))) {
      // title found
      titlesCollector.push({
        book: hymn.book,
        title: hymn.title,
      });
    } else {
      // lyrics found
      hymn.lyrics.map((verses: any) => {
        verses.map((lines: string, index: number) => {
          if (textFormat(lines).includes(textFormat(input))) {
            lyricsCollector.push({
              book: hymn.book,
              title: hymn.title,
              lyrics: [
                verses[index - 2] ? "... " : undefined,
                verses[index - 1],
                verses[index],
                verses[index + 1],
                verses[index + 2] ? "..." : undefined,
              ],
            });
          }
        });
      });
    }
  });

  // merge Collectors
  let Collector = [...titlesCollector, ...lyricsCollector];
  Collector = Collector.filter((value, index, self) => {
    return index === self.findIndex((x) => x.title === value.title);
  });

  const titles = Collector.map((i) => i.title);
  Collector = Collector.filter(
    ({ id }, index) => !titles.includes(id, index + 1)
  );

  // return all results
  return Collector;
}

// change text to searching-friendly format
function textFormat(text: string) {
  return text
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
